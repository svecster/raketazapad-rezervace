import { Card, CardContent } from '@/components/ui/card';
import { Clock, Info } from 'lucide-react';

export const OpeningHours = () => {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-heading font-bold">
                  Otevírací doba
                </h3>
                <p className="text-3xl sm:text-4xl font-heading font-bold text-primary">
                  Denně 7:00–22:00
                </p>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Poslední rezervace končí ve 22:00</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};