// src/firebase/services/categoryService.ts
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
import { compressCategoryImage, formatFileSize } from '@/utils/imageCompression';

// Константы для коллекций
const CATEGORIES_COLLECTION = 'categories';

// Интерфейс для категории
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  order?: number;
  isActive: boolean;
}

// Получение всех категорий
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  } catch (error) {
    console.error('Error getting categories: ', error);
    throw error;
  }
};

// Получение категории по ID
export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Category;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category: ', error);
    throw error;
  }
};

// Получение категории по slug
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('slug', '==', slug)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Category;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category by slug: ', error);
    throw error;
  }
};

// Получение активных категорий
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const q = query(
      collection(db, CATEGORIES_COLLECTION),
      where('isActive', '==', true),
      orderBy('order', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Category[];
  } catch (error) {
    console.error('Error getting active categories: ', error);
    throw error;
  }
};

// Добавление новой категории (для админа)
export const addCategory = async (
  category: Omit<Category, 'id'>,
  imageFile?: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Создаем категорию без изображения
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...category,
      createdAt: new Date()
    });

    // Если есть файл изображения, сжимаем и загружаем его
    if (imageFile) {
      console.log(`[CategoryService] Сжатие изображения: ${formatFileSize(imageFile.size)}`);

      const compressedResult = await compressCategoryImage(imageFile, onProgress);
      console.log(`[CategoryService] Сжато: ${formatFileSize(compressedResult.compressedSize)}`);

      const imageRef = ref(storage, `categories/${docRef.id}.webp`);
      await uploadBytes(imageRef, compressedResult.file);
      const imageUrl = await getDownloadURL(imageRef);

      // Обновляем категорию с URL изображения
      await updateDoc(docRef, {
        imageUrl
      });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error adding category: ', error);
    throw error;
  }
};

// Обновление категории (для админа)
export const updateCategory = async (
  categoryId: string,
  categoryData: Partial<Category>,
  imageFile?: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const categoryRef = doc(db, CATEGORIES_COLLECTION, categoryId);

    // Если есть новый файл изображения, сжимаем и загружаем его
    if (imageFile) {
      console.log(`[CategoryService] Сжатие нового изображения: ${formatFileSize(imageFile.size)}`);

      // Удаляем старое изображение, если оно существует
      try {
        const oldImageRef = ref(storage, `categories/${categoryId}`);
        await deleteObject(oldImageRef);
      } catch {
        console.log('[CategoryService] Нет старого изображения для удаления');
      }

      // Сжимаем изображение
      const compressedResult = await compressCategoryImage(imageFile, onProgress);
      console.log(`[CategoryService] Сжато: ${formatFileSize(compressedResult.compressedSize)}`);

      // Загружаем новое изображение
      const imageRef = ref(storage, `categories/${categoryId}.webp`);
      await uploadBytes(imageRef, compressedResult.file);
      const imageUrl = await getDownloadURL(imageRef);

      // Добавляем URL изображения в обновляемые данные
      categoryData.imageUrl = imageUrl;
    }

    // Обновляем категорию
    await updateDoc(categoryRef, categoryData);
  } catch (error) {
    console.error('Error updating category: ', error);
    throw error;
  }
};

// Удаление категории (для админа)
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    // Удаляем категорию
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId));

    // Удаляем изображение категории, если оно существует
    try {
      const imageRef = ref(storage, `categories/${categoryId}`);
      await deleteObject(imageRef);
    } catch (error) {
      // Игнорируем ошибку, если изображения нет
      console.log('No image to delete or error: ', error);
    }
  } catch (error) {
    console.error('Error deleting category: ', error);
    throw error;
  }
};
