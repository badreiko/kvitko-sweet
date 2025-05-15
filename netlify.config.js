// netlify.config.js
module.exports = {
  // Отключаем проверку ESLint во время сборки
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Отключаем проверку TypeScript во время сборки
  typescript: {
    ignoreBuildErrors: true,
  },
  // Настройки для Vite
  build: {
    outDir: 'dist',
  },
  // Игнорируем предупреждения как ошибки
  env: {
    CI: 'false',
  }
};
