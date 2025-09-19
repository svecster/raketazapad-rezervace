import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Camera, 
  Lightbulb, 
  BarChart3,
  User,
  Clock,
  MapPin
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatCurrency } from '@/lib/utils/currency';
import { formatDateTime } from '@/lib/utils/datetime';

export const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from Supabase
  const mockReservations = [
    {
      id: '1',
      court_name: 'Kurt 1 (Indoor)',
      start_time: new Date('2024-01-15T10:00:00'),
      end_time: new Date('2024-01-15T11:30:00'),
      price: 750,
      status: 'booked' as const,
      player_name: 'Jan Novák',
      is_guest: false
    },
    {
      id: '2',
      court_name: 'Kurt 2 (Outdoor)',
      start_time: new Date('2024-01-15T14:00:00'),
      end_time: new Date('2024-01-15T15:30:00'),
      price: 600,
      status: 'booked' as const,
      player_name: 'Host - Marie Svobodová',
      is_guest: true
    }
  ];

  const mockBarOrders = [
    {
      id: '1',
      reservation_id: '1',
      total_price: 320,
      items: [
        { name: 'Pivo 0.5l', quantity: 2, price: 80 },
        { name: 'Kofola 0.33l', quantity: 1, price: 40 },
        { name: 'Topený sýr', quantity: 1, price: 120 }
      ],
      payment_status: 'open' as const,
      created_at: new Date()
    }
  ];

  return (
    <Layout requireAuth={true} allowedRoles={['staff', 'owner']}>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Personál - Administrace</h1>
            <p className="text-muted-foreground">Správa rezervací, bar účtů a vybavení</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">
              <BarChart3 className="mr-2 h-4 w-4" />
              Přehled
            </TabsTrigger>
            <TabsTrigger value="reservations">
              <Calendar className="mr-2 h-4 w-4" />
              Rezervace
            </TabsTrigger>
            <TabsTrigger value="bar">
              <CreditCard className="mr-2 h-4 w-4" />
              Bar účty
            </TabsTrigger>
            <TabsTrigger value="equipment">
              <Lightbulb className="mr-2 h-4 w-4" />
              Vybavení
            </TabsTrigger>
            <TabsTrigger value="customers">
              <Users className="mr-2 h-4 w-4" />
              Zákazníci
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dnešní rezervace</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">+2 od včera</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Otevřené bar účty</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">{formatCurrency(980)} celkem</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dnešní tržby</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(12450)}</div>
                  <p className="text-xs text-muted-foreground">+15% oproti průměru</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aktivní kurty</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5/6</div>
                  <p className="text-xs text-muted-foreground">Kurt 3 volný</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reservations" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Dnešní rezervace</h2>
              <div className="grid gap-4">
                {mockReservations.map((reservation) => (
                  <Card key={reservation.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center">
                          <MapPin className="mr-2 h-4 w-4" />
                          {reservation.court_name}
                          {reservation.is_guest && (
                            <Badge variant="secondary" className="ml-2">Host</Badge>
                          )}
                        </CardTitle>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(reservation.price)}
                        </span>
                      </div>
                      <CardDescription>
                        <User className="inline mr-1 h-3 w-3" />
                        {reservation.player_name}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-muted-foreground">
                          <Clock className="mr-2 h-4 w-4" />
                          {formatDateTime(reservation.start_time)} - {new Date(reservation.end_time).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Upravit
                          </Button>
                          {reservation.is_guest && (
                            <Button variant="secondary" size="sm">
                              Otevřít bar účet
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bar" className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-4">Otevřené bar účty</h2>
              <div className="grid gap-4">
                {mockBarOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Bar účet #{order.id}</CardTitle>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(order.total_price)}
                        </span>
                      </div>
                      <CardDescription>
                        Vytvořen: {formatDateTime(order.created_at)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantity}× {item.name}</span>
                            <span>{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Přidat položku
                        </Button>
                        <Button className="btn-tennis" size="sm">
                          Uzavřít účet
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="equipment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Osvětlení kurtů
                  </CardTitle>
                  <CardDescription>
                    Ovládání Sonoff spínačů
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[1, 2, 3, 4, 5, 6].map((court) => (
                    <div key={court} className="flex items-center justify-between">
                      <span>Kurt {court}</span>
                      <Button variant="outline" size="sm">
                        Zapnout/Vypnout
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Camera className="mr-2 h-5 w-5" />
                    Kamerový systém
                  </CardTitle>
                  <CardDescription>
                    Přístup k IP kamerám
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full">
                    Kamera 1 - Vstup
                  </Button>
                  <Button variant="outline" className="w-full">
                    Kamera 2 - Kurty 1-3
                  </Button>
                  <Button variant="outline" className="w-full">
                    Kamera 3 - Kurty 4-6
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Zákazníci dnes</CardTitle>
                <CardDescription>
                  Přehled všech dnešních návštěvníků
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Seznam zákazníků bude zde implementován
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};