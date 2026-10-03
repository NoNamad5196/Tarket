import assert from 'node:assert/strict'
// Smoke-test emitted ESM, not just TypeScript source. Never call a live provider.
process.env.GEMINI_API_KEY = ''
const { default: api } = await import('../.cache/server-check/api/readings.js')
const status = await api.fetch(new Request('https://tarket.example/api/readings'))
assert.equal(status.status, 200)
assert.equal((await status.json()).mode, 'demo')
const response = await api.fetch(new Request('https://tarket.example/api/readings', {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: '빌드 테스트', year: '2000', month: '2', day: '29', category: '개발운' }),
}))
assert.equal(response.status, 200)
assert.equal((await response.json()).source, 'demo')
console.log('Compiled ESM API imports and GET/POST demo issuance passed.')
