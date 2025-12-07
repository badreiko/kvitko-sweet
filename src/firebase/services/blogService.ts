// src/firebase/services/blogService.ts
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';
import { compressBlogImage, formatFileSize } from '@/utils/imageCompression';

// Определение типов
export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  tags?: string[];
  published: boolean;
  publishedAt: Date;
  createdAt: Date;
  views?: number; // Количество просмотров
  commentCount?: number; // Количество комментариев
  likes?: number; // Количество лайков
}

// Константы для коллекций
const BLOG_POSTS_COLLECTION = 'blogPosts';

// Получение всех опубликованных постов
export const getAllPublishedPosts = async (): Promise<BlogPost[]> => {
  try {
    // Fetch all and filter client-side to avoid composite index requirement
    const q = query(collection(db, BLOG_POSTS_COLLECTION));

    const querySnapshot = await getDocs(q);
    const allPosts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      publishedAt: (doc.data().publishedAt as Timestamp)?.toDate(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate()
    })) as BlogPost[];

    // Filter published and sort by publishedAt descending
    return allPosts
      .filter(post => post.published)
      .sort((a, b) => (b.publishedAt?.getTime() || 0) - (a.publishedAt?.getTime() || 0));
  } catch (error) {
    console.error('Error getting blog posts: ', error);
    throw error;
  }
};

// Получение всех постов (для админа)
export const getAllPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Преобразование Timestamp в Date
      publishedAt: (doc.data().publishedAt as Timestamp)?.toDate(),
      createdAt: (doc.data().createdAt as Timestamp)?.toDate()
    })) as BlogPost[];
  } catch (error) {
    console.error('Error getting all blog posts: ', error);
    throw error;
  }
};

// Получение поста по ID
export const getPostById = async (postId: string): Promise<BlogPost | null> => {
  try {
    const docRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        // Преобразование Timestamp в Date
        publishedAt: (docSnap.data().publishedAt as Timestamp)?.toDate(),
        createdAt: (docSnap.data().createdAt as Timestamp)?.toDate()
      } as BlogPost;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting blog post: ', error);
    throw error;
  }
};

// Получение последних постов
export const getRecentPosts = async (postsCount = 3): Promise<BlogPost[]> => {
  try {
    // Reuse getAllPublishedPosts to avoid composite index
    const allPosts = await getAllPublishedPosts();
    return allPosts.slice(0, postsCount);
  } catch (error) {
    console.error('Error getting recent posts: ', error);
    throw error;
  }
};

// Получение постов по тегу
export const getPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  try {
    // Reuse getAllPublishedPosts to avoid composite index
    const allPosts = await getAllPublishedPosts();
    return allPosts.filter(post => post.tags?.includes(tag));
  } catch (error) {
    console.error('Error getting posts by tag: ', error);
    throw error;
  }
};

// Создание поста (для админа)
export const createPost = async (
  postData: Omit<BlogPost, 'id' | 'publishedAt' | 'createdAt'>,
  imageFile?: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    // Создание записи в Firestore
    const postToCreate: any = {
      ...postData,
      createdAt: serverTimestamp()
    };

    // Если пост опубликован, устанавливаем дату публикации
    if (postData.published) {
      postToCreate.publishedAt = serverTimestamp();
    }

    const docRef = await addDoc(collection(db, BLOG_POSTS_COLLECTION), postToCreate);

    // Если есть файл изображения, сжимаем и загружаем его
    if (imageFile) {
      try {
        console.log(`[BlogService] Сжатие изображения: ${formatFileSize(imageFile.size)}`);

        // Сжимаем изображение
        const compressedResult = await compressBlogImage(imageFile, onProgress);
        console.log(`[BlogService] Сжато: ${formatFileSize(compressedResult.compressedSize)} (${compressedResult.compressionRatio.toFixed(1)}%)`);

        const imageRef = ref(storage, `blog/${docRef.id}.webp`);

        // Загружаем сжатый файл
        await uploadBytes(imageRef, compressedResult.file, {
          contentType: 'image/webp',
          customMetadata: {
            'postId': docRef.id,
            'originalSize': String(compressedResult.originalSize),
            'compressedSize': String(compressedResult.compressedSize)
          }
        });
        const imageUrl = await getDownloadURL(imageRef);

        console.log('[BlogService] Изображение успешно загружено:', imageUrl);

        // Обновляем пост с URL изображения
        await updateDoc(docRef, {
          imageUrl
        });
      } catch (error) {
        console.error('[BlogService] Ошибка загрузки изображения:', error);
        // Продолжаем выполнение даже если загрузка изображения не удалась
      }
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating blog post: ', error);
    throw error;
  }
};

// Обновление поста (для админа)
export const updatePost = async (
  postId: string,
  postData: Partial<BlogPost>,
  imageFile?: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error(`Post with ID ${postId} not found`);
    }

    const currentData = postSnap.data();
    const updateData: any = { ...postData };

    // Если меняется статус публикации с неопубликованного на опубликованный
    if (postData.published === true && !currentData.published) {
      updateData.publishedAt = serverTimestamp();
    }

    // Если есть новый файл изображения, сжимаем и загружаем его
    if (imageFile) {
      try {
        console.log(`[BlogService] Сжатие нового изображения: ${formatFileSize(imageFile.size)}`);

        // Удаляем старое изображение, если оно существует
        if (currentData.imageUrl) {
          try {
            const oldImageRef = ref(storage, `blog/${postId}.webp`);
            await deleteObject(oldImageRef);
          } catch {
            console.log('[BlogService] Нет старого изображения для удаления');
          }
        }

        // Сжимаем изображение
        const compressedResult = await compressBlogImage(imageFile, onProgress);
        console.log(`[BlogService] Сжато: ${formatFileSize(compressedResult.compressedSize)}`);

        // Загружаем новое изображение
        const imageRef = ref(storage, `blog/${postId}.webp`);
        await uploadBytes(imageRef, compressedResult.file, {
          contentType: 'image/webp',
          customMetadata: {
            'postId': postId,
            'originalSize': String(compressedResult.originalSize),
            'compressedSize': String(compressedResult.compressedSize)
          }
        });
        const imageUrl = await getDownloadURL(imageRef);

        console.log('[BlogService] Изображение обновлено:', imageUrl);

        // Добавляем URL изображения в обновляемые данные
        updateData.imageUrl = imageUrl;
      } catch (error) {
        console.error('[BlogService] Ошибка обновления изображения:', error);
        // Продолжаем выполнение даже если загрузка изображения не удалась
      }
    }

    // Обновляем пост
    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error('Error updating blog post: ', error);
    throw error;
  }
};

// Удаление поста (для админа)
export const deletePost = async (postId: string): Promise<void> => {
  try {
    // Удаляем пост
    await deleteDoc(doc(db, BLOG_POSTS_COLLECTION, postId));

    // Удаляем изображение поста, если оно существует
    try {
      const imageRef = ref(storage, `blog/${postId}`);
      await deleteObject(imageRef);
    } catch (error) {
      console.log('No image to delete or error: ', error);
    }
  } catch (error) {
    console.error('Error deleting blog post: ', error);
    throw error;
  }
};

// Получение всех тегов блога
export const getAllBlogTags = async (): Promise<string[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, BLOG_POSTS_COLLECTION));

    // Собираем все теги из всех постов
    const tagsSet = new Set<string>();
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.tags && Array.isArray(data.tags)) {
        data.tags.forEach((tag: string) => tagsSet.add(tag));
      }
    });

    return Array.from(tagsSet);
  } catch (error) {
    console.error('Error getting all blog tags: ', error);
    throw error;
  }
};

// Получение связанных постов по тегу
export const getRelatedPosts = async (postId: string, tag: string, limitCount: number = 3): Promise<BlogPost[]> => {
  try {
    // Reuse getPostsByTag to avoid composite index
    const tagPosts = await getPostsByTag(tag);

    // Filter out current post and limit results
    return tagPosts
      .filter(post => post.id !== postId)
      .slice(0, limitCount);
  } catch (error) {
    console.error('Error getting related posts: ', error);
    return [];
  }
};