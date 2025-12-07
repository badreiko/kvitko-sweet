// src/firebase/services/userService.ts
import {
    collection,
    doc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    where
} from 'firebase/firestore';
import { db } from '../config';

// Константы для коллекций
const USERS_COLLECTION = 'users';

// Интерфейс для пользователя
export interface User {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string;
    isAdmin: boolean;
    createdAt: Date;
    lastLogin?: Date;
    status: 'active' | 'blocked';
    phone?: string;
    address?: string;
}

// Статистика пользователей
export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    adminUsers: number;
    newUsersThisMonth: number;
}

/**
 * Получение всех пользователей
 */
export const getAllUsers = async (): Promise<User[]> => {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName || data.email?.split('@')[0] || 'Пользователь',
                email: data.email || '',
                photoURL: data.photoURL,
                isAdmin: data.isAdmin || false,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: data.lastLogin?.toDate(),
                status: data.status || 'active',
                phone: data.phone,
                address: data.address
            } as User;
        });
    } catch (error) {
        console.error('Error getting users:', error);
        throw error;
    }
};

/**
 * Получение пользователя по ID
 */
export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const docRef = doc(db, USERS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                displayName: data.displayName || data.email?.split('@')[0] || 'Пользователь',
                email: data.email || '',
                photoURL: data.photoURL,
                isAdmin: data.isAdmin || false,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: data.lastLogin?.toDate(),
                status: data.status || 'active',
                phone: data.phone,
                address: data.address
            } as User;
        }

        return null;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

/**
 * Получение статистики пользователей
 */
export const getUserStats = async (): Promise<UserStats> => {
    try {
        const users = await getAllUsers();

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats: UserStats = {
            totalUsers: users.length,
            activeUsers: users.filter(u => u.status === 'active').length,
            blockedUsers: users.filter(u => u.status === 'blocked').length,
            adminUsers: users.filter(u => u.isAdmin).length,
            newUsersThisMonth: users.filter(u => u.createdAt >= startOfMonth).length
        };

        return stats;
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
};

/**
 * Обновление роли пользователя (админ/обычный)
 */
export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            isAdmin,
            updatedAt: Timestamp.now()
        });
        console.log(`[UserService] Роль пользователя ${userId} изменена на ${isAdmin ? 'админ' : 'пользователь'}`);
    } catch (error) {
        console.error('Error updating user role:', error);
        throw error;
    }
};

/**
 * Блокировка/разблокировка пользователя
 */
export const updateUserStatus = async (userId: string, status: 'active' | 'blocked'): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            status,
            updatedAt: Timestamp.now()
        });
        console.log(`[UserService] Статус пользователя ${userId} изменен на ${status}`);
    } catch (error) {
        console.error('Error updating user status:', error);
        throw error;
    }
};

/**
 * Удаление пользователя (только из Firestore, не из Auth)
 */
export const deleteUser = async (userId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, userId));
        console.log(`[UserService] Пользователь ${userId} удален из Firestore`);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

/**
 * Получение активных пользователей (не заблокированных)
 */
export const getActiveUsers = async (): Promise<User[]> => {
    try {
        const q = query(
            collection(db, USERS_COLLECTION),
            where('status', '==', 'active'),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                displayName: data.displayName || data.email?.split('@')[0] || 'Пользователь',
                email: data.email || '',
                photoURL: data.photoURL,
                isAdmin: data.isAdmin || false,
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLogin: data.lastLogin?.toDate(),
                status: 'active' as const,
                phone: data.phone,
                address: data.address
            } as User;
        });
    } catch (error) {
        console.error('Error getting active users:', error);
        throw error;
    }
};

/**
 * Обновление профиля пользователя
 */
export const updateUserProfile = async (
    userId: string,
    data: Partial<Pick<User, 'displayName' | 'phone' | 'address'>>
): Promise<void> => {
    try {
        const userRef = doc(db, USERS_COLLECTION, userId);
        await updateDoc(userRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
        console.log(`[UserService] Профиль пользователя ${userId} обновлен`);
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};
