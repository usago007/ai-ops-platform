import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const esToolkitCompat = (name: string) =>
  path.resolve(__dirname, `patches/es-toolkit/compat/${name}.mjs`)

export default defineConfig({
  plugins: [react({
    exclude: [/node_modules/, /src\/app\/router\.tsx$/],
  })],
  base: '/ai-ops-platform/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'es-toolkit/compat/get':          esToolkitCompat('get'),
      'es-toolkit/compat/omit':         esToolkitCompat('omit'),
      'es-toolkit/compat/range':        esToolkitCompat('range'),
      'es-toolkit/compat/last':         esToolkitCompat('last'),
      'es-toolkit/compat/maxBy':        esToolkitCompat('maxBy'),
      'es-toolkit/compat/minBy':        esToolkitCompat('minBy'),
      'es-toolkit/compat/uniqBy':       esToolkitCompat('uniqBy'),
      'es-toolkit/compat/sortBy':       esToolkitCompat('sortBy'),
      'es-toolkit/compat/isPlainObject':esToolkitCompat('isPlainObject'),
      'es-toolkit/compat/sumBy':        esToolkitCompat('sumBy'),
      'es-toolkit/compat/throttle':     esToolkitCompat('throttle'),
    },
  },
  server: {
    port: 3000,
    open: true,
    strictPort: false,
  },
})
