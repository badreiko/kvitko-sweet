// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Firebase конфигурация
const firebaseConfig = {
  apiKey: "AIzaSyD-yc1UoyATTyaDM3ZMESQFW22jFv6u_Sc",
  authDomain: "kvitko-sweet.firebaseapp.com",
  projectId: "kvitko-sweet",
  storageBucket: "kvitko-sweet.firebasestorage.app",
  messagingSenderId: "911440795607",
  appId: "1:911440795607:web:232e974c3252c49c895d92",
  measurementId: "G-25MZ8NWED0"
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