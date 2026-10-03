import { createHmac, randomUUID } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { CARDS } from '../src/lib/cards.ts'
import { CATEGORY_CONFIG, type Category } from '../src/lib/tarot-data.ts'
import { issueTicket, localDate, normalizeName, validateBooking, type BookingInput } from '../src/lib/tarot.ts'
import type { ReadingResponse, ServiceStatus } from '../src/lib/readings-contract.ts'
import { createGeminiGenerator, validateReading, type GenerateReading } from './gemini.ts'
import { ReadingError } from './errors.ts'
import { RedisReadingStore, type ReadingStore } from './store.ts'

export interface ReadingEnvironment {
  GEMINI_API_KEY?: string; GEMINI_MODEL?: string; TICKET_HMAC_SECRET?: string
  UPSTASH_REDIS_REST_URL?: string; UPSTASH_REDIS_REST_TOKEN?: string
  KV_REST_API_URL?: string; KV_REST_API_TOKEN?: string
  VERCEL_ENV?: string
}
export interface Dependencies {
  store?: ReadingStore; generate?: GenerateReading; now?: () => Date
  wait?: (ms: number) => Promise<void>; timeoutMs?: number
}
const storageConfig = (env: ReadingEnvironment) => ({ url: env.UPSTASH_REDIS_REST_URL || env.KV_REST_API_URL, token: env.UPSTASH_REDIS_REST_TOKEN || env.KV_REST_API_TOKEN })
export function serviceStatus(env: ReadingEnvironment): ServiceStatus {
  if (!env.GEMINI_API_KEY?.trim()) return { mode: 'demo' }
  const { url, token } = storageConfig(env)
  return { mode: url && token && (env.TICKET_HMAC_SECRET?.length ?? 0) >= 32 ? 'gemini' : 'unavailable' }
}
export function parseBooking(body: unknown, date: string): { input: BookingInput; category: Category } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new ReadingError(400, 'INVALID_INPUT', '입력 정보를 확인해주세요.')
  const data = body as Record<string, unknown>
  if (!['name', 'year', 'month', 'day'].every(key => typeof data[key] === 'string' && (data[key] as string).length <= 128)) throw new ReadingError(400, 'INVALID_INPUT', '이름과 생년월일을 확인해주세요.')
  const input: BookingInput = { name: data.name as string, year: data.year as string, month: data.month as string, day: data.day as string }
  const errors = validateBooking(input, date)
  if (Object.keys(errors).length) throw new ReadingError(400, 'INVALID_INPUT', errors.name || errors.birth!)
  if (!CATEGORY_CONFIG.some(item => item.name === data.category)) throw new ReadingError(400, 'INVALID_CATEGORY', '운세를 다시 선택해주세요.')
  return { input: { ...input, name: normalizeName(input.name), month: input.month.padStart(2, '0'), day: input.day.padStart(2, '0') }, category: data.category as Category }
}

export function createReadingService(env: ReadingEnvironment, deps: Dependencies = {}) {
  const { url, token } = storageConfig(env)
  const store = deps.store || (url && token ? new RedisReadingStore(url, token) : undefined)
  const generate = deps.generate || (env.GEMINI_API_KEY?.trim() ? createGeminiGenerator(env.GEMINI_API_KEY, env.GEMINI_MODEL) : undefined)
  const now = deps.now || (() => new Date())
  const wait = deps.wait || delay
  const digest = (value: string) => createHmac('sha256', env.TICKET_HMAC_SECRET!).update(value).digest('hex')
  return async (body: unknown, ip: string): Promise<ReadingResponse> => {
    const started = now()
    const date = localDate(started)
    const { input, category } = parseBooking(body, date)
    if (!env.GEMINI_API_KEY?.trim()) {
      const { name: _name, ...demo } = issueTicket(input, category, date)
      return demo
    }
    if (!store || !generate || (env.TICKET_HMAC_SECRET?.length ?? 0) < 32) throw new ReadingError(503, 'NOT_CONFIGURED', 'AI 발권을 준비 중이에요. 잠시 후 다시 방문해주세요.')
    const identity = digest(JSON.stringify([input.name, `${input.year}-${input.month}-${input.day}`, category, date]))
    // Model/prompt revisions deliberately do not change today's cache identity.
    // Preview and production use different namespaces but share the daily budget.
    const key = `tarket:${env.VERCEL_ENV === 'preview' ? 'preview' : 'production'}:reading:${identity}`
    const owner = randomUUID()
    let reserved = false
    try {
      const reservation = await store.reserve({ key, owner, date, ipKey: digest(`ip:${date}:${ip}`), minute: Math.floor(started.getTime() / 60000) })
      if (reservation.kind === 'cached') return reservation.value
      if (reservation.kind === 'daily-limit') {
        const untilMidnight = Math.ceil((Date.parse(`${date}T15:00:00Z`) - started.getTime()) / 1000)
        throw new ReadingError(429, 'DAILY_LIMIT', '오늘 준비한 AI 티켓 100장이 모두 발권되었어요. 한국 시간 자정 이후 다시 만나요. 이미 받은 티켓은 같은 정보로 다시 열 수 있어요.', Math.max(1, untilMidnight))
      }
      if (reservation.kind === 'ip-limit') throw new ReadingError(429, 'RATE_LIMIT', '짧은 시간에 여러 장을 발권했어요. 1분 뒤 다시 시도해주세요.', 60)
      if (reservation.kind === 'pending') {
        for (let i = 0; i < 44; i++) {
          await wait(500)
          const cached = await store.get(key)
          if (cached) return cached
        }
        throw new ReadingError(409, 'IN_PROGRESS', '같은 티켓을 준비하고 있어요. 잠시 후 다시 열어주세요.', 3)
      }
      reserved = true
      const card = CARDS[Number.parseInt(identity.slice(0, 8), 16) % CARDS.length]
      const controller = new AbortController()
      let timer: ReturnType<typeof setTimeout> | undefined
      try {
        const timeout = new Promise<never>((_, reject) => {
          timer = setTimeout(() => { controller.abort(); reject(new ReadingError(504, 'AI_TIMEOUT', '해석에 시간이 조금 오래 걸리고 있어요. 잠시 후 다시 발권해주세요.')) }, deps.timeoutMs ?? 20000)
        })
        const text = validateReading(await Promise.race([generate(card, category, date, controller.signal), timeout]))
        const value: ReadingResponse = {
          cardId: card.id, source: 'gemini', category, date,
          serial: `TKT-${date.replaceAll('-', '')}-${identity.slice(0, 12).toUpperCase()}`,
          result: { ...text, card: card.name, cardKo: card.ko, keywords: card.keywords },
        }
        await store.complete(key, owner, value)
        return value
      } finally { if (timer) clearTimeout(timer) }
    } catch (error) {
      if (error instanceof ReadingError) throw error
      throw new ReadingError(503, 'READING_UNAVAILABLE', '티켓을 안전하게 준비하지 못했어요. 잠시 후 다시 발권해주세요.')
    } finally {
      if (reserved) await store.release(key, owner).catch(() => {})
    }
  }
}

export function createReadingHandler(env: ReadingEnvironment, deps: Dependencies = {}) {
  const issue = createReadingService(env, deps)
  return async (request: Request): Promise<Response> => {
    const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff' }
    const reply = (data: unknown, status = 200, extra: Record<string, string> = {}) => new Response(JSON.stringify(data), { status, headers: { ...headers, ...extra } })
    if (request.method === 'GET') return reply(serviceStatus(env))
    if (request.method !== 'POST') return reply({ code: 'METHOD_NOT_ALLOWED', message: '지원하지 않는 요청입니다.' }, 405, { Allow: 'GET, POST' })
    try {
      const origin = request.headers.get('origin')
      if (origin && origin !== new URL(request.url).origin) throw new ReadingError(403, 'INVALID_ORIGIN', 'Tarket 화면에서 다시 발권해주세요.')
      if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) throw new ReadingError(415, 'INVALID_CONTENT_TYPE', '입력 정보를 다시 전송해주세요.')
      if (Number(request.headers.get('content-length')) > 4096) throw new ReadingError(413, 'BODY_TOO_LARGE', '입력 정보가 너무 길어요.')
      const reader = request.body?.getReader()
      if (!reader) throw new ReadingError(400, 'INVALID_JSON', '입력 정보를 확인해주세요.')
      const chunks: Uint8Array[] = []
      let size = 0
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        size += value.byteLength
        if (size > 4096) { await reader.cancel(); throw new ReadingError(413, 'BODY_TOO_LARGE', '입력 정보가 너무 길어요.') }
        chunks.push(value)
      }
      let body: unknown
      try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new ReadingError(400, 'INVALID_JSON', '입력 정보를 확인해주세요.') }
      // Vercel overwrites this header; do not trust client-supplied x-forwarded-for.
      const ip = env.VERCEL_ENV ? request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() || 'unknown' : 'local'
      const ticket = await issue(body, ip)
      return reply(ticket)
    } catch (error) {
      const failure = error instanceof ReadingError ? error : new ReadingError(503, 'UNAVAILABLE', '발권기를 잠시 이용할 수 없어요.')
      // Never include the input, cache identity, provider response or exception text in logs.
      if (failure.status >= 500) console.warn(JSON.stringify({ event: 'reading_failed', code: failure.code }))
      return reply({ code: failure.code, message: failure.message, ...(failure.retryAfter ? { retryAfter: failure.retryAfter } : {}) }, failure.status, failure.retryAfter ? { 'Retry-After': String(failure.retryAfter) } : {})
    }
  }
}
