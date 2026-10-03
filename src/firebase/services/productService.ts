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
import { compressProductImage, compressProductLayer, formatFileSize, ImageOrientation } from '@/utils/imageCompression';
import { slugify } from '@/utils/slugify';

/**
 * Эффект объёма для карточки товара: фон и вырезанный товар отдельными слоями.
 * Без foregroundUrl (или при enabled = false) карточка показывает обычное фото.
 */
export interface ProductDepthEffect {
  enabled: boolean;
  /** Товар без фона (WebP с прозрачностью), в том же кадре, что и фон. */
  foregroundUrl?: string;
  /** Фон с восстановленным местом под товаром. Если нет — используется backgroundColor. */
  backgroundUrl?: string;
  /** CSS-цвет или градиент для фона без изображения. */
  backgroundColor?: string;
  /** Индивидуальная коррекция слоя товара относительно фона. */
  fgScale?: number;
  /** Смещение слоя товара в % от ширины/высоты области фото. */
  fgOffsetX?: number;
  fgOffsetY?: number;
}

// Определение интерфейса Product
export interface Product {
  id: string;
  name: string;
  slug?: string;
  description: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  imageOrientation?: ImageOrientation;
  imageAspectRatio?: number;
  imageFocalPoint?: { x: number; y: number };
  category: string;
  tags?: string[];
  featured: boolean;
  inStock: boolean;
  // Опциональные trust-сигналы для карточки. Все флаги независимы, можно
  // комбинировать (Bestseller + Nový и т.д.). Пустые значения — карточка
  // выглядит как обычно.
  isBestseller?: boolean;
  isNew?: boolean;
  /** Количество в наличии (для «Poslední X kusů» badge). */
  stockQuantity?: number;
  /**
   * Список поводов, для которых подходит товар. Используется в
   * OccasionNav фильтре: /catalog?occasion=birthday.
   * Пример: ['birthday', 'thanks', 'general']
   */
  occasions?: string[];
  depthEffect?: ProductDepthEffect;
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

    // Перемешиваем рандомно и ограничиваем количество
    return products
      .sort(() => Math.random() - 0.5)
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
      const baseUrl = await getDownloadURL(imageRef);
      // Cache-busting: при обновлении путь storage детерминированный, поэтому
      // браузер/CDN могут отдать старую кэшированную картинку. Версия по
      // времени загрузки гарантирует, что новый imageUrl будет уникальным.
      const imageUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

      await updateDoc(docRef, {
        imageUrl,
        imageOrientation: compressedResult.orientation,
        imageAspectRatio: compressedResult.aspectRatio,
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
        const oldImageRef = ref(storage, `products/${productId}.webp`);
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
      const baseUrl = await getDownloadURL(imageRef);
      const imageUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;

      // Добавляем URL изображения и метаданные ориентации в обновляемые данные
      productData.imageUrl = imageUrl;
      productData.imageOrientation = compressedResult.orientation;
      productData.imageAspectRatio = compressedResult.aspectRatio;
    }

    // Обновляем продукт
    await updateDoc(productRef, productData);
  } catch (error) {
    console.error('Error updating product: ', error);
    throw error;
  }
};

export type ProductDepthLayer = 'foreground' | 'background';

const depthLayerPath = (productId: string, layer: ProductDepthLayer) =>
  `products/${productId}-${layer === 'foreground' ? 'fg' : 'bg'}.webp`;

// Загрузка слоя эффекта объёма (товар без фона / фон). Возвращает URL с
// cache-busting версией. WebP сохраняет прозрачность слоя товара.
export const uploadProductDepthLayer = async (
  productId: string,
  layer: ProductDepthLayer,
  file: File
): Promise<string> => {
  const compressed = await compressProductLayer(file);
  console.log(`[ProductService] Слой ${layer}: ${formatFileSize(compressed.compressedSize)}`);
  const layerRef = ref(storage, depthLayerPath(productId, layer));
  await uploadBytes(layerRef, compressed.file);
  const baseUrl = await getDownloadURL(layerRef);
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}v=${Date.now()}`;
};

// Удаление слоя эффекта объёма. Отсутствие файла — не ошибка.
export const deleteProductDepthLayer = async (
  productId: string,
  layer: ProductDepthLayer
): Promise<void> => {
  try {
    await deleteObject(ref(storage, depthLayerPath(productId, layer)));
  } catch {
    console.log(`[ProductService] Нет слоя ${layer} для удаления`);
  }
};

// Удаление продукта (для админа)
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    // Удаляем продукт
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));

    // Удаляем изображение продукта, если оно существует
    try {
      const imageRef = ref(storage, `products/${productId}.webp`);
      await deleteObject(imageRef);
    } catch (error) {
      // Игнорируем ошибку, если изображения нет
      console.log('No image to delete or error: ', error);
    }

    await deleteProductDepthLayer(productId, 'foreground');
    await deleteProductDepthLayer(productId, 'background');
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