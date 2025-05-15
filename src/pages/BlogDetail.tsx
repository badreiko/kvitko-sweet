import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ReactMarkdown from "react-markdown";
import { blogContent } from "@/data/blogContent";
import { blogPosts } from "@/data/blogPosts";
import { BlogPost } from "@/components/BlogPostCard";

// Simulace API volání
const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  // V reálné aplikaci by zde bylo API volání
  const post = blogPosts.find(post => post.id === id);
  return post;
};

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // Funkce pro formátování data
  const formatDate = (dateString: string) => {
    return dateString; // V reálné aplikaci by zde bylo formátování data
  };

  // Načtení článku
  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const postData = await getPostById(id);
        
        if (postData) {
          // Získání úplného obsahu z blogContent
          const fullContent = blogContent[postData.id as keyof typeof blogContent] || postData.content;
          
          setPost({
            ...postData,
            content: fullContent
          });
          
          // Načítáme podobné články podle štítku (pokud existují)
          if (postData.tags && postData.tags.length > 0) {
            const mainTag = postData.tags[0];
            const similar = blogPosts
              .filter(p => p.id !== id && p.tags && p.tags.includes(mainTag))
              .slice(0, 3);
            setRelatedPosts(similar);
          }
        }
      } catch (error) {
        console.error("Error loading blog post:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPost();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <p>Načítání článku...</p>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container-custom py-12">
          <h1 className="text-2xl font-bold mb-4">Článek nenalezen</h1>
          <p className="mb-6">Požadovaný článek bohužel neexistuje.</p>
          <Button asChild>
            <Link to="/blog">Zpět na blog</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-custom py-12">
        {/* Back button */}
        <div className="mb-8">
          <Button variant="outline" asChild>
            <Link to="/blog" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na blog
            </Link>
          </Button>
        </div>

        {/* Article header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          {/* Meta info */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(post.date)}
            </div>
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              {post.author}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Featured image */}
          <div className="aspect-[21/9] relative rounded-lg overflow-hidden mb-8">
            <img 
              src={post.imageUrl} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Article content */}
        <div className="prose prose-lg max-w-none mb-12">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Související články</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link to={`/blog/${relatedPost.id}`} key={relatedPost.id} className="block">
                  <div className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-[16/9] relative">
                      <img 
                        src={relatedPost.imageUrl} 
                        alt={relatedPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold mb-2">{relatedPost.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}