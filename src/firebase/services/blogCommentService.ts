import { db } from "../config";
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { serverTimestamp } from "firebase/firestore";

// Константы
const BLOG_COMMENTS_COLLECTION = "blogComments";
const BLOG_POSTS_COLLECTION = "blogPosts";

// Статусы комментариев
export enum CommentStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

// Интерфейс для комментария блога
export interface BlogComment {
  id: string;
  postId: string;
  author: string;
  email: string;
  content: string;
  status: CommentStatus;
  replyContent?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  repliedAt?: Date;
}

/**
 * Получить все комментарии блога
 */
export const getAllBlogComments = async (): Promise<BlogComment[]> => {
  try {
    const q = query(
      collection(db, BLOG_COMMENTS_COLLECTION),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate() || undefined,
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    } as BlogComment));
  } catch (error) {
    console.error("Error getting blog comments:", error);
    throw error;
  }
};

/**
 * Получить комментарии по статусу
 */
export const getCommentsByStatus = async (status: CommentStatus): Promise<BlogComment[]> => {
  try {
    const q = query(
      collection(db, BLOG_COMMENTS_COLLECTION),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate() || undefined,
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    } as BlogComment));
  } catch (error) {
    console.error(`Error getting ${status} comments:`, error);
    throw error;
  }
};

/**
 * Получить комментарии для конкретного поста
 */
export const getCommentsForPost = async (postId: string, onlyApproved: boolean = true): Promise<BlogComment[]> => {
  try {
    let q;
    if (onlyApproved) {
      q = query(
        collection(db, BLOG_COMMENTS_COLLECTION),
        where("postId", "==", postId),
        where("status", "==", CommentStatus.APPROVED),
        orderBy("createdAt", "desc")
      );
    } else {
      q = query(
        collection(db, BLOG_COMMENTS_COLLECTION),
        where("postId", "==", postId),
        orderBy("createdAt", "desc")
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate() || undefined,
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    } as BlogComment));
  } catch (error) {
    console.error("Error getting comments for post:", error);
    throw error;
  }
};

/**
 * Получить комментарий по ID
 */
export const getBlogCommentById = async (id: string): Promise<BlogComment | null> => {
  try {
    const docRef = doc(db, BLOG_COMMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        approvedAt: data.approvedAt?.toDate() || undefined,
        rejectedAt: data.rejectedAt?.toDate() || undefined,
        repliedAt: data.repliedAt?.toDate() || undefined
      } as BlogComment;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting blog comment:", error);
    throw error;
  }
};

/**
 * Добавить новый комментарий
 */
export const addBlogComment = async (
  comment: Omit<BlogComment, "id" | "status" | "createdAt" | "updatedAt" | "approvedAt" | "rejectedAt" | "repliedAt">
): Promise<BlogComment> => {
  try {
    // Проверяем, существует ли пост
    const postRef = doc(db, BLOG_POSTS_COLLECTION, comment.postId);
    const postSnap = await getDoc(postRef);
    
    if (!postSnap.exists()) {
      throw new Error(`Post with ID "${comment.postId}" does not exist`);
    }
    
    const now = new Date();
    const docRef = await addDoc(collection(db, BLOG_COMMENTS_COLLECTION), {
      ...comment,
      status: CommentStatus.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return {
      id: docRef.id,
      ...comment,
      status: CommentStatus.PENDING,
      createdAt: now,
      updatedAt: now
    } as BlogComment;
  } catch (error) {
    console.error("Error adding blog comment:", error);
    throw error;
  }
};

/**
 * Обновить статус комментария
 */
export const updateCommentStatus = async (id: string, status: CommentStatus): Promise<void> => {
  try {
    const docRef = doc(db, BLOG_COMMENTS_COLLECTION, id);
    
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    // Добавляем соответствующее поле с датой в зависимости от статуса
    if (status === CommentStatus.APPROVED) {
      updateData.approvedAt = serverTimestamp();
    } else if (status === CommentStatus.REJECTED) {
      updateData.rejectedAt = serverTimestamp();
    }
    
    await updateDoc(docRef, updateData);
  } catch (error) {
    console.error("Error updating comment status:", error);
    throw error;
  }
};

/**
 * Добавить ответ на комментарий
 */
export const replyToComment = async (id: string, replyContent: string): Promise<void> => {
  try {
    const docRef = doc(db, BLOG_COMMENTS_COLLECTION, id);
    
    await updateDoc(docRef, {
      replyContent,
      repliedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error replying to comment:", error);
    throw error;
  }
};

/**
 * Удалить комментарий
 */
export const deleteBlogComment = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, BLOG_COMMENTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting blog comment:", error);
    throw error;
  }
};

/**
 * Получить количество комментариев по статусам
 */
export const getCommentCounts = async (): Promise<{ [key in CommentStatus]: number }> => {
  try {
    const allComments = await getAllBlogComments();
    
    const counts = {
      [CommentStatus.PENDING]: 0,
      [CommentStatus.APPROVED]: 0,
      [CommentStatus.REJECTED]: 0
    };
    
    allComments.forEach(comment => {
      counts[comment.status]++;
    });
    
    return counts;
  } catch (error) {
    console.error("Error getting comment counts:", error);
    throw error;
  }
};

/**
 * Получить последние комментарии
 */
export const getRecentComments = async (limitCount: number = 5, onlyApproved: boolean = true): Promise<BlogComment[]> => {
  try {
    let q;
    if (onlyApproved) {
      q = query(
        collection(db, BLOG_COMMENTS_COLLECTION),
        where("status", "==", CommentStatus.APPROVED),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    } else {
      q = query(
        collection(db, BLOG_COMMENTS_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );
    }
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate() || undefined,
      rejectedAt: doc.data().rejectedAt?.toDate() || undefined,
      repliedAt: doc.data().repliedAt?.toDate() || undefined
    } as BlogComment));
  } catch (error) {
    console.error("Error getting recent comments:", error);
    throw error;
  }
};
