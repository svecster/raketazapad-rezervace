import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Clock, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatCurrency } from '@/lib/utils/currency';
import { toast } from 'sonner';

interface Reservation {
  id: string;
  start_time: string;
  end_time: string;
  court: { name: string };
  user: { name: string } | null;
  guest_contact: any;
  price: number;
}

interface ReservationSearchModalProps {
  onClose: () => void;
  onSelect: (reservation: Reservation) => void;
}

export function ReservationSearchModal({ onClose, onSelect }: ReservationSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodaysReservations();
  }, []);

  const loadTodaysReservations = async () => {
    try {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfWeek = new Date(today.setDate(today.getDate() + 7)).toISOString();

      const { data, error } = await supabase
        .from('reservations')
        .select(`
          id,
          start_time,
          end_time,
          price,
          court_id,
          user_id,
          guest_contact,
          courts!inner(name)
        `)
        .gte('start_time', startOfDay)
        .lte('start_time', endOfWeek)
        .order('start_time', { ascending: true });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(reservation => ({
        id: reservation.id,
        start_time: reservation.start_time,
        end_time: reservation.end_time,
        price: reservation.price,
        court: { name: reservation.courts?.name || 'Neznámý kurt' },
        user: null, // We'll load user names separately if needed
        guest_contact: reservation.guest_contact
      })) || [];
      
      setReservations(transformedData);
    } catch (error) {
      console.error('Error loading reservations:', error);
      toast.error('Chyba při načítání rezervací');
    } finally {
      setLoading(false);
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const courtName = reservation.court?.name || '';
    const userName = reservation.user?.name || '';
    const guestName = reservation.guest_contact?.name || '';
    
    return (
      courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guestName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('cs-CZ'),
      time: date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getCustomerName = (reservation: Reservation) => {
    if (reservation.user?.name) {
      return reservation.user.name;
    }
    if (reservation.guest_contact?.name) {
      return reservation.guest_contact.name;
    }
    return 'Neznámý zákazník';
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Vybrat rezervaci
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Hledat podle kurtu nebo jména..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Reservations List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Žádné rezervace nenalezeny</p>
              </div>
            ) : (
              filteredReservations.map((reservation) => {
                const startTime = formatDateTime(reservation.start_time);
                const endTime = formatDateTime(reservation.end_time);
                
                return (
                  <div
                    key={reservation.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => onSelect(reservation)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {reservation.court?.name || 'Neznámý kurt'}
                          </Badge>
                          <Badge variant="outline">
                            {startTime.date}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {startTime.time} - {endTime.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {getCustomerName(reservation)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(reservation.price)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Cancel Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Zrušit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}