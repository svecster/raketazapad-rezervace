import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSession } from '@/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  LogOut, 
  Home, 
  Calendar, 
  CreditCard, 
  Settings, 
  Users, 
  ChevronRight,
  Menu,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Clock
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { session, appRole } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  const getRoleLabel = (role: string | null) => {
    const labels = {
      'guest': 'Host',
      'player': 'Hráč',
      'trainer': 'Trenér', 
      'staff': 'Obsluha',
      'owner': 'Majitel',
      'admin': 'Admin'
    };
    return role ? labels[role as keyof typeof labels] || role : 'Uživatel';
  };

  const getRoleColor = (role: string | null) => {
    const colors = {
      'guest': 'secondary',
      'player': 'default',
      'trainer': 'outline',
      'staff': 'default',
      'owner': 'default',
      'admin': 'destructive'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  // Generate breadcrumb
  const generateBreadcrumb = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Domů', path: '/app' }];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      if (segment === 'app') return;
      
      currentPath += `/${segment}`;
      const fullPath = '/app' + currentPath;
      
      const segmentLabels: Record<string, string> = {
        'rezervace': 'Rezervace',
        'moje-rezervace': 'Moje rezervace',
        'platby': 'Platby',
        'profil': 'Profil',
        'staff': 'Obsluha',
        'owner': 'Majitel',
        'trener': 'Trenér',
        'admin': 'Admin',
        'dashboard': 'Dashboard',
        'cenik': 'Ceník',
        'sklad': 'Sklad',
        'finance': 'Finance',
        'pokladna': 'Pokladna',
        'smeny': 'Směny',
        'klienti': 'Klienti',
        'kalendar': 'Kalendář',
        'vyplaty': 'Výplaty'
      };
      
      breadcrumbs.push({
        label: segmentLabels[segment] || segment,
        path: fullPath
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumb();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/app" className="text-xl font-bold text-primary">
                Tenis Nisa
              </Link>
              <div className="text-sm text-muted-foreground">
                App
              </div>
            </div>
            
            {/* User menu */}
            <div className="flex items-center space-x-3">
              <Badge variant={getRoleColor(appRole) as any}>
                {getRoleLabel(appRole)}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {session?.user?.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/app/profil">
                      <User className="h-4 w-4 mr-2" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/logout">
                      <LogOut className="h-4 w-4 mr-2" />
                      Odhlásit se
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center">
                {index > 0 && <ChevronRight className="h-3 w-3 mx-1" />}
                {index === breadcrumbs.length - 1 ? (
                  <span className="text-foreground">{crumb.label}</span>
                ) : (
                  <Link 
                    to={crumb.path} 
                    className="hover:text-primary transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center space-x-6 overflow-x-auto">
            
            {/* Everyone can access reservations */}
            <Link 
              to="/app/rezervace"
              className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Rezervace
            </Link>
            
            {/* Player and above */}
            {appRole && ['player', 'trainer', 'staff', 'owner', 'admin'].includes(appRole) && (
              <>
                <Link 
                  to="/app/moje-rezervace"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Moje rezervace
                </Link>
                <Link 
                  to="/app/platby"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Platby
                </Link>
              </>
            )}
            
            {/* Trainer */}
            {appRole === 'trainer' && (
              <>
                <Link 
                  to="/app/trener/kalendar"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Kalendář
                </Link>
                <Link 
                  to="/app/trener/vyplaty"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Výplaty
                </Link>
              </>
            )}
            
            {/* Staff and above */}
            {appRole && ['staff', 'owner', 'admin'].includes(appRole) && (
              <>
                <Link 
                  to="/app/staff/dashboard"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
                <Link 
                  to="/app/staff/pokladna"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Pokladna
                </Link>
                <Link 
                  to="/app/staff/smeny"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Směny
                </Link>
              </>
            )}
            
            {/* Owner and admin */}
            {appRole && ['owner', 'admin'].includes(appRole) && (
              <>
                <Link 
                  to="/app/owner/cenik"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Ceník
                </Link>
                <Link 
                  to="/app/owner/sklad"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Sklad
                </Link>
                <Link 
                  to="/app/owner/finance"
                  className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Finance
                </Link>
              </>
            )}
            
            {/* Admin only */}
            {appRole === 'admin' && (
              <Link 
                to="/app/admin"
                className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
              >
                <Users className="h-4 w-4 mr-1" />
                Správa
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
};