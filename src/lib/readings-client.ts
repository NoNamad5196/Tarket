import { normalizeName, type Ticket } from './tarot.ts'
import { CARDS } from './cards.ts'
import type { ApiError, ReadingRequest, ReadingResponse } from './readings-contract.ts'

export class ClientReadingError extends Error {
  retryAfter: number
  constructor(message: string, retryAfter = 0) { super(message); this.retryAfter = retryAfter }
}
export async function requestReading(input: ReadingRequest, signal: AbortSignal): Promise<Ticket> {
  const response = await fetch('/api/readings', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input),
    signal: AbortSignal.any([signal, AbortSignal.timeout(35000)]),
  })
  const body = await response.json() as ReadingResponse & ApiError
  if (!response.ok) throw new ClientReadingError(body.message || '발권기를 잠시 이용할 수 없어요.', body.retryAfter || 0)
  const card = CARDS.find(item => item.id === body.cardId)
  if (!card || !body.result || body.result.card !== card.name || !['demo', 'gemini'].includes(body.source)) throw new ClientReadingError('티켓 정보를 읽지 못했어요. 다시 발권해주세요.')
  return { ...body, name: normalizeName(input.name) }
}
