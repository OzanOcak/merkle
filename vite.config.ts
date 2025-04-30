import { join, resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    root: './src/renderer',
    build: {
      outDir: '../../out/renderer', // Output directory
      emptyOutDir: true,
      rollupOptions: {
        input: {
          index: join(__dirname, 'src/renderer/index.html')
        }
      }
    },
    css: {
      postcss: './postcss.config.js'
    },
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
