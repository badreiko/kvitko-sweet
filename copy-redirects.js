// copy-redirects.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем __dirname для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к исходному файлу _redirects
const sourcePath = path.join(__dirname, 'public', '_redirects');
// Путь к целевому файлу в директории dist
const targetPath = path.join(__dirname, 'dist', '_redirects');

// Проверяем, существует ли исходный файл
if (fs.existsSync(sourcePath)) {
  // Создаем директорию dist, если она не существует
  if (!fs.existsSync(path.join(__dirname, 'dist'))) {
    fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
  }

  // Копируем файл
  fs.copyFileSync(sourcePath, targetPath);
  console.log('✅ _redirects file copied to dist folder');
} else {
  console.error('❌ Source file _redirects not found in public directory');
}
