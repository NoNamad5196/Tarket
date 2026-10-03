import { CATEGORY_CONFIG, type Category, type TarotResult } from './tarot-data.ts'
import { CARDS, demoReading, type CardId } from './cards.ts'

export interface BookingInput { name: string; year: string; month: string; day: string }
export interface Ticket {
  cardId: CardId
  source: 'demo' | 'gemini'
  name: string
  category: Category
  date: string
  serial: string
  result: TarotResult
}
export type BookingErrors = Partial<Record<'name' | 'birth', string>>
export const MAX_NAME_LENGTH = 24

export function normalizeName(name: string): string {
  return name.normalize('NFC').trim().replace(/\s+/g, ' ')
}

export function localDate(date = new Date()): string {
  return new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export function validateBooking(input: BookingInput, today = localDate()): BookingErrors {
  const errors: BookingErrors = {}
  const name = normalizeName(input.name)
  if (!name) errors.name = '티켓에 적을 이름을 입력해주세요.'
  else if (Array.from(name).length > MAX_NAME_LENGTH) errors.name = `이름은 ${MAX_NAME_LENGTH}자 이내로 입력해주세요.`
  else if (/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/u.test(name)) errors.name = '이름에 보이지 않는 문자가 있어요. 다시 입력해주세요.'
  const { year, month, day } = input
  const y = Number(year), m = Number(month), d = Number(day)
  if (!/^\d{4}$/.test(year) || y < 1900 || y > Number(today.slice(0, 4))) {
    errors.birth = `연도를 1900~${today.slice(0, 4)} 사이의 네 자리 숫자로 입력해주세요.`
  } else if (!/^\d{1,2}$/.test(month) || m < 1 || m > 12) {
    errors.birth = '월을 1~12 사이로 입력해주세요.'
  } else if (!/^\d{1,2}$/.test(day) || d < 1 || d > 31) {
    errors.birth = '일을 올바르게 입력해주세요.'
  } else {
    const candidate = new Date(y, m - 1, d)
    if (candidate.getMonth() !== m - 1 || candidate.getDate() !== d) {
      errors.birth = '달력에 없는 날짜예요. 생년월일을 다시 확인해주세요.'
    } else if (`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}` > today) {
      errors.birth = '생년월일은 오늘보다 미래일 수 없어요.'
    }
  }
  return errors
}

function hash(value: string): number {
  let output = 2166136261
  for (const char of value) output = Math.imul(output ^ char.codePointAt(0)!, 16777619)
  return output >>> 0
}

/** Curated demo only. Production AI issuance is handled by /api/readings. */
export function issueTicket(input: BookingInput, category: Category, date = localDate()): Ticket {
  if (Object.keys(validateBooking(input, date)).length) throw new Error('Invalid booking')
  if (!CATEGORY_CONFIG.some(item => item.name === category)) throw new Error('Unknown category')
  const name = normalizeName(input.name)
  const birth = `${input.year}${input.month.padStart(2, '0')}${input.day.padStart(2, '0')}`
  const seed = JSON.stringify([name, birth, category, date])
  const card = CARDS[hash(seed) % CARDS.length]
  return {
    name, category, date, cardId: card.id, source: 'demo',
    serial: `TKT-${date.replaceAll('-', '')}-${hash('ticket:' + seed).toString(36).toUpperCase().padStart(7, '0')}`,
    result: demoReading(card, category),
  }
}
