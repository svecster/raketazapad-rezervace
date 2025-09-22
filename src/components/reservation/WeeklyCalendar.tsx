import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils/currency';
import { getSeasonFromDate } from '@/lib/utils/datetime';
import { addDays, format, startOfDay, endOfDay } from 'date-fns';
import { cs } from 'date-fns/locale';

interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  seasonal_price_rules: Record<string, number>;
  status: 'available' | 'unavailable';
}

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

interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  court_id: string;
  status: string;
}

interface WeeklyCalendarProps {
  courts: Court[];
  currentWeek: Date;
  selectedSlots: SelectedSlot[];
  onSlotSelect: (slot: TimeSlot) => void;
}

export const WeeklyCalendar = ({ courts, currentWeek, selectedSlots, onSlotSelect }: WeeklyCalendarProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate time slots (7:00 - 23:00, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Generate week days
  const generateWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(currentWeek, i));
    }
    return days;
  };

  const timeSlots = generateTimeSlots();
  const weekDays = generateWeekDays();

  useEffect(() => {
    fetchReservations();
  }, [currentWeek]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const weekStart = startOfDay(currentWeek);
      const weekEnd = endOfDay(addDays(currentWeek, 6));

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSlotOccupied = (courtId: string, date: Date, startTime: string): boolean => {
    const slotStart = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    slotStart.setHours(hours, minutes, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return reservations.some(reservation => {
      if (reservation.court_id !== courtId) return false;
      
      const reservationStart = new Date(reservation.start_time);
      const reservationEnd = new Date(reservation.end_time);
      
      return (slotStart < reservationEnd && slotEnd > reservationStart);
    });
  };

  const isSlotSelected = (courtId: string, date: Date, startTime: string): boolean => {
    const slotId = `${courtId}-${date.toISOString()}-${startTime}`;
    return selectedSlots.some(slot => slot.id === slotId);
  };

  const getSlotPrice = (court: Court, date: Date): number => {
    const season = getSeasonFromDate(date);
    return (court.seasonal_price_rules[season] || 0) / 2; // 30-minute price
  };

  const handleSlotClick = (court: Court, date: Date, startTime: string) => {
    const endTime = (() => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endDate = new Date();
      endDate.setHours(hours, minutes + 30, 0, 0);
      return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
    })();

    const slot: TimeSlot = {
      courtId: court.id,
      courtName: court.name,
      date,
      startTime,
      endTime,
      price: getSlotPrice(court, date),
      isOccupied: isSlotOccupied(court.id, date, startTime)
    };

    if (!slot.isOccupied) {
      onSlotSelect(slot);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">Načítání kalendáře...</div>
      </Card>
    );
  }

  // Calculate total columns (1 for court names + days * time slots per day)
  const timeColumnsPerDay = 8; // Show 8 time slots per day for simplicity (each represents 2 hours)
  const totalColumns = 1 + (weekDays.length * timeColumnsPerDay);
  
  // Select representative time slots for headers (every 2 hours)
  const displayTimeSlots = timeSlots.filter((_, index) => index % 4 === 0); // Every 2 hours

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header with days and time slots */}
          <div className="bg-muted/30 border-b">
            <div className="grid" style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)` }}>
              <div className="p-3 font-medium text-sm border-r">Kurt / Čas</div>
              {weekDays.map((day, dayIndex) => (
                <div key={dayIndex} className="border-l">
                  <div className="p-2 text-center font-medium text-sm border-b">
                    <div>{format(day, 'EEEE', { locale: cs })}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(day, 'dd.MM', { locale: cs })}
                    </div>
                  </div>
                  {/* Time slots header */}
                  <div className="grid grid-cols-8 text-xs">
                    {displayTimeSlots.map((time, timeIndex) => (
                      <div key={timeIndex} className="p-1 text-center border-r last:border-r-0 bg-muted/20">
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Court rows */}
          {courts.map((court) => (
            <div key={court.id} className="border-b">
              <div className="grid" style={{ gridTemplateColumns: `120px repeat(${weekDays.length}, 1fr)` }}>
                {/* Court name */}
                <div className="p-3 text-sm font-medium bg-muted/10 border-r flex items-center">
                  <div>
                    <div className="font-medium">{court.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {court.type === 'indoor' ? 'Hala' : 'Venkovní'}
                    </div>
                  </div>
                </div>
                
                {/* Time slots for each day */}
                {weekDays.map((day, dayIndex) => (
                  <div key={dayIndex} className="border-l">
                    <div className="grid grid-cols-8">
                      {displayTimeSlots.map((time, timeIndex) => {
                        const isOccupied = isSlotOccupied(court.id, day, time);
                        const isSelected = isSlotSelected(court.id, day, time);
                        const price = getSlotPrice(court, day);
                        
                        return (
                          <Button
                            key={timeIndex}
                            variant="ghost"
                            size="sm"
                            className={`h-16 p-1 rounded-none border-r last:border-r-0 text-xs flex flex-col justify-center
                              ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                              ${isOccupied ? 'bg-destructive/10 text-destructive cursor-not-allowed' : 'hover:bg-muted/50'}
                            `}
                            onClick={() => handleSlotClick(court, day, time)}
                            disabled={isOccupied}
                          >
                            {isOccupied ? (
                              <div className="text-center">
                                <div className="font-medium text-destructive">Obsazeno</div>
                              </div>
                            ) : (
                              <div className="text-center">
                                <div className="font-medium text-xs">
                                  {formatCurrency(price)}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  30 min
                                </div>
                              </div>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="p-3 bg-muted/20 border-t text-xs text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span>Vybrané</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive/10 border border-destructive rounded"></div>
            <span>Obsazené</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-muted border rounded"></div>
            <span>Dostupné</span>
          </div>
        </div>
      </div>
    </Card>
  );
};