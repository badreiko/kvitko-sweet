#!/bin/bash

# Скрипт для подготовки сборки на Netlify

echo "Начинаем процесс сборки для Netlify..."

# Установка зависимостей с игнорированием ошибок peer dependencies
echo "Установка зависимостей..."
npm install --legacy-peer-deps

# Очистка кэша, если возникают проблемы
echo "Очистка кэша..."
npm cache clean --force

# Сборка проекта с отключенными проверками TypeScript
echo "Сборка проекта..."
CI=false npm run build

echo "Сборка завершена!"
