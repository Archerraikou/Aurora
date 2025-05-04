import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:7242', // Your .NET backend
        changeOrigin: true,
        secure: false, // Disable SSL verification for dev self-signed certs
      },
    },
  },
})
