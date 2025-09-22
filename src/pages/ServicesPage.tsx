import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, GraduationCap, ShoppingBag, Coffee, Car } from 'lucide-react';

export const ServicesPage = () => {
  const services = [
    {
      id: 'kurty',
      title: 'Tenisové kurty',
      description: 'Čtyři pečlivě udržované antukové kurty pro rekreační i klubové hráče. Kvalitní povrch zajišťuje optimální podmínky pro hru.',
      icon: Users,
      details: [
        '4 antukové kurty',
        'Pravidelná údržba',
        'Kvalitní síťky a vybavení',
        'Denní otevírací doba 7:00-22:00'
      ]
    },
    {
      id: 'hala',
      title: 'Tenisová hala',
      description: 'Dva vnitřní kurty se špičkovým osvětlením pro jistotu hry v každém počasí. Vyhřívaná hala s textilním povrchem.',
      icon: Building,
      details: [
        '2 kurty s textilním povrchem',
        'Vyhřívaná hala',
        'Špičkové osvětlení',
        'Komfort za každého počasí'
      ]
    },
    {
      id: 'vyuka',
      title: 'Výuka tenisu',
      description: 'Profesionální výuka pro děti i dospělé. Individuální i skupinové lekce přizpůsobené vašim potřebám.',
      icon: GraduationCap,
      details: [
        'Individuální lekce',
        'Skupinové kurzy',
        'Výuka pro děti i dospělé',
        'Zkušení trenéři'
      ]
    },
    {
      id: 'kramek',
      title: 'Tenisový krámek',
      description: 'Prodej tenisového vybavení, půjčovna raket a profesionální vyplétání. Kontakt na Markétu pro více informací.',
      icon: ShoppingBag,
      details: [
        'Prodej tenisového vybavení',
        'Půjčovna raket',
        'Profesionální vyplétání',
        'Kontakt: Markéta'
      ]
    },
    {
      id: 'zazemí',
      title: 'Zázemí klubu',
      description: 'Občerstvení a pohodlné sledování TV přenosů. Relaxujte před nebo po hře v příjemném prostředí.',
      icon: Coffee,
      details: [
        'Občerstvení',
        'TV přenosy',
        'Pohodlné posezení',
        'Příjemné prostředí'
      ]
    },
    {
      id: 'parkovani',
      title: 'Parkování zdarma',
      description: 'Bezplatné parkování přímo u areálu. Žádné starosti s hledáním místa nebo placením.',
      icon: Car,
      details: [
        'Bezplatné parkování',
        'Přímo u areálu',
        'Dostatek míst',
        'Bez časového omezení'
      ]
    }
  ];

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold">
              Naše služby
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Kompletní tenisové zázemí pro hráče všech úrovní v srdci Liberce
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => {
              const IconComponent = service.icon;
              
              return (
                <Card key={service.id} id={service.id} className="service-card">
                  <CardHeader className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-heading">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-2">
                      {service.details.map((detail, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};