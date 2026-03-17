import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { writeFileSync } from 'node:fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'write-nojekyll',
      closeBundle() {
        writeFileSync('docs/.nojekyll', '')
      },
    },
  ],
  base: '/p47/',
  build: {
    outDir: 'docs',
  },
})
