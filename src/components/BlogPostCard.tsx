// src/components/BlogPostCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

interface BlogPostCardProps {
  post: {
    id: string;
    title: string;
    excerpt: string;
    imageUrl: string;
    author: string;
    date: string;
    tags?: string[];
  };
}

export function BlogPostCard({ post }: BlogPostCardProps) {
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
          <p className="text-muted-foreground mb-4">
            {post.excerpt}
          </p>
          <div className="flex items-center text-sm text-muted-foreground gap-4">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{post.date}</span>
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
