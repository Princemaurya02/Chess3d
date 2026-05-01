import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Rolldown (Vite 8) requires manualChunks as a function
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('peerjs'))                                     return 'peer-vendor';
            if (id.includes('@react-three'))                               return 'r3f-vendor';
            if (id.includes('three'))                                      return 'three-vendor';
            if (id.includes('chess.js') || id.includes('zustand'))        return 'chess-vendor';
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
          }
        },
      },
    },
  },
})
