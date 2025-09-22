import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const CTASection = () => {
  return (
    <section className="section-padding bg-primary">
      <div className="container-max">
        <div className="text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-primary-foreground">
            Chcete si zahrát dnes?
          </h2>
          <Button 
            size="lg" 
            variant="secondary"
            asChild
            className="text-lg px-8 py-4 rounded-xl bg-white text-primary hover:bg-white/90"
          >
            <Link to="/rezervace">
              Rezervovat kurt
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};