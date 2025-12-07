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
  QueryConstraint
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { compressProductImage, formatFileSize } from '@/utils/imageCompression';
import { slugify } from '@/utils/slugify';

// Определение интерфейса Product
export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  category: string;
  tags?: string[];
  featured: boolean;
  inStock: boolean;
  createdAt: Date;
}

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

// Получение продукта по Slug
export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('slug', '==', slug),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data()
      } as Product;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting product by slug: ', error);
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
    // Простой запрос без orderBy чтобы избежать составных индексов
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('featured', '==', true)
    );

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];

    // Сортируем в JS и ограничиваем количество
    return products
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting featured products: ', error);
    throw error;
  }
};

// Добавление нового продукта (для админа)
export const addProduct = async (
  product: Omit<Product, 'id'>,
  imageFile?: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Генерируем slug
    const slug = slugify(product.name);

    // Создаем продукт без изображения
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      slug,
      createdAt: new Date()
    });

    // Если есть файл изображения, сжимаем и загружаем его
    if (imageFile) {
      console.log(`[ProductService] Сжатие изображения: ${formatFileSize(imageFile.size)}`);

      // Сжимаем изображение
      const compressedResult = await compressProductImage(imageFile, onProgress);
      console.log(`[ProductService] Сжато: ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio.toFixed(1)}%)`);

      const imageRef = ref(storage, `products/${docRef.id}.webp`);
      await uploadBytes(imageRef, compressedResult.file);
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
  imageFile?: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);

    // Если изменилось имя, обновляем slug
    if (productData.name) {
      productData.slug = slugify(productData.name);
    }

    // Если есть новый файл изображения, сжимаем и загружаем его
    if (imageFile) {
      console.log(`[ProductService] Сжатие нового изображения: ${formatFileSize(imageFile.size)}`);

      // Удаляем старое изображение, если оно существует
      try {
        const oldImageRef = ref(storage, `products/${productId}`);
        await deleteObject(oldImageRef);
      } catch {
        // Игнорируем ошибку, если старого изображения нет
        console.log('[ProductService] Нет старого изображения для удаления');
      }

      // Сжимаем изображение
      const compressedResult = await compressProductImage(imageFile, onProgress);
      console.log(`[ProductService] Сжато: ${formatFileSize(compressedResult.compressedSize)}`);

      // Загружаем новое изображение
      const imageRef = ref(storage, `products/${productId}.webp`);
      await uploadBytes(imageRef, compressedResult.file);
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