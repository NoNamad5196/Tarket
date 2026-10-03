import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createReadingHandler, createReadingService, serviceStatus } from '../server/readings.ts'
import { createGeminiGenerator, validateReading, type ReadingText } from '../server/gemini.ts'
import { ReadingError } from '../server/errors.ts'
import { RedisReadingStore, RESERVE_SCRIPT, COMPLETE_SCRIPT, type ReadingStore, type Reservation, type ReservationInput } from '../server/store.ts'
import { CARDS } from '../src/lib/cards.ts'
import type { ReadingResponse } from '../src/lib/readings-contract.ts'

const body = { name: '지우', year: '2000', month: '2', day: '29', category: '개발운' }
const text: ReadingText = { title: '작은 시도가 길을 여는 날', summary: '손에 익은 도구로 한 걸음 나아가보세요.', detail: '한 가지 문제에 집중해보세요. 작은 발견이 다음 시도로 이어질 수 있어요.', advice: '가장 작은 변경부터 확인해보세요.', caution: '결론을 서두르지 마세요.', luck: '따뜻한 차' }
const env = { GEMINI_API_KEY: 'test-key-never-real', TICKET_HMAC_SECRET: 'test-secret-not-for-production-00000000' }
const now = () => new Date('2026-09-12T03:00:00Z')
const code = (value: string) => (error: unknown) => error instanceof ReadingError && error.code === value

class MemoryStore implements ReadingStore {
  values = new Map<string, ReadingResponse>()
  locks = new Map<string, string>()
  days = new Map<string, number>()
  ips = new Map<string, number>()
  seen: ReservationInput[] = []
  async reserve(input: ReservationInput): Promise<Reservation> {
    this.seen.push(input)
    if (this.values.has(input.key)) return { kind: 'cached', value: this.values.get(input.key)! }
    if (this.locks.has(input.key)) return { kind: 'pending' }
    if ((this.days.get(input.date) || 0) >= 100) return { kind: 'daily-limit' }
    const ip = `${input.ipKey}:${input.minute}`
    if ((this.ips.get(ip) || 0) >= 5) return { kind: 'ip-limit' }
    this.locks.set(input.key, input.owner)
    this.days.set(input.date, (this.days.get(input.date) || 0) + 1)
    this.ips.set(ip, (this.ips.get(ip) || 0) + 1)
    return { kind: 'reserved' }
  }
  async get(key: string) { return this.values.get(key) || null }
  async complete(key: string, owner: string, value: ReadingResponse) {
    assert.equal(this.locks.get(key), owner)
    this.values.set(key, value)
    this.locks.delete(key)
  }
  async release(key: string, owner: string) { if (this.locks.get(key) === owner) this.locks.delete(key) }
}

test('missing key selects explicit demo, requires no store and returns no raw name/birthday', async () => {
  const issue = createReadingService({}, { now })
  const ticket = await issue(body, '1.2.3.4')
  assert.equal(ticket.source, 'demo')
  assert.ok(CARDS.some(card => card.id === ticket.cardId && card.name === ticket.result.card))
  assert.equal('name' in ticket, false)
  assert.equal('year' in ticket, false)
  assert.deepEqual(ticket, await issue(body, 'another-ip'))
  assert.deepEqual(serviceStatus({}), { mode: 'demo' })
  assert.deepEqual(serviceStatus(env), { mode: 'unavailable' })
})

test('configured key with missing store/secret fails closed instead of serving demo', async () => {
  await assert.rejects(createReadingService(env, { now })(body, 'ip'), code('NOT_CONFIGURED'))
  await assert.rejects(createReadingService({ GEMINI_API_KEY: 'test' }, { store: new MemoryStore(), now })(body, 'ip'), code('NOT_CONFIGURED'))
})

test('same-day cache survives service instances, normalization and model changes without storing raw inputs', async () => {
  const store = new MemoryStore()
  let calls = 0
  const generate = async () => { calls++; return text }
  const first = await createReadingService(env, { store, generate, now })(body, '1.2.3.4')
  const second = await createReadingService({ ...env, GEMINI_MODEL: 'other' }, { store, generate, now })({ ...body, name: ' 지우 '.normalize('NFD'), month: '02' }, '9.8.7.6')
  assert.deepEqual(first, second)
  assert.equal(calls, 1)
  const persisted = JSON.stringify([...store.values]) + JSON.stringify(store.seen)
  for (const privateValue of ['지우', '2000-02-29', '1.2.3.4', '9.8.7.6']) assert.ok(!persisted.includes(privateValue))
  assert.equal(first.source, 'gemini')
})

test('simultaneous identical requests generate once and share the whole result', async () => {
  const store = new MemoryStore()
  let calls = 0
  const generate = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 20)); return text }
  const issue = createReadingService(env, { store, generate, now, wait: () => new Promise(resolve => setTimeout(resolve, 5)) })
  const tickets = await Promise.all(Array.from({ length: 8 }, () => issue(body, 'ip')))
  assert.equal(calls, 1)
  tickets.forEach(ticket => assert.deepEqual(ticket, tickets[0]))
  assert.equal(store.days.get('2026-09-12'), 1)
})

test('100 concurrent distinct calls consume the daily allowance; 101st fails but cached reopens work', async () => {
  const store = new MemoryStore()
  let calls = 0
  const issue = createReadingService(env, { store, generate: async () => { calls++; return text }, now })
  const results = await Promise.allSettled(Array.from({ length: 101 }, (_, i) => issue({ ...body, name: `관객${i}` }, `ip-${i}`)))
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 100)
  assert.equal(calls, 100)
  await assert.rejects(issue(body, 'new-ip'), code('DAILY_LIMIT'))
  assert.equal((await issue({ ...body, name: '관객0' }, 'new-ip')).source, 'gemini')
  assert.equal(calls, 100)
})

test('IP quota permits five new calls per minute and excludes cached reads', async () => {
  const store = new MemoryStore()
  let current = now()
  const issue = createReadingService(env, { store, generate: async () => text, now: () => current })
  for (let i = 0; i < 5; i++) await issue({ ...body, name: `관객${i}` }, 'ip')
  await assert.rejects(issue(body, 'ip'), code('RATE_LIMIT'))
  await issue({ ...body, name: '관객0' }, 'ip')
  current = new Date(current.getTime() + 60000)
  await issue(body, 'ip')
  assert.equal(store.days.get('2026-09-12'), 6)
})

test('Korean midnight resets the daily bucket and cache identity', async () => {
  const store = new MemoryStore()
  let current = new Date('2026-09-12T14:59:59Z')
  const issue = createReadingService(env, { store, generate: async () => text, now: () => current })
  const before = await issue(body, 'ip')
  current = new Date('2026-09-12T15:00:00Z')
  const after = await issue(body, 'ip')
  assert.equal(before.date, '2026-09-12')
  assert.equal(after.date, '2026-09-13')
  assert.notEqual(before.serial, after.serial)
})

test('failed calls stay charged, do not get cached, release lock, and retry with the same card', async () => {
  const store = new MemoryStore()
  const seen: string[] = []
  const issue = createReadingService(env, { store, now, generate: async card => {
    seen.push(card.id)
    if (seen.length === 1) throw new ReadingError(502, 'AI_UNAVAILABLE', '잠시 후 다시 시도해주세요.')
    return text
  } })
  await assert.rejects(issue(body, 'ip'), code('AI_UNAVAILABLE'))
  assert.equal(store.values.size, 0)
  assert.equal(store.locks.size, 0)
  await issue(body, 'ip')
  assert.deepEqual(seen, [seen[0], seen[0]])
  assert.equal(store.days.get('2026-09-12'), 2)
})

test('timeout aborts the provider and never silently falls back to demo', async () => {
  const store = new MemoryStore()
  let signal: AbortSignal | undefined
  const issue = createReadingService(env, { store, now, timeoutMs: 10, generate: async (_card, _category, _date, received) => { signal = received; return new Promise(() => {}) } })
  await assert.rejects(issue(body, 'ip'), code('AI_TIMEOUT'))
  assert.equal(signal?.aborted, true)
  assert.equal(store.values.size, 0)
  assert.equal(store.days.get('2026-09-12'), 1)
})

test('malformed or oversized model responses cannot enter the result cache', async () => {
  for (const value of [null, [], { ...text, card: 'made-up' }, { ...text, advice: '' }, { ...text, title: '가'.repeat(51) }]) assert.throws(() => validateReading(value))
  const store = new MemoryStore()
  const issue = createReadingService(env, { store, now, generate: async () => ({ ...text, title: '' }) })
  await assert.rejects(issue(body, 'ip'), code('READING_UNAVAILABLE'))
  assert.equal(store.values.size, 0)
})

test('invalid booking never consumes budget or calls Gemini', async () => {
  const store = new MemoryStore()
  const issue = createReadingService(env, { store, now, generate: async () => { assert.fail('Unexpected AI call') } })
  for (const invalid of [null, {}, { ...body, name: [] }, { ...body, day: '31' }, { ...body, category: '__proto__' }]) await assert.rejects(issue(invalid, 'ip'))
  assert.equal(store.seen.length, 0)
})

test('HTTP handler enforces method, JSON, size and same-origin; marks every response no-store', async () => {
  const handler = createReadingHandler({}, { now })
  const req = (method: string, data?: string, extra: Record<string, string> = {}) => new Request('https://tarket.example/api/readings', { method, headers: { 'content-type': 'application/json', ...extra }, body: data })
  assert.equal((await handler(req('GET'))).status, 200)
  assert.equal((await handler(req('DELETE'))).status, 405)
  assert.equal((await handler(req('POST', JSON.stringify(body), { 'content-type': 'text/plain' }))).status, 415)
  assert.equal((await handler(req('POST', '{'))).status, 400)
  assert.equal((await handler(req('POST', 'a'.repeat(5000)))).status, 413)
  assert.equal((await handler(req('POST', JSON.stringify(body), { origin: 'https://attacker.example' }))).status, 403)
  const result = await handler(req('POST', JSON.stringify(body), { origin: 'https://tarket.example' }))
  assert.equal(result.status, 200)
  assert.equal(result.headers.get('cache-control'), 'no-store')
  assert.equal((await result.json()).source, 'demo')
})

test('Gemini SDK sends structured schema without personal input and performs no hidden retries', async context => {
  const requests: unknown[] = []
  context.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    requests.push(JSON.parse(init.body as string))
    return Response.json({ candidates: [{ content: { role: 'model', parts: [{ text: JSON.stringify(text) }] }, finishReason: 'STOP' }] })
  })
  const generate = createGeminiGenerator('fake-local-key')
  assert.deepEqual(await generate(CARDS[17], '개발운', '2026-09-12', new AbortController().signal), text)
  assert.equal(requests.length, 1)
  const payload = JSON.stringify(requests[0])
  assert.ok(payload.includes('application/json'))
  assert.ok(payload.includes('responseJsonSchema'))
  assert.ok(!payload.includes(body.name))
  assert.ok(!payload.includes('2000'))
  context.mock.restoreAll()
  let failures = 0
  context.mock.method(globalThis, 'fetch', async () => { failures++; return Response.json({ error: { code: 503, message: 'Temporarily unavailable', status: 'UNAVAILABLE' } }, { status: 503 }) })
  await assert.rejects(createGeminiGenerator('fake-local-key')(CARDS[0], '개발운', '2026-09-12', new AbortController().signal), code('AI_UNAVAILABLE'))
  assert.equal(failures, 1)
})

test('Redis REST adapter sends atomic scripts, retains 48-hour cache and fails on storage errors', async context => {
  const commands: (string | number)[][] = []
  context.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    const command = JSON.parse(init.body as string) as (string | number)[]
    commands.push(command)
    return Response.json({ result: command[1] === RESERVE_SCRIPT ? ['reserved'] : 1 })
  })
  const store = new RedisReadingStore('https://example.upstash.io', 'test-token')
  assert.deepEqual(await store.reserve({ key: 'hashed-key', owner: 'owner', date: '2026-09-12', ipKey: 'hashed-ip', minute: 1 }), { kind: 'reserved' })
  const ticket = await createReadingService({}, { now })(body, 'ip')
  await store.complete('hashed-key', 'owner', ticket)
  assert.equal(commands[0][0], 'EVAL')
  assert.equal(commands[1][1], COMPLETE_SCRIPT)
  assert.ok(COMPLETE_SCRIPT.includes('172800'))
  context.mock.restoreAll()
  context.mock.method(globalThis, 'fetch', async () => Response.json({ error: 'unavailable' }, { status: 503 }))
  await assert.rejects(store.reserve({ key: 'x', owner: 'o', date: 'd', ipKey: 'i', minute: 1 }))
})
