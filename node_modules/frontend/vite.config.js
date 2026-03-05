import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In development, proxy /api/* to the local FastAPI server.
  // In production on Vercel, the vercel.json routes handle this automatically.
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  // Output the production build in a 'dist' folder inside frontend/.
  build: {
    outDir: 'dist',
  },
})
