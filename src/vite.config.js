import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) では manualChunks は関数形式で指定
        manualChunks(id) {
          if (id.includes('maplibre-gl')) return 'maplibre'
          if (id.includes('firebase/auth')) return 'firebase-auth'
          if (id.includes('firebase/firestore')) return 'firebase-firestore'
          if (id.includes('firebase/storage')) return 'firebase-storage'
          if (id.includes('firebase/app') || id.includes('firebase/')) return 'firebase-app'
          if (id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor'
        },
      },
    },
    chunkSizeWarningLimit: 1100,
  },
})
