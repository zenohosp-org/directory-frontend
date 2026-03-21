import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /api requests are forwarded to the Spring Boot backend.
      // The browser never makes a cross-origin call — CORS is a non-issue in dev.
      '/api': {
        target: 'https://directory-backend-kdhr.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'https://directory-backend-kdhr.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
