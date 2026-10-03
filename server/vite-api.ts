import type { Plugin } from 'vite'
import { createReadingHandler, type ReadingEnvironment } from './readings.ts'

/** Run the exact deployment handler locally; no separate mock-only frontend path. */
export function readingsApi(env: ReadingEnvironment): Plugin {
  const handler = createReadingHandler(env)
  return {
    name: 'tarket-readings-api',
    configureServer(server) {
      server.middlewares.use('/api/readings', async (req, res) => {
        const headers = new Headers()
        for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(',') : value)
        const controller = new AbortController()
        req.on('aborted', () => controller.abort())
        try {
          const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : new ReadableStream<Uint8Array>({
            start(stream) {
              req.on('data', chunk => stream.enqueue(new Uint8Array(chunk)))
              req.on('end', () => stream.close())
              req.on('error', error => stream.error(error))
            },
          })
          const request = new Request(`http://${req.headers.host}/api/readings`, { method: req.method, headers, body, signal: controller.signal, duplex: 'half' } as RequestInit)
          const response = await handler(request)
          res.statusCode = response.status
          response.headers.forEach((value, key) => res.setHeader(key, value))
          res.end(await response.text())
        } catch { res.statusCode = 503; res.end(JSON.stringify({ code: 'UNAVAILABLE', message: '발권기를 잠시 이용할 수 없어요.' })) }
      })
    },
  }
}
