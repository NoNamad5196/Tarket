import type { Ticket, BookingInput } from './tarot.ts'
import type { Category } from './tarot-data.ts'

export type ReadingRequest = BookingInput & { category: Category }
export type ReadingResponse = Omit<Ticket, 'name'>
export type ServiceStatus = { mode: 'demo' | 'gemini' | 'unavailable' }
export interface ApiError { code: string; message: string; retryAfter?: number }
