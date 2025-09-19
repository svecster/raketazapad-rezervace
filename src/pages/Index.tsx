// Update this page (the content is just a fallback if you fail to update the page)

import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Users, Coffee } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Tenisový klub Raketa</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Rezervujte si tenisové kurty, objednejte občerstvení a užijte si skvělý tenis
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg border bg-card">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Rezervace kurtů</h3>
            <p className="text-sm text-muted-foreground mb-4">
              2 halové a 4 venkovní kurty k dispozici
            </p>
            <Button asChild className="w-full btn-tennis">
              <Link to="/rezervace">Rezervovat kurt</Link>
            </Button>
          </div>
          
          <div className="p-6 rounded-lg border bg-card">
            <Coffee className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Restaurace & Bar</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Občerstvení a jídlo po hře
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Přihlásit se</Link>
            </Button>
          </div>
          
          <div className="p-6 rounded-lg border bg-card">
            <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Členství</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Staňte se členem našeho klubu
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Registrovat se</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
