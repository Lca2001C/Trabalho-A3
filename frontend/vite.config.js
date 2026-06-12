import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Escuta em 0.0.0.0 — acessível ao túnel NGROK
    host: true,
    // Libera os domínios do NGROK (Vite bloqueia hosts desconhecidos por padrão)
    allowedHosts: ['.ngrok-free.app', '.ngrok.app', '.ngrok.io'],
    // Proxy /api para o backend — permite expor apenas o frontend via NGROK
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
})
