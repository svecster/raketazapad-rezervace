import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useViewMode } from '@/hooks/useViewMode';
import { 
  Circle, 
  User, 
  LogOut, 
  Calendar, 
  Settings, 
  BarChart3, 
  Banknote,
  Crown,
  UserCog,
  ChevronDown,
  Users,
  Coffee,
  Package,
  FileText,
  Shield,
  Zap,
  CalendarCheck
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export const Header = () => {
  const { user, profile, signOut, isStaff, isOwner } = useAuth();
  const { viewMode, switchViewMode, getNavigationForMode, getViewModeLabel, canSwitchMode } = useViewMode();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons = { 
      Calendar, 
      BarChart3, 
      Settings, 
      Banknote,
      Users,
      Coffee,
      Package,
      FileText,
      Shield,
      Zap,
      CalendarCheck,
      User
    };
    return icons[iconName as keyof typeof icons];
  };

  const navigation = getNavigationForMode();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-full">
              <Circle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Raketa</span>
          </Link>

          {user && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigation.map((item) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {IconComponent && <IconComponent className="h-4 w-4 inline mr-2" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Role Switcher for Owner */}
          {canSwitchMode && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  {viewMode === 'owner' && <Crown className="h-3 w-3 mr-2" />}
                  {viewMode === 'staff' && <UserCog className="h-3 w-3 mr-2" />}
                  {viewMode === 'player' && <User className="h-3 w-3 mr-2" />}
                  <span className="hidden sm:inline">{getViewModeLabel(viewMode)}</span>
                  <span className="sm:hidden">
                    {viewMode === 'owner' && 'Majitel'}
                    {viewMode === 'staff' && 'Personál'}
                    {viewMode === 'player' && 'Hráč'}
                  </span>
                  <ChevronDown className="h-3 w-3 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-48 bg-background/95 backdrop-blur z-50" 
                align="end"
                sideOffset={5}
              >
                <DropdownMenuLabel>Přepnout režim</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => switchViewMode('owner')}
                  className={viewMode === 'owner' ? 'bg-accent' : ''}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  <span>Majitel</span>
                  {viewMode === 'owner' && <Badge className="ml-auto" variant="secondary">Aktivní</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchViewMode('staff')}
                  className={viewMode === 'staff' ? 'bg-accent' : ''}
                >
                  <UserCog className="mr-2 h-4 w-4" />
                  <span>Personál</span>
                  {viewMode === 'staff' && <Badge className="ml-auto" variant="secondary">Aktivní</Badge>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => switchViewMode('player')}
                  className={viewMode === 'player' ? 'bg-accent' : ''}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Hráč</span>
                  {viewMode === 'player' && <Badge className="ml-auto" variant="secondary">Aktivní</Badge>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-background/95 backdrop-blur z-50" 
                align="end" 
                forceMount
                sideOffset={5}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.name || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center pt-1">
                      <Badge 
                        variant={profile?.role === 'owner' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {profile?.role === 'owner' && 'Majitel'}
                        {profile?.role === 'staff' && 'Personál'}
                        {profile?.role === 'player' && 'Hráč'}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profil">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/rezervace">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Moje rezervace</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Odhlásit se</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost">
                <Link to="/auth">Přihlásit se</Link>
              </Button>
              <Button asChild className="btn-tennis">
                <Link to="/auth">Registrace</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};