// src/components/BlogNotification.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBlogContext } from '@/context/BlogContext';
import { motion, AnimatePresence } from 'framer-motion';

export const BlogNotification = () => {
  try {
    const { hasNewPosts, setHasNewPosts } = useBlogContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      if (hasNewPosts) {
        setIsVisible(true);
        // Автоматически скрыть уведомление через 10 секунд
        const timer = setTimeout(() => {
          setIsVisible(false);
          setHasNewPosts(false);
        }, 10000);

        return () => clearTimeout(timer);
      }
    }, [hasNewPosts, setHasNewPosts]);

    const handleClose = () => {
      setIsVisible(false);
      setHasNewPosts(false);
    };

    const handleViewBlog = () => {
      setIsVisible(false);
      setHasNewPosts(false);
    };

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -100, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed top-4 right-4 z-50 max-w-sm"
          >
            <Card className="border-primary/20 bg-background/95 backdrop-blur-sm shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <Bell className="h-5 w-5 text-primary" />
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                      >
                        !
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1">
                      Nový článek v blogu!
                    </h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Byl přidán nový článek do našeho blogu. Přečtěte si nejnovější tipy a rady.
                    </p>
                    
                    <div className="flex gap-2">
                      <Button 
                        asChild 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={handleViewBlog}
                      >
                        <Link to="/blog">
                          Zobrazit blog
                        </Link>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-7"
                        onClick={handleClose}
                      >
                        Později
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 flex-shrink-0"
                    onClick={handleClose}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
  } catch (error) {
    console.error(error);
    return null;
  }
};
