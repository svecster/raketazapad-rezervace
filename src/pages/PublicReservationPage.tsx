import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useSession } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Calendar, LogIn, ArrowRight, Clock, Users } from 'lucide-react';

export const PublicReservationPage = () => {
  const { session, loading } = useSession();

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-heading font-bold mb-4">Rezervace kurtů</h1>
              <p className="text-lg text-muted-foreground">
                Rezervujte si tenisové kurty rychle a jednoduše
              </p>
            </div>

            {/* Auth-dependent content */}
            {!loading && (
              !session ? (
                <Card className="mb-8">
                  <CardHeader className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <LogIn className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-heading">
                      Přihlaste se pro rezervaci
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground">
                      Pro vytvoření rezervace se musíte nejdříve přihlásit do svého účtu.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button asChild size="lg">
                        <Link to="/login" className="flex items-center space-x-2">
                          <span>Přihlásit se</span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link to="/register">Vytvořit účet</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="mb-8">
                  <CardHeader className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl font-heading">
                      Vítejte zpět!
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    <p className="text-muted-foreground">
                      Pokračujte do správy rezervací pro vytvoření nové rezervace.
                    </p>
                    <Button asChild size="lg">
                      <Link to="/sprava" className="flex items-center space-x-2">
                        <span>Přejít do správy rezervací</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            )}

            {/* Information Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="text-center">
                  <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Online rezervace</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Rezervujte kurty 24/7 přes náš online systém
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Flexibilní časy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Otevírací doba denně 7:00 - 22:00
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="text-center">
                  <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-lg">Pro všechny</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center">
                    Antukové kurty i vnitřní hala k dispozici
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Alternative contact info */}
            <Card>
              <CardHeader>
                <CardTitle>Potřebujete pomoc?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Můžete nás také kontaktovat přímo
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" asChild>
                    <a href="tel:+420602130331" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Zavolat: +420 602 130 331</span>
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:kdyrova.tenis@seznam.cz" className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Email: kdyrova.tenis@seznam.cz</span>
                    </a>
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