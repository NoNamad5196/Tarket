import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { CARDS } from '../src/lib/cards.ts'
const ids = [...CARDS.map(card => card.id), 'card-back']
await mkdir('docs', { recursive: true })
const layers = []
for (let i = 0; i < ids.length; i++) {
  const left = (i % 6) * 168 + 9, top = Math.floor(i / 6) * 258 + 9
  layers.push({ input: await sharp(`public/assets/tarot/${ids[i]}.webp`).resize(150, 225).toBuffer(), left, top })
  const label = `<svg width="150" height="23"><text x="75" y="16" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#e8ddf3">${ids[i]}</text></svg>`
  layers.push({ input: Buffer.from(label), left, top: top + 227 })
}
await sharp({ create: { width: 1008, height: 1032, channels: 3, background: '#21142e' } }).composite(layers).jpeg({ quality: 90 }).toFile('docs/tarot-contact-sheet.jpg')
