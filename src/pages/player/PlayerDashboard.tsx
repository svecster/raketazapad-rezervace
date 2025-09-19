import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, CreditCard, Plus, Clock, MapPin } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/datetime';

export const PlayerDashboard = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('reservations');

  // Mock data - replace with real data from Supabase
  const mockReservations = [
    {
      id: '1',
      court_name: 'Kurt 1 (Indoor)',
      start_time: new Date('2024-01-15T10:00:00'),
      end_time: new Date('2024-01-15T11:30:00'),
      price: 750,
      status: 'booked' as const
    },
    {
      id: '2',
      court_name: 'Kurt 2 (Outdoor)',
      start_time: new Date('2024-01-10T14:00:00'),
      end_time: new Date('2024-01-10T15:30:00'),
      price: 600,
      status: 'completed' as const
    }
  ];

  const mockPayments = [
    {
      id: '1',
      type: 'reservation',
      description: 'Rezervace Kurt 1 - 15.1.2024',
      amount: 750,
      date: new Date('2024-01-15T10:00:00'),
      status: 'paid' as const
    },
    {
      id: '2',
      type: 'bar',
      description: 'Bar účet - 10.1.2024',
      amount: 320,
      date: new Date('2024-01-10T15:45:00'),
      status: 'paid' as const
    }
  ];

  return (
    <Layout requireAuth={true} requiredRole="player">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Vítejte, {profile?.name}</h1>
            <p className="text-muted-foreground">Přehled vašich rezervací a plateb</p>
          </div>
          <Button className="btn-tennis">
            <Plus className="mr-2 h-4 w-4" />
            Nová rezervace
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reservations">
              <Calendar className="mr-2 h-4 w-4" />
              Moje rezervace
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="mr-2 h-4 w-4" />
              Moje platby
            </TabsTrigger>
            <TabsTrigger value="new-reservation">
              <Plus className="mr-2 h-4 w-4" />
              Nová rezervace
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reservations" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Nadcházející rezervace</h2>
              <div className="grid gap-4">
                {mockReservations
                  .filter(r => r.start_time > new Date() && r.status === 'booked')
                  .map((reservation) => (
                    <Card key={reservation.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            {reservation.court_name}
                          </CardTitle>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(reservation.price)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-muted-foreground mb-4">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatDateTime(reservation.start_time)} - {new Date(reservation.end_time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Upravit
                          </Button>
                          <Button variant="destructive" size="sm">
                            Zrušit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Historie rezervací</h2>
              <div className="grid gap-4">
                {mockReservations
                  .filter(r => r.start_time < new Date() || r.status === 'completed')
                  .map((reservation) => (
                    <Card key={reservation.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center">
                            <MapPin className="mr-2 h-4 w-4" />
                            {reservation.court_name}
                          </CardTitle>
                          <span className="text-lg font-bold">
                            {formatCurrency(reservation.price)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatDateTime(reservation.start_time)} - {new Date(reservation.end_time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Historie plateb</h2>
              <div className="grid gap-4">
                {mockPayments.map((payment) => (
                  <Card key={payment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{payment.description}</CardTitle>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>
                      <CardDescription>
                        {formatDateTime(payment.date)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Typ: {payment.type === 'reservation' ? 'Rezervace' : 'Bar'}
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          Zaplaceno
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline">
                  Export plateb
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new-reservation">
            <Card>
              <CardHeader>
                <CardTitle>Nová rezervace</CardTitle>
                <CardDescription>
                  Vytvořte novou rezervace kurtu s předvyplněnými údaji
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Rezervační formulář bude zde implementován
                  </p>
                  <Button className="btn-tennis">
                    Pokračovat na rezervaci
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};