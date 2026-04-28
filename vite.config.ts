import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Must match your GitHub repo name for Pages at username.github.io/<repo-name>/
const githubRepoBase = '/luna-website/'

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? githubRepoBase : '/',
  plugins: [react()],
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
