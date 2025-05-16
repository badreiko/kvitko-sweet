// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  getCurrentUser, 
  loginUser, 
  logoutUser, 
  registerUser, 
  updateUserProfile, 
  resetPassword, 
  signInWithGoogle
} from '../firebase/services';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Проверяем состояние аутентификации при загрузке
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        console.log('currentUser from Firebase:', currentUser);
        setUser(currentUser);
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Авторизация пользователя
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await loginUser(email, password);
      setUser(loggedInUser);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Вход через Google
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const googleUser = await signInWithGoogle();
      setUser(googleUser);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Регистрация нового пользователя
  const register = async (email: string, password: string, displayName?: string) => {
    setLoading(true);
    try {
      const newUser = await registerUser(email, password, displayName);
      setUser(newUser);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Выход пользователя
  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Обновление профиля пользователя
  const updateProfile = async (userData: Partial<User>) => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    try {
      await updateUserProfile(user.id, userData);
      
      // Обновляем локальное состояние пользователя
      setUser(prevUser => {
        if (!prevUser) return null;
        return { ...prevUser, ...userData };
      });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Сброс пароля
  const sendPasswordReset = async (email: string) => {
    setLoading(true);
    try {
      await resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    sendPasswordReset,
    loginWithGoogle,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};