import { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { WeeklyCalendar } from '@/components/reservation/WeeklyCalendar';
import { ReservationModal } from '@/components/reservation/ReservationModal';
import { useSession } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Settings, LogIn, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek } from 'date-fns';

interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  status: 'available' | 'unavailable';
  seasonal_price_rules: any;
}

export const ReservationPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<any[]>([]);
  const { session, loading } = useSession();

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .eq('status', 'available');
    
    if (data && !error) {
      setCourts(data);
    }
  };

  const handleSlotSelect = (slot: any) => {
    setSelectedSlots([slot]);
    setIsModalOpen(true);
  };

  return (
    <PublicLayout>
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-heading font-bold mb-4">Rezervace kurtů</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vyberte si čas a kurt pro vaši hru. Rezervace je rychlá a jednoduchá.
            </p>
          </div>

          {/* Auth-dependent content */}
          {!loading && !session && (
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
          )}

          {session && (
            <Card className="mb-8">
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-heading">
                  Vyberte termín rezervace
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Kliknutím na volný slot níže vytvoříte novou rezervaci.
                </p>
                {session?.user?.user_metadata?.app_role === 'staff' || 
                 session?.user?.user_metadata?.app_role === 'owner' ? (
                  <Button asChild size="lg" variant="outline">
                    <Link to="/sprava" className="flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Přejít do správy rezervací</span>
                    </Link>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Dostupné termíny</CardTitle>
            </CardHeader>
            <CardContent>
              {courts.length > 0 ? (
                <WeeklyCalendar
                  courts={courts}
                  currentWeek={currentWeek}
                  selectedSlots={selectedSlots}
                  onSlotSelect={handleSlotSelect}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Načítají se dostupné kurty...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact info for help */}
          <Card className="mt-8">
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
      </section>

      <ReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </PublicLayout>
  );
};