import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
const host = process.env.VITE_SERVER_HOST
const port = parseInt(process.env.VITE_SERVER_PORT)
const serverOpen = process.env.VITE_SERVER_OPEN === 'true'



// https://vite.dev/config/
export default defineConfig({
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
})

