// src/context/BlogContext.tsx
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { BlogPost } from '@/firebase/services/blogService';

interface BlogContextType {
  // Кэш постов
  postsCache: Map<string, BlogPost>;
  
  // Функции для управления кэшем
  addPostToCache: (post: BlogPost) => void;
  updatePostInCache: (postId: string, updates: Partial<BlogPost>) => void;
  removePostFromCache: (postId: string) => void;
  getPostFromCache: (postId: string) => BlogPost | undefined;
  clearCache: () => void;
  
  // Состояние для уведомлений о новых постах
  hasNewPosts: boolean;
  setHasNewPosts: (value: boolean) => void;
  
  // Функция для принудительного обновления
  triggerRefresh: () => void;
  refreshTrigger: number;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlogContext = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlogContext must be used within a BlogProvider');
  }
  return context;
};

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider = ({ children }: BlogProviderProps) => {
  const [postsCache, setPostsCache] = useState<Map<string, BlogPost>>(new Map());
  const [hasNewPosts, setHasNewPosts] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const addPostToCache = useCallback((post: BlogPost) => {
    setPostsCache(prev => {
      const newCache = new Map(prev);
      newCache.set(post.id, post);
      return newCache;
    });
    setHasNewPosts(true);
  }, []);

  const updatePostInCache = useCallback((postId: string, updates: Partial<BlogPost>) => {
    setPostsCache(prev => {
      const newCache = new Map(prev);
      const existingPost = newCache.get(postId);
      if (existingPost) {
        newCache.set(postId, { ...existingPost, ...updates });
      }
      return newCache;
    });
  }, []);

  const removePostFromCache = useCallback((postId: string) => {
    setPostsCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(postId);
      return newCache;
    });
  }, []);

  const getPostFromCache = useCallback((postId: string) => {
    return postsCache.get(postId);
  }, [postsCache]);

  const clearCache = useCallback(() => {
    setPostsCache(new Map());
    setHasNewPosts(false);
  }, []);

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const value: BlogContextType = {
    postsCache,
    addPostToCache,
    updatePostInCache,
    removePostFromCache,
    getPostFromCache,
    clearCache,
    hasNewPosts,
    setHasNewPosts,
    triggerRefresh,
    refreshTrigger,
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};