import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "@/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Loader2, CreditCard, Calendar, Receipt } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface PaymentRecord {
  id: number;
  begins_at: string;
  ends_at: string;
  price: number | null;
  status: string | null;
  created_at: string | null;
  court_id: number;
}

export const PaymentHistoryPage = () => {
  const { session, loading } = useSession();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // If not logged in, redirect to login
  if (!loading && !session) {
    return <Navigate to="/login" state={{ message: "Pro zobrazení historie plateb se přihlaste." }} replace />;
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchPaymentHistory();
    }
  }, [session]);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('bookings')
        .select('id, begins_at, ends_at, price, status, created_at, court_id')
        .eq('user_id', session?.user?.id)
        .not('price', 'is', null) // Only show bookings with price (payments)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPayments(data || []);
    } catch (err) {
      console.error('Error fetching payment history:', err);
      setError('Nepodařilo se načíst historii plateb. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatusBadge = (status: string | null) => {
    switch (status) {
      case 'new':
        return <Badge variant="secondary">Čeká na platbu</Badge>;
      case 'confirmed':
        return <Badge variant="default">Uhrazeno</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Stornováno</Badge>;
      default:
        return <Badge variant="outline">Neznámý stav</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d. M. yyyy", { locale: cs });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "d. M. yyyy 'v' HH:mm", { locale: cs });
  };

  const calculateTotal = () => {
    return payments
      .filter(payment => payment.status !== 'cancelled')
      .reduce((total, payment) => total + (payment.price || 0), 0);
  };

  const getPaidTotal = () => {
    return payments
      .filter(payment => payment.status === 'confirmed')
      .reduce((total, payment) => total + (payment.price || 0), 0);
  };

  const getPendingTotal = () => {
    return payments
      .filter(payment => payment.status === 'new')
      .reduce((total, payment) => total + (payment.price || 0), 0);
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Historie plateb</h1>
          <p className="text-muted-foreground">
            Přehled všech vašich plateb za rezervace
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Celkem uhrazeno</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {getPaidTotal()} Kč
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Čeká na platbu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {getPendingTotal()} Kč
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Celkový obrat</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {calculateTotal()} Kč
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Historie plateb
            </CardTitle>
            <CardDescription>
              Chronologický přehled všech vašich plateb za rezervace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Žádné platby</h3>
                <p className="text-muted-foreground">
                  Zatím nemáte žádné záznamy o platbách.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Datum platby</TableHead>
                      <TableHead>ID rezervace</TableHead>
                      <TableHead>Kurt</TableHead>
                      <TableHead>Termín rezervace</TableHead>
                      <TableHead>Částka</TableHead>
                      <TableHead>Status platby</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {formatDate(payment.created_at || payment.begins_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            #{payment.id.toString().padStart(6, '0')}
                          </code>
                        </TableCell>
                        <TableCell>
                          Kurt {payment.court_id}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(payment.begins_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{payment.price} Kč</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPaymentStatusBadge(payment.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
};