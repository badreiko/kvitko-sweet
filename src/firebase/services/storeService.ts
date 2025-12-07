// src/firebase/services/storeService.ts
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../config';

// Интерфейс часов работы
export interface OpeningHours {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
}

// Интерфейс магазина
export interface Store {
    id: string;
    name: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email?: string;
    openingHours: OpeningHours;
    description?: string;
    isActive: boolean;
    order: number;
    createdAt: Date;
}

// Константы для коллекции
const STORES_COLLECTION = 'stores';

// Получение всех магазинов
export const getAllStores = async (): Promise<Store[]> => {
    try {
        const storesQuery = query(
            collection(db, STORES_COLLECTION),
            orderBy('order')
        );
        const snapshot = await getDocs(storesQuery);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Store[];
    } catch (error) {
        console.error('Error getting stores:', error);
        throw error;
    }
};

// Получение активных магазинов (для самовывоза)
export const getActiveStores = async (): Promise<Store[]> => {
    try {
        // Fetch all stores and filter client-side to avoid composite index requirement
        const storesQuery = query(collection(db, STORES_COLLECTION));
        const snapshot = await getDocs(storesQuery);

        const allStores = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as Store[];

        // Filter active stores and sort by order
        return allStores
            .filter(store => store.isActive)
            .sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (error) {
        console.error('Error getting active stores:', error);
        throw error;
    }
};

// Получение магазина по ID
export const getStoreById = async (id: string): Promise<Store | null> => {
    try {
        const docRef = doc(db, STORES_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data(),
                createdAt: docSnap.data().createdAt?.toDate() || new Date()
            } as Store;
        }
        return null;
    } catch (error) {
        console.error('Error getting store:', error);
        throw error;
    }
};

// Добавление нового магазина
export const addStore = async (store: Omit<Store, 'id' | 'createdAt'>): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, STORES_COLLECTION), {
            ...store,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding store:', error);
        throw error;
    }
};

// Обновление магазина
export const updateStore = async (id: string, store: Partial<Store>): Promise<void> => {
    try {
        const docRef = doc(db, STORES_COLLECTION, id);
        await updateDoc(docRef, {
            ...store,
            updatedAt: new Date()
        });
    } catch (error) {
        console.error('Error updating store:', error);
        throw error;
    }
};

// Удаление магазина
export const deleteStore = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, STORES_COLLECTION, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting store:', error);
        throw error;
    }
};
