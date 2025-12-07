import { db } from "../config";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, query, where, orderBy, limit, increment, deleteDoc } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";
import { subDays, format } from "date-fns";

// Константы
const BLOG_POSTS_COLLECTION = "blogPosts";
const BLOG_VIEWS_COLLECTION = "blogViews";
const BLOG_INTERACTIONS_COLLECTION = "blogInteractions";

// Типы взаимодействий
export enum InteractionType {
  VIEW = "view",
  LIKE = "like",
  COMMENT = "comment",
  SHARE = "share"
}

// Интерфейс для просмотра
export interface BlogView {
  id: string;
  postId: string;
  userId?: string; // Опционально, если пользователь авторизован
  ip: string;
  userAgent: string;
  referer?: string;
  createdAt: Date;
}

// Интерфейс для взаимодействия
export interface BlogInteraction {
  id: string;
  postId: string;
  userId?: string;
  type: InteractionType;
  createdAt: Date;
}

// Интерфейс для статистики поста
export interface PostStats {
  postId: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

// Интерфейс для ежедневной статистики
export interface DailyStats {
  date: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Записать просмотр поста
 */
export const recordPostView = async (
  postId: string,
  data: {
    userId?: string;
    ip: string;
    userAgent: string;
    referer?: string;
  }
): Promise<void> => {
  try {
    // Проверяем, существует ли пост
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error(`Post with ID "${postId}" does not exist`);
    }
    
    // Проверяем, не просматривал ли уже этот пользователь/IP этот пост в течение последних 30 минут
    // Это помогает избежать накрутки просмотров
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
    
    let q;
    if (data.userId) {
      // Если пользователь авторизован, проверяем по userId
      q = query(
        collection(db, BLOG_VIEWS_COLLECTION),
        where("postId", "==", postId),
        where("userId", "==", data.userId),
        where("createdAt", ">=", thirtyMinutesAgo)
      );
    } else {
      // Иначе проверяем по IP
      q = query(
        collection(db, BLOG_VIEWS_COLLECTION),
        where("postId", "==", postId),
        where("ip", "==", data.ip),
        where("createdAt", ">=", thirtyMinutesAgo)
      );
    }
    
    const viewsSnapshot = await getDocs(q);
    
    // Если просмотров не было в течение последних 30 минут, записываем новый
    if (viewsSnapshot.empty) {
      // Добавляем запись о просмотре
      await addDoc(collection(db, BLOG_VIEWS_COLLECTION), {
        postId,
        ...data,
        createdAt: serverTimestamp()
      });
      
      // Увеличиваем счетчик просмотров в посте
      await updateDoc(postRef, {
        viewCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error("Error recording post view:", error);
    throw error;
  }
};

/**
 * Записать взаимодействие с постом (лайк, комментарий, шеринг)
 */
export const recordPostInteraction = async (
  postId: string,
  type: InteractionType,
  userId?: string
): Promise<void> => {
  try {
    // Проверяем, существует ли пост
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error(`Post with ID "${postId}" does not exist`);
    }
    
    // Добавляем запись о взаимодействии
    await addDoc(collection(db, BLOG_INTERACTIONS_COLLECTION), {
      postId,
      type,
      userId,
      createdAt: serverTimestamp()
    });
    
    // Увеличиваем соответствующий счетчик в посте
    const updateData: any = {
      updatedAt: serverTimestamp()
    };
    
    switch (type) {
      case InteractionType.LIKE:
        updateData.likeCount = increment(1);
        break;
      case InteractionType.COMMENT:
        updateData.commentCount = increment(1);
        break;
      case InteractionType.SHARE:
        updateData.shareCount = increment(1);
        break;
    }
    
    await updateDoc(postRef, updateData);
  } catch (error) {
    console.error(`Error recording post ${type}:`, error);
    throw error;
  }
};

/**
 * Удалить взаимодействие с постом (например, отменить лайк)
 */
export const removePostInteraction = async (
  postId: string,
  type: InteractionType,
  userId: string
): Promise<void> => {
  try {
    // Проверяем, существует ли пост
    const postRef = doc(db, BLOG_POSTS_COLLECTION, postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error(`Post with ID "${postId}" does not exist`);
    }
    
    // Находим запись о взаимодействии
    const q = query(
      collection(db, BLOG_INTERACTIONS_COLLECTION),
      where("postId", "==", postId),
      where("type", "==", type),
      where("userId", "==", userId)
    );
    
    const interactionsSnapshot = await getDocs(q);
    
    // Если нашли запись, удаляем ее
    if (!interactionsSnapshot.empty) {
      // Удаляем только самую последнюю запись
      const interactionDoc = interactionsSnapshot.docs[0];
      await deleteDoc(interactionDoc.ref);
      
      // Уменьшаем соответствующий счетчик в посте
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      switch (type) {
        case InteractionType.LIKE:
          updateData.likeCount = increment(-1);
          break;
        case InteractionType.COMMENT:
          updateData.commentCount = increment(-1);
          break;
        case InteractionType.SHARE:
          updateData.shareCount = increment(-1);
          break;
      }
      
      await updateDoc(postRef, updateData);
    }
  } catch (error) {
    console.error(`Error removing post ${type}:`, error);
    throw error;
  }
};

/**
 * Получить статистику по популярным постам
 */
export const getPopularPosts = async (limitCount: number = 5): Promise<PostStats[]> => {
  try {
    // Получаем посты, отсортированные по количеству просмотров
    const q = query(
      collection(db, BLOG_POSTS_COLLECTION),
      orderBy("viewCount", "desc"),
      limit(limitCount)
    );
    
    const postsSnapshot = await getDocs(q);
    
    return postsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        postId: doc.id,
        title: data.title || "",
        views: data.viewCount || 0,
        likes: data.likeCount || 0,
        comments: data.commentCount || 0,
        shares: data.shareCount || 0
      };
    });
  } catch (error) {
    console.error("Error getting popular posts:", error);
    throw error;
  }
};

/**
 * Получить статистику просмотров за указанный период
 */
export const getViewsStats = async (days: number = 30): Promise<DailyStats[]> => {
  try {
    // Получаем дату начала периода
    const startDate = subDays(new Date(), days);
    
    // Получаем все просмотры за указанный период
    const q = query(
      collection(db, BLOG_VIEWS_COLLECTION),
      where("createdAt", ">=", startDate),
      orderBy("createdAt", "asc")
    );
    
    const viewsSnapshot = await getDocs(q);
    
    // Группируем просмотры по дням
    const dailyStats: { [key: string]: DailyStats } = {};
    
    // Инициализируем статистику для каждого дня в периоде
    for (let i = 0; i < days; i++) {
      const date = format(subDays(new Date(), days - i - 1), "yyyy-MM-dd");
      dailyStats[date] = {
        date,
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0
      };
    }
    
    // Заполняем статистику просмотров
    viewsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = format(data.createdAt.toDate(), "yyyy-MM-dd");
      
      if (dailyStats[date]) {
        dailyStats[date].views++;
      }
    });
    
    // Получаем все взаимодействия за указанный период
    const interactionsQuery = query(
      collection(db, BLOG_INTERACTIONS_COLLECTION),
      where("createdAt", ">=", startDate),
      orderBy("createdAt", "asc")
    );
    
    const interactionsSnapshot = await getDocs(interactionsQuery);
    
    // Заполняем статистику взаимодействий
    interactionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = format(data.createdAt.toDate(), "yyyy-MM-dd");
      
      if (dailyStats[date]) {
        switch (data.type) {
          case InteractionType.LIKE:
            dailyStats[date].likes++;
            break;
          case InteractionType.COMMENT:
            dailyStats[date].comments++;
            break;
          case InteractionType.SHARE:
            dailyStats[date].shares++;
            break;
        }
      }
    });
    
    // Преобразуем объект в массив
    return Object.values(dailyStats);
  } catch (error) {
    console.error("Error getting views stats:", error);
    throw error;
  }
};

/**
 * Получить общую статистику блога
 */
export const getBlogStats = async (): Promise<{
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgViewsPerPost: number;
}> => {
  try {
    // Получаем все посты
    const postsSnapshot = await getDocs(collection(db, BLOG_POSTS_COLLECTION));
    
    let totalPosts = postsSnapshot.size;
    let totalViews = 0;
    let totalLikes = 0;
    let totalComments = 0;
    let totalShares = 0;
    
    // Суммируем статистику по всем постам
    postsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      totalViews += data.viewCount || 0;
      totalLikes += data.likeCount || 0;
      totalComments += data.commentCount || 0;
      totalShares += data.shareCount || 0;
    });
    
    // Вычисляем среднее количество просмотров на пост
    const avgViewsPerPost = totalPosts > 0 ? Math.round(totalViews / totalPosts) : 0;
    
    return {
      totalPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      avgViewsPerPost
    };
  } catch (error) {
    console.error("Error getting blog stats:", error);
    throw error;
  }
};
