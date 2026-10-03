import type { CSSProperties } from 'react'
import { CinemaSign } from './Design'

export const CURTAIN_OPEN_MS = 1500

/** The fabric stays in separate layers so its folds gather at the wings. */
export function CurtainEntrance({ opening, onEnter }: { opening: boolean; onEnter: () => void }) {
  return <section className={`entry-screen ${opening ? 'is-opening' : ''}`} style={{ '--curtain-open-duration': `${CURTAIN_OPEN_MS}ms` } as CSSProperties}>
    <div className="theatre-architecture" aria-hidden="true">
      <div className="curtain-light" />
      <div className="entry-curtain curtain-left"><div className="curtain-fabric" /></div>
      <div className="entry-curtain curtain-right"><div className="curtain-fabric" /></div>
      <svg className="curtain-valance" viewBox="0 0 1440 230" preserveAspectRatio="none">
        <defs>
          <linearGradient id="valance-fabric" x1="0" y1="0" x2="0.15" y2="1">
            <stop stopColor="#1a0b21" /><stop offset=".4" stopColor="#4e274b" /><stop offset=".72" stopColor="#30132f" /><stop offset="1" stopColor="#170b20" />
          </linearGradient>
          <linearGradient id="valance-trim"><stop stopColor="#624631" /><stop offset=".5" stopColor="#c3a16a" /><stop offset="1" stopColor="#624631" /></linearGradient>
        </defs>
        <path d="M0 0H1440V38Q1230 246 970 106Q720 237 470 106Q210 246 0 38Z" fill="url(#valance-fabric)" />
        <g fill="none" stroke="#ba8393" strokeOpacity=".1" strokeWidth="2">
          <path d="M0 8Q230 154 470 65Q720 164 970 65Q1210 154 1440 8" />
          <path d="M0 16Q230 181 470 78Q720 190 970 78Q1210 181 1440 16" />
          <path d="M0 27Q230 214 470 95Q720 218 970 95Q1210 214 1440 27" />
        </g>
        <path d="M0 38Q210 246 470 106Q720 237 970 106Q1230 246 1440 38" fill="none" stroke="url(#valance-trim)" strokeWidth="3" />
        <path d="M0 45Q210 253 470 113Q720 244 970 113Q1230 253 1440 45" fill="none" stroke="#9b7748" strokeOpacity=".35" strokeWidth="5" strokeDasharray="1 4" />
      </svg>
      <div className="theatre-pillar pillar-left" /><div className="theatre-pillar pillar-right" />
      <div className="theatre-cornice"><span>✦</span></div>
      <div className="theatre-footlights" />
    </div>
    <div className="entry-content">
      <h1 className="sr-only" tabIndex={-1}>Tarket, 오늘의 당신을 위한 한 장의 티켓</h1>
      <p className="entry-eyebrow">오직 당신을 위한 작은 영화관</p>
      <div className="entry-sign"><CinemaSign /></div>
      <p className="entry-story font-serif-kr">오늘의 당신을 위한<br /><span>한 장의 티켓.</span></p>
      <button className="button entry-button" disabled={opening} onClick={onEnter}>
        <span aria-hidden="true">✦</span><span>{opening ? '막이 오르고 있어요' : '입장하기'}</span><span aria-hidden="true">→</span>
      </button>
      <span className="entry-caption">TAROT + TICKET</span>
    </div>
    <p className="entry-footnote">당신의 오늘이, 한 편의 이야기가 되는 곳.</p>
  </section>
}
