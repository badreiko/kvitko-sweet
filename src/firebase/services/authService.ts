// src/firebase/services/authService.ts
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User as FirebaseUser,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config';

// Константы для коллекций
const USERS_COLLECTION = 'users';

// Интерфейс пользователя.
// Согласовано с userService: там же используются status/createdAt/updatedAt
// в списке пользователей и в админ-панели. Раньше эти поля писались в
// Firestore, но не были описаны в типе — TS-кастил as any.
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  isAdmin?: boolean;
  status?: 'active' | 'blocked';
  createdAt?: Date;
  updatedAt?: Date;
}

// Вход через Google
export const signInWithGoogle = async (): Promise<User & { firebaseUser: FirebaseUser }> => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const { user } = result;

    // Проверяем, есть ли пользователь в Firestore
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
    if (userDoc.exists()) {
      return {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        ...userDoc.data(),
        firebaseUser: user
      };
    } else {
      // Если нет, создаём новую запись
      const userData: User = {
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isAdmin: false
      };
      await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
      return { ...userData, firebaseUser: user };
    }
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

// Регистрация нового пользователя
export const registerUser = async (
  email: string,
  password: string,
  displayName?: string
): Promise<User & { firebaseUser: FirebaseUser }> => {
  try {
    // Создаем учетную запись пользователя в Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    // Обновляем профиль пользователя с displayName
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Отправляем email для верификации
    await sendEmailVerification(user);

    // Создаем запись пользователя в Firestore
    const userData: User = {
      id: user.uid,
      email: user.email || email,
      displayName: displayName || user.displayName || '',
      photoURL: user.photoURL || '',
      isAdmin: false,
      status: 'active',
      createdAt: new Date()
    };

    await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);

    return { ...userData, firebaseUser: user };
  } catch (error) {
    console.error('Error registering user: ', error);
    throw error;
  }
};

// Вход пользователя
export const loginUser = async (
  email: string,
  password: string
): Promise<User & { firebaseUser: FirebaseUser }> => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = credential;

    // Получаем дополнительные данные из Firestore
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));

    if (userDoc.exists()) {
      return {
        id: user.uid,
        email: user.email || email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        ...userDoc.data(),
        firebaseUser: user
      };
    } else {
      // Если нет записи в Firestore, создаем ее
      const userData: User = {
        id: user.uid,
        email: user.email || email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        isAdmin: false
      };

      await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
      return { ...userData, firebaseUser: user };
    }
  } catch (error) {
    console.error('Error logging in: ', error);
    throw error;
  }
};

// Выход пользователя
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out: ', error);
    throw error;
  }
};

// Преобразует Firebase user + Firestore-документ в нашу User-модель.
// Если документа нет — создаёт минимальный.
async function hydrateUser(user: FirebaseUser): Promise<User & { firebaseUser: FirebaseUser }> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
  if (userDoc.exists()) {
    return {
      id: user.uid,
      email: user.email || '',
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      ...userDoc.data(),
      firebaseUser: user,
    };
  }
  const userData: User = {
    id: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    isAdmin: false,
  };
  await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
  return { ...userData, firebaseUser: user };
}

// Получение текущего пользователя ОДИН РАЗ (для инициализации).
// Для непрерывной подписки используй subscribeToAuthChanges.
export const getCurrentUser = (): Promise<(User & { firebaseUser: FirebaseUser }) | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        try {
          resolve(user ? await hydrateUser(user) : null);
        } catch (error) {
          reject(error);
        }
      },
      reject
    );
  });
};

// Постоянная подписка на изменения auth state: логин/логаут в других
// вкладках, refresh токена, ручной signOut. Вернёт unsubscribe.
export const subscribeToAuthChanges = (
  onChange: (user: (User & { firebaseUser: FirebaseUser }) | null) => void
): (() => void) => {
  return onAuthStateChanged(auth, async (user) => {
    try {
      onChange(user ? await hydrateUser(user) : null);
    } catch (error) {
      console.error('Error hydrating user from auth change:', error);
      onChange(null);
    }
  });
};

// Ре-аутентификация с текущим паролем. Требуется Firebase перед
// изменением email или пароля, если с момента последнего логина прошло
// больше ~5 минут. Без этого запрос падает с auth/requires-recent-login.
export const reauthenticateWithPassword = async (currentPassword: string): Promise<void> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('Пользователь не авторизован или у аккаунта нет email (например Google).');
  }
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
};

// Обновление профиля пользователя.
// Если меняется email — обязательно нужен currentPassword, чтобы пройти
// требование Firebase на recent auth. Без него бросаем понятную ошибку.
export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>,
  currentPassword?: string
): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    const emailChanged = !!userData.email && userData.email !== user.email;
    if (emailChanged) {
      if (!currentPassword) {
        const err = new Error('Для изменения email нужен текущий пароль.');
        (err as Error & { code?: string }).code = 'auth/current-password-required';
        throw err;
      }
      await reauthenticateWithPassword(currentPassword);
    }

    // Обновляем данные в Firestore
    await updateDoc(doc(db, USERS_COLLECTION, userId), userData);

    // Обновляем данные в Firebase Auth, если они предоставлены
    if (userData.displayName) {
      await updateProfile(user, { displayName: userData.displayName });
    }

    if (userData.photoURL) {
      await updateProfile(user, { photoURL: userData.photoURL });
    }

    if (emailChanged && userData.email) {
      await updateEmail(user, userData.email);
    }
  } catch (error) {
    console.error('Error updating user profile: ', error);
    throw error;
  }
};

// Обновление пароля пользователя
export const updateUserPassword = async (newPassword: string): Promise<void> => {
  try {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    await updatePassword(user, newPassword);
  } catch (error) {
    console.error('Error updating password: ', error);
    throw error;
  }
};

// Сброс пароля пользователя
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error resetting password: ', error);
    throw error;
  }
};

// Проверка, является ли пользователь администратором
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.isAdmin === true;
    }

    return false;
  } catch (error) {
    console.error('Error checking admin status: ', error);
    throw error;
  }
};