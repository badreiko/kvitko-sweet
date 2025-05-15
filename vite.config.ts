import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true
    }
  },
  build: {
    sourcemap: process.env.NODE_ENV !== 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
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