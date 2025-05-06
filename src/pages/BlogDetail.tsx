import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, Tag, ChevronRight, ArrowLeft, Share, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogPostCard } from "@/components/BlogPostCard";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { getPostById, getAllPublishedPosts, getPostsByTag } from "@/firebase/services";

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

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Загрузка статьи
  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const postData = await getPostById(id);
        
        if (postData) {
          setPost(postData);
          
          // Загружаем похожие статьи по тегу (если есть)
          if (postData.tags && postData.tags.length > 0) {
            const mainTag = postData.tags[0];
            const related = await getPostsByTag(mainTag);
            // Фильтруем, чтобы не включать текущую статью
            const filtered = related.filter(item => item.id !== id);
            setRelatedPosts(filtered.slice(0, 3));
          } else {
            // Если нет тегов, загружаем просто другие статьи
            const allPosts = await getAllPublishedPosts();
            const filtered = allPosts.filter(item => item.id !== id);
            setRelatedPosts(filtered.slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Error loading blog post:", error);
        toast.error("Произошла ошибка при загрузке статьи");
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [id]);

  // Форматирование даты
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <div className="flex items-center justify-center min-h-[40vh]">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container-custom py-16">
          <h1 className="text-2xl font-bold">Статья не найдена</h1>
          <p className="mt-4">К сожалению, запрашиваемая статья не существует или была удалена.</p>
          <Button asChild className="mt-6">
            <Link to="/blog">Вернуться к блогу</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground transition-colors">Главная</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link to="/blog" className="hover:text-foreground transition-colors">Блог</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="truncate max-w-xs">{post.title}</span>
        </div>
        
        {/* Back to blog */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Назад к блогу
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-card rounded-lg shadow overflow-hidden">
              {/* Featured Image */}
              <div className="aspect-[16/9] relative">
                <img 
                  src={post.imageUrl} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="p-6 md:p-8">
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          // Здесь можно добавить редирект на страницу категории
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
                
                <div className="flex flex-wrap items-center text-sm text-muted-foreground gap-4 mb-6">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(post.publishedAt)}</span>
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    <span>{post.author}</span>
                  </div>
                </div>
                
                {/* Render the blog content - this should be rich text or HTML */}
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                  {/* В реальном проекте здесь будет рендер HTML или Markdown */}
                  <div dangerouslySetInnerHTML={{ __html: post.content }} />
                </div>
                
                {/* Share buttons */}
                <div className="border-t border-border mt-8 pt-6">
                  <div className="flex items-center flex-wrap gap-4">
                    <span className="text-sm font-medium">Поделиться:</span>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Facebook className="h-4 w-4 mr-2" />
                      Facebook
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          </div>
          
          {/* Sidebar */}
          <div>
            <div className="sticky top-24 space-y-6">
              {/* Author */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Автор</h3>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{post.author}</p>
                      <p className="text-sm text-muted-foreground">Флорист</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Теги</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            // Здесь можно добавить редирект на страницу категории
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Похожие статьи</h3>
                    <div className="space-y-4">
                      {relatedPosts.map(post => (
                        <div key={post.id} className="flex gap-3">
                          <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm line-clamp-2">
                              <Link to={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                                {post.title}
                              </Link>
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(post.publishedAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}