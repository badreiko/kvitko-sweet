import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BlogPost, getPostById, getRelatedPosts } from "@/firebase/services/blogService";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

export default function BlogDetail() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  // Parallax constraints
  const headerRef = useRef<HTMLDivElement>(null);

  // Reading progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({
    target: headerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(heroProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(heroProgress, [0, 1], ["0%", "150%"]);

  const formatDate = (date: Date | null) => {
    if (!date) return "";
    return format(date, "dd MMMM yyyy", { locale: ru });
  };

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;
      setLoading(true);
      window.scrollTo(0, 0); // Reset scroll position when loading new post

      try {
        const postData = await getPostById(id);
        if (postData) {
          setPost(postData);
          if (postData.tags && postData.tags.length > 0) {
            const mainTag = postData.tags[0];
            try {
              const relatedPostsData = await getRelatedPosts(id, mainTag, 3);
              setRelatedPosts(relatedPostsData);
            } catch (error) {
              console.error("Error loading related posts:", error);
            }
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
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
            <p className="font-serif text-lg text-muted-foreground animate-pulse">Načítání článku...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl font-serif font-bold mb-4">Článek nenalezen</h1>
          <p className="text-muted-foreground mb-8 max-w-md">Omlouváme se, ale požadovaný článek byl přesunut nebo již neexistuje.</p>
          <Button asChild className="rounded-full shadow-lg h-12 px-8">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" /> Zpět na blog
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Reading Progress Indicator */}
      <motion.div
        className="fixed top-[73px] left-0 right-0 h-1 bg-primary z-50 origin-left"
        style={{ scaleX }}
      />

      <article className="pb-24">
        {/* Parallax Hero Section */}
        <section ref={headerRef} className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden mb-16">
          <motion.div
            style={{ y }}
            className="absolute inset-0 z-0 bg-muted"
          >
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            {/* Dark gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </motion.div>

          {/* Hero Content */}
          <motion.div
            style={{ y: textY, opacity }}
            className="container-custom relative z-10 pb-16 pt-32"
          >
            <div className="max-w-4xl mx-auto text-center">
              <Link
                to="/blog"
                className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-background/50 backdrop-blur-md mb-8 hover:bg-background/80 transition-colors text-foreground shadow-sm hover:shadow-md border border-border/50"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                {post.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="bg-background/80 backdrop-blur-sm text-sm py-1 px-3">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold leading-[1.1] mb-8 text-foreground balance-text break-words">
                {post.title}
              </h1>

              <div className="flex items-center justify-center gap-6 text-sm sm:text-base font-medium text-foreground/80 uppercase tracking-wider">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  <span>{post.author}</span>
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Post Content */}
        <div className="container-custom relative">
          <div className="max-w-3xl mx-auto">

            {/* Abstract Decorative elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -translate-x-1/2 -z-10" />
            <div className="absolute bottom-1/2 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] translate-x-1/3 -z-10" />

            <div className="prose prose-lg sm:prose-xl max-w-none text-foreground break-words prose-headings:break-words prose-headings:font-serif prose-headings:font-bold prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-2xl prose-img:shadow-lg prose-p:leading-relaxed prose-blockquote:border-primary prose-blockquote:bg-muted/30 prose-blockquote:rounded-r-2xl prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:font-serif prose-blockquote:text-2xl prose-blockquote:leading-snug">
              {/* Dropcap styling via standard markdown paragraph combined with CSS classes if provided */}
              <style dangerouslySetInnerHTML={{
                __html: `
                .prose > p:first-of-type::first-letter {
                  float: left;
                  font-size: 5rem;
                  line-height: 0.8;
                  padding-right: 0.5rem;
                  padding-top: 0.5rem;
                  font-family: var(--font-serif);
                  color: hsl(var(--primary));
                  font-weight: bold;
                }
              `}} />
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Author Footer block */}
            <div className="mt-16 pt-8 border-t border-border flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xl font-bold font-serif shadow-inner shrink-0 object-cover overflow-hidden">
                {post.author.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-lg">Napsal(a) {post.author}</h4>
                <p className="text-muted-foreground text-sm">Designér floristiky Kvitko Sweet, vytváří kouzelné aranžmá s láskou k detailu a přírodě.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="container-custom mt-24">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-10 border-b border-border pb-4">
                <h2 className="text-3xl font-serif font-bold">Související čtení</h2>
                <Button variant="ghost" asChild className="hover:bg-transparent hover:text-primary group">
                  <Link to="/blog">
                    Všechny články <ArrowLeft className="ml-2 h-4 w-4 rotate-180 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, i) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Link to={`/blog/${relatedPost.id}`} className="group block h-full">
                      <div className="flex flex-col h-full">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-muted">
                          <img
                            src={relatedPost.imageUrl}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        </div>
                        <h3 className="font-serif font-bold text-xl mb-2 group-hover:text-primary transition-colors line-clamp-2 break-words">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-1 break-words">
                          {relatedPost.excerpt}
                        </p>
                        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground mt-auto">
                          {relatedPost.publishedAt ? formatDate(relatedPost.publishedAt) : formatDate(relatedPost.createdAt)}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </Layout>
  );
}