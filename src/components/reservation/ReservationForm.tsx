import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, User, Mail, Phone, MessageSquare, Calendar, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface TimeSlot {
  courtId: string;
  courtName: string;
  date: Date;
  startTime: string;
  endTime: string;
  price: number;
  isOccupied: boolean;
}

interface SelectedSlot extends TimeSlot {
  id: string;
}

interface ContactData {
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

interface ReservationFormProps {
  contactData: ContactData;
  selectedSlots: SelectedSlot[];
  totalPrice: number;
  onContactDataChange: (data: ContactData) => void;
  onPreviousStep: () => void;
  onConfirmReservation: () => void;
}

export const ReservationForm = ({
  contactData,
  selectedSlots,
  totalPrice,
  onContactDataChange,
  onPreviousStep,
  onConfirmReservation
}: ReservationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof ContactData, value: string) => {
    onContactDataChange({
      ...contactData,
      [field]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactData.name || !contactData.email || !contactData.phone) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmReservation();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = contactData.name.trim() && 
                     contactData.email.trim() && 
                     contactData.phone.trim();

  // Group slots by date for display
  const groupedSlots = selectedSlots.reduce((acc, slot) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = {
        date: slot.date,
        slots: []
      };
    }
    acc[dateKey].slots.push(slot);
    return acc;
  }, {} as Record<string, { date: Date; slots: SelectedSlot[] }>);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={onPreviousStep}
        className="mb-4"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Zpět na výběr termínu
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Kontaktní údaje</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Jméno a příjmení *</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={contactData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Zadejte své jméno"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>E-mail *</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={contactData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="vase@email.cz"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Telefon *</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+420 123 456 789"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Poznámka</span>
                </Label>
                <Textarea
                  id="notes"
                  value={contactData.notes || ''}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Doplňující informace k rezervaci..."
                  rows={3}
                />
              </div>

              <Separator />

              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Chcete vytvořit účet pro snadnější správu rezervací?
                </p>
                <Button variant="outline" size="sm" type="button">
                  Přihlásit se / Vytvořit účet
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Reservation Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Souhrn rezervace</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(groupedSlots)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([dateKey, group]) => (
                <div key={dateKey} className="space-y-3">
                  <div className="font-medium">
                    {format(group.date, 'EEEE, dd. MMMM yyyy', { locale: cs })}
                  </div>
                  
                  {group.slots
                    .sort((a, b) => `${a.courtName}-${a.startTime}`.localeCompare(`${b.courtName}-${b.startTime}`))
                    .map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{slot.courtName}</Badge>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(slot.price)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            30 min
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}

            <Separator />

            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Celková cena:</span>
              <span className="text-primary">{formatCurrency(totalPrice)}</span>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Vytváří se rezervace...' : 'Potvrdit rezervaci'}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Po potvrzení rezervace obdržíte potvrzovací e-mail s detaily platby.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};