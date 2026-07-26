import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer'
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
    // Агрессивная оптимизация локальных картинок при билде. Лечит
    // главную проблему Lighthouse: src/assets/*.png по 1.5-2 MB.
    // Sharp + svgo внутри плагина пережимают без потери видимого качества.
    ViteImageOptimizer({
      png: { quality: 75, compressionLevel: 9, adaptiveFiltering: true },
      jpeg: { quality: 78, progressive: true },
      jpg: { quality: 78, progressive: true },
      webp: { quality: 78, effort: 6 },
      avif: { quality: 60, effort: 6 },
      svg: { multipass: true },
      logStats: true,
    }),
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
        // Намеренно держим vendor одним монолитным чанком. Дробление
        // node_modules между несколькими manualChunks в Rollup может
        // создать circular import между чанками и привести к TDZ-ошибке
        // вида "cannot access lexical declaration 'n' before initialization"
        // в production. Один vendor чанк = один порядок инициализации.
        //
        // Главный win всё равно сохраняется: код админки уходит в свой
        // ленивый чанк через React.lazy в App.tsx, и витрина его не качает.
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/src/components/admin/')) {
            return 'admin';
          }
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
  publicDir: 'public',
  // Конфигурация Vitest. Тесты живут рядом с исходниками или в src/tests/.
  // @ts-expect-error — поле `test` валидно для Vitest, но отсутствует в типах Vite.
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
  }
})