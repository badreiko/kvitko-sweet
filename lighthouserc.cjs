/**
 * Lighthouse CI конфигурация.
 *
 * Запуск:  npm run lhci
 * Что делает:
 *   1. Поднимает vite preview на 4173.
 *   2. Гоняет Lighthouse 3 раза, берёт медиану.
 *   3. Падает CI, если метрики хуже бюджетов ниже.
 *
 * Бюджеты — наша линия в песке. Если они не проходят — это регрессия,
 * её надо чинить, а не «потом разберёмся».
 */
module.exports = {
  ci: {
    collect: {
      // Локально: поднимет preview через startServerCommand.
      // В CI: можно задать --collect.url через CLI.
      startServerCommand: 'npx vite preview --port 4173 --strictPort',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30_000,
      url: ['http://localhost:4173/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        // === Категории ===
        'categories:performance':     ['error', { minScore: 0.80 }],
        'categories:accessibility':   ['error', { minScore: 0.95 }],
        'categories:best-practices':  ['error', { minScore: 0.95 }],
        'categories:seo':             ['error', { minScore: 0.95 }],

        // === Core Web Vitals ===
        // Google рекомендует LCP <2.5s, INP <200ms, CLS <0.1.
        'largest-contentful-paint':   ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint':     ['error', { maxNumericValue: 1500 }],
        'cumulative-layout-shift':    ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time':        ['error', { maxNumericValue: 300 }],
        'speed-index':                ['warn',  { maxNumericValue: 3500 }],
        'interactive':                ['warn',  { maxNumericValue: 3500 }],

        // === Размер payload ===
        // Цель — <3 MB суммарно. Сейчас ~10 MB из-за legacy Firebase Storage
        // картинок, поэтому пока warn. Когда мигрируем — поднять до error.
        'total-byte-weight':          ['warn',  { maxNumericValue: 3_000_000 }],
        'unused-javascript':          ['warn',  { maxNumericValue: 200_000 }],

        // === Accessibility hard rules ===
        'color-contrast':             'error',
        'document-title':             'error',
        'html-has-lang':              'error',
        'meta-description':           'error',

        // === Известные ограничения SPA ===
        'valid-source-maps':          'off',     // намеренно отключены в проде
        'heading-order':              'warn',    // sr-only h2 в Footer
      },
    },
    upload: {
      // Локально храним временно. В CI можно поменять на temporary-public-storage
      // или подключить свой LHCI server (https://github.com/GoogleChrome/lighthouse-ci).
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
  },
};
