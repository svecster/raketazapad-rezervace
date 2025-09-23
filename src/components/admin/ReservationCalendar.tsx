import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Users,
  MapPin,
  Phone,
  Mail,
  CreditCard
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/datetime';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Reservation {
  id: string;
  court_name: string;
  start_time: Date;
  end_time: Date;
  price: number;
  status: 'booked' | 'paid' | 'cancelled' | 'completed';
  player_name?: string;
  player_email?: string;
  player_phone?: string;
  guest_contact?: any;
  payment_method?: string;
  is_guest: boolean;
}

interface ReservationCalendarProps {
  onReservationSelect?: (reservation: Reservation) => void;
}

export const ReservationCalendar = ({ onReservationSelect }: ReservationCalendarProps) => {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courtFilter, setCourtFilter] = useState<string>('all');
  const { toast } = useToast();

  // Mock data - replace with real Supabase queries
  const mockReservations: Reservation[] = [
    {
      id: '1',
      court_name: 'Kurt 1 (Indoor)',
      start_time: new Date(2024, 0, 15, 10, 0),
      end_time: new Date(2024, 0, 15, 11, 30),
      price: 750,
      status: 'booked',
      player_name: 'Jan Novák',
      player_email: 'jan.novak@email.cz',
      player_phone: '+420 123 456 789',
      payment_method: 'cash',
      is_guest: false
    },
    {
      id: '2',
      court_name: 'Kurt 2 (Outdoor)',
      start_time: new Date(2024, 0, 15, 14, 0),
      end_time: new Date(2024, 0, 15, 15, 30),
      price: 600,
      status: 'paid',
      guest_contact: {
        name: 'Marie Svobodová',
        email: 'marie@email.cz',
        phone: '+420 987 654 321'
      },
      payment_method: 'qr',
      is_guest: true
    }
  ];

  useEffect(() => {
    loadReservations();
  }, [selectedDate, viewType]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      console.log('Loading reservations from database...');
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          courts(name)
        `)
        .order('start_time', { ascending: true });
      
      console.log('Reservations loaded:', { data, error });
      
      if (error) {
        console.error('Error loading reservations:', error);
        toast({
          title: 'Chyba',
          description: `Nepodařilo se načíst rezervace: ${error.message}`,
          variant: 'destructive'
        });
        // Fallback to mock data for development
        setReservations(mockReservations);
        return;
      }
      
      // Convert data to expected format
      const formattedReservations = data?.map(r => ({
        id: r.id,
        court_name: r.courts?.name || `Kurt ${r.court_id}`,
        start_time: new Date(r.start_time),
        end_time: new Date(r.end_time),
        price: r.price || 0,
        status: r.status || 'booked',
        player_name: (r.guest_contact as any)?.name || 'Uživatel',
        player_email: (r.guest_contact as any)?.email || '',
        player_phone: (r.guest_contact as any)?.phone || '',
        guest_contact: r.guest_contact,
        payment_method: r.payment_method || 'cash',
        is_guest: !!r.guest_contact
      })) || [];
      
      setReservations(formattedReservations);
      console.log(`Loaded ${formattedReservations.length} reservations`);
      
    } catch (error) {
      console.error('Unexpected error loading reservations:', error);
      toast({
        title: 'Chyba',
        description: 'Neočekávaná chyba při načítání rezervací.',
        variant: 'destructive'
      });
      // Fallback to mock data
      setReservations(mockReservations);
    } finally {
      setLoading(false);
    }
  };

  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => 
      isSameDay(reservation.start_time, date)
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return <Badge variant="secondary">Rezervováno</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Zaplaceno</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Zrušeno</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Dokončeno</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = !searchTerm || 
      (reservation.player_name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (reservation.guest_contact?.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      reservation.court_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesCourt = courtFilter === 'all' || reservation.court_name.includes(courtFilter);
    
    return matchesSearch && matchesStatus && matchesCourt;
  });

  const renderDayView = () => {
    const dayReservations = getReservationsForDate(selectedDate);
    const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7:00 to 22:00

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: cs })}</span>
            <Button size="sm" className="btn-tennis">
              <Plus className="mr-2 h-4 w-4" />
              Nová rezervace
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {hours.map(hour => (
            <div key={hour} className="flex items-center border-b pb-2">
              <div className="w-16 text-sm text-muted-foreground">
                {hour.toString().padStart(2, '0')}:00
              </div>
              <div className="flex-1 grid grid-cols-6 gap-1">
                {Array.from({ length: 6 }, (_, courtIndex) => {
                  const reservation = dayReservations.find(r => 
                    r.start_time.getHours() === hour && 
                    r.court_name.includes((courtIndex + 1).toString())
                  );
                  
                  return (
                    <div
                      key={courtIndex}
                      className={`h-8 border rounded text-xs flex items-center justify-center cursor-pointer ${
                        reservation 
                          ? 'bg-primary/20 border-primary text-primary' 
                          : 'border-dashed border-muted-foreground/30 hover:border-primary/50'
                      }`}
                      onClick={() => reservation && onReservationSelect?.(reservation)}
                    >
                      {reservation && (
                        <span className="truncate px-1">
                          {reservation.player_name || reservation.guest_contact?.name || 'Host'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              {format(weekStart, 'd. M.', { locale: cs })} - {format(weekEnd, 'd. M. yyyy', { locale: cs })}
            </span>
            <Button size="sm" className="btn-tennis">
              <Plus className="mr-2 h-4 w-4" />
              Nová rezervace
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => (
              <div key={day.toISOString()} className="border rounded p-2 min-h-[200px]">
                <div className="font-semibold text-sm mb-2">
                  {format(day, 'EEE d.', { locale: cs })}
                </div>
                <div className="space-y-1">
                  {getReservationsForDate(day).map(reservation => (
                    <div
                      key={reservation.id}
                      className="text-xs p-1 rounded bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20"
                      onClick={() => onReservationSelect?.(reservation)}
                    >
                      <div className="font-medium truncate">
                        {format(reservation.start_time, 'HH:mm')}
                      </div>
                      <div className="truncate">
                        {reservation.player_name || reservation.guest_contact?.name || 'Host'}
                      </div>
                      <div className="truncate text-muted-foreground">
                        {reservation.court_name.replace(/\s*\(.*\)/, '')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderMonthView = () => {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kalendář</CardTitle>
            <CardDescription>
              Klikněte na datum pro zobrazení rezervací
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              locale={cs}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>
              Rezervace - {format(selectedDate, 'd. MMMM yyyy', { locale: cs })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-y-auto">
            {getReservationsForDate(selectedDate).map(reservation => (
              <div
                key={reservation.id}
                className="p-3 border rounded cursor-pointer hover:bg-muted/50"
                onClick={() => onReservationSelect?.(reservation)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {format(reservation.start_time, 'HH:mm')} - {format(reservation.end_time, 'HH:mm')}
                    </span>
                  </div>
                  {getStatusBadge(reservation.status)}
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-3 w-3" />
                    {reservation.court_name}
                  </div>
                  <div className="flex items-center mt-1">
                    <Users className="mr-2 h-3 w-3" />
                    {reservation.player_name || reservation.guest_contact?.name || 'Host'}
                  </div>
                </div>
              </div>
            ))}
            {getReservationsForDate(selectedDate).length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Žádné rezervace pro vybraný den
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewType === 'day' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('day')}
          >
            Den
          </Button>
          <Button
            variant={viewType === 'week' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('week')}
          >
            Týden
          </Button>
          <Button
            variant={viewType === 'month' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('month')}
          >
            Měsíc
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(new Date())}
          >
            Dnes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          >
            ←
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          >
            →
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Hledat</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Jméno, kurt..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <Label>Stav</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny stavy</SelectItem>
                  <SelectItem value="booked">Rezervováno</SelectItem>
                  <SelectItem value="paid">Zaplaceno</SelectItem>
                  <SelectItem value="cancelled">Zrušeno</SelectItem>
                  <SelectItem value="completed">Dokončeno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kurt</Label>
              <Select value={courtFilter} onValueChange={setCourtFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Všechny kurty</SelectItem>
                  <SelectItem value="1">Kurt 1</SelectItem>
                  <SelectItem value="2">Kurt 2</SelectItem>
                  <SelectItem value="3">Kurt 3</SelectItem>
                  <SelectItem value="4">Kurt 4</SelectItem>
                  <SelectItem value="5">Kurt 5</SelectItem>
                  <SelectItem value="6">Kurt 6</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Exportovat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      <div className="min-h-[600px]">
        {viewType === 'day' && renderDayView()}
        {viewType === 'week' && renderWeekView()}
        {viewType === 'month' && renderMonthView()}
      </div>

      {/* Reservations List (for filtered results) */}
      {(searchTerm || statusFilter !== 'all' || courtFilter !== 'all') && (
        <Card>
          <CardHeader>
            <CardTitle>Výsledky vyhledávání ({filteredReservations.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-60 overflow-y-auto">
            {filteredReservations.map(reservation => (
              <div
                key={reservation.id}
                className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-muted/50"
                onClick={() => onReservationSelect?.(reservation)}
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium">
                      {reservation.player_name || reservation.guest_contact?.name || 'Host'}
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {reservation.court_name} • {formatDateTime(reservation.start_time)} • {formatCurrency(reservation.price)}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredReservations.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Žádné rezervace odpovídající kritériím
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};