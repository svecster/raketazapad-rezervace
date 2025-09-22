import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin } from 'lucide-react';

export const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-section-bg border-t border-border">
      <div className="container-max px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Club Info */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Tenis Nisa</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 text-primary" />
                <span>Londýnská 630/2a<br />Liberec</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary" />
                <a href="tel:+420602130331" className="hover:text-primary transition-colors">
                  +420 602 130 331
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary" />
                <a href="mailto:info@tenisnisa.cz" className="hover:text-primary transition-colors">
                  info@tenisnisa.cz
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Otevírací doba</h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm">Denně 7:00–22:00</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Rychlé odkazy</h3>
            <div className="space-y-2 text-sm">
              <Link to="/" className="block hover:text-primary transition-colors">
                Domů
              </Link>
              <Link to="/sluzby" className="block hover:text-primary transition-colors">
                Služby
              </Link>
              <Link to="/cenik" className="block hover:text-primary transition-colors">
                Ceník
              </Link>
              <Link to="/kontakt" className="block hover:text-primary transition-colors">
                Kontakt
              </Link>
              <Link to="/rezervace" className="block hover:text-primary transition-colors">
                Rezervace
              </Link>
            </div>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg">Dokumenty</h3>
            <div className="space-y-2 text-sm">
              <a 
                href="/dokumenty/provozni-rad.pdf" 
                className="block hover:text-primary transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                Provozní řád
              </a>
              <Link to="/ochrana-soukromi" className="block hover:text-primary transition-colors">
                Ochrana soukromí
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Tenis Nisa. Všechna práva vyhrazena.
            </p>
            <p className="text-sm text-muted-foreground">
              Provozovatel: Mgr. Markéta Kdýrová
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};