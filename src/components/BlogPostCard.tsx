// src/components/BlogPostCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { BlogPost as FirestoreBlogPost } from "@/firebase/services/blogService";

// Определение типа BlogPost для использования в компоненте
export type BlogPost = FirestoreBlogPost;

interface BlogPostCardProps {
  post: BlogPost;
  viewMode?: 'compact' | 'full';
}

export function BlogPostCard({ post, viewMode = 'full' }: BlogPostCardProps) {
  // Форматирование даты из Firestore
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "dd MMMM yyyy", { locale: cs });
  };

  if (viewMode === 'compact') {
    return (
      <Link to={`/blog/${post.id}`} className="group">
        <Card className="overflow-hidden border-border card-hover h-full">
          <CardContent className="p-4">
            <div className="flex gap-4">
              {/* Компактное изображение */}
              <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              {/* Контент */}
              <div className="flex-1 min-w-0">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.tags.slice(0, 2).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{post.tags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}

                <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                  {post.excerpt}
                </p>

                <div className="flex items-center text-xs text-muted-foreground gap-3">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-3 w-3 mr-1" />
                    <span>{post.author}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  // Полный режим (по умолчанию)
  return (
    <Link to={`/blog/${post.id}`} className="group">
      <Card className="overflow-hidden border-border card-hover h-full">
        <div className="aspect-video overflow-hidden">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map(tag => (
                <Badge
                  key={tag}
                  variant="secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {post.excerpt}
          </p>
          <div className="flex items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span>{post.author}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
