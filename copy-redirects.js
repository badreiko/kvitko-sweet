// copy-redirects.js
const fs = require('fs');
const path = require('path');

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
  console.log('Файл _redirects успешно скопирован в директорию dist');
} else {
  console.error('Исходный файл _redirects не найден в директории public');
}
