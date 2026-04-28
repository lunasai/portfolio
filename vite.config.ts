import { copyFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Must match the repo name for project Pages: https://<user>.github.io/<repo>/
const githubRepoBase = '/portfolio/'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? githubRepoBase : '/',
  plugins: [
    react(),
    {
      name: 'github-pages-404',
      closeBundle() {
        const indexHtml = resolve(__dirname, 'dist/index.html')
        const notFoundHtml = resolve(__dirname, 'dist/404.html')
        if (existsSync(indexHtml)) copyFileSync(indexHtml, notFoundHtml)
      },
    },
  ],
  // Match local URL: http://localhost:5182/ (Vite default is 5173)
  server: {
    port: 5182,
    // If 5182 is taken (e.g. old dev still running), Vite uses the next free port and prints the URL
    strictPort: false,
  },
  preview: {
    port: 5182,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
}))
