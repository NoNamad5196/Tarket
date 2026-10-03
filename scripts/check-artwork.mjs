import sharp from 'sharp'
import { stat } from 'node:fs/promises'
import assert from 'node:assert/strict'
import { CARDS, CATEGORY_CARDS } from '../src/lib/cards.ts'

assert.equal(CARDS.length, 22)
assert.equal(new Set(CARDS.map(card => card.id)).size, 22)
for (const id of Object.values(CATEGORY_CARDS)) assert.ok(CARDS.some(card => card.id === id))
for (const id of [...CARDS.map(card => card.id), 'card-back']) {
  const path = `public/assets/tarot/${id}.webp`
  const meta = await sharp(path).metadata()
  assert.equal(meta.width, 640, id)
  assert.equal(meta.height, 960, id)
  assert.ok((await stat(path)).size < 250 * 1024, `${id} exceeds asset budget`)
}
console.log('All 22 cards and shared back are present, correctly mapped, 640×960, under 250 KB each.')
