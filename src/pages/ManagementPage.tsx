import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { ReservationCalendar } from '@/components/admin/ReservationCalendar';

interface Reservation {
  id: string;
  court_id: string;
  start_time: string;
  end_time: string;
  status: string;
  price: number;
  user_id: string | null;
  guest_contact: any;
  created_at: string;
}

export const ManagementPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  useEffect(() => {
    fetchReservations();
  }, [selectedDate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      console.log('Fetching reservations...');
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('start_time', { ascending: true });
      
      console.log('Reservations query result:', { data, error });
      
      if (error) {
        console.error('Error fetching reservations:', error);
        toast({
          title: 'Chyba',
          description: `Nepodařilo se načíst rezervace: ${error.message}`,
          variant: 'destructive'
        });
        return;
      }
      
      if (data) {
        setReservations(data);
        console.log(`Loaded ${data.length} reservations`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Chyba',
        description: 'Neočekávaná chyba při načítání rezervací.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout requireAuth allowedRoles={['staff', 'owner']}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Správa rezervací</h1>
            <p className="text-muted-foreground">
              Spravujte rezervace kurtů, vytvářejte nové a upravujte stávající
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrovat
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nová rezervace
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-16 mb-2"></div>
                    <div className="h-8 bg-muted rounded w-12 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dnes</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reservations.filter(r => 
                    new Date(r.start_time).toDateString() === new Date().toDateString()
                  ).length}
                </div>
                <p className="text-xs text-muted-foreground">rezervací</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktivní</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reservations.filter(r => r.status === 'booked').length}
                </div>
                <p className="text-xs text-muted-foreground">rezervací</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Zaplaceno</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {reservations.filter(r => r.status === 'paid').length}
                </div>
                <p className="text-xs text-muted-foreground">rezervací</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Příjem</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round(reservations.reduce((sum, r) => sum + (r.price || 0), 0))} Kč
                </div>
                <p className="text-xs text-muted-foreground">celkem</p>
              </CardContent>
            </Card>
          </div>
        )}

        {reservations.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Žádné rezervace nenalezeny</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Zkuste obnovit stránku nebo kontaktujte správce systému
                </p>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Kalendář rezervací</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Načítám rezervace...</p>
                </div>
              </div>
            ) : (
              <ReservationCalendar />
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};