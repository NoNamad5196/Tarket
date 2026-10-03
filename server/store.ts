import type { ReadingResponse } from '../src/lib/readings-contract.ts'

export type Reservation = { kind: 'cached'; value: ReadingResponse } | { kind: 'reserved' | 'pending' | 'daily-limit' | 'ip-limit' }
export interface ReservationInput { key: string; owner: string; date: string; ipKey: string; minute: number }
export interface ReadingStore {
  reserve(input: ReservationInput): Promise<Reservation>
  get(key: string): Promise<ReadingResponse | null>
  complete(key: string, owner: string, value: ReadingResponse): Promise<void>
  release(key: string, owner: string): Promise<void>
}

// One Redis operation checks the cache, claims the request, and charges both quotas.
export const RESERVE_SCRIPT = `
local cached = redis.call('GET', KEYS[1])
if cached then return {'cached', cached} end
if redis.call('EXISTS', KEYS[2]) == 1 then return {'pending'} end
if tonumber(redis.call('GET', KEYS[3]) or '0') >= 100 then return {'daily-limit'} end
if tonumber(redis.call('GET', KEYS[4]) or '0') >= 5 then return {'ip-limit'} end
redis.call('SET', KEYS[2], ARGV[1], 'EX', 45)
redis.call('INCR', KEYS[3])
redis.call('EXPIRE', KEYS[3], 172800)
redis.call('INCR', KEYS[4])
redis.call('EXPIRE', KEYS[4], 120)
return {'reserved'}
`
export const COMPLETE_SCRIPT = `
if redis.call('GET', KEYS[2]) ~= ARGV[1] then return 0 end
redis.call('SET', KEYS[1], ARGV[2], 'EX', 172800)
redis.call('DEL', KEYS[2])
return 1
`
export const RELEASE_SCRIPT = `
if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end
return 0
`

export class RedisReadingStore implements ReadingStore {
  private url: string
  private token: string
  constructor(url: string, token: string) { this.url = url; this.token = token }
  private async command<T>(args: (string | number)[]): Promise<T> {
    const response = await fetch(this.url, {
      method: 'POST', headers: { Authorization: `Bearer ${this.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args), signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) throw new Error('Storage unavailable')
    const data = await response.json() as { result: T; error?: string }
    if (data.error) throw new Error('Storage command failed')
    return data.result
  }
  async reserve(input: ReservationInput): Promise<Reservation> {
    const result = await this.command<string[]>(['EVAL', RESERVE_SCRIPT, 4, input.key, `${input.key}:lock`, `tarket:daily:${input.date}`, `tarket:ip:${input.ipKey}:${input.minute}`, input.owner])
    if (result[0] === 'cached') return { kind: 'cached', value: JSON.parse(result[1]) as ReadingResponse }
    if (['reserved', 'pending', 'daily-limit', 'ip-limit'].includes(result[0])) return { kind: result[0] as Exclude<Reservation['kind'], 'cached'> }
    throw new Error('Unexpected reservation')
  }
  async get(key: string) {
    const result = await this.command<string | null>(['GET', key])
    return result ? JSON.parse(result) as ReadingResponse : null
  }
  async complete(key: string, owner: string, value: ReadingResponse) {
    const committed = await this.command<number>(['EVAL', COMPLETE_SCRIPT, 2, key, `${key}:lock`, owner, JSON.stringify(value)])
    if (committed !== 1) throw new Error('Reservation expired')
  }
  async release(key: string, owner: string) {
    await this.command(['EVAL', RELEASE_SCRIPT, 1, `${key}:lock`, owner])
  }
}
