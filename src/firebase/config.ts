// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";

// Firebase конфигурация (можно переопределить через переменные окружения)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAI73IPE_YOOwB1K9-5mQFMHWcvvrJAkUU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kvitko-sweet-d226a.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kvitko-sweet-d226a",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kvitko-sweet-d226a.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "132008587224",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:132008587224:web:5d0191f34fd39d383f4cad",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-GVNRZKMR3X"
};

// Инициализация Firebase
export const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
// ignoreUndefinedProperties: при записи документов поля со значением `undefined`
// будут пропущены вместо выброса ошибки. Нужно, чтобы admin-формы могли
// безопасно слать опциональные поля (focal point, orientation и т.п.).
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true,
});
export const storage = getStorage(app);

// Analytics только в браузере
let analytics: Analytics | null = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };