import { PublicLayout } from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, Clock, User } from 'lucide-react';

export const ContactPage = () => {
  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center space-y-4 mb-16">
            <h1 className="text-4xl sm:text-5xl font-heading font-bold">
              Kontakt
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Spojte se s námi pro rezervace nebo jakékoli dotazy
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-primary" />
                    <span>Provozovatel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">Mgr. Markéta Kdýrová</h3>
                    <p className="text-muted-foreground">Vedoucí klubu</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>Telefon</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a 
                      href="tel:+420602130331"
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      +420 602 130 331
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Nejrychlejší způsob kontaktu pro rezervace
                    </p>
                    <Button size="sm" asChild>
                      <a href="tel:+420602130331">Zavolat nyní</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <span>E-mail</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a 
                      href="mailto:kdyrova.tenis@seznam.cz"
                      className="text-lg font-semibold text-primary hover:underline"
                    >
                      kdyrova.tenis@seznam.cz
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Pro všeobecné dotazy a informace
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="mailto:kdyrova.tenis@seznam.cz">Napsat e-mail</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Otevírací doba</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Pondělí - Neděle</span>
                      <span className="text-primary font-semibold">7:00 - 22:00</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Poslední rezervace končí ve 22:00
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Location and Map */}
            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Adresa areálu</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-lg font-semibold">Londýnská 630/2a</p>
                    <p className="text-lg font-semibold">Liberec</p>
                  </div>
                  <Button variant="outline" asChild>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        // TODO: Implement map navigation in Phase 2
                      }}
                    >
                      Zobrazit na mapě
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Map Placeholder */}
              <Card>
                <CardContent className="p-0">
                  <div className="aspect-video rounded-lg overflow-hidden bg-section-bg border">
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center space-y-4 p-8">
                        <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">Mapa areálu</p>
                          <p className="text-sm text-muted-foreground">
                            Interaktivní mapa bude zde
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-primary text-primary-foreground">
                <CardHeader>
                  <CardTitle>Chcete si zahrát?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>Rezervujte si kurt online nebo nás kontaktujte telefonicky.</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      variant="secondary"
                      className="bg-white text-primary hover:bg-white/90"
                      asChild
                    >
                      <a href="/rezervace">Online rezervace</a>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-white text-white hover:bg-white/10"
                      asChild
                    >
                      <a href="tel:+420602130331">Zavolat</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};