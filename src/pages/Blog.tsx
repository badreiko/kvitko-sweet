import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Search, Tag, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/layout/Layout";

// Sample data for blog posts
const blogPosts = [
  {
    id: "1",
    title: "Jak pečovat o řezané květiny",
    excerpt: "Tipy a triky pro prodloužení životnosti vašich květin. Naučte se, jak správně pečovat o řezané květiny, aby vám vydržely co nejdéle.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: "Jana Květinová",
    date: "15. 5. 2023",
    tags: ["péče o květiny", "řezané květiny", "tipy"]
  },
  {
    id: "2",
    title: "Květiny pro každou příležitost",
    excerpt: "Průvodce výběrem správných květin pro různé události. Svatby, narozeniny, výročí nebo jen tak pro radost - pro každou příležitost existují ideální květiny.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: "https://images.unsplash.com/photo-1519378058457-4c29a0a2efac?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: "Petr Zahradník",
    date: "2. 4. 2023",
    tags: ["příležitosti", "výběr květin", "dárky"]
  },
  {
    id: "3",
    title: "Pěstování pokojových rostlin",
    excerpt: "Základní rady pro začátečníky i pokročilé pěstitele. Dozvíte se, jak vybrat správnou rostlinu pro váš domov a jak o ni pečovat.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: "https://images.unsplash.com/photo-1545165375-7c5a75c62a57?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: "Martina Zelená",
    date: "18. 3. 2023",
    tags: ["pokojové rostliny", "pěstování", "začátečníci"]
  },
  {
    id: "4",
    title: "Sezónní květiny pro vaši zahradu",
    excerpt: "Přehled květin, které můžete pěstovat v každém ročním období. Plánujte svou zahradu tak, aby kvetla po celý rok.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: "https://images.unsplash.com/photo-1520412099551-62b6bafeb5bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: "Jana Květinová",
    date: "5. 3. 2023",
    tags: ["zahrada", "sezónní květiny", "plánování"]
  },
  {
    id: "5",
    title: "Symbolika květin v různých kulturách",
    excerpt: "Objevte, co znamenají různé květiny v různých částech světa. Květiny mají bohatou symboliku, která se liší napříč kulturami.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: "Petr Zahradník",
    date: "20. 2. 2023",
    tags: ["symbolika", "kultury", "historie"]
  },
  {
    id: "6",
    title: "Jak vytvořit perfektní svatební kytici",
    excerpt: "Kompletní průvodce výběrem a tvorbou svatební kytice. Inspirujte se různými styly a barvami pro váš velký den.",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl. Sed euismod, nisl vel ultricies lacinia, nisl nisl aliquam nisl, eu aliquam nisl nisl eu nisl.",
    imageUrl: "https://images.unsplash.com/photo-1525811902-f2342640856e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    author: "Martina Zelená",
    date: "10. 2. 2023",
    tags: ["svatba", "svatební kytice", "inspirace"]
  }
];

// Extract all unique tags
const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags || [])));

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Filter posts based on search query and selected tag
  const filteredPosts = blogPosts.filter(post => {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog o květinách</h1>
          <p className="text-muted-foreground max-w-2xl">
            Přečtěte si naše tipy a rady pro péči o květiny a inspirujte se našimi nápady.
          </p>
        </div>
      </section>
      
      <section className="py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Search Results Info */}
              {(searchQuery || selectedTag) && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-2">
                    {searchQuery && selectedTag && (
                      <>Výsledky pro "{searchQuery}" v kategorii "{selectedTag}"</>
                    )}
                    {searchQuery && !selectedTag && (
                      <>Výsledky pro "{searchQuery}"</>
                    )}
                    {!searchQuery && selectedTag && (
                      <>Články v kategorii "{selectedTag}"</>
                    )}
                  </h2>
                  <p className="text-muted-foreground">
                    Nalezeno {filteredPosts.length} článků
                  </p>
                </div>
              )}
              
              {/* Blog Posts */}
              <div className="space-y-8">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post, index) => (
                    <Card key={post.id} className="overflow-hidden border-border card-hover animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-1/3">
                          <img 
                            src={post.imageUrl} 
                            alt={post.title} 
                            className="w-full h-full object-cover aspect-video md:aspect-square"
                          />
                        </div>
                        <CardContent className="p-6 md:w-2/3 flex flex-col">
                          <div className="flex flex-wrap gap-2 mb-3">
                            {post.tags?.map(tag => (
                              <Badge 
                                key={tag} 
                                variant="secondary" 
                                className="cursor-pointer"
                                onClick={() => setSelectedTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <h2 className="text-xl font-semibold mb-2">
                            <Link to={`/blog/${post.id}`} className="hover:text-primary transition-colors">
                              {post.title}
                            </Link>
                          </h2>
                          <p className="text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground gap-4 mb-4">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              <span>{post.date}</span>
                            </div>
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              <span>{post.author}</span>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <Button variant="outline" asChild>
                              <Link to={`/blog/${post.id}`}>
                                Číst více
                                <ArrowRight className="ml-2 h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
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
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
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
                    <div className="flex flex-wrap gap-2">
                      {allTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant={selectedTag === tag ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Recent Posts */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Nejnovější články</h3>
                    <div className="space-y-4">
                      {blogPosts.slice(0, 3).map(post => (
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
                            <p className="text-xs text-muted-foreground mt-1">{post.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
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