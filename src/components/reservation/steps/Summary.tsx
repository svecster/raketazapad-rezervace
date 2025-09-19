import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard,
  Banknote,
  QrCode,
  CheckCircle,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  Users,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/currency';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ReservationData } from '../ReservationModal';

interface SummaryProps {
  reservationData: ReservationData;
  onPaymentComplete: (reservationId: string) => void;
}

type PaymentMethod = 'cash' | 'card' | 'qr';

export const Summary = ({ reservationData, onPaymentComplete }: SummaryProps) => {
  const [selectedPayment, setSelectedPayment] = useState<'cash' | 'qr'>('cash');
  const [isCreating, setIsCreating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const { toast } = useToast();

  // Calculate total price
  const calculatePrice = () => {
    if (!reservationData.court || !reservationData.duration) return 0;
    
    const basePrice = reservationData.court.basePrice;
    const hours = reservationData.duration / 60;
    
    // Peak hours pricing (16:00-20:00)
    const startHour = reservationData.startTime ? parseInt(reservationData.startTime.split(':')[0]) : 0;
    const isPeakHour = startHour >= 16 && startHour < 20;
    const priceMultiplier = isPeakHour ? 1.2 : 1;
    
    return Math.round(basePrice * hours * priceMultiplier);
  };

  const totalPrice = calculatePrice();

  const handleCreateReservation = async () => {
    if (!reservationData.court || !reservationData.date || !reservationData.startTime || 
        !reservationData.duration || !reservationData.contact) {
      toast({
        title: "Chyba",
        description: "Neúplné údaje rezervace",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);

    try {
      // Create reservation
      const startDateTime = new Date(`${reservationData.date}T${reservationData.startTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + (reservationData.duration * 60000));
      
      // Generate guest token
      const { data: tokenData } = await supabase.rpc('generate_guest_token');
      const guestToken = tokenData;

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          court_id: reservationData.court.id,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          price: totalPrice,
          status: 'booked',
          user_id: null, // Guest reservation
          guest_token: guestToken,
          guest_contact: {
            name: reservationData.contact.name,
            email: reservationData.contact.email,
            phone: reservationData.contact.phone,
            playersCount: reservationData.contact.playersCount,
            notes: reservationData.contact.notes
          }
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Generate QR code if QR payment selected
      if (selectedPayment === 'qr') {
        await generateQRCode(reservation.id, totalPrice);
      }

      toast({
        title: "Rezervace vytvořena",
        description: `Rezervace byla úspěšně vytvořena. ID: ${reservation.id.slice(0, 8)}`,
      });

      onPaymentComplete(reservation.id);

    } catch (error: any) {
      toast({
        title: "Chyba při vytváření rezervace",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const generateQRCode = async (reservationId: string, amount: number) => {
    // Mock QR code generation - in real app, integrate with QR payment provider
    const qrPayload = {
      amount: amount,
      currency: 'CZK',
      reference: reservationId.slice(0, 8),
      description: `Rezervace ${reservationData.court?.name}`
    };
    
    // In real implementation, call QR payment service
    setQrCode(`data:text/plain,${JSON.stringify(qrPayload)}`);
  };

  const paymentMethods = [
    {
      id: 'cash' as PaymentMethod,
      name: 'Hotově u baru',
      description: 'Zaplatíte při příchodu na recepci',
      icon: Banknote,
      available: true
    },
    {
      id: 'card' as PaymentMethod,
      name: 'Platební karta',
      description: 'Online platba kartou (připravujeme)',
      icon: CreditCard,
      available: false
    },
    {
      id: 'qr' as PaymentMethod,
      name: 'QR Platba',
      description: 'Okamžitá platba mobilem',
      icon: QrCode,
      available: true
    }
  ];

  if (!reservationData.court || !reservationData.contact) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Neúplné údaje pro zobrazení souhrnu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Souhrn a platba</h2>
        <p className="text-muted-foreground">
          Zkontrolujte údaje a dokončete rezervaci
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: Reservation summary */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5" />
                Souhrn rezervace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Court info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{reservationData.court.name}</span>
                </div>
                <Badge variant={reservationData.court.type === 'indoor' ? 'default' : 'secondary'}>
                  {reservationData.court.type === 'indoor' ? 'Indoor' : 'Outdoor'}
                </Badge>
              </div>

              {/* Date and time */}
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>
                  {reservationData.date && format(new Date(reservationData.date), 'dd. MMMM yyyy', { locale: cs })} • {reservationData.startTime} ({reservationData.duration} min)
                </span>
              </div>

              <Separator />

              {/* Contact info */}
              <div className="space-y-2">
                <h4 className="font-medium">Kontaktní údaje</h4>
                
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{reservationData.contact.name}</span>
                </div>
                
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{reservationData.contact.email}</span>
                </div>
                
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{reservationData.contact.phone}</span>
                </div>

                {reservationData.contact.playersCount && (
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      {reservationData.contact.playersCount === '1' ? '1 hráč' :
                       reservationData.contact.playersCount === '2' ? '2 hráči' :
                       reservationData.contact.playersCount === '4' ? '4 hráči' : 'Více hráčů'}
                    </span>
                  </div>
                )}

                {reservationData.contact.notes && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                    <strong>Poznámka:</strong> {reservationData.contact.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Payment */}
        <div className="space-y-4">
          {/* Price summary */}
          <Card>
            <CardHeader>
              <CardTitle>Cena</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Základní cena ({reservationData.duration} min)</span>
                  <span>{formatCurrency(reservationData.court.basePrice * (reservationData.duration! / 60))}</span>
                </div>
                
                {reservationData.startTime && parseInt(reservationData.startTime.split(':')[0]) >= 16 && 
                 parseInt(reservationData.startTime.split(':')[0]) < 20 && (
                  <div className="flex justify-between text-sm">
                    <span>Peak hours (+20%)</span>
                    <span>+{formatCurrency(Math.round(reservationData.court.basePrice * (reservationData.duration! / 60) * 0.2))}</span>
                  </div>
                )}
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Celkem</span>
                  <span className="text-primary">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment methods */}
          <Card>
            <CardHeader>
              <CardTitle>Způsob platby</CardTitle>
              <CardDescription>
                Vyberte způsob platby za rezervaci
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentMethods.map((method) => {
                const IconComponent = method.icon;
                return (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                      selectedPayment === method.id
                        ? 'border-primary bg-primary/5'
                        : method.available
                        ? 'border-border hover:border-primary/50'
                        : 'border-muted opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => method.available && setSelectedPayment(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IconComponent className="mr-2 h-4 w-4" />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">{method.description}</div>
                        </div>
                      </div>
                      {selectedPayment === method.id && method.available && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* QR Code display */}
          {selectedPayment === 'qr' && qrCode && (
            <Card>
              <CardHeader>
                <CardTitle>QR Platba</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="bg-muted p-4 rounded-lg mb-2">
                  <QrCode className="h-24 w-24 mx-auto text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Naskenujte QR kód v bankovní aplikaci
                </p>
              </CardContent>
            </Card>
          )}

          {/* Create reservation button */}
          <Button
            onClick={handleCreateReservation}
            disabled={isCreating}
            className="w-full btn-tennis"
            size="lg"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Vytvářím rezervaci...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Dokončit rezervaci
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Potvrzením souhlasíte s podmínkami používání tenisového klubu
          </p>
        </div>
      </div>
    </div>
  );
};