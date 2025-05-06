// src/firebase/services/index.ts
// Экспорт всех сервисов
export * from './authService';
export * from './productService';
export * from './orderService';
export * from './blogService';

// Экспорт конфигурации Firebase
export { app, auth, db, storage, analytics } from '../config';