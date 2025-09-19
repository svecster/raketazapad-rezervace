import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';

interface CourtSlot {
  courtId: string;
  courtName: string;
  courtType: 'indoor' | 'outdoor';
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

interface StepData {
  courtType: string;
  date: string;
  startTime: string;
  duration: string;
  selectedSlot?: CourtSlot;
}

interface Props {
  data: StepData;
  onChange: (data: StepData) => void;
  onNext: () => void;
}

export const GuestWizardStep1 = ({ data, onChange, onNext }: Props) => {
  const [availableSlots, setAvailableSlots] = useState<CourtSlot[]>([]);

  // Mock court availability data
  const mockCourts = [
    { id: 'indoor-1', name: 'Indoor Kurt 1', type: 'indoor' as const },
    { id: 'indoor-2', name: 'Indoor Kurt 2', type: 'indoor' as const },
    { id: 'outdoor-1', name: 'Outdoor Kurt 1', type: 'outdoor' as const },
    { id: 'outdoor-2', name: 'Outdoor Kurt 2', type: 'outdoor' as const },
    { id: 'outdoor-3', name: 'Outdoor Kurt 3', type: 'outdoor' as const },
    { id: 'outdoor-4', name: 'Outdoor Kurt 4', type: 'outdoor' as const },
  ];

  const handleInputChange = (field: keyof StepData, value: string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
    
    // Generate available slots when court type, date, or time changes
    if (field === 'courtType' || field === 'date' || field === 'startTime') {
      generateAvailableSlots(newData);
    }
  };

  const generateAvailableSlots = (stepData: StepData) => {
    if (!stepData.courtType || !stepData.date || !stepData.startTime) return;

    const filteredCourts = mockCourts.filter(court => court.type === stepData.courtType);
    const slots: CourtSlot[] = [];

    filteredCourts.forEach(court => {
      // Calculate end time based on duration (default 1.5 hours)
      const startHour = parseInt(stepData.startTime.split(':')[0]);
      const startMinute = parseInt(stepData.startTime.split(':')[1]);
      const durationHours = parseFloat(stepData.duration || '1.5');
      const endHour = Math.floor(startHour + durationHours);
      const endMinute = startMinute + ((durationHours % 1) * 60);

      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

      // Mock pricing
      const basePrice = court.type === 'indoor' ? 800 : 600;
      const isPeakHour = startHour >= 16 && startHour <= 20;
      const price = isPeakHour ? Math.round(basePrice * 1.2) : basePrice;

      slots.push({
        courtId: court.id,
        courtName: court.name,
        courtType: court.type,
        date: stepData.date,
        startTime: stepData.startTime,
        endTime,
        price,
      });
    });

    setAvailableSlots(slots);
  };

  const selectSlot = (slot: CourtSlot) => {
    onChange({ ...data, selectedSlot: slot });
  };

  const canProceed = data.selectedSlot !== undefined;

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Krok 1: Vyberte kurt a čas
        </CardTitle>
        <CardDescription>
          Vyberte typ kurtu, datum a čas pro vaši rezervaci
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Court Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="courtType">Typ kurtu *</Label>
          <Select value={data.courtType} onValueChange={(value) => handleInputChange('courtType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Vyberte typ kurtu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indoor">Indoor - krytý kurt</SelectItem>
              <SelectItem value="outdoor">Outdoor - venkovní kurt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="date">Datum *</Label>
            <Input
              id="date"
              type="date"
              value={data.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startTime">Čas začátku *</Label>
            <Input
              id="startTime"
              type="time"
              value={data.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              min="07:00"
              max="22:00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Doba (hodiny)</Label>
            <Select 
              value={data.duration || '1.5'} 
              onValueChange={(value) => handleInputChange('duration', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">30 minut</SelectItem>
                <SelectItem value="1">1 hodina</SelectItem>
                <SelectItem value="1.5">1,5 hodiny</SelectItem>
                <SelectItem value="2">2 hodiny</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Available Slots */}
        {availableSlots.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Dostupné kurty
            </h3>
            
            <div className="grid gap-3">
              {availableSlots.map((slot) => (
                <div
                  key={slot.courtId}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    data.selectedSlot?.courtId === slot.courtId
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => selectSlot(slot)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{slot.courtName}</h4>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <Clock className="mr-1 h-4 w-4" />
                        {slot.startTime} - {slot.endTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(slot.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        za {data.duration || '1,5'} hodiny
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={onNext}
          className="w-full btn-tennis"
          disabled={!canProceed}
        >
          Pokračovat na kontaktní údaje
        </Button>
      </CardContent>
    </Card>
  );
};