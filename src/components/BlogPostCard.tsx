import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { BlogPost as FirestoreBlogPost } from "@/firebase/services/blogService";
import { motion } from "framer-motion";

export type BlogPost = FirestoreBlogPost;

interface BlogPostCardProps {
  post: BlogPost;
  featured?: boolean;
}

export function BlogPostCard({ post, featured = false }: BlogPostCardProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "dd MMMM yyyy", { locale: cs });
  };

  // Вычисляем примерное время чтения (1 слово = ~0.5 секунд, или тупо по длине контента)
  const calculateReadingTime = (content: string) => {
    const words = content?.trim().split(/\s+/).length || 0;
    const minutes = Math.ceil(words / 200); // 200 слов в минуту
    return Math.max(1, minutes);
  };

  const readTime = calculateReadingTime(post.content || post.excerpt);

  return (
    <Link to={`/blog/${post.id}`} className="group block h-full">
      <Card
        className={`overflow-hidden border-border/50 bg-background/50 hover:bg-background/80 transition-colors h-full flex flex-col relative ${featured ? "sm:flex-row shadow-lg hover:shadow-xl" : "shadow-md hover:shadow-lg"
          }`}
      >
        <div
          className={`overflow-hidden relative bg-muted shrink-0 ${featured ? "w-full sm:w-1/2 aspect-video sm:aspect-auto sm:h-auto" : "aspect-[4/3] w-full"
            }`}
        >
          <motion.img
            initial={false}
            src={post.imageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
          {post.tags && post.tags.length > 0 && (
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <Badge variant="default" className="bg-primary/90 hover:bg-primary backdrop-blur-md shadow-sm">
                {post.tags[0]}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className={`p-6 flex flex-col flex-1 min-w-0 justify-center ${featured ? "sm:p-10" : ""}`}>
          <div className="flex items-center text-xs font-medium text-muted-foreground gap-4 mb-4 uppercase tracking-wider flex-wrap">
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              <span>{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50 mr-2" />
              <span>{readTime} min čtení</span>
            </div>
          </div>

          <h3
            className={`font-serif font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2 break-words ${featured ? "text-2xl sm:text-3xl leading-snug" : "text-xl leading-tight"
              }`}
          >
            {post.title}
          </h3>

          <p
            className={`text-muted-foreground mb-6 break-words ${featured ? "line-clamp-3 text-base sm:text-lg" : "line-clamp-2 text-sm"
              }`}
          >
            {post.excerpt}
          </p>

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-border/50">
            <div className="flex items-center text-sm font-medium">
              <User className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{post.author}</span>
            </div>
            <span className="text-primary text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
              Číst dál
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
