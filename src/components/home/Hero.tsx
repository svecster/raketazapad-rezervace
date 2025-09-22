import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="hero-section">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[600px] py-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight">
                Tenis v srdci
                <span className="text-primary block">Liberce</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg leading-relaxed">
                Antukové kurty i zimní hala. Rezervace online za pár vteřin.
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-lg px-8 py-4 rounded-xl">
                <Link to="/rezervace">
                  Rezervovat kurt
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                asChild
                className="text-lg px-8 py-4 rounded-xl"
              >
                <a href="tel:+420602130331" className="flex items-center space-x-2">
                  <Phone className="h-5 w-5" />
                  <span>Zavolat</span>
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              {/* Placeholder for hero image */}
              <div className="w-full h-full flex items-center justify-center bg-section-bg">
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2L8.59 3.41L15.17 10L8.59 16.59L10 18L18 10L10 2Z"/>
                    </svg>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hero fotka areálu bude zde
                  </p>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-secondary/10 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};