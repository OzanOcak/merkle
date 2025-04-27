import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/index.ts')
        },
        output: {
          dir: 'out/main'
        }
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts')
        },
        output: {
          format: 'cjs',
          dir: 'out/preload'
        }
      }
    }
  },
  renderer: {
    resolve: {
      alias: [
        // Force single React instance
        { find: 'react', replacement: resolve('node_modules/react') },
        { find: 'react-dom', replacement: resolve('node_modules/react-dom') },
        // Project aliases
        { find: '@', replacement: resolve('src/renderer/src') },
        { find: '@renderer', replacement: resolve('src/renderer/src') },
        { find: '@backend', replacement: resolve('backend/src') },
        { find: '@main', replacement: resolve('src/main') },
        // Libraries
        {
          find: '@tanstack/react-query',
          replacement: resolve('node_modules/@tanstack/react-query')
        },
        {
          find: '@tanstack/react-query-devtools',
          replacement: resolve('node_modules/@tanstack/react-query-devtools')
        },
        { find: 'path', replacement: 'path-browserify' }
      ]
    },
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: '../../out/renderer',
      emptyOutDir: true,
      minify: 'terser',
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html')
        },
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    }
  }
})
