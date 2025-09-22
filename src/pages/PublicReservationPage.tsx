import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar } from 'lucide-react';

export const PublicReservationPage = () => {
  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-heading">
                  Rezervace
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Online rezervační systém bude brzy k dispozici.
                </p>
                <p className="text-sm text-muted-foreground">
                  Zatím nás prosím kontaktujte telefonicky na{' '}
                  <a 
                    href="tel:+420602130331" 
                    className="text-primary hover:underline font-medium"
                  >
                    +420 602 130 331
                  </a>
                </p>
                <div className="pt-4">
                  <Button variant="outline" asChild>
                    <Link to="/" className="flex items-center space-x-2">
                      <ArrowLeft className="h-4 w-4" />
                      <span>Zpět na domů</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};