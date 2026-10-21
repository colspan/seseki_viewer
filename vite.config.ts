import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

function devHtmlEntry(): Plugin {
  return {
    name: 'seseki-dev-html-entry',
    apply: 'serve',
    transformIndexHtml(html) {
      return html
        .replace('./dist/js/main.js', '/src/main.tsx')
        .replace('./dist/js/landing.js', '/src/landing.tsx')
        .replace('<link rel="stylesheet" href="./dist/css/main.css">', '')
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), devHtmlEntry()],
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
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('@mantine') || id.includes('@tabler')) {
            return 'mantine'
          }
          if (id.includes('react-data-grid')) return 'data-grid'
          if (id.includes('leaflet')) return 'leaflet'
          if (/\/node_modules\/(react|react-dom|scheduler|zustand)\//.test(id)) {
            return 'react'
          }
          if (id.includes('d3-') || id.includes('topojson')) return 'd3'

          return 'vendor'
        },
        assetFileNames: (assetInfo) => {
          const name =
            (assetInfo as { names?: string[] }).names?.[0] ??
            (assetInfo as { name?: string }).name ??
            ''
          return name.endsWith('.css') ? 'css/main.css' : 'assets/[name]-[hash][extname]'
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
