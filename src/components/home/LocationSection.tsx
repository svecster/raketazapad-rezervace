import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

export const LocationSection = () => {
  return (
    <section className="section-padding bg-section-bg">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl sm:text-3xl font-heading font-bold">
                Jak nás najdete
              </h3>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <div className="space-y-1">
                  <p className="font-medium">Londýnská 630/2a</p>
                  <p className="text-muted-foreground">Liberec</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" asChild>
              <a 
                href="#" 
                className="flex items-center space-x-2"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Implement map navigation in Phase 2
                }}
              >
                <Navigation className="h-4 w-4" />
                <span>Trasa v mapě</span>
              </a>
            </Button>
          </div>

          {/* Right Map Placeholder */}
          <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-section-bg border">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4 p-8">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Mapa bude zobrazena zde
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};