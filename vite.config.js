import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_TARGET = process.env.API_TARGET || 'http://localhost:3001'

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
    // Dev: Vite phuc vu UI, /api duoc chuyen tiep sang Express
    // => cung origin nen cookie phien dang nhap hoat dong binh thuong
    proxy: {
      '/api': { target: API_TARGET, changeOrigin: true },
    },
  },
})
