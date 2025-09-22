import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Building, GraduationCap } from 'lucide-react';

export const ServicesSection = () => {
  const services = [
    {
      id: 'kurty',
      title: 'Kurty venku',
      description: 'Čtyři pečlivě udržované antukové kurty pro rekreační i klubové hráče.',
      icon: Users,
      href: '/sluzby#kurty'
    },
    {
      id: 'hala',
      title: 'Tenisová hala',
      description: 'Dva vnitřní kurty se špičkovým osvětlením pro jistotu hry v každém počasí.',
      icon: Building,
      href: '/sluzby#hala'
    },
    {
      id: 'vyuka',
      title: 'Výuka tenisu',
      description: 'Individuální i skupinové lekce pro děti i dospělé.',
      icon: GraduationCap,
      href: '/sluzby#vyuka'
    }
  ];

  return (
    <section className="section-padding bg-section-bg">
      <div className="container-max">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold">
            Naše služby
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kompletní tenisové zázemí pro hráče všech úrovní
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const IconComponent = service.icon;
            
            return (
              <Card key={service.id} className="service-card group hover:scale-105 transition-transform duration-200">
                <CardHeader className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-heading">
                    {service.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6">
                  <p className="text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                  <Button variant="ghost" asChild className="group/button">
                    <Link to={service.href} className="flex items-center space-x-2">
                      <span>Více informací</span>
                      <ArrowRight className="h-4 w-4 group-hover/button:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};