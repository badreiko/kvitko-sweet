// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyAI73IPE_YOOwB1K9-5mQFMHWcvvrJAkUU",
  authDomain: "kvitko-sweet-d226a.firebaseapp.com",
  projectId: "kvitko-sweet-d226a",
  storageBucket: "kvitko-sweet-d226a.firebasestorage.app",
  messagingSenderId: "132008587224",
  appId: "1:132008587224:web:5d0191f34fd39d383f4cad",
  measurementId: "G-GVNRZKMR3X"
};

// Инициализация Firebase
export const app = initializeApp(firebaseConfig);

// Инициализация сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Analytics только в браузере
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
export { analytics };