// src/firebase/services/orderService.ts
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { Order, CustomBouquet } from '@/app/repo/apps/firestore/models/product';

// Константы для коллекций
const ORDERS_COLLECTION = 'orders';
const CUSTOM_BOUQUETS_COLLECTION = 'customBouquets';

// Создание нового заказа
export const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating order: ', error);
    throw error;
  }
};

// Получение заказа по ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Order;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting order: ', error);
    throw error;
  }
};

// Получение заказов пользователя
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Преобразование Timestamp в Date
      createdAt: (doc.data().createdAt as Timestamp).toDate(),
      deliveryDate: doc.data().deliveryDate ? (doc.data().deliveryDate as Timestamp).toDate() : undefined
    })) as Order[];
  } catch (error) {
    console.error('Error getting user orders: ', error);
    throw error;
  }
};

// Обновление статуса заказа
export const updateOrderStatus = async (
  orderId: string, 
  status: Order['status'],
  paymentStatus?: Order['paymentStatus']
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const updateData: { status: Order['status'], paymentStatus?: Order['paymentStatus'] } = { status };
    
    if (paymentStatus) {
      updateData.paymentStatus = paymentStatus;
    }
    
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order status: ', error);
    throw error;
  }
};

// Создание пользовательской кytice
export const createCustomBouquet = async (
  bouquetData: Omit<CustomBouquet, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, CUSTOM_BOUQUETS_COLLECTION), {
      ...bouquetData,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating custom bouquet: ', error);
    throw error;
  }
};

// Получение пользовательской кytice по ID
export const getCustomBouquetById = async (bouquetId: string): Promise<CustomBouquet | null> => {
  try {
    const docRef = doc(db, CUSTOM_BOUQUETS_COLLECTION, bouquetId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        // Преобразование Timestamp в Date
        createdAt: (docSnap.data().createdAt as Timestamp).toDate()
      } as CustomBouquet;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting custom bouquet: ', error);
    throw error;
  }
};

// Получение пользовательских букетов пользователя
export const getUserCustomBouquets = async (userId: string): Promise<CustomBouquet[]> => {
  try {
    const q = query(
      collection(db, CUSTOM_BOUQUETS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Преобразование Timestamp в Date
      createdAt: (doc.data().createdAt as Timestamp).toDate()
    })) as CustomBouquet[];
  } catch (error) {
    console.error('Error getting user custom bouquets: ', error);
    throw error;
  }
};

// Обновление статуса пользовательской кytice
export const updateCustomBouquetStatus = async (
  bouquetId: string, 
  status: CustomBouquet['status']
): Promise<void> => {
  try {
    const bouquetRef = doc(db, CUSTOM_BOUQUETS_COLLECTION, bouquetId);
    await updateDoc(bouquetRef, { status });
  } catch (error) {
    console.error('Error updating custom bouquet status: ', error);
    throw error;
  }
};