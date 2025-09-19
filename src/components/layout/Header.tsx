import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Circle, User, LogOut, Calendar, Settings, BarChart3 } from 'lucide-react';
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
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
              <Link
                to="/rezervace"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/rezervace') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Rezervace
              </Link>

              {isStaff && (
                <Link
                  to="/personal"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/personal') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <BarChart3 className="h-4 w-4 inline mr-2" />
                  Personál
                </Link>
              )}

              {isOwner && (
                <Link
                  to="/sprava"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/sprava') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Settings className="h-4 w-4 inline mr-2" />
                  Správa
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
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