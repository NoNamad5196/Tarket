import { GoogleGenAI } from '@google/genai'
import type { Card } from '../src/lib/cards.ts'
import type { Category, TarotResult } from '../src/lib/tarot-data.ts'
import { ReadingError } from './errors.ts'

export type ReadingText = Omit<TarotResult, 'card' | 'cardKo' | 'keywords'>
export type GenerateReading = (card: Card, category: Category, date: string, signal: AbortSignal) => Promise<ReadingText>
const LIMITS: Record<keyof ReadingText, number> = { title: 50, summary: 160, detail: 400, advice: 180, caution: 180, luck: 50 }
export const READING_SCHEMA = {
  type: 'object', additionalProperties: false,
  properties: Object.fromEntries(Object.entries(LIMITS).map(([key, maxLength]) => [key, { type: 'string', minLength: 1, maxLength }])),
  required: Object.keys(LIMITS),
}
export function validateReading(value: unknown): ReadingText {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid reading')
  const data = value as Record<string, unknown>
  if (Object.keys(data).length !== Object.keys(LIMITS).length) throw new Error('Unexpected reading fields')
  const result: Record<string, string> = {}
  for (const [key, limit] of Object.entries(LIMITS)) {
    const text = data[key]
    if (typeof text !== 'string' || !text.trim() || Array.from(text).length > limit || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u.test(text)) throw new Error('Invalid reading field')
    result[key] = text.trim()
  }
  return result as ReadingText
}

export function createGeminiGenerator(apiKey: string, model = 'gemini-3.1-flash-lite'): GenerateReading {
  // Explicit key and disabled SDK retries: each reserved slot means at most one provider call.
  const client = new GoogleGenAI({ apiKey, httpOptions: { retryOptions: { attempts: 1 }, timeout: 20000 } })
  return async (card, category, date, signal) => {
    try {
      const response = await client.models.generateContent({
        model, contents: JSON.stringify({ card: card.name, meaning: card.meaning, category, date }),
        config: {
          abortSignal: signal, responseMimeType: 'application/json', responseJsonSchema: READING_SCHEMA,
          maxOutputTokens: 2048,
          systemInstruction: '당신은 Tarket의 다정하고 차분한 한국어 타로 해설자입니다. 제공된 카드와 분야를 오늘의 성찰을 위한 상징으로 해석하세요. title은 짧은 제목, summary는 한두 문장, detail은 두세 문장, advice와 caution은 실천 가능한 한두 문장, luck은 짧은 일상적 요소입니다. 확정적 예언, 금전 수익 보장, 의료 진단, 죽음이나 사고 예고를 하지 마세요. 타인의 속마음을 사실처럼 단정하지 마세요. 금전운은 지출 점검과 습관에 집중하세요. 죽음·악마·탑은 변화와 자각의 상징으로 설명하세요. 생년월일 분석이나 사주를 했다고 주장하지 마세요. 지정된 JSON 외에 마크다운이나 다른 내용을 출력하지 마세요.',
        },
      })
      if (!response.text) throw new Error('Empty provider response')
      return validateReading(JSON.parse(response.text))
    } catch {
      throw new ReadingError(502, signal.aborted ? 'AI_TIMEOUT' : 'AI_UNAVAILABLE', signal.aborted ? '해석에 시간이 조금 오래 걸리고 있어요. 잠시 후 다시 발권해주세요.' : '해석을 준비하지 못했어요. 잠시 후 다시 발권해주세요.')
    }
  }
}
