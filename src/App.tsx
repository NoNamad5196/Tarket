import { useEffect, useRef, useState, type FormEvent } from 'react'
import { CrystalBall, DispenserMachine, SideCurtains, Stars } from './components/Design'
import { CurtainEntrance, CURTAIN_OPEN_MS } from './components/CurtainEntrance'
import { TarotArtwork, TarotPoster } from './components/TarotArtwork'
import { cardImage } from './lib/cards'
import { ClientReadingError, requestReading } from './lib/readings-client'
import type { ServiceStatus } from './lib/readings-contract'
import { CATEGORY_CONFIG, type Category } from './lib/tarot-data'
import { localDate, MAX_NAME_LENGTH, validateBooking, type BookingErrors, type BookingInput, type Ticket } from './lib/tarot'

type Screen = 'curtain' | 'select' | 'book' | 'printing' | 'result' | 'error'
type PrintPhase = 'reading' | 'feeding' | 'ready'
const EMPTY_INPUT: BookingInput = { name: '', year: '', month: '', day: '' }
const dateLabel = (date: string) => date.replaceAll('-', '.')

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(query.matches)
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])
  return reduced
}

function StageHeader({ screen }: { screen: Screen }) {
  const step = screen === 'select' ? 0 : screen === 'book' || screen === 'error' ? 1 : 2
  return <header className="stage-header">
    <span className="brand-wordmark">Tarket <span>CINEMA</span></span>
    <ol className="steps" aria-label="발권 순서">
      {['운세 선택', '정보 입력', '티켓 발권'].map((label, index) => <li key={label} aria-current={step === index ? 'step' : undefined} className={step === index ? 'current' : index < step ? 'complete' : ''}>
        <span className="step-number" aria-hidden="true">{index < step ? '✓' : `0${index + 1}`}</span><span>{label}</span>
      </li>)}
    </ol>
  </header>
}

function ResultTicket({ ticket }: { ticket: Ticket }) {
  const { name, category, date, serial, result } = ticket
  return <article className="result-ticket ivory-paper" aria-label={`${name} 님의 ${category} 티켓`}>
    <div className="ticket-inner-border" aria-hidden="true" />
    <header className="ticket-header">
      <div><p className="ticket-brand font-en-serif">Tarket</p><p className="ticket-eyebrow">CINEMA · TAROT + TICKET</p></div>
      <div className="ticket-issue"><p>{category}</p><time dateTime={date}>{dateLabel(date)}</time></div>
    </header>
    <div className="ticket-main">
      <aside className="ticket-art">
        <TarotArtwork cardId={ticket.cardId} />
        <p className="card-name font-en-serif">{result.card}</p>
        <h2 className="font-serif-kr">{result.cardKo}</h2>
        <p className="card-keywords">{result.keywords}</p>
        <span className="art-caption">YOUR ORIGINAL TICKET</span>
      </aside>
      <section className="ticket-reading" aria-label="오늘의 운세 해석">
        <p className="recipient"><span>예매자</span><strong>{name} 님</strong></p>
        <div className="reading-title"><h2 className="font-serif-kr">{result.title}</h2><p>{result.summary}</p></div>
        <p className="reading-detail">{result.detail}</p>
        <dl className="reading-notes">
          {[['오늘의 조언', result.advice, '✦'], ['주의할 점', result.caution, '◈'], ['행운 요소', result.luck, '☆']].map(([label, text, symbol]) => <div key={label}>
            <dt><span aria-hidden="true">{symbol}</span>{label}</dt><dd>{text}</dd>
          </div>)}
        </dl>
      </section>
    </div>
    <footer className="ticket-stub"><div><p>TARKET CINEMA · {ticket.source === 'demo' ? '오늘의 타로' : 'AI 타로 해석'} · {category}</p><span className="serial">{serial}</span></div><span className="stub-message font-serif-kr">오늘이라는 한 편의 이야기.</span></footer>
  </article>
}

function Receipt({ ticket }: { ticket: Ticket }) {
  return <div className="receipt-paper ivory-paper">
    <div className="receipt-top"><span className="font-en-serif">Tarket</span><span>ADMIT ONE</span></div>
    <span className="receipt-label">예매자</span>
    <strong className={`receipt-name font-serif-kr ${Array.from(ticket.name).length > 12 ? 'long-name' : ''}`}>{ticket.name}</strong>
    <span className="receipt-category">{ticket.category}</span>
    <div className="receipt-seal"><span aria-hidden="true">✦</span><p>당신의 오늘이<br />도착했습니다.</p></div>
    <div className="receipt-stub"><time dateTime={ticket.date}>{dateLabel(ticket.date)}</time><span className="serial">{ticket.serial}</span></div>
  </div>
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('curtain')
  const [opening, setOpening] = useState(false)
  const [category, setCategory] = useState<Category | null>(null)
  const [input, setInput] = useState<BookingInput>(EMPTY_INPUT)
  const [errors, setErrors] = useState<BookingErrors>({})
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [phase, setPhase] = useState<PrintPhase>('reading')
  const [replay, setReplay] = useState(0)
  const reducedMotion = useReducedMotion()
  const mainRef = useRef<HTMLElement>(null)
  const submitLock = useRef(false)
  const activeRequest = useRef<AbortController | null>(null)
  const [mode, setMode] = useState<ServiceStatus['mode'] | 'loading'>('loading')
  const [errorMessage, setErrorMessage] = useState('입력한 정보는 그대로 있어요. 잠시 후 다시 발권해주세요.')
  const [retryAt, setRetryAt] = useState(0)
  const [retrySeconds, setRetrySeconds] = useState(0)
  const categoryInfo = CATEGORY_CONFIG.find(item => item.name === category)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/readings', { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Unavailable')
      const status = await response.json() as ServiceStatus
      if (!['demo', 'gemini', 'unavailable'].includes(status.mode)) throw new Error('Invalid status')
      setMode(status.mode)
    }).catch(() => { if (!controller.signal.aborted) setMode('unavailable') })
    return () => { controller.abort(); activeRequest.current?.abort() }
  }, [])

  useEffect(() => {
    const update = () => setRetrySeconds(Math.max(0, Math.ceil((retryAt - Date.now()) / 1000)))
    update()
    if (!retryAt) return
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [retryAt])

  useEffect(() => {
    if (!opening || screen !== 'curtain') return
    const timer = window.setTimeout(() => setScreen('select'), reducedMotion ? 100 : CURTAIN_OPEN_MS)
    return () => window.clearTimeout(timer)
  }, [opening, screen, reducedMotion])

  useEffect(() => {
    if (screen !== 'printing' || !ticket) return
    const feedTimer = window.setTimeout(() => setPhase('feeding'), reducedMotion ? 50 : 350)
    const readyTimer = window.setTimeout(() => setPhase('ready'), reducedMotion ? 100 : 2250)
    return () => { window.clearTimeout(feedTimer); window.clearTimeout(readyTimer) }
  }, [screen, ticket, reducedMotion])

  useEffect(() => {
    const title = mainRef.current?.querySelector<HTMLElement>('h1')
    title?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [screen])

  useEffect(() => {
    if (screen === 'printing' && phase === 'ready') {
      mainRef.current?.querySelector('.paper-output')?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'instant' : 'smooth' })
    }
  }, [screen, phase, reducedMotion])

  function updateInput(field: keyof BookingInput, value: string) {
    setRetryAt(0)
    setInput(previous => ({ ...previous, [field]: value }))
    setErrors(previous => ({ ...previous, [field === 'name' ? 'name' : 'birth']: undefined }))
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!category || submitLock.current || retryAt > Date.now()) return
    // Capture the day at issuance, so an open tab crossing midnight gets today's reading.
    const date = localDate()
    const nextErrors = validateBooking(input, date)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(nextErrors.name ? 'booking-name' : 'booking-year')?.focus()
      return
    }
    submitLock.current = true
    activeRequest.current?.abort()
    const controller = new AbortController()
    activeRequest.current = controller
    setTicket(null)
    setPhase('reading')
    setScreen('printing')
    try {
      const nextTicket = await requestReading({ ...input, category }, controller.signal)
      if (controller.signal.aborted || activeRequest.current !== controller) return
      setTicket(nextTicket)
      setMode(nextTicket.source)
      setInput(previous => ({ ...previous, name: nextTicket.name }))
      const preload = new Image()
      preload.src = cardImage(nextTicket.cardId)
    } catch (error) {
      if (controller.signal.aborted || activeRequest.current !== controller) return
      setErrorMessage(error instanceof ClientReadingError ? error.message : '발권기와 연결하지 못했어요. 인터넷 연결을 확인하고 다시 시도해주세요.')
      setRetryAt(error instanceof ClientReadingError && error.retryAfter ? Date.now() + error.retryAfter * 1000 : 0)
      setScreen('error')
      submitLock.current = false
    }
  }

  function rebook() {
    activeRequest.current?.abort()
    submitLock.current = false
    setRetryAt(0)
    setCategory(null)
    setErrors({})
    setTicket(null)
    setScreen('select')
  }

  return <div className={`app-shell ${screen === 'curtain' ? 'has-curtain' : ''} ${reducedMotion ? 'reduced-motion' : ''}`}>
    <div aria-hidden="true"><Stars />{screen !== 'curtain' && <SideCurtains />}</div>
    <a href="#main" className="skip-link">본문으로 건너뛰기</a>
    {screen !== 'curtain' && <StageHeader screen={screen} />}
    {screen !== 'curtain' && mode === 'unavailable' && <div className="service-banner" role="status">발권 연결을 준비 중입니다.</div>}
    <main id="main" className={screen === 'curtain' ? 'entry-main' : undefined} ref={mainRef} tabIndex={-1}>
      {screen === 'curtain' && <div className="curtain-overlay"><CurtainEntrance opening={opening} onEnter={() => setOpening(true)} /></div>}

      {screen === 'select' && <section className="page selection-page scene-in">
        <header className="page-heading">
          <span className="eyebrow">TARKET CINEMA</span>
          <h1 className="font-en-serif" tabIndex={-1}>Now Showing</h1>
          <div className="deco-divider"><p>오늘, 어떤 이야기가 궁금한가요?</p></div>
        </header>
        <div className="poster-grid" role="group" aria-label="운세 카테고리">
          {CATEGORY_CONFIG.map(item => <TarotPoster key={item.name} cat={item} selected={item.name === category} onClick={() => { setCategory(item.name); setRetryAt(0) }} />)}
        </div>
        <div className="selection-action">
          <p className="selection-hint" aria-live="polite">{categoryInfo ? `${categoryInfo.mood}을 담은 한 장의 티켓` : '여섯 편의 이야기 중 한 편을 골라주세요.'}</p>
          <button className="button primary" disabled={!category} onClick={() => setScreen('book')}>{category ? `${category} 예매하기` : '운세를 선택해주세요'}</button>
        </div>
      </section>}

      {screen === 'book' && <section className="page booking-page scene-in">
        <div className="booking-atmosphere" aria-hidden="true"><div className="waiting-deck"><img src={cardImage('card-back')} width={160} height={240} alt="" /><img src={cardImage('card-back')} width={160} height={240} alt="" /><img src={cardImage('card-back')} width={160} height={240} alt="" /></div><CrystalBall size={160} /><span className="eyebrow">YOUR STORY STARTS HERE</span><p className="font-serif-kr">당신의 오늘을<br />기다리고 있었어요.</p></div>
        <div className="booking-kiosk">
          <div className="kiosk-bar"><span className="font-en-serif">TARKET CINEMA</span><span className="selected-category">{category}</span></div>
          <div className="kiosk-body">
            <button className="text-button back-button" onClick={() => setScreen('select')}>← 운세 다시 선택</button>
            <h1 className="font-serif-kr" tabIndex={-1}>당신의 운세를<br />예매해보세요.</h1>
            <p className="booking-description">이름과 생년월일을 입력하면,<br />오늘의 이야기가 티켓으로 발권됩니다.</p>
            <form onSubmit={submit} noValidate>
              <div className="form-field">
                <label htmlFor="booking-name">이름 <span>또는 닉네임</span></label>
                <input id="booking-name" name="name" autoComplete="off" value={input.name} maxLength={MAX_NAME_LENGTH * 2} placeholder="티켓에 적을 이름" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} onChange={event => updateInput('name', event.target.value)} />
                {errors.name && <p id="name-error" className="field-error" role="alert">{errors.name}</p>}
              </div>
              <fieldset className="form-field birth-field" aria-describedby={errors.birth ? 'birth-error' : undefined}>
                <legend>생년월일 <span>양력</span></legend>
                <div className="birth-inputs">
                  {([{ field: 'year', label: '연도', placeholder: 'YYYY', max: 4 }, { field: 'month', label: '월', placeholder: 'MM', max: 2 }, { field: 'day', label: '일', placeholder: 'DD', max: 2 }] as const).map(({ field, label, placeholder, max }) => <div key={field}>
                    <label htmlFor={`booking-${field}`}>{label}</label>
                    <input id={`booking-${field}`} name={field} inputMode="numeric" autoComplete="off" value={input[field]} placeholder={placeholder} maxLength={max} aria-invalid={!!errors.birth} aria-describedby={errors.birth ? 'birth-error' : undefined} onChange={event => updateInput(field, event.target.value.replace(/\D/g, ''))} />
                  </div>)}
                </div>
                {errors.birth && <p id="birth-error" className="field-error" role="alert">{errors.birth}</p>}
              </fieldset>
              <button type="submit" className="button primary submit-button" disabled={retrySeconds > 0}>{retrySeconds > 0 ? '잠시 후 다시 발권해주세요' : '타로 티켓 발권하기'} <span aria-hidden="true">✦</span></button>
              <p className="form-note">같은 정보와 같은 운세로 예매하면,<br />오늘은 같은 티켓을 받습니다.</p>
              <p className="privacy-note">이름과 생년월일은 카드 선택을 위해 서버로 전송되며 원문은 저장하지 않아요. AI에는 카드·운세·날짜만 전달해요. AI 결과는 같은 티켓을 다시 보여드리기 위해 48시간 보관해요.</p>
            </form>
          </div>
        </div>
      </section>}

      {screen === 'printing' && <section className="page printing-page scene-in">
        <div className="printing-heading" role="status" aria-live="polite" aria-atomic="true">
          <span className="eyebrow">TARKET SELF TICKETING</span>
          <h1 className="font-serif-kr" tabIndex={-1}>{phase === 'ready' ? '당신의 오늘이 도착했습니다.' : phase === 'feeding' ? '티켓이 나오고 있어요.' : '당신의 오늘을 티켓에 새기는 중…'}</h1>
          <p>{phase === 'ready' ? '티켓을 눌러 오늘의 운세를 펼쳐보세요.' : '잠시만 기다려주세요. 한 장의 이야기를 준비하고 있어요.'}</p>
        </div>
        <div className="printer-stage" aria-busy={phase !== 'ready'}>
          <div className="printer-machine" aria-hidden="true"><DispenserMachine glowing={phase !== 'ready'} /></div>
          <div className="paper-output" data-phase={phase}>
            <button type="button" className={`printed-ticket ${phase !== 'reading' ? 'is-fed' : ''}`} disabled={phase !== 'ready'} aria-label="티켓을 눌러 오늘의 운세 펼치기" onClick={() => setScreen('result')}>
              {ticket && <Receipt ticket={ticket} />}
            </button>
          </div>
          <div className="print-indicator" aria-hidden="true"><span className={phase === 'ready' ? 'ready' : ''} />{phase === 'ready' ? '발권 완료 · 티켓을 열어보세요' : '발권 중'}</div>
        </div>
        {phase === 'reading' && <button className="text-button" onClick={() => { activeRequest.current?.abort(); submitLock.current = false; setScreen('book') }}>입력 화면으로 돌아가기</button>}
      </section>}

      {screen === 'result' && ticket && <section className="page result-page scene-in">
        <header className="page-heading result-heading"><span className="eyebrow">EXCLUSIVELY FOR YOU</span><h1 className="font-serif-kr" tabIndex={-1}>오늘의 타로 티켓</h1><p>오늘이라는 영화의 주인공은 당신이에요.</p></header>
        <div key={replay} className="ticket-reveal"><ResultTicket ticket={ticket} /></div>
        <div className="result-actions"><button className="button primary" onClick={rebook}>다른 운세 예매하기</button><button className="button secondary" onClick={() => setReplay(value => value + 1)}>티켓 다시 펼치기</button></div>
        <p className="result-note">{ticket.source === 'demo' && <>미리 준비한 카드 해석을 담은 티켓입니다.<br /></>}이 티켓은 {dateLabel(ticket.date)}의 이야기예요.<br />가벼운 재미와 오늘을 돌아보는 작은 힌트로 즐겨주세요.</p>
      </section>}

      {screen === 'error' && <section className="page error-page scene-in"><span className="eyebrow">잠시 쉬어가는 장면</span><h1 className="font-serif-kr" tabIndex={-1}>티켓을 준비하지 못했어요.</h1><p role="alert">{errorMessage}</p><p>입력한 정보는 그대로 있어요.</p><div className="result-actions"><button className="button primary" disabled={retrySeconds > 0} onClick={() => submit()}>{retrySeconds > 3600 ? '한국 시간 자정 이후 발권 가능' : retrySeconds > 0 ? `${retrySeconds}초 후 다시 발권` : '다시 발권하기'}</button><button className="button secondary" onClick={() => setScreen('book')}>입력 정보 확인</button></div></section>}
    </main>
    {screen !== 'curtain' && <footer className="site-footer"><span>TARKET CINEMA</span><p>오늘의 당신을 위한 한 장의 티켓.</p><span>Tarot + Ticket</span></footer>}
  </div>
}
