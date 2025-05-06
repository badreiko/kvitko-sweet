// src/firebase/services/productService.ts
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
  orderBy,
  limit,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { Product } from '@/app/repo/apps/firestore/models/product';

// Константы для коллекций
const PRODUCTS_COLLECTION = 'products';
const CATEGORIES_COLLECTION = 'categories';

// Получение всех продуктов
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting products: ', error);
    throw error;
  }
};

// Получение продукта по ID
export const getProductById = async (productId: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting product: ', error);
    throw error;
  }
};

// Получение отфильтрованных продуктов
export const getFilteredProducts = async (
  categoryId?: string,
  minPrice?: number,
  maxPrice?: number,
  featured?: boolean,
  sortBy?: string,
  tags?: string[]
): Promise<Product[]> => {
  try {
    const constraints: QueryConstraint[] = [];
    
    if (categoryId) {
      constraints.push(where('category', '==', categoryId));
    }
    
    if (minPrice !== undefined) {
      constraints.push(where('price', '>=', minPrice));
    }
    
    if (maxPrice !== undefined) {
      constraints.push(where('price', '<=', maxPrice));
    }
    
    if (featured !== undefined) {
      constraints.push(where('featured', '==', featured));
    }
    
    if (tags && tags.length > 0) {
      constraints.push(where('tags', 'array-contains-any', tags));
    }
    
    // Сортировка
    if (sortBy) {
      switch (sortBy) {
        case 'price-asc':
          constraints.push(orderBy('price', 'asc'));
          break;
        case 'price-desc':
          constraints.push(orderBy('price', 'desc'));
          break;
        case 'name':
          constraints.push(orderBy('name', 'asc'));
          break;
        default:
          constraints.push(orderBy('createdAt', 'desc'));
      }
    } else {
      // По умолчанию сортируем по дате создания
      constraints.push(orderBy('createdAt', 'desc'));
    }
    
    const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting filtered products: ', error);
    throw error;
  }
};

// Получение популярных продуктов
export const getFeaturedProducts = async (limitCount = 4): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error getting featured products: ', error);
    throw error;
  }
};

// Добавление нового продукта (для админа)
export const addProduct = async (product: Omit<Product, 'id'>, imageFile?: File): Promise<string> => {
  try {
    // Создаем продукт без изображения
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      createdAt: new Date()
    });
    
    // Если есть файл изображения, загружаем его
    if (imageFile) {
      const imageRef = ref(storage, `products/${docRef.id}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Обновляем продукт с URL изображения
      await updateDoc(docRef, {
        imageUrl
      });
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding product: ', error);
    throw error;
  }
};

// Обновление продукта (для админа)
export const updateProduct = async (
  productId: string, 
  productData: Partial<Product>, 
  imageFile?: File
): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    
    // Если есть новый файл изображения, загружаем его
    if (imageFile) {
      // Удаляем старое изображение, если оно существует
      try {
        const oldImageRef = ref(storage, `products/${productId}`);
        await deleteObject(oldImageRef);
      } catch (error) {
        // Игнорируем ошибку, если старого изображения нет
        console.log('No old image to delete or error: ', error);
      }
      
      // Загружаем новое изображение
      const imageRef = ref(storage, `products/${productId}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Добавляем URL изображения в обновляемые данные
      productData.imageUrl = imageUrl;
    }
    
    // Обновляем продукт
    await updateDoc(productRef, productData);
  } catch (error) {
    console.error('Error updating product: ', error);
    throw error;
  }
};

// Удаление продукта (для админа)
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    // Удаляем продукт
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    
    // Удаляем изображение продукта, если оно существует
    try {
      const imageRef = ref(storage, `products/${productId}`);
      await deleteObject(imageRef);
    } catch (error) {
      // Игнорируем ошибку, если изображения нет
      console.log('No image to delete or error: ', error);
    }
  } catch (error) {
    console.error('Error deleting product: ', error);
    throw error;
  }
};

// Получение всех категорий
export const getAllCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CATEGORIES_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting categories: ', error);
    throw error;
  }
};