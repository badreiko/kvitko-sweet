// src/firebase/services/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config';

// Константы для коллекций
const USERS_COLLECTION = 'users';

// Интерфейс пользователя
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
}

// Регистрация нового пользователя
export const registerUser = async (
  email: string, 
  password: string, 
  displayName?: string
): Promise<User> => {
  try {
    // Создаем учетную запись пользователя в Firebase Auth
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = credential;
    
    // Обновляем профиль пользователя с displayName
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    // Создаем запись пользователя в Firestore
    const userData: User = {
      id: user.uid,
      email: user.email || email,
      displayName: displayName || user.displayName || '',
      photoURL: user.photoURL || '',
      isAdmin: false
    };
    
    await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
    
    return userData;
  } catch (error) {
    console.error('Error registering user: ', error);
    throw error;
  }
};

// Вход пользователя
export const loginUser = async (
  email: string, 
  password: string
): Promise<User> => {
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
        ...userDoc.data()
      } as User;
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
      return userData;
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

// Получение текущего пользователя
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        unsubscribe();
        
        if (user) {
          // Пользователь аутентифицирован
          try {
            const userDoc = await getDoc(doc(db, USERS_COLLECTION, user.uid));
            
            if (userDoc.exists()) {
              resolve({
                id: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                ...userDoc.data()
              } as User);
            } else {
              // Если нет записи в Firestore, создаем ее
              const userData: User = {
                id: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                isAdmin: false
              };
              
              await setDoc(doc(db, USERS_COLLECTION, user.uid), userData);
              resolve(userData);
            }
          } catch (error) {
            reject(error);
          }
        } else {
          // Пользователь не аутентифицирован
          resolve(null);
        }
      },
      reject
    );
  });
};

// Обновление профиля пользователя
export const updateUserProfile = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('User not authenticated');
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
    
    if (userData.email && userData.email !== user.email) {
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