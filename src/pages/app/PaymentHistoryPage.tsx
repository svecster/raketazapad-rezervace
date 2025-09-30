import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { Payment } from '@/types';
import { formatPrice } from '@/lib/pricing';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { toast } from 'sonner';
import { CreditCard, Calendar } from 'lucide-react';

export const PaymentHistoryPage = () => {
  const { session } = useSession();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchPayments();
    }
  }, [session]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      
      // Fetch reservations as payment history
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .eq('user_id', session?.user?.id)
        .not('price', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Map reservations to payment format
      const mappedPayments = (data || []).map(reservation => ({
        id: parseInt(reservation.id.substring(0, 8), 16),
        reservation_id: reservation.id,
        method: reservation.payment_method || 'cash',
        amount_czk: reservation.price || 0,
        created_at: reservation.payment_confirmed_at || reservation.created_at,
        created_by: reservation.user_id,
        notes: `Rezervace ${new Date(reservation.start_time).toLocaleDateString('cs-CZ')}`
      }));
      
      setPayments(mappedPayments as Payment[]);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Chyba při načítání platební history');
    } finally {
      setLoading(false);
    }
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      'cash': 'Hotovost',
      'card': 'Karta',
      'bank': 'Převod'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getMethodColor = (method: string) => {
    const colors = {
      'cash': 'default',
      'card': 'secondary',
      'bank': 'outline'
    };
    return colors[method as keyof typeof colors] || 'default';
  };

  const calculateTotalPaid = () => {
    return payments.reduce((sum, payment) => sum + payment.amount_czk, 0);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-pulse">Načítám platební historii...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Historie plateb</h1>
          <p className="text-muted-foreground">
            Přehled všech vašich plateb
          </p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Souhrn plateb
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {formatPrice(calculateTotalPaid())}
                </div>
                <div className="text-sm text-muted-foreground">
                  Celkem zaplaceno
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold">
                  {payments.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Počet plateb
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Historie plateb
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nemáte žádné platby
              </p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-4">
                          <Badge variant={getMethodColor(payment.method) as any}>
                            {getMethodLabel(payment.method)}
                          </Badge>
                          <div className="font-semibold">
                            {formatPrice(payment.amount_czk)}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(payment.created_at), 'dd. MMMM yyyy HH:mm', { locale: cs })}
                        </div>

                        {payment.notes && (
                          <p className="text-sm text-muted-foreground">
                            Poznámka: {payment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};