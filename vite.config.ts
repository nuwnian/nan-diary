import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'deploy',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
  },
  // Environment variables prefixed with VITE_ are exposed to the client
  // This allows us to use import.meta.env.VITE_FIREBASE_API_KEY in the code
  define: {
    // Make process.env available for legacy code compatibility
    'process.env.FIREBASE_API_KEY': JSON.stringify(process.env.FIREBASE_API_KEY || process.env.VITE_FIREBASE_API_KEY),
  },
})
