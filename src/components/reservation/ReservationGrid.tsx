import { useState, useEffect } from 'react';
import { format, addDays, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/auth/AuthProvider';
import { Court, Slot, Block, Reservation } from '@/types/reservation';
import { generateTimeSlots } from '@/lib/utils/slots';
import { calculateSlotPrice, formatSlotPrice } from '@/lib/utils/pricing';
import { cn } from '@/lib/utils';

interface ReservationGridProps {
  courts: Court[];
  startDate: Date;
  selectedBlocks: Block[];
  onSlotClick: (slot: Slot) => void;
}

export const ReservationGrid = ({ courts, startDate, selectedBlocks, onSlotClick }: ReservationGridProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { session } = useSession();
  
  const timeSlots = generateTimeSlots(7, 22); // 7:00 to 22:00
  const days = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  
  useEffect(() => {
    fetchReservations();
  }, [startDate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const endDate = addDays(startDate, 7);
      
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lt('start_time', endDate.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const isSlotBusy = (courtId: string, date: Date, time: string): boolean => {
    const slotStart = new Date(date);
    const [hours, minutes] = time.split(':').map(Number);
    slotStart.setHours(hours, minutes, 0, 0);
    
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 30);

    return reservations.some(reservation => {
      if (reservation.court_id !== courtId) return false;
      
      const reservationStart = new Date(reservation.start_time);
      const reservationEnd = new Date(reservation.end_time);
      
      return slotStart < reservationEnd && slotEnd > reservationStart;
    });
  };

  const isSlotSelected = (courtId: string, date: Date, time: string): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return selectedBlocks.some(block => 
      block.courtId === courtId && 
      block.date === dateStr &&
      block.slots.some(slot => {
        const slotTime = format(parseISO(slot.startsAt), 'HH:mm');
        return slotTime === time;
      })
    );
  };

  const getSelectedBlock = (courtId: string, date: Date, time: string): Block | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    
    return selectedBlocks.find(block => 
      block.courtId === courtId && 
      block.date === dateStr &&
      block.slots.some(slot => {
        const slotTime = format(parseISO(slot.startsAt), 'HH:mm');
        return slotTime === time;
      })
    );
  };

  const createSlot = (court: Court, date: Date, time: string): Slot => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const [hours, minutes] = time.split(':').map(Number);
    
    const startsAt = new Date(date);
    startsAt.setHours(hours, minutes, 0, 0);
    
    const endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + 30);
    
    const isMember = session?.user?.app_role === 'member';
    const price = calculateSlotPrice(court, date, time, isMember) || 0;
    
    return {
      courtId: court.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      price,
      isBusy: isSlotBusy(court.id, date, time),
      date: dateStr
    };
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Načítání kalendáře...
      </div>
    );
  }

  // Sort courts: indoor first, then outdoor, then alphabetically
  const sortedCourts = [...courts].sort((a, b) => {
    if (a.type === 'indoor' && b.type === 'outdoor') return -1;
    if (a.type === 'outdoor' && b.type === 'indoor') return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="flex flex-col h-full">
      {days.map((day, dayIndex) => {
        const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        
        return (
          <div key={dayIndex} className="mb-8">
            {/* Day header */}
            <div className={cn(
              "sticky top-0 z-10 bg-tn-bg border-b border-tn-border p-4 mb-4",
              isToday && "bg-tn-accent/5 border-tn-accent/20"
            )}>
              <h3 className={cn(
                "text-lg font-semibold text-tn-text",
                isToday && "text-tn-primary"
              )}>
                {format(day, 'EEEE d. MMMM yyyy', { locale: cs })}
                {isToday && <span className="ml-2 text-sm bg-tn-primary text-white px-2 py-1 rounded-lg">Dnes</span>}
              </h3>
            </div>

            {/* Time slots grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[1200px]">
                {/* Time header */}
                <div className="grid grid-cols-[160px_repeat(30,1fr)] border-b border-tn-border bg-tn-subtle">
                  <div className="p-3 text-sm font-semibold border-r border-tn-border text-tn-text">Kurt</div>
                  {timeSlots.map((time, index) => (
                    <div key={index} className="p-2 text-xs text-center font-medium border-r border-tn-border text-tn-text last:border-r-0">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Court rows */}
                {sortedCourts.filter(court => court.status === 'available').map((court) => (
                  <div key={court.id} className="border-b border-tn-border last:border-b-0">
                    <div className="grid grid-cols-[160px_repeat(30,1fr)]">
                      {/* Court name */}
                      <div className="p-3 bg-tn-subtle border-r border-tn-border">
                        <div className="font-semibold text-sm text-tn-text">{court.name}</div>
                        <div className="text-xs text-tn-muted mt-1">
                          {court.type === 'indoor' ? 'Vnitřní' : 'Venkovní'}
                        </div>
                      </div>
                      
                      {/* Time slots */}
                      {timeSlots.map((time, timeIndex) => {
                        const slot = createSlot(court, day, time);
                        const isSelected = isSlotSelected(court.id, day, time);
                        const selectedBlock = getSelectedBlock(court.id, day, time);
                        const isBlockStart = selectedBlock && selectedBlock.start === time;
                        const isBlockMiddle = selectedBlock && !isBlockStart && selectedBlock.end !== time;
                        const isBlockEnd = selectedBlock && selectedBlock.end === time;
                        
                        return (
                          <button
                            key={timeIndex}
                            className={cn(
                              "slot-cell relative min-h-[60px] flex flex-col items-center justify-center transition-all duration-150",
                              slot.isBusy && "bg-[#F1F5F9] text-[#64748B] cursor-not-allowed border-tn-border",
                              !slot.isBusy && !isSelected && "bg-white text-tn-text hover:bg-tn-subtle hover:ring-2 hover:ring-tn-accent/30 cursor-pointer border-tn-border",
                              isSelected && "bg-tn-primary text-white font-semibold border-tn-primary",
                              isBlockStart && "rounded-l-lg",
                              isBlockEnd && "rounded-r-lg",
                              isBlockMiddle && "border-l-0 border-r-0"
                            )}
                            onClick={() => !slot.isBusy && onSlotClick(slot)}
                            disabled={slot.isBusy}
                            data-busy={slot.isBusy ? "true" : "false"}
                            data-selected={isSelected ? "true" : "false"}
                          >
                            {slot.isBusy ? (
                              <span className="text-center text-xs font-medium">Obsazeno</span>
                            ) : isSelected && selectedBlock ? (
                              <div className="text-center">
                                {isBlockStart && (
                                  <>
                                    <div className="font-semibold text-xs">{selectedBlock.start}–{selectedBlock.end}</div>
                                    <div className="text-xs mt-1">{Math.round(selectedBlock.totalPrice)} Kč</div>
                                  </>
                                )}
                              </div>
                            ) : (
                              <span className="font-semibold text-xs">{formatSlotPrice(slot.price)}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};