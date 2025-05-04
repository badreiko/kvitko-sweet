import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import Logo from "./Logo";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <Link to="/">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Domů
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Katalog</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/catalog/bouquets" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Kytice</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Krásné kytice pro každou příležitost
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/catalog/wedding" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Svatební květiny</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Svatební kytice a dekorace
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/catalog/plants" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Pokojové rostliny</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Zelené rostliny pro váš domov
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink asChild>
                          <Link to="/catalog/gifts" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                            <div className="text-sm font-medium leading-none">Dárky</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              Dárkové předměty a doplňky
                            </p>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/custom-bouquet">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Vlastní kytice
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/delivery">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Doručení
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/blog">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Blog
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/contact">
                    <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                      Kontakt
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Hledat"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Link to="/account">
              <Button variant="ghost" size="icon" aria-label="Můj účet">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Košík">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  0
                </Badge>
              </Button>
            </Link>
            
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <Logo showText={false} size="sm" />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <nav className="flex flex-col gap-4">
                    <Link 
                      to="/" 
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Domů
                    </Link>
                    <Link 
                      to="/catalog" 
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Katalog
                    </Link>
                    <Link 
                      to="/custom-bouquet" 
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Vlastní kytice
                    </Link>
                    <Link 
                      to="/delivery" 
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Doručení
                    </Link>
                    <Link 
                      to="/blog" 
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Blog
                    </Link>
                    <Link 
                      to="/contact" 
                      className="text-lg font-medium py-2 border-b border-border"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Kontakt
                    </Link>
                  </nav>
                  
                  <div className="mt-auto flex flex-col gap-4">
                    <Link 
                      to="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 h-4 w-4" />
                        Můj účet
                      </Button>
                    </Link>
                    <Link 
                      to="/cart"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Košík
                      </Button>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Search Bar */}
        {isSearchOpen && (
          <div className="mt-4 animate-fade-in">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Hledat produkty..." 
                className="pl-10"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;