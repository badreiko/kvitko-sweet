// src/hooks/useBlogPosts.ts
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit as firestoreLimit,
  onSnapshot,
  getDocs,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { BlogPost } from '@/firebase/services/blogService';

interface UseBlogPostsOptions {
  publishedOnly?: boolean;
  limit?: number;
  realTime?: boolean;
}

export const useBlogPosts = (options: UseBlogPostsOptions = {}) => {
  const { publishedOnly = true, limit, realTime = true } = options;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const setupQuery = useCallback(() => {
    const constraints = [];

    // Используем только createdAt для сортировки, так как это поле всегда существует
    constraints.push(orderBy('createdAt', 'desc'));

    if (limit) {
      constraints.push(firestoreLimit(limit));
    }

    return query(collection(db, 'blogPosts'), ...constraints);
  }, [limit]);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const q = setupQuery();
      const snapshot = await getDocs(q);

      const postsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          publishedAt: data.publishedAt?.toDate() || null,
          createdAt: data.createdAt?.toDate() || null,
        } as BlogPost;
      });

      console.log('[useBlogPosts] Загружено постов:', postsData.length);
      console.log('[useBlogPosts] Все посты:', postsData.map(p => ({ id: p.id, title: p.title, published: p.published, publishedAt: p.publishedAt })));

      const filteredPosts = publishedOnly ? postsData.filter(post => post.published === true) : postsData;
      console.log('[useBlogPosts] После фильтрации (published=true):', filteredPosts.length);

      setPosts(filteredPosts);
      setError(null);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Ошибка загрузки постов');
    } finally {
      setLoading(false);
    }
  }, [setupQuery, publishedOnly]);

  const refreshPosts = useCallback(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    if (realTime) {
      try {
        // Подписка на изменения в реальном времени
        const q = setupQuery();

        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const postsData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                publishedAt: data.publishedAt?.toDate() || null,
                createdAt: data.createdAt?.toDate() || null,
              } as BlogPost;
            });

            console.log('[useBlogPosts RT] Загружено постов:', postsData.length);
            const filteredPosts = publishedOnly ? postsData.filter(post => post.published === true) : postsData;
            console.log('[useBlogPosts RT] После фильтрации:', filteredPosts.length);

            setPosts(filteredPosts);
            setLoading(false);
            setError(null);
          },
          (err) => {
            console.error('Error listening to blog posts:', err);
            // Fallback на обычный запрос при ошибке real-time
            fetchPosts();
          }
        );
      } catch (err) {
        console.error('Error setting up real-time listener:', err);
        // Fallback на обычный запрос
        fetchPosts();
      }
    } else {
      // Обычный запрос без real-time
      fetchPosts();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [publishedOnly, limit, realTime, setupQuery, fetchPosts]);

  return { posts, loading, error, refreshPosts };
};