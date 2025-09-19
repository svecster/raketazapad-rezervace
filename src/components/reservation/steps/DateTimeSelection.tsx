import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar as CalendarIcon,
  Clock,
  CheckCircle
} from 'lucide-react';
import { format, startOfDay, addMinutes, isAfter, isBefore } from 'date-fns';
import { cs } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/currency';
import type { CourtInfo } from '../ReservationModal';

interface DateTimeSelectionProps {
  selectedCourt?: CourtInfo;
  date?: string;
  startTime?: string;
  duration?: number;
  onDateTimeSelect: (data: { date: string; startTime: string; duration: number }) => void;
}

interface TimeSlot {
  time: string;
  available: boolean;
  price: number;
}

const BUSINESS_HOURS = {
  start: 7, // 7:00
  end: 23   // 23:00
};

const DURATION_OPTIONS = [
  { value: 30, label: '30 minut' },
  { value: 60, label: '1 hodina' },
  { value: 90, label: '1,5 hodiny' },
  { value: 120, label: '2 hodiny' }
];

export const DateTimeSelection = ({ 
  selectedCourt, 
  date, 
  startTime, 
  duration = 90,
  onDateTimeSelect 
}: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date ? new Date(date) : undefined
  );
  const [selectedTime, setSelectedTime] = useState<string | undefined>(startTime);
  const [selectedDuration, setSelectedDuration] = useState<number>(duration);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    if (selectedDate && selectedCourt) {
      generateTimeSlots();
    }
  }, [selectedDate, selectedCourt, selectedDuration]);

  useEffect(() => {
    if (selectedDate && selectedTime && selectedDuration) {
      onDateTimeSelect({
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        duration: selectedDuration
      });
    }
  }, [selectedDate, selectedTime, selectedDuration]);

  const generateTimeSlots = () => {
    if (!selectedDate || !selectedCourt) return;

    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = format(selectedDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

    // Generate 30-minute slots from business hours
    for (let hour = BUSINESS_HOURS.start; hour < BUSINESS_HOURS.end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const slotTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hour, minute, 0, 0);
        
        // Check if slot is in the past (for today)
        const isPast = isToday && isBefore(slotDateTime, now);
        
        // Check if slot + duration would exceed business hours
        const endTime = addMinutes(slotDateTime, selectedDuration);
        const businessEndTime = new Date(selectedDate);
        businessEndTime.setHours(BUSINESS_HOURS.end, 0, 0, 0);
        const exceedsBusinessHours = isAfter(endTime, businessEndTime);
        
        // Mock availability (in real app, check against reservations)
        const isReserved = Math.random() < 0.3; // 30% chance of being reserved
        
        const available = !isPast && !exceedsBusinessHours && !isReserved;
        
        // Calculate price (peak hours 16-20, +20%)
        const isPeakHour = hour >= 16 && hour < 20;
        const basePrice = selectedCourt.basePrice * (selectedDuration / 60);
        const price = isPeakHour ? Math.round(basePrice * 1.2) : basePrice;

        slots.push({
          time: slotTime,
          available,
          price
        });
      }
    }

    setAvailableSlots(slots);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(undefined); // Reset time when date changes
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleDurationChange = (newDuration: string) => {
    const durationValue = parseInt(newDuration);
    setSelectedDuration(durationValue);
    setSelectedTime(undefined); // Reset time when duration changes
  };

  const getTimeSlotStatus = (slot: TimeSlot) => {
    if (!slot.available) {
      return <Badge variant="destructive" className="text-xs">Obsazeno</Badge>;
    }
    if (slot.time >= '16:00' && slot.time < '20:00') {
      return <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">Peak</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Vyberte datum a čas</h2>
        <p className="text-muted-foreground">
          {selectedCourt ? `Pro ${selectedCourt.name}` : 'Nejprve vyberte kurt'}
        </p>
      </div>

      {!selectedCourt && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Prosím nejprve vyberte kurt v předchozím kroku
            </p>
          </CardContent>
        </Card>
      )}

      {selectedCourt && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left column: Date picker */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5" />
                Vyberte datum
              </CardTitle>
              <CardDescription>
                Dostupné termíny pro následující období
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => 
                  date < startOfDay(new Date()) || // Past dates
                  date > addMinutes(new Date(), 30 * 24 * 60) // Max 30 days ahead
                }
                locale={cs}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Right column: Time selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  Doba rezervace
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedDuration.toString()} onValueChange={handleDurationChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value.toString()}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  Minimální doba rezervace: 30 minut
                </p>
              </CardContent>
            </Card>

            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Dostupné časy - {format(selectedDate, 'dd. MMMM yyyy', { locale: cs })}
                  </CardTitle>
                  <CardDescription>
                    Provozní doba: {BUSINESS_HOURS.start}:00 - {BUSINESS_HOURS.end}:00
                  </CardDescription>
                </CardHeader>
                <CardContent className="max-h-80 overflow-y-auto">
                  <div className="grid gap-2 grid-cols-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.time}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        size="sm"
                        disabled={!slot.available}
                        onClick={() => handleTimeSelect(slot.time)}
                        className={`p-3 h-auto flex flex-col items-start ${
                          selectedTime === slot.time 
                            ? 'bg-primary text-primary-foreground' 
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono text-sm">
                            {slot.time}
                          </span>
                          {selectedTime === slot.time && (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </div>
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-xs font-medium">
                            {formatCurrency(slot.price)}
                          </span>
                          {getTimeSlotStatus(slot)}
                        </div>
                      </Button>
                    ))}
                  </div>
                  
                  {availableSlots.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      Žádné dostupné časy pro vybraný den a dobu
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {selectedDate && selectedTime && selectedCourt && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <h3 className="font-semibold text-primary">Vybraný termín</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedCourt.name} • {format(selectedDate, 'dd. MMMM yyyy', { locale: cs })} • {selectedTime} ({selectedDuration} min)
                </p>
              </div>
              <CheckCircle className="ml-3 h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};