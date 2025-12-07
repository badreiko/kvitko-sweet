// src/firebase/services/flowerService.ts
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
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';

// Константы для коллекций
const FLOWERS_COLLECTION = 'flowers';

// Интерфейс для многоязычного текста
export interface MultiLanguageText {
  cs: string; // Чешский (основной)
  uk?: string; // Украинский
  en?: string; // Английский
  ru?: string; // Русский
}

// Импортируем тип ItemType из bouquetFlowerService
import { ItemType } from './bouquetFlowerService';

// Интерфейс для цветка
export interface Flower {
  id: string;
  name: MultiLanguageText;
  latinName?: string;
  type: string; // Теперь это просто строка, чтобы поддерживать пользовательские типы
  color: string;
  price: number;
  inStock: boolean;
  stockQuantity: number;
  description?: string;
  imageUrl?: string;
  itemType?: ItemType; // Вид элемента: цветок, упаковка или дополнение
  forCustomBouquet?: boolean; // Флаг, указывающий, что элемент используется для букетов
  createdAt?: Date;
  updatedAt?: Date;
}

// Получение всех цветов
export const getAllFlowers = async (): Promise<Flower[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, FLOWERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flower[];
  } catch (error) {
    console.error('Error getting flowers: ', error);
    throw error;
  }
};

// Получение цветка по ID
export const getFlowerById = async (flowerId: string): Promise<Flower | null> => {
  try {
    const docRef = doc(db, FLOWERS_COLLECTION, flowerId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Flower;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting flower: ', error);
    throw error;
  }
};

// Получение цветов по типу
export const getFlowersByType = async (type: string): Promise<Flower[]> => {
  try {
    const q = query(
      collection(db, FLOWERS_COLLECTION),
      where('type', '==', type),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flower[];
  } catch (error) {
    console.error('Error getting flowers by type: ', error);
    throw error;
  }
};

// Получение цветов в наличии
export const getInStockFlowers = async (): Promise<Flower[]> => {
  try {
    const q = query(
      collection(db, FLOWERS_COLLECTION),
      where('inStock', '==', true),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Flower[];
  } catch (error) {
    console.error('Error getting in-stock flowers: ', error);
    throw error;
  }
};

// Добавление нового цветка (для админа)
export const addFlower = async (flower: Omit<Flower, 'id'>, imageFile?: File): Promise<string> => {
  try {
    // Создаем цветок без изображения
    const docRef = await addDoc(collection(db, FLOWERS_COLLECTION), {
      ...flower,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Если есть файл изображения, загружаем его
    if (imageFile) {
      const imageRef = ref(storage, `flowers/${docRef.id}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Обновляем цветок с URL изображения
      await updateDoc(docRef, {
        imageUrl
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding flower: ', error);
    throw error;
  }
};

// Обновление цветка (для админа)
export const updateFlower = async (
  flowerId: string, 
  flowerData: Partial<Flower>, 
  imageFile?: File
): Promise<void> => {
  try {
    const flowerRef = doc(db, FLOWERS_COLLECTION, flowerId);
    
    // Обновляем дату изменения
    flowerData.updatedAt = new Date();
    
    // Если есть новый файл изображения, загружаем его
    if (imageFile) {
      // Удаляем старое изображение, если оно существует
      try {
        const oldImageRef = ref(storage, `flowers/${flowerId}`);
        await deleteObject(oldImageRef);
      } catch (error) {
        // Игнорируем ошибку, если старого изображения нет
        console.log('No old image to delete or error: ', error);
      }
      
      // Загружаем новое изображение
      const imageRef = ref(storage, `flowers/${flowerId}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Добавляем URL изображения в обновляемые данные
      flowerData.imageUrl = imageUrl;
    }
    
    // Обновляем цветок
    await updateDoc(flowerRef, flowerData);
  } catch (error) {
    console.error('Error updating flower: ', error);
    throw error;
  }
};

// Удаление цветка (для админа)
export const deleteFlower = async (flowerId: string): Promise<void> => {
  try {
    // Удаляем цветок
    await deleteDoc(doc(db, FLOWERS_COLLECTION, flowerId));
    
    // Удаляем изображение цветка, если оно существует
    try {
      const imageRef = ref(storage, `flowers/${flowerId}`);
      await deleteObject(imageRef);
    } catch (error) {
      // Игнорируем ошибку, если изображения нет
      console.log('No image to delete or error: ', error);
    }
  } catch (error) {
    console.error('Error deleting flower: ', error);
    throw error;
  }
};
