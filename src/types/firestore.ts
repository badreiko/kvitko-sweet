import { Timestamp } from 'firebase/firestore';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  views: number;
  likes: number;
  published: boolean;
  featured?: boolean;
}

// Тип для Firestore документа
export interface BlogPostDoc {
  [key: string]: any;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  author: string;
  publishedAt: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  tags?: string[];
  views: number;
  likes: number;
  published: boolean;
  featured?: boolean;
}
