import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  CreditCard, 
  Settings, 
  UserPlus,
  FileText,
  Shield,
  Calendar,
  Package,
  Banknote,
  Globe
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatCurrency } from '@/lib/utils/currency';
import { StaffManagement } from '@/components/owner/StaffManagement';
import { ReservationCalendar } from '@/components/admin/ReservationCalendar';
import { BarAccountManager } from '@/components/admin/BarAccountManager';
import { CashRegisterManager } from '@/components/admin/CashRegisterManager';

export const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - replace with real data from Supabase
  const mockUsers = [
    {
      id: '1',
      name: 'Jan Novák',
      email: 'jan.novak@email.cz',
      role: 'player' as 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner',
      created_at: new Date('2024-01-01'),
      active: true
    },
    {
      id: '2',
      name: 'Marie Svobodová',
      email: 'marie.svobodova@email.cz',
      role: 'staff' as 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner',
      created_at: new Date('2024-01-15'),
      active: true
    },
    {
      id: '3',
      name: 'Pavel Novotný',
      email: 'pavel.novotny@email.cz',
      role: 'owner' as 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner',
      created_at: new Date('2024-01-10'),
      active: true
    }
  ];

  const mockStats = {
    dailyRevenue: 15240,
    weeklyRevenue: 89650,
    monthlyRevenue: 345200,
    totalUsers: 234,
    activeReservations: 12,
    todayReservations: 28
  };

  return (
    <Layout requireAuth={true} requiredRole="owner">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Majitel - Administrace</h1>
            <p className="text-muted-foreground">Kompletní správa tenisového klubu</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-10">
            <TabsTrigger value="overview">
              <BarChart3 className="mr-2 h-4 w-4" />
              Přehled
            </TabsTrigger>
            <TabsTrigger value="public-reservation">
              <Globe className="mr-2 h-4 w-4" />
              Veřejná rezervace
            </TabsTrigger>
            <TabsTrigger value="reservations">
              <Calendar className="mr-2 h-4 w-4" />
              Rezervace
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" />
              Uživatelé
            </TabsTrigger>
            <TabsTrigger value="bar">
              <CreditCard className="mr-2 h-4 w-4" />
              Bar & účty
            </TabsTrigger>
            <TabsTrigger value="inventory">
              <Package className="mr-2 h-4 w-4" />
              Sklad
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="mr-2 h-4 w-4" />
              Reporty
            </TabsTrigger>
            <TabsTrigger value="audit">
              <Shield className="mr-2 h-4 w-4" />
              Audit
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="mr-2 h-4 w-4" />
              Nastavení
            </TabsTrigger>
            <TabsTrigger value="cash">
              <Banknote className="mr-2 h-4 w-4" />
              Pokladna
            </TabsTrigger>
          </TabsList>

          <TabsContent value="public-reservation">
            <Card>
              <CardHeader>
                <CardTitle>Veřejná rezervace</CardTitle>
                <CardDescription>
                  Otevřete rezervační systém pro zákazníky
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center py-8">
                  <Globe className="mx-auto h-12 w-12 text-primary mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Rezervační systém inspirovaný Reservanto pro vaše zákazníky
                  </p>
                  <Button 
                    className="mr-2"
                    onClick={() => window.open('/rezervace/novy', '_blank')}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Otevřít rezervační systém
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigator.clipboard.writeText(window.location.origin + '/rezervace/novy')}
                  >
                    Kopírovat odkaz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Denní tržby</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockStats.dailyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+12% oproti včera</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Týdenní tržby</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockStats.weeklyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+8% oproti minulému týdnu</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Měsíční tržby</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(mockStats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">+18% oproti minulému měsíci</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Celkem uživatelů</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
                  <p className="text-xs text-muted-foreground">+5 nových tento týden</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dnešní rezervace</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{mockStats.todayReservations}</div>
                  <p className="text-xs text-muted-foreground">{mockStats.activeReservations} aktivních</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Využití kurtů</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">78%</div>
                  <p className="text-xs text-muted-foreground">Průměr za dnešek</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <StaffManagement />
            
            <div className="grid gap-4">
              {mockUsers.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={user.role === 'owner' ? 'default' : 'secondary'}
                        >
                          {user.role === 'owner' ? 'Majitel' : user.role === 'staff' ? 'Personál' : 'Hráč'}
                        </Badge>
                        {user.active ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Aktivní
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            Neaktivní
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Upravit roli
                      </Button>
                      <Button variant="outline" size="sm">
                        Resetovat heslo
                      </Button>
                      <Button variant="destructive" size="sm">
                        Deaktivovat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="reservations">
            <ReservationCalendar />
          </TabsContent>

          <TabsContent value="bar">
            <BarAccountManager />
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Skladové hospodářství</CardTitle>
                <CardDescription>
                  Správa zásob a inventáře
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Skladový systém bude zde implementován
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Reporty a analýzy</CardTitle>
                <CardDescription>
                  Detailní přehledy a exporty dat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Reportovací systém bude zde implementován
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>Audit log</CardTitle>
                <CardDescription>
                  Historie všech akcí v systému
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Audit log bude zde implementován
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Nastavení systému</CardTitle>
                <CardDescription>
                  Konfigurace klubu a systému
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nastavení bude zde implementováno
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cash">
            <CashRegisterManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};