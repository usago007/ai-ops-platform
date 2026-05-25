import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/ai-ops-platform/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'es-toolkit/compat/get': path.resolve(__dirname, 'node_modules/es-toolkit/compat/get.mjs'),
      'es-toolkit/compat/omit': path.resolve(__dirname, 'node_modules/es-toolkit/compat/omit.mjs'),
      'es-toolkit/compat/range': path.resolve(__dirname, 'node_modules/es-toolkit/compat/range.mjs'),
      'es-toolkit/compat/last': path.resolve(__dirname, 'node_modules/es-toolkit/compat/last.mjs'),
      'es-toolkit/compat/maxBy': path.resolve(__dirname, 'node_modules/es-toolkit/compat/maxBy.mjs'),
      'es-toolkit/compat/minBy': path.resolve(__dirname, 'node_modules/es-toolkit/compat/minBy.mjs'),
      'es-toolkit/compat/uniqBy': path.resolve(__dirname, 'node_modules/es-toolkit/compat/uniqBy.mjs'),
      'es-toolkit/compat/sortBy': path.resolve(__dirname, 'node_modules/es-toolkit/compat/sortBy.mjs'),
      'es-toolkit/compat/isPlainObject': path.resolve(__dirname, 'node_modules/es-toolkit/compat/isPlainObject.mjs'),
      'es-toolkit/compat/sumBy': path.resolve(__dirname, 'node_modules/es-toolkit/compat/sumBy.mjs'),
      'es-toolkit/compat/throttle': path.resolve(__dirname, 'node_modules/es-toolkit/compat/throttle.mjs'),
    },
  },
  server: {
    port: 3000,
    open: true,
    strictPort: false,
  },
})
