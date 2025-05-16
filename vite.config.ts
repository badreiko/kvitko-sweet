import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

// Функция для копирования файла _redirects после сборки
const copyRedirects = () => {
  return {
    name: 'copy-redirects',
    closeBundle() {
      const sourcePath = path.resolve(__dirname, 'public', '_redirects')
      const targetPath = path.resolve(__dirname, 'dist', '_redirects')
      if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, targetPath)
        console.log('\n✅ _redirects file copied to dist folder')
      } else {
        console.warn('\n⚠️ _redirects file not found in public folder')
      }
    }
  }
}

export default defineConfig({
  plugins: [
    react(),
    copyRedirects()
  ],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      format: {
        comments: false
      }
    },
    assetsDir: 'assets',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-navigation-menu', '@radix-ui/react-slot', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    },
    chunkSizeWarningLimit: 1600
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './app')
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-slot',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu'
    ],
    exclude: ['firebase']
  },
  publicDir: 'public'
})