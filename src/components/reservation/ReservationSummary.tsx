import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Calendar, Clock, MapPin } from 'lucide-react';
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

interface ReservationSummaryProps {
  selectedSlots: SelectedSlot[];
  totalPrice: number;
  onRemoveSlot: (slotId: string) => void;
  onNextStep: () => void;
}

export const ReservationSummary = ({ 
  selectedSlots, 
  totalPrice, 
  onRemoveSlot, 
  onNextStep 
}: ReservationSummaryProps) => {
  if (selectedSlots.length === 0) {
    return (
      <Card className="bg-muted/30">
        <CardContent className="p-6 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Vyberte termíny kliknutím do kalendáře
          </p>
        </CardContent>
      </Card>
    );
  }

  // Group slots by date and court for better display
  const groupedSlots = selectedSlots.reduce((acc, slot) => {
    const dateKey = format(slot.date, 'yyyy-MM-dd');
    const courtKey = slot.courtId;
    const key = `${dateKey}-${courtKey}`;
    
    if (!acc[key]) {
      acc[key] = {
        date: slot.date,
        courtName: slot.courtName,
        slots: [],
        totalPrice: 0
      };
    }
    
    acc[key].slots.push(slot);
    acc[key].totalPrice += slot.price;
    
    return acc;
  }, {} as Record<string, { date: Date; courtName: string; slots: SelectedSlot[]; totalPrice: number }>);

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Vybrané termíny</span>
          <Badge variant="secondary">{selectedSlots.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedSlots).map(([key, group]) => (
          <div key={key} className="p-4 bg-muted/50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(group.date, 'EEEE, dd. MMMM yyyy', { locale: cs })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {group.courtName}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatCurrency(group.totalPrice)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {group.slots.length} × 30 min
                </div>
              </div>
            </div>
            
            {/* Time slots for this court/date */}
            <div className="flex flex-wrap gap-2">
              {group.slots
                .sort((a, b) => a.startTime.localeCompare(b.startTime))
                .map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center space-x-1 bg-background rounded-md px-2 py-1 text-sm"
                  >
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span>{slot.startTime} - {slot.endTime}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => onRemoveSlot(slot.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        ))}
        
        {/* Total and Next Button */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Celková cena:</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(totalPrice)}
              </div>
            </div>
            <Button onClick={onNextStep} size="lg" className="bg-primary hover:bg-primary/90">
              Další krok
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};