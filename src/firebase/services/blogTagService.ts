import { db } from "../config";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

// Константы
const BLOG_TAGS_COLLECTION = "blogTags";
const BLOG_POSTS_COLLECTION = "blogPosts";

// Интерфейс для поста блога (упрощенный для использования с тегами)
interface BlogPost {
  id: string;
  tagIds?: string[];
  [key: string]: any; // Для других свойств
}

// Интерфейс для тега блога
export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Получить все теги блога
 */
export const getAllBlogTags = async (): Promise<BlogTag[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, BLOG_TAGS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date()
    } as BlogTag));
  } catch (error) {
    console.error("Error getting blog tags:", error);
    throw error;
  }
};

/**
 * Получить тег блога по ID
 */
export const getBlogTagById = async (id: string): Promise<BlogTag | null> => {
  try {
    const docRef = doc(db, BLOG_TAGS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as BlogTag;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting blog tag:", error);
    throw error;
  }
};

/**
 * Получить тег блога по slug
 */
export const getBlogTagBySlug = async (slug: string): Promise<BlogTag | null> => {
  try {
    const q = query(collection(db, BLOG_TAGS_COLLECTION), where("slug", "==", slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as BlogTag;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting blog tag by slug:", error);
    throw error;
  }
};

/**
 * Добавить новый тег блога
 */
export const addBlogTag = async (tag: Omit<BlogTag, "id" | "createdAt" | "updatedAt">): Promise<BlogTag> => {
  try {
    // Проверяем, существует ли тег с таким slug
    const existingTag = await getBlogTagBySlug(tag.slug);
    if (existingTag) {
      throw new Error(`Tag with slug "${tag.slug}" already exists`);
    }
    
    const now = new Date();
    const docRef = await addDoc(collection(db, BLOG_TAGS_COLLECTION), {
      ...tag,
      createdAt: now,
      updatedAt: now
    });
    
    return {
      id: docRef.id,
      ...tag,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error("Error adding blog tag:", error);
    throw error;
  }
};

/**
 * Обновить тег блога
 */
export const updateBlogTag = async (id: string, tag: Partial<Omit<BlogTag, "id" | "createdAt" | "updatedAt">>): Promise<void> => {
  try {
    // Если обновляем slug, проверяем, что такой slug не существует у другого тега
    if (tag.slug) {
      const existingTag = await getBlogTagBySlug(tag.slug);
      if (existingTag && existingTag.id !== id) {
        throw new Error(`Tag with slug "${tag.slug}" already exists`);
      }
    }
    
    const docRef = doc(db, BLOG_TAGS_COLLECTION, id);
    await updateDoc(docRef, {
      ...tag,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Error updating blog tag:", error);
    throw error;
  }
};

/**
 * Удалить тег блога
 */
export const deleteBlogTag = async (id: string): Promise<void> => {
  try {
    // Проверяем, используется ли тег в постах
    // Эта проверка зависит от структуры данных постов
    // Предполагаем, что у постов есть поле tagIds, которое содержит массив ID тегов
    const postsQuery = query(collection(db, BLOG_POSTS_COLLECTION), where("tagIds", "array-contains", id));
    const postsSnapshot = await getDocs(postsQuery);
    
    if (!postsSnapshot.empty) {
      throw new Error("Cannot delete tag that is used in posts");
    }
    
    await deleteDoc(doc(db, BLOG_TAGS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting blog tag:", error);
    throw error;
  }
};

/**
 * Получить количество постов для каждого тега
 */
export const getTagsWithPostCount = async (): Promise<{ id: string; name: string; slug: string; postCount: number }[]> => {
  try {
    // Получаем все теги
    const tags = await getAllBlogTags();
    
    // Получаем все посты
    const postsSnapshot = await getDocs(collection(db, BLOG_POSTS_COLLECTION));
    const posts: BlogPost[] = postsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Считаем количество постов для каждого тега
    return tags.map(tag => {
      const postCount = posts.filter(post => {
        // Предполагаем, что у постов есть поле tagIds, которое содержит массив ID тегов
        const tagIds = post.tagIds || [];
        return tagIds.includes(tag.id);
      }).length;
      
      return {
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        postCount
      };
    });
  } catch (error) {
    console.error("Error getting tags with post count:", error);
    throw error;
  }
};

/**
 * Получить популярные теги (с наибольшим количеством постов)
 */
export const getPopularTags = async (limit: number = 10): Promise<{ id: string; name: string; slug: string; postCount: number }[]> => {
  try {
    const tagsWithCount = await getTagsWithPostCount();
    
    // Сортируем по количеству постов (по убыванию)
    return tagsWithCount
      .sort((a, b) => b.postCount - a.postCount)
      .slice(0, limit);
  } catch (error) {
    console.error("Error getting popular tags:", error);
    throw error;
  }
};
