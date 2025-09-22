import { useState, useEffect } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DateNavigator } from '@/components/reservation/DateNavigator';
import { ReservationGrid } from '@/components/reservation/ReservationGrid';
import { BookingSummary } from '@/components/reservation/BookingSummary';
import { BookingForm } from '@/components/reservation/BookingForm';
import { useSession } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Calendar, Settings, LogIn, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Court, Block, Slot } from '@/types/reservation';
import { toggleSlot } from '@/lib/utils/slots';
import { toast } from 'sonner';

export const ReservationPage = () => {
  const [step, setStep] = useState(0); // 0: selection, 1: booking form
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [courts, setCourts] = useState<Court[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<Block[]>([]);
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
      // Transform data to match our Court interface
      const transformedCourts: Court[] = data.map(court => ({
        ...court,
        seasonal_price_rules: court.seasonal_price_rules as Record<string, any>
      }));
      setCourts(transformedCourts);
    }
  };

  const handleSlotClick = (slot: Slot) => {
    // Find court name for the slot
    const court = courts.find(c => c.id === slot.courtId);
    const courtName = court?.name || `Kurt ${slot.courtId}`;
    
    const newBlocks = toggleSlot(selectedBlocks, slot, courtName);
    setSelectedBlocks(newBlocks);
  };

  const handleRemoveBlock = (blockIndex: number) => {
    const newBlocks = [...selectedBlocks];
    newBlocks.splice(blockIndex, 1);
    setSelectedBlocks(newBlocks);
  };

  const handleNextStep = () => {
    if (selectedBlocks.length > 0) {
      setStep(1);
    }
  };

  const handleBack = () => {
    setStep(0);
  };

  const handleBookingSuccess = () => {
    setSelectedBlocks([]);
    setStep(0);
    toast.success('Rezervace byla úspěšně vytvořena!');
  };

  // Step 1: Booking form
  if (step === 1) {
    return (
      <PublicLayout>
        <BookingForm
          selectedBlocks={selectedBlocks}
          onBack={handleBack}
          onSuccess={handleBookingSuccess}
        />
      </PublicLayout>
    );
  }

  // Step 0: Slot selection
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="bg-card border-b">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="py-6">
              <h1 className="text-3xl font-bold mb-2">Rezervace kurtů</h1>
              <p className="text-muted-foreground">
                Vyberte si termín a kurt pro vaši hru. Kliknutím na volné sloty vytvoříte rezervaci.
              </p>
            </div>
          </div>
        </div>

        {/* Auth check */}
        {!loading && !session && (
          <div className="container max-w-7xl mx-auto px-4 py-6">
            <Card>
              <CardHeader className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <LogIn className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">
                  Přihlaste se pro rezervaci
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <p className="text-muted-foreground">
                  Pro vytvoření rezervace můžete pokračovat jako host nebo se přihlásit do svého účtu.
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
                <p className="text-xs text-muted-foreground">
                  Nebo pokračujte níže jako host
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Staff link */}
        {session?.user?.user_metadata?.app_role === 'staff' || 
         session?.user?.user_metadata?.app_role === 'owner' ? (
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <Button asChild variant="outline">
              <Link to="/sprava" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Přejít do správy rezervací</span>
              </Link>
            </Button>
          </div>
        ) : null}

        {/* Date Navigator */}
        <DateNavigator
          selectedDate={startDate}
          onDateChange={setStartDate}
        />

        {/* Main content */}
        <div className="container max-w-7xl mx-auto px-4">
          {courts.length > 0 ? (
            <ReservationGrid
              courts={courts}
              startDate={startDate}
              selectedBlocks={selectedBlocks}
              onSlotClick={handleSlotClick}
            />
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              Načítají se dostupné kurty...
            </div>
          )}
        </div>

        {/* Booking Summary */}
        <BookingSummary
          selectedBlocks={selectedBlocks}
          onRemoveBlock={handleRemoveBlock}
          onNextStep={handleNextStep}
        />

        {/* Contact info */}
        <div className="container max-w-7xl mx-auto px-4 py-8">
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
    </PublicLayout>
  );
};