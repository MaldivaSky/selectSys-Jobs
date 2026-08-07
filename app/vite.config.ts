import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // O vocabulário do domínio mora no core e é consumido pela vitrine.
      '@selectsys/core': fileURLToPath(new URL('../packages/core/src', import.meta.url)),
    },
  },
})
