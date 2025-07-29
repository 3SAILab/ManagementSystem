import { defineConfig, loadEnv } from 'vite' // 👈 1. 导入 loadEnv
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => { // 👈 2. 使用函数形式，并接收 mode 参数
  // 显式加载 .env 文件
  const env = loadEnv(mode, process.cwd(), '') // 第三个参数 '' 表示加载所有变量，不限于 VITE_ 前缀

  const host = env.VITE_SERVER_HOST // 👈 3. 从加载的 env 对象中获取
  const port = parseInt(env.VITE_SERVER_PORT) // 👈 4. 从加载的 env 对象中获取
  const serverOpen = env.VITE_SERVER_OPEN === 'true' // 👈 5. 从加载的 env 对象中获取

  return {
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      host: host,
      port: port,
      open: serverOpen,
    }
  }
})