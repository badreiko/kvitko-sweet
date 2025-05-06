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
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../config';

// Определение типов
interface BlogPost {
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
}

// Константы для коллекций
const BLOG_POSTS_COLLECTION = 'blogPosts';

// Получение всех опубликованных постов
export const getAllPublishedPosts = async (): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where('published', '==', true),
      orderBy('publishedAt', 'desc')
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
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where('published', '==', true),
      orderBy('publishedAt', 'desc'),
      limit(postsCount)
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
    console.error('Error getting recent posts: ', error);
    throw error;
  }
};

// Получение постов по тегу
export const getPostsByTag = async (tag: string): Promise<BlogPost[]> => {
  try {
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      where('published', '==', true),
      where('tags', 'array-contains', tag),
      orderBy('publishedAt', 'desc')
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
    console.error('Error getting posts by tag: ', error);
    throw error;
  }
};

// Создание поста (для админа)
export const createPost = async (
  postData: Omit<BlogPost, 'id' | 'publishedAt' | 'createdAt'>,
  imageFile?: File
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
    
    // Если есть файл изображения, загружаем его
    if (imageFile) {
      const imageRef = ref(storage, `blog/${docRef.id}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Обновляем пост с URL изображения
      await updateDoc(docRef, {
        imageUrl
      });
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
  imageFile?: File
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
    
    // Если есть новый файл изображения, загружаем его
    if (imageFile) {
      // Удаляем старое изображение, если оно существует
      if (currentData.imageUrl) {
        try {
          const oldImageRef = ref(storage, `blog/${postId}`);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log('No old image to delete or error: ', error);
        }
      }
      
      // Загружаем новое изображение
      const imageRef = ref(storage, `blog/${postId}`);
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      
      // Добавляем URL изображения в обновляемые данные
      updateData.imageUrl = imageUrl;
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