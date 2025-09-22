import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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

  // Generate time slots (8:00 - 17:00, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour <= 16; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  // Generate week days (Monday-Sunday)
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
      <div className="text-center py-8 text-muted-foreground">Načítání kalendáře...</div>
    );
  }

  return (
    <div className="bg-white border border-gray-200">
      {/* Time slots header */}
      <div className="grid border-b" style={{ gridTemplateColumns: `140px repeat(${timeSlots.length}, 1fr)` }}>
        <div className="p-2 text-sm font-medium text-gray-600 border-r"></div>
        {timeSlots.map((time, index) => (
          <div key={index} className="p-2 text-xs text-center font-medium text-gray-600 border-r last:border-r-0">
            {time}
          </div>
        ))}
      </div>

      {/* Court rows */}
      {courts.map((court) => (
        <div key={court.id} className="border-b last:border-b-0">
          <div className="grid" style={{ gridTemplateColumns: `140px repeat(${timeSlots.length}, 1fr)` }}>
            {/* Court name */}
            <div className="p-3 text-sm font-medium bg-gray-50 border-r">
              <div>{court.name}</div>
              <div className="text-xs text-gray-500 mt-1">2024/2025</div>
            </div>
            
            {/* Time slots */}
            {timeSlots.map((time, timeIndex) => {
              const isOccupied = isSlotOccupied(court.id, weekDays[0], time); // Using first day for demo
              const isSelected = isSlotSelected(court.id, weekDays[0], time);
              const price = getSlotPrice(court, weekDays[0]);
              
              return (
                <button
                  key={timeIndex}
                  className={`p-2 text-xs border-r last:border-r-0 min-h-[60px] flex items-center justify-center transition-colors
                    ${isSelected ? 'bg-blue-500 text-white' : ''}
                    ${isOccupied ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'}
                    ${!isSelected && !isOccupied ? 'text-gray-800' : ''}
                  `}
                  onClick={() => !isOccupied && handleSlotClick(court, weekDays[0], time)}
                  disabled={isOccupied}
                >
                  {isOccupied ? (
                    <span className="text-gray-500">Obsazeno</span>
                  ) : (
                    <span className="font-medium">{price} Kč</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};