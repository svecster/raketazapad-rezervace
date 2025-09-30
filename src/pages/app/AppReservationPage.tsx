import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Court, Reservation, PriceRule } from '@/types';
import { calculateReservationPrice, formatPrice, getTimeSlots, isTimeSlotAvailable } from '@/lib/pricing';
import { format, addDays, startOfDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import { CalendarIcon, Clock, MapPin } from 'lucide-react';

export const AppReservationPage = () => {
  const { session, appRole } = useSession();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCourt, setSelectedCourt] = useState<string>('');
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [priceRules, setPriceRules] = useState<PriceRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courts
      const { data: courtsData } = await supabase
        .from('courts')
        .select('*')
        .eq('status', 'available');
      
      // Fetch existing reservations for the selected date
      const startOfDayDate = startOfDay(selectedDate);
      const endOfDayDate = addDays(startOfDayDate, 1);
      
      const { data: reservationsData } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_time', startOfDayDate.toISOString())
        .lt('start_time', endOfDayDate.toISOString())
        .neq('status', 'cancelled');
      
      // Fetch price rules
      const { data: priceRulesData } = await supabase
        .from('price_rules')
        .select('*');
      
      setCourts((courtsData || []) as Court[]);
      setReservations((reservationsData || []) as Reservation[]);
      setPriceRules((priceRulesData || []) as PriceRule[]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Chyba při načítání dat');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotToggle = (timeSlot: string) => {
    if (!selectedCourt) {
      toast.error('Nejdříve vyberte kurt');
      return;
    }
    
    const court = courts.find(c => c.id === selectedCourt);
    if (!court) return;
    
    if (!isTimeSlotAvailable(selectedCourt, selectedDate, timeSlot, reservations)) {
      toast.error('Tento čas je již obsazen');
      return;
    }
    
    setSelectedTimeSlots(prev => 
      prev.includes(timeSlot) 
        ? prev.filter(slot => slot !== timeSlot)
        : [...prev, timeSlot].sort()
    );
  };

  const calculateTotalPrice = () => {
    if (!selectedCourt || selectedTimeSlots.length === 0) return 0;
    
    const court = courts.find(c => c.id === selectedCourt);
    if (!court) return 0;
    
    const isMember = appRole === 'player';
    const totalDuration = selectedTimeSlots.length * 0.5; // 30-minute slots
    
    const [hours, minutes] = selectedTimeSlots[0].split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime.getTime() + totalDuration * 60 * 60 * 1000);
    
    return calculateReservationPrice(court, startTime, endTime, priceRules, isMember);
  };

  const handleBooking = async () => {
    if (!selectedCourt || selectedTimeSlots.length === 0) {
      toast.error('Vyberte kurt a časové sloty');
      return;
    }
    
    const court = courts.find(c => c.id === selectedCourt);
    if (!court) return;
    
    try {
      const [hours, minutes] = selectedTimeSlots[0].split(':').map(Number);
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const totalDuration = selectedTimeSlots.length * 0.5;
      const endTime = new Date(startTime.getTime() + totalDuration * 60 * 60 * 1000);
      const totalPrice = calculateTotalPrice();
      
      const { error } = await supabase
        .from('reservations')
        .insert({
          court_id: selectedCourt,
          user_id: session?.user?.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          price: totalPrice,
          status: 'booked'
        });
      
      if (error) throw error;
      
      toast.success('Rezervace byla úspěšně vytvořena!');
      setSelectedTimeSlots([]);
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Chyba při vytváření rezervace');
    }
  };

  const timeSlots = getTimeSlots(8, 22);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Rezervace kurtu</h1>
          <p className="text-muted-foreground">
            Vyberte datum, kurt a čas pro vaši rezervaci
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Vyberte datum
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => date < new Date()}
                locale={cs}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Court Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Vyberte kurt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courts.map((court) => (
                <div
                  key={court.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCourt === court.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    setSelectedCourt(court.id);
                    setSelectedTimeSlots([]);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{court.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {court.type === 'indoor' ? 'Vnitřní' : 'Venkovní'} kurt
                      </p>
                    </div>
                    <Badge variant={court.type === 'indoor' ? 'default' : 'secondary'}>
                      {court.type === 'indoor' ? 'Hala' : 'Venku'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Time Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Vyberte čas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCourt ? (
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((timeSlot) => {
                    const isAvailable = isTimeSlotAvailable(selectedCourt, selectedDate, timeSlot, reservations);
                    const isSelected = selectedTimeSlots.includes(timeSlot);
                    
                    return (
                      <Button
                        key={timeSlot}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={!isAvailable}
                        onClick={() => handleTimeSlotToggle(timeSlot)}
                        className={`text-xs ${!isAvailable ? 'opacity-50' : ''}`}
                      >
                        {timeSlot}
                      </Button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nejdříve vyberte kurt
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        {selectedTimeSlots.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Souhrn rezervace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Datum:</span>
                  <span>{format(selectedDate, 'dd. MMMM yyyy', { locale: cs })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kurt:</span>
                  <span>{courts.find(c => c.id === selectedCourt)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Čas:</span>
                  <span>
                    {selectedTimeSlots[0]} - {
                      (() => {
                        const lastSlot = selectedTimeSlots[selectedTimeSlots.length - 1];
                        const [hours, minutes] = lastSlot.split(':').map(Number);
                        const endTime = new Date();
                        endTime.setHours(hours, minutes + 30, 0, 0);
                        return format(endTime, 'HH:mm');
                      })()
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Doba:</span>
                  <span>{selectedTimeSlots.length * 30} minut</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span>Cena celkem:</span>
                  <span>{formatPrice(calculateTotalPrice())}</span>
                </div>
                <Button onClick={handleBooking} className="w-full" size="lg">
                  Potvrdit rezervaci
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};