import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { CourtCard } from '@/components/courts/CourtCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatTime, getWorkingHoursOptions, isWithinWorkingHours } from '@/lib/utils/datetime';
import { formatCurrency } from '@/lib/utils/currency';
import { CalendarIcon, Filter, Clock, MapPin } from 'lucide-react';
import { cs } from 'date-fns/locale';

interface Court {
  id: string;
  name: string;
  type: 'indoor' | 'outdoor';
  seasonal_price_rules: Record<string, number>;
  status: 'available' | 'unavailable';
}

interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  court_id: string;
  user_id: string;
  price: number;
  status: 'booked' | 'paid' | 'cancelled';
  created_at: string;
}

export const ReservationPage = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [duration, setDuration] = useState<number>(60); // minutes
  const [courtTypeFilter, setCourtTypeFilter] = useState<'all' | 'indoor' | 'outdoor'>('all');
  const [loading, setLoading] = useState(true);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchCourts();
    fetchReservations();
  }, [selectedDate]);

  const fetchCourts = async () => {
    try {
      const { data, error } = await supabase
        .from('courts')
        .select('*')
        .order('name');

      if (error) throw error;
      setCourts((data || []) as Court[]);
    } catch (error: any) {
      toast({
        title: 'Chyba při načítání kurtů',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchReservations = async () => {
    try {
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .neq('status', 'cancelled');

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      toast({
        title: 'Chyba při načítání rezervací',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const isTimeSlotAvailable = (court: Court, time: string, durationMinutes: number): boolean => {
    const startTime = new Date(selectedDate);
    const [hours, minutes] = time.split(':').map(Number);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    // Check if within working hours
    if (!isWithinWorkingHours(startTime) || !isWithinWorkingHours(endTime)) {
      return false;
    }

    // Check for overlapping reservations
    return !reservations.some(reservation => {
      if (reservation.court_id !== court.id) return false;
      
      const reservationStart = new Date(reservation.start_time);
      const reservationEnd = new Date(reservation.end_time);
      
      return (startTime < reservationEnd && endTime > reservationStart);
    });
  };

  const handleCourtReserve = (courtId: string) => {
    const court = courts.find(c => c.id === courtId);
    if (!court) return;

    setSelectedCourt(court);
    setShowReservationForm(true);
  };

  const handleCreateReservation = async () => {
    if (!selectedCourt || !selectedTime) return;

    try {
      const startTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + duration);

      if (!isTimeSlotAvailable(selectedCourt, selectedTime, duration)) {
        toast({
          title: 'Termín není dostupný',
          description: 'Vybraný čas je již rezervován nebo mimo provozní hodiny.',
          variant: 'destructive',
        });
        return;
      }

      // Calculate price based on season
      const season = selectedDate.getMonth() >= 2 && selectedDate.getMonth() <= 4 ? 'spring' :
                    selectedDate.getMonth() >= 5 && selectedDate.getMonth() <= 7 ? 'summer' :
                    selectedDate.getMonth() >= 8 && selectedDate.getMonth() <= 10 ? 'autumn' : 'winter';
      
      const hourlyRate = selectedCourt.seasonal_price_rules[season] || 0;
      const price = (hourlyRate * duration) / 60;

      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Uživatel není přihlášen');

      const { error } = await supabase
        .from('reservations')
        .insert({
          user_id: user.user.id,
          court_id: selectedCourt.id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          price,
          status: 'booked',
        });

      if (error) throw error;

      toast({
        title: 'Rezervace vytvořena',
        description: `Kurt ${selectedCourt.name} byl rezervován na ${formatDate(selectedDate)} od ${selectedTime}.`,
      });

      setShowReservationForm(false);
      setSelectedCourt(null);
      setSelectedTime('');
      fetchReservations();
    } catch (error: any) {
      toast({
        title: 'Chyba při vytváření rezervace',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredCourts = courts.filter(court => {
    if (courtTypeFilter === 'all') return true;
    return court.type === courtTypeFilter;
  });

  const workingHours = getWorkingHoursOptions();
  const availableTimeSlots = workingHours.filter(slot => {
    if (!selectedCourt) return true;
    return isTimeSlotAvailable(selectedCourt, slot.value, duration);
  });

  return (
    <Layout requireAuth>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rezervace kurtů</h1>
          <p className="text-muted-foreground">
            Rezervujte si tenisové kurty na váš preferovaný termín
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtry</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Datum rezervace</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(selectedDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                      locale={cs}
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Typ kurtu</Label>
                <Select value={courtTypeFilter} onValueChange={(value: any) => setCourtTypeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Všechny kurty</SelectItem>
                    <SelectItem value="indoor">Halové kurty</SelectItem>
                    <SelectItem value="outdoor">Venkovní kurty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Délka rezervace</Label>
                <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minut</SelectItem>
                    <SelectItem value="60">1 hodina</SelectItem>
                    <SelectItem value="90">1,5 hodiny</SelectItem>
                    <SelectItem value="120">2 hodiny</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onReserve={handleCourtReserve}
              showPrice
            />
          ))}
        </div>

        {/* Reservation Form */}
        {showReservationForm && selectedCourt && (
          <Card>
            <CardHeader>
              <CardTitle>Dokončit rezervaci</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Vybraný kurt</Label>
                  <div className="flex items-center space-x-2">
                    <Badge variant={selectedCourt.type === 'indoor' ? 'default' : 'secondary'}>
                      {selectedCourt.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedCourt.type === 'indoor' ? 'Halový' : 'Venkovní'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Datum a doba</Label>
                  <div className="text-sm">
                    {formatDate(selectedDate)} • {duration} minut
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Čas zahájení</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vyberte čas" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.map((slot) => (
                      <SelectItem key={slot.value} value={slot.value}>
                        {slot.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Celková cena:</div>
                  <div className="text-2xl font-bold text-primary currency">
                    {selectedCourt && formatCurrency((selectedCourt.seasonal_price_rules[
                      selectedDate.getMonth() >= 2 && selectedDate.getMonth() <= 4 ? 'spring' :
                      selectedDate.getMonth() >= 5 && selectedDate.getMonth() <= 7 ? 'summer' :
                      selectedDate.getMonth() >= 8 && selectedDate.getMonth() <= 10 ? 'autumn' : 'winter'
                    ] || 0) * duration / 60)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={() => setShowReservationForm(false)}>
                    Zrušit
                  </Button>
                  <Button 
                    onClick={handleCreateReservation}
                    disabled={!selectedTime}
                    className="btn-tennis"
                  >
                    Potvrdit rezervaci
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};