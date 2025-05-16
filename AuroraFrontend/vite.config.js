import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mkcert from 'vite-plugin-mkcert'
export default defineConfig({
  plugins: [react(),mkcert()],
  server: {
    watch: {
      usePolling: true, // Required for WSL/Docker
    },
    https: true,
    host:'localhost',
    proxy: {
      '/api': {
        target: 'https://localhost:7242', // Your .NET backend
        changeOrigin: true,
        secure: false, // Disable SSL verification for dev self-signed certs
      },
    },
  },
})
