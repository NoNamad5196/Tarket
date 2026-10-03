import sharp from 'sharp'
import { mkdir, access, writeFile } from 'node:fs/promises'
import { CARDS } from '../src/lib/cards.ts'

const partial = process.argv.includes('--partial')
const ids = [...CARDS.map(card => card.id), 'card-back']
await mkdir('public/assets/tarot', { recursive: true })
const assets = []
for (const id of ids) {
  const original = `artwork/tarot/originals/${id}.png`
  try { await access(original) } catch {
    if (partial) continue
    throw new Error(`Missing original artwork: ${id}`)
  }
  const output = `public/assets/tarot/${id}.webp`
  const result = await sharp(original).resize(640, 960, { fit: 'contain', background: '#f7f2e8' }).webp({ quality: 84, effort: 5 }).toFile(output)
  assets.push({ id, original, url: `/assets/tarot/${id}.webp`, width: result.width, height: result.height, bytes: result.size })
}
if (!partial) await writeFile('artwork/tarot/manifest.json', JSON.stringify({ style: 'Flat pastel anime tarot; final user reference direction', assets }, null, 2) + '\n')
console.log(`Prepared ${assets.length}/${ids.length} WebP assets, ${Math.round(assets.reduce((sum, asset) => sum + asset.bytes, 0) / 1024)} KB total.`)
