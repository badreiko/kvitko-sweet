const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Начинаем процесс сборки для Netlify...');

process.env.CI = 'false';
process.env.SKIP_PREFLIGHT_CHECK = 'true';
process.env.TSC_COMPILE_ON_ERROR = 'true';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('🔨 Запускаем сборку Vite...');
execSync('npx vite build', { stdio: 'inherit', env: { ...process.env, CI: 'false' } });

const sourcePath = path.join(__dirname, 'public', '_redirects');
const targetPath = path.join(distDir, '_redirects');
if (fs.existsSync(sourcePath)) {
  fs.copyFileSync(sourcePath, targetPath);
  console.log('📄 Файл _redirects скопирован в директорию dist');
} else {
  console.warn('⚠️ Файл _redirects не найден в public — пропускаем копирование');
}

console.log('✅ Сборка успешно завершена!');
