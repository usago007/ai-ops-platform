import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import { viteSingleFile } from 'vite-plugin-singlefile'

function inlineFaviconPlugin(): Plugin {
  return {
    name: 'inline-favicon',
    transformIndexHtml(html) {
      const faviconPath = path.resolve(__dirname, 'public/favicon.svg')
      if (!fs.existsSync(faviconPath)) return html
      const svg = fs.readFileSync(faviconPath, 'utf-8')
      const encoded = `data:image/svg+xml,${encodeURIComponent(svg)}`
      return html.replace(/href="\/favicon\.svg"|href="\.\/favicon\.svg"|href="favicon\.svg"/g, `href="${encoded}"`)
    },
  }
}

function cleanPublicFilesPlugin(): Plugin {
  return {
    name: 'clean-public-files',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      for (const file of ['favicon.svg', 'icons.svg', 'mockServiceWorker.js']) {
        const target = path.join(distDir, file)
        if (fs.existsSync(target)) {
          fs.unlinkSync(target)
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    inlineFaviconPlugin(),
    viteSingleFile(),
    cleanPublicFilesPlugin(),
  ],
  define: {
    'import.meta.env.VITE_SINGLE_FILE': JSON.stringify('true'),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    sourcemap: false,
    chunkSizeWarningLimit: 8192,
  },
})
