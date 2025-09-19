import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle, Clock, MapPin, User, CreditCard, QrCode, Banknote } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CourtSlot {
  courtId: string;
  courtName: string;
  courtType: 'indoor' | 'outdoor';
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  playersCount: string;
  notes: string;
}

interface Props {
  courtData: { selectedSlot?: CourtSlot };
  contactData: ContactData;
  onPrevious: () => void;
  onComplete: (reservationId: string) => void;
}

export const GuestWizardStep3 = ({ courtData, contactData, onPrevious, onComplete }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCreateReservation = async () => {
    if (!courtData.selectedSlot) return;

    setIsSubmitting(true);

    try {
      // Create guest reservation
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: null, // Guest reservation
          court_id: courtData.selectedSlot.courtId,
          start_time: `${courtData.selectedSlot.date} ${courtData.selectedSlot.startTime}`,
          end_time: `${courtData.selectedSlot.date} ${courtData.selectedSlot.endTime}`,
          price: courtData.selectedSlot.price,
          status: 'booked',
          guest_contact: {
            name: contactData.name,
            email: contactData.email,
            phone: contactData.phone,
            playersCount: contactData.playersCount,
            notes: contactData.notes,
          },
          guest_token: crypto.randomUUID(),
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setReservationId(reservation.id);
      toast({
        title: "Rezervace vytvořena",
        description: "Vaša rezervace byla úspešně vytvořena.",
      });

      // Show registration modal
      setShowRegistrationModal(true);

    } catch (error: any) {
      console.error('Error creating reservation:', error);
      toast({
        title: "Chyba při vytváření rezervace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountCreation = () => {
    // Redirect to registration with prefilled data
    const params = new URLSearchParams({
      name: contactData.name,
      email: contactData.email,
      phone: contactData.phone,
      reservationId: reservationId || '',
    });
    window.location.href = `/auth?signup=1&${params.toString()}`;
  };

  const handleContinueWithoutAccount = () => {
    if (reservationId) {
      onComplete(reservationId);
    }
  };

  if (!courtData.selectedSlot) {
    return <div>Chyba: Nebyl vybrán žádný kurt</div>;
  }

  const slot = courtData.selectedSlot;

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="mr-2 h-5 w-5" />
            Krok 3: Shrnutí a platba
          </CardTitle>
          <CardDescription>
            Zkontrolujte údaje a dokončete rezervaci
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Reservation Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <MapPin className="mr-2 h-5 w-5" />
              Shrnutí rezervace
            </h3>
            
            <div className="border rounded-lg p-4 bg-secondary/10">
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Kurt:</span>
                  <span className="font-medium">{slot.courtName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datum:</span>
                  <span className="font-medium">{new Date(slot.date).toLocaleDateString('cs-CZ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Čas:</span>
                  <span className="font-medium flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    {slot.startTime} - {slot.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Počet hráčů:</span>
                  <span className="font-medium">{contactData.playersCount} hráči</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-lg font-medium">Celková cena:</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatCurrency(slot.price)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <User className="mr-2 h-5 w-5" />
              Kontaktní údaje
            </h3>
            
            <div className="border rounded-lg p-4 bg-secondary/10">
              <div className="grid gap-2">
                <div><strong>Jméno:</strong> {contactData.name}</div>
                <div><strong>Email:</strong> {contactData.email}</div>
                <div><strong>Telefon:</strong> {contactData.phone}</div>
                {contactData.notes && (
                  <div><strong>Poznámka:</strong> {contactData.notes}</div>
                )}
              </div>
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Možnosti platby
            </h3>
            
            <div className="grid gap-3">
              <div className="border rounded-lg p-4 flex items-center">
                <Banknote className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Platba v hotovosti</p>
                  <p className="text-sm text-muted-foreground">Zaplaťte při příchodu na recepci</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 flex items-center">
                <QrCode className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">QR Platba</p>
                  <p className="text-sm text-muted-foreground">Okamžitá platba přes bankovní aplikaci</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline"
              onClick={onPrevious}
              className="flex-1"
            >
              Zpět
            </Button>
            <Button 
              onClick={handleCreateReservation}
              className="flex-1 btn-tennis"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Vytvářím rezervaci...' : 'Vytvořit rezervaci'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registration Modal */}
      <Dialog open={showRegistrationModal} onOpenChange={setShowRegistrationModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chcete si vytvořit účet hráče?</DialogTitle>
            <DialogDescription>
              S účtem budete mít přehled o všech svých rezervacích, můžete je snadno spravovat 
              a rezervovat nové kurty rychleji.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-3">
              <Button onClick={handleAccountCreation} className="btn-tennis">
                Vytvořit účet hráče
              </Button>
              <Button variant="outline" onClick={handleContinueWithoutAccount}>
                Ne, pokračovat bez účtu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};