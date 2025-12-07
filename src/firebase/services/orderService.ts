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

// Определение типов для заказов
export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  shippingAddress?: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  delivery?: {
    type: 'delivery' | 'pickup';
    zoneId: string;
    zoneName: string;
    price: number;
  };
  payment?: {
    methodId: string;
    methodName: string;
  };
  customerInfo?: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    note?: string;
  };
  createdAt: Date;
  deliveryDate?: Date;
}

export interface CustomBouquet {
  id: string;
  userId: string;
  flowers: { id: string; name: string; quantity: number; price: number }[];
  wrapping?: { id: string; name: string; price: number };
  additionalItems?: { id: string; name: string; quantity: number; price: number }[];
  message?: string;
  totalPrice: number;
  status: 'draft' | 'submitted' | 'confirmed' | 'cancelled';
  createdAt: Date;
}

// Константы для коллекций
const ORDERS_COLLECTION = 'orders';
const CUSTOM_BOUQUETS_COLLECTION = 'customBouquets';

// Генерация номера заказа (KS-YYYYMMDD-NNN)
const generateOrderNumber = async (): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `KS-${dateStr}`;

  // Получаем заказы за сегодня для подсчета последовательного номера
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('createdAt', '>=', startOfDay),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  const orderCount = snapshot.size + 1;
  const sequence = String(orderCount).padStart(3, '0');

  return `${prefix}-${sequence}`;
};

// Создание нового заказа
export const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Promise<string> => {
  try {
    const orderNumber = await generateOrderNumber();

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...orderData,
      orderNumber,
      status: 'pending',
      createdAt: serverTimestamp()
    });

    return orderNumber;
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

// Получение всех заказов (для админ-панели)
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        deliveryDate: data.deliveryDate?.toDate()
      };
    }) as Order[];
  } catch (error) {
    console.error('Error getting all orders: ', error);
    throw error;
  }
};

// Статистика заказов
export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

// Получение статистики заказов
export const getOrderStats = async (): Promise<OrderStats> => {
  try {
    const orders = await getAllOrders();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Подсчет выручки (только для доставленных заказов)
    const deliveredOrders = orders.filter(o => o.status === 'delivered');

    const stats: OrderStats = {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      processingOrders: orders.filter(o => o.status === 'processing').length,
      shippedOrders: orders.filter(o => o.status === 'shipped').length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      totalRevenue: deliveredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      todayRevenue: deliveredOrders
        .filter(o => o.createdAt >= startOfToday)
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      weekRevenue: deliveredOrders
        .filter(o => o.createdAt >= startOfWeek)
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0),
      monthRevenue: deliveredOrders
        .filter(o => o.createdAt >= startOfMonth)
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0)
    };

    return stats;
  } catch (error) {
    console.error('Error getting order stats: ', error);
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

// Интерфейс для обновления заказа
export interface OrderUpdateData {
  delivery?: Order['delivery'];
  shippingAddress?: Order['shippingAddress'];
  payment?: Order['payment'];
  paymentStatus?: Order['paymentStatus'];
  customerInfo?: Order['customerInfo'];
  totalPrice?: number;
  status?: Order['status'];
}

// Полное обновление заказа
export const updateOrder = async (
  orderId: string,
  updates: OrderUpdateData
): Promise<void> => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating order: ', error);
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