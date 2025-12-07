// src/pages/Blog.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2, Grid3X3, List } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { BlogPostCard } from "@/components/BlogPostCard";
import { getAllBlogTags } from "@/firebase/services/blogService";
import { useBlogPosts } from "@/hooks/useBlogPosts";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'compact' | 'full'>('full');
  
  // Используем новый хук для real-time получения постов
  const { posts, loading } = useBlogPosts({ 
    publishedOnly: true, 
    realTime: true 
  });

  // Загрузка тегов
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

  // Filter posts based on search query and selected tag
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? post.tags?.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-muted py-12">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog o květinách</h1>
              <p className="text-muted-foreground max-w-2xl">
                Přečtěte si naše tipy a rady pro péči o květiny a inspirujte se našimi nápady.
              </p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">Zobrazení:</span>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'compact' ? 'full' : 'compact')}
                className="flex items-center gap-2"
                title={viewMode === 'compact' ? 'Přepnout na plný režim' : 'Přepnout na kompaktní režim'}
              >
                {viewMode === 'compact' ? (
                  <>
                    <Grid3X3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Kompaktní</span>
                  </>
                ) : (
                  <>
                    <List className="h-4 w-4" />
                    <span className="hidden sm:inline">Plný</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Blog Posts */}
            <div className="md:col-span-2 space-y-8">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <span className="ml-4 text-lg">Načítání článků...</span>
                </div>
              ) : (
                <>
                  {(searchQuery || selectedTag) && (
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">
                        {searchQuery && selectedTag && `Výsledky pro "${searchQuery}" v kategorii "${selectedTag}"`}
                        {searchQuery && !selectedTag && `Výsledky pro "${searchQuery}"`}
                        {!searchQuery && selectedTag && `Články v kategorii "${selectedTag}"`}
                      </h2>
                      <p className="text-muted-foreground">
                        Nalezeno {filteredPosts.length} článků
                      </p>
                    </div>
                  )}

                  {filteredPosts.length > 0 ? (
                    filteredPosts.map((post, index) => (
                      <div key={post.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <BlogPostCard post={post} viewMode={viewMode} />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-semibold mb-2">Žádné články nenalezeny</h3>
                      <p className="text-muted-foreground mb-6">
                        Zkuste upravit vyhledávání nebo vybrat jinou kategorii.
                      </p>
                      <Button onClick={() => { setSearchQuery(""); setSelectedTag(null); }}>
                        Zobrazit všechny články
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Search */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Hledat</h3>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Hledat články..." 
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Categories */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Kategorie</h3>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant={selectedTag === null ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => setSelectedTag(null)}
                        >
                          Všechny
                        </Button>
                        {allTags.map(tag => (
                          <Button 
                            key={tag} 
                            variant={selectedTag === tag ? "default" : "secondary"}
                            className="cursor-pointer"
                            onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Posts */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Nejnovější články</h3>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {posts.slice(0, 3).map(post => (
                          <Link to={`/blog/${post.id}`} key={post.id} className="flex gap-3 group">
                            <div className="w-16 h-16 rounded-md overflow-hidden shrink-0">
                              <img
                                src={post.imageUrl}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{post.title}</h4>
                              <p className="text-xs text-muted-foreground">
                                {post.publishedAt ? format(post.publishedAt, "dd.MM.yyyy", { locale: ru }) : format(post.createdAt, "dd.MM.yyyy", { locale: ru })}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Subscribe */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Odběr novinek</h3>
                    <p className="text-muted-foreground mb-4">
                      Přihlaste se k odběru a dostávejte nejnovější články přímo do vaší e-mailové schránky.
                    </p>
                    <div className="space-y-3">
                      <Input placeholder="Váš e-mail" type="email" />
                      <Button className="w-full">Odebírat</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}