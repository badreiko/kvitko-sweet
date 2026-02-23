import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BlogPostCard } from "@/components/BlogPostCard";
import { getAllBlogTags } from "@/firebase/services/blogService";
import { useBlogPosts } from "@/hooks/useBlogPosts";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  const { posts, loading } = useBlogPosts({
    publishedOnly: true,
    realTime: true
  });

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getAllBlogTags();
        setAllTags(tags);
      } catch (error) {
        console.error("Error fetching blog tags:", error);
      }
    };
    fetchTags();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <Layout>
      {/* Magazine-style Hero Section */}
      <section ref={heroRef} className="relative bg-muted py-24 sm:py-32 overflow-hidden border-b border-border/50">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container-custom relative z-10 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-5xl sm:text-7xl lg:text-[6rem] font-serif font-bold tracking-tighter mb-6 leading-none">
              The Floral <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic font-light pr-4">Journal</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto font-light"
          >
            Inspirace, rady pro péči a příběhy ze světa nádherných květin. Ponořte se do krásy přírody.
          </motion.p>
        </motion.div>
      </section>

      {/* Sticky Categories & Search Bar (Glassmorphism) */}
      <section className="sticky top-[73px] z-30 border-b border-border/50 bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40 py-4 transition-all">
        <div className="container-custom flex flex-col sm:flex-row items-center justify-between gap-4">

          {/* Tags Overflow Scroll */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-none flex items-center gap-2 pb-1 sm:pb-0 w-full mask-linear-fade">
            <Button
              size="sm"
              variant={selectedTag === null ? "default" : "ghost"}
              className="rounded-full shrink-0 font-medium"
              onClick={() => setSelectedTag(null)}
            >
              Všechny
            </Button>
            {allTags.map(tag => (
              <Button
                size="sm"
                key={tag}
                variant={selectedTag === tag ? "default" : "ghost"}
                className={`rounded-full shrink-0 transition-all ${selectedTag === tag ? 'font-medium shadow-md shadow-primary/20' : ''}`}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              >
                {tag}
              </Button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-auto shrink-0 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Hledat články..."
              className="pl-9 rounded-full bg-background/50 border-border/50 focus-visible:ring-1 focus-visible:ring-primary w-full sm:w-[250px] transition-all hover:bg-background/80"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Bento Grid layout for Posts */}
      <section className="py-16 md:py-24">
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 opacity-50">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-serif">Načítání inspirace...</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-12">

              {/* Main Content Area */}
              <div className="flex-1 min-w-0 w-full lg:w-2/3 xl:w-3/4">
                {(searchQuery || selectedTag) && (
                  <div className="mb-8 p-6 bg-muted/50 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <h2 className="text-2xl font-serif font-medium mb-1">
                      {searchQuery && selectedTag && `Výsledky pro "${searchQuery}" v kategorii "${selectedTag}"`}
                      {searchQuery && !selectedTag && `Výsledky pro "${searchQuery}"`}
                      {!searchQuery && selectedTag && `Články v kategorii "${selectedTag}"`}
                    </h2>
                    <p className="text-muted-foreground">
                      Nalezeno: <span className="font-medium text-foreground">{filteredPosts.length}</span>
                    </p>
                  </div>
                )}

                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    {filteredPosts.map((post, index) => {
                      // Первые два поста крупные, если нет поиска
                      // Или первый пост на всю ширину
                      const isFirst = index === 0;
                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: "-100px" }}
                          transition={{ duration: 0.6, delay: Math.min(index * 0.1, 0.4) }}
                          className={isFirst && !searchQuery ? "sm:col-span-2" : "col-span-1"}
                        >
                          <BlogPostCard post={post} featured={isFirst && !searchQuery} />
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-muted/30 rounded-3xl border border-border/50 border-dashed">
                    <h3 className="text-2xl font-serif mb-3">Zátiší</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                      Vašemu hledání bohužel neodpovídají žádné články. Zkuste jiná klíčová slova nebo vyberte jinou kategorii.
                    </p>
                    <Button onClick={() => { setSearchQuery(""); setSelectedTag(null); }} className="rounded-full shadow-lg shadow-primary/20">
                      Vyčistit filtry
                    </Button>
                  </div>
                )}
              </div>

              {/* Sidebar Area */}
              <aside className="w-full lg:w-1/3 xl:w-1/4 space-y-10">
                <div className="sticky top-[160px]">

                  {/* Join the club / Newsletter */}
                  <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 rounded-3xl border border-primary/10 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                    <h3 className="font-serif text-2xl font-bold mb-3 relative z-10">Květinový klub</h3>
                    <p className="text-muted-foreground text-sm mb-6 relative z-10">
                      Přihlaste se k odběru našeho newsletteru a získejte 10% slevu na první nákup plus týdenní dávku inspirace.
                    </p>
                    <div className="space-y-3 relative z-10">
                      <Input placeholder="vas@email.cz" type="email" className="bg-background/80 border-border/50 rounded-xl" />
                      <Button className="w-full rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all group-hover:-translate-y-0.5">
                        Chci do klubu
                      </Button>
                    </div>
                  </div>

                  {/* Popular Posts */}
                  <div className="mt-10">
                    <h3 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
                      <span className="w-8 h-px bg-primary/50" /> Oblíbené
                    </h3>
                    <div className="space-y-6">
                      {!loading && posts.slice(0, 4).map((post, i) => (
                        <Link to={`/blog/${post.id}`} key={post.id} className="group flex gap-4 items-center">
                          <span className="text-4xl font-serif font-black text-muted/30 group-hover:text-primary/20 transition-colors w-10 text-center shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-1 break-words">
                              {post.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {post.publishedAt ? format(post.publishedAt, "dd.MM.yyyy", { locale: ru }) : format(post.createdAt, "dd.MM.yyyy", { locale: ru })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                </div>
              </aside>

            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}