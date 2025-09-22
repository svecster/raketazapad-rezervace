import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Phone, User, LogOut, Settings, Users, Calendar } from 'lucide-react';
import { useSession, hasRole } from '@/auth/AuthProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import tenisNisaLogo from '@/assets/tenis-nisa-logo.png';

export const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { session, loading } = useSession();

  const navItems = [
    { href: '/', label: 'Domů' },
    { href: '/sluzby', label: 'Služby' },
    { href: '/cenik', label: 'Ceník' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  const isActive = (href: string) => location.pathname === href;
  
  const isStaff = hasRole(session, ["staff", "coach", "admin", "owner"]);
  const isAdmin = hasRole(session, ["admin", "owner"]);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <nav className="container-max flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <img 
            src={tenisNisaLogo} 
            alt="Tenis Nisa logo" 
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive(item.href) 
                  ? 'text-primary' 
                  : 'text-foreground/80'
              }`}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Admin Navigation Links */}
          {isStaff && (
            <Link
              to="/sprava"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/sprava') 
                  ? 'text-primary' 
                  : 'text-foreground/80'
              }`}
            >
              Správa
            </Link>
          )}
        </div>

        {/* CTA Buttons & User Menu - Desktop */}
        <div className="hidden md:flex items-center space-x-3">
          <Button variant="outline" size="sm" asChild>
            <a href="tel:+420602130331" className="flex items-center space-x-2">
              <Phone className="h-4 w-4" />
              <span>Zavolat</span>
            </a>
          </Button>
          <Button asChild>
            <Link to="/rezervace">Rezervovat kurt</Link>
          </Button>
          
          {/* User Menu or Login */}
          {!loading && (
            session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Můj účet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    {isStaff && (
                      <DropdownMenuItem asChild>
                        <Link to="/sprava" className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Správa rezervací
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/nastaveni" className="flex items-center">
                            <Settings className="mr-2 h-4 w-4" />
                            Nastavení
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/uzivatele" className="flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            Uživatelé
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/logout" className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Odhlásit se
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link to="/login">Přihlásit se</Link>
              </Button>
            )
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`block text-sm font-medium transition-colors hover:text-primary ${
                  isActive(item.href) 
                    ? 'text-primary' 
                    : 'text-foreground/80'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Admin Navigation Links - Mobile */}
            {isStaff && (
              <Link
                to="/sprava"
                className={`block text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/sprava') 
                    ? 'text-primary' 
                    : 'text-foreground/80'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Správa
              </Link>
            )}
            {isAdmin && (
              <>
                <Link
                  to="/nastaveni"
                  className={`block text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/nastaveni') 
                      ? 'text-primary' 
                      : 'text-foreground/80'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Nastavení
                </Link>
                <Link
                  to="/uzivatele"
                  className={`block text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/uzivatele') 
                      ? 'text-primary' 
                      : 'text-foreground/80'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Uživatelé
                </Link>
              </>
            )}
            
            <div className="pt-4 space-y-3">
              <Button variant="outline" size="sm" asChild className="w-full justify-center">
                <a href="tel:+420602130331" className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Zavolat</span>
                </a>
              </Button>
              <Button asChild className="w-full">
                <Link to="/rezervace" onClick={() => setIsMobileMenuOpen(false)}>
                  Rezervovat kurt
                </Link>
              </Button>
              
              {/* Auth buttons - Mobile */}
              {!loading && (
                session ? (
                  <>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Můj profil
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/logout" onClick={() => setIsMobileMenuOpen(false)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Odhlásit se
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Přihlásit se
                    </Link>
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};