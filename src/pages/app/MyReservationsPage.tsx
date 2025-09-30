import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSession } from '@/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, Court } from '@/types';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, CreditCard } from 'lucide-react';

export const MyReservationsPage = () => {
  const { session } = useSession();
  const [reservations, setReservations] = useState<(Reservation & { court: Court })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchReservations();
    }
  }, [session]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          court:courts(*)
        `)
        .eq('user_id', session?.user?.id)
        .order('start_time', { ascending: false });
      
      if (error) throw error;
      
      setReservations((data || []) as any);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Chyba při načítání rezervací');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'booked': 'Rezervováno',
      'paid': 'Zaplaceno',
      'cancelled': 'Zrušeno'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'booked': 'default',
      'paid': 'default',
      'cancelled': 'secondary'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const canCancelReservation = (reservation: Reservation) => {
    const now = new Date();
    const startTime = new Date(reservation.start_time);
    const hoursBefore = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    return reservation.status === 'booked' && hoursBefore > 2; // Can cancel up to 2 hours before
  };

  const handleCancelReservation = async (reservationId: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);
      
      if (error) throw error;
      
      toast.success('Rezervace byla zrušena');
      fetchReservations();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast.error('Chyba při rušení rezervace');
    }
  };

  const upcoming = reservations.filter(r => new Date(r.start_time) > new Date() && r.status !== 'cancelled');
  const past = reservations.filter(r => new Date(r.start_time) <= new Date() || r.status === 'cancelled');

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-pulse">Načítám rezervace...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Moje rezervace</h1>
          <p className="text-muted-foreground">
            Přehled všech vašich rezervací
          </p>
        </div>

        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Nadcházející rezervace ({upcoming.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nemáte žádné nadcházející rezervace
              </p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {reservation.court.name}
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(reservation.start_time), 'dd. MMMM yyyy', { locale: cs })}
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(reservation.start_time), 'HH:mm')} - {format(new Date(reservation.end_time), 'HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(reservation.status) as any}>
                            {getStatusLabel(reservation.status)}
                          </Badge>
                          <div className="flex items-center text-sm font-medium">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {formatPrice(reservation.price)}
                          </div>
                        </div>
                      </div>
                      
                      {canCancelReservation(reservation) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          Zrušit
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past Reservations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Historie rezervací ({past.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {past.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nemáte žádné předchozí rezervace
              </p>
            ) : (
              <div className="space-y-4">
                {past.slice(0, 10).map((reservation) => (
                  <div
                    key={reservation.id}
                    className="border rounded-lg p-4 space-y-3 opacity-75"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-1" />
                            {reservation.court.name}
                          </div>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(reservation.start_time), 'dd. MMMM yyyy', { locale: cs })}
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-1" />
                            {format(new Date(reservation.start_time), 'HH:mm')} - {format(new Date(reservation.end_time), 'HH:mm')}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(reservation.status) as any}>
                            {getStatusLabel(reservation.status)}
                          </Badge>
                          <div className="flex items-center text-sm font-medium">
                            <CreditCard className="h-4 w-4 mr-1" />
                            {formatPrice(reservation.price)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {past.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground">
                    ... a dalších {past.length - 10} rezervací
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};