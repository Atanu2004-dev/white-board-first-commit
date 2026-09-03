import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Change this to 3000 or any port you prefer
    strictPort: true, // Optional: Prevents Vite from automatically trying the next available port if 3000 is busy
  }
})
