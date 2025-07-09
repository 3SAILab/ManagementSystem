import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // 后端服务地址
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '') // 可选：去掉 /api 前缀
      }
    }
  }
})

