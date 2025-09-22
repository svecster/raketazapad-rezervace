import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useSession } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Loader2, Calendar, Clock, MapPin, CreditCard, RefreshCw, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface Booking {
  id: number;
  court_id: number;
  begins_at: string;
  ends_at: string;
  price: number | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
}

export const MyReservationsPage = () => {
  const { session, loading } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If not logged in, redirect to login
  if (!loading && !session) {
    return <Navigate to="/login" state={{ message: "Pro zobrazení vašich rezervací se přihlaste." }} replace />;
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchBookings();
    }
  }, [session]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('begins_at', { ascending: false });

      if (error) {
        throw error;
      }

      setBookings(data || []);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Nepodařilo se načíst rezervace. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async (bookingId: number) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('user_id', session?.user?.id); // Extra security check

      if (error) {
        throw error;
      }

      toast({
        title: "Rezervace zrušena",
        description: "Vaše rezervace byla úspěšně zrušena.",
      });

      fetchBookings(); // Refresh the list
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast({
        title: "Chyba",
        description: "Nepodařilo se zrušit rezervaci. Zkuste to prosím znovu.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">Nová</Badge>;
      case 'confirmed':
        return <Badge variant="default">Potvrzená</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Zrušená</Badge>;
      default:
        return <Badge variant="secondary">Neznámý stav</Badge>;
    }
  };

  const canCancel = (booking: Booking) => {
    const now = new Date();
    const bookingStart = new Date(booking.begins_at);
    const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can cancel if booking is not already cancelled and starts more than 24 hours from now
    return booking.status !== 'cancelled' && hoursUntilBooking > 24;
  };

  const canReschedule = (booking: Booking) => {
    const now = new Date();
    const bookingStart = new Date(booking.begins_at);
    const hoursUntilBooking = (bookingStart.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    // Can reschedule if booking is not cancelled and starts more than 48 hours from now
    return booking.status !== 'cancelled' && hoursUntilBooking > 48;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d. M. yyyy 'v' HH:mm", { locale: cs });
  };

  const formatTimeRange = (startString: string, endString: string) => {
    const start = new Date(startString);
    const end = new Date(endString);
    return `${format(start, "HH:mm", { locale: cs })} - ${format(end, "HH:mm", { locale: cs })}`;
  };

  if (loading || isLoading) {
    return (
      <PublicLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Moje rezervace</h1>
          <p className="text-muted-foreground">
            Přehled vašich rezervací kortů a hal
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Seznam rezervací
            </CardTitle>
            <CardDescription>
              Zde můžete zobrazit, spravovat a rušit své rezervace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Žádné rezervace</h3>
                <p className="text-muted-foreground mb-4">
                  Zatím nemáte žádné rezervace. Vytvořte svou první rezervaci.
                </p>
                <Button asChild>
                  <Link to="/rezervace">Rezervovat kurt</Link>
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum a čas</TableHead>
                      <TableHead>Kurt/Hala</TableHead>
                      <TableHead>Časový interval</TableHead>
                      <TableHead>Cena</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Akce</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDateTime(booking.begins_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            Kurt {booking.court_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {formatTimeRange(booking.begins_at, booking.ends_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            {booking.price ? `${booking.price} Kč` : 'Neuvedena'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {canReschedule(booking) && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                              >
                                <Link to={`/rezervace?reschedule=${booking.id}`}>
                                  <RefreshCw className="h-4 w-4 mr-1" />
                                  Přeplánovat
                                </Link>
                              </Button>
                            )}
                            {canCancel(booking) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelReservation(booking.id)}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Zrušit
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link to="/rezervace">Vytvořit novou rezervaci</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
};