import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';

export default function ErrorPage() {
  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl top-0 -right-48 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-secondary/10 rounded-full blur-3xl -bottom-20 -left-20"></div>
        
        <div className="relative z-10 max-w-md w-full text-center">
          <h1 className="text-9xl font-bold mb-2 text-primary">
            404
          </h1>
          <div className="w-16 h-1 bg-primary/20 mx-auto my-4"></div>
          <h2 className="text-2xl font-semibold mb-2">Stránka nenalezena</h2>
          <p className="text-muted-foreground mb-8">
            Omlouváme se, ale stránka, kterou hledáte, neexistuje nebo byla přesunuta.
          </p>
          <Button asChild size="lg">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zpět na úvodní stránku
            </Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
}

