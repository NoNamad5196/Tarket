import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import { readingsApi } from './server/vite-api'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), readingsApi({ ...loadEnv(mode, process.cwd(), ''), ...process.env })],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { host: '127.0.0.1', port: 5175, strictPort: true },
  preview: { host: '127.0.0.1', port: 4175, strictPort: true },
}))
