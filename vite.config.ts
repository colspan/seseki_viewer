import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        main: fromRoot('./src/main.tsx'),
        landing: fromRoot('./src/landing.tsx'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/chunks/[name]-[hash].js',
        assetFileNames: assetInfo => {
          const name =
            (assetInfo as { names?: string[] }).names?.[0] ??
            (assetInfo as { name?: string }).name ??
            ''
          return name.endsWith('.css')
            ? 'css/main.css'
            : 'assets/[name]-[hash][extname]'
        },
      },
    },
  },
  server: {
    port: 8080,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts'],
  },
})
