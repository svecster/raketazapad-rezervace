import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserPlus,
  CheckCircle,
  Calendar,
  BarChart3,
  Bell,
  Crown
} from 'lucide-react';

interface AccountOfferModalProps {
  isOpen: boolean;
  onClose: (createAccount: boolean) => void;
  contactData?: {
    name: string;
    email: string;
    phone: string;
    playersCount?: string;
    notes?: string;
  };
}

export const AccountOfferModal = ({ isOpen, onClose, contactData }: AccountOfferModalProps) => {
  const benefits = [
    {
      icon: Calendar,
      title: 'Přehled rezervací',
      description: 'Všechny vaše rezervace na jednom místě'
    },
    {
      icon: BarChart3,
      title: 'Historie a statistiky',
      description: 'Sledujte svůj herní pokrok a statistiky'
    },
    {
      icon: Bell,
      title: 'Oznámení',
      description: 'Dostávejte upozornění na důležité události'
    },
    {
      icon: Crown,
      title: 'Výhody pro stálé hráče',
      description: 'Slevy a prioritní rezervace pro registrované'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <UserPlus className="mr-2 h-5 w-5 text-primary" />
            Vytvořit účet hráče?
          </DialogTitle>
          <DialogDescription>
            Vaše rezervace byla úspěšně vytvořena! Chcete si založit účet pro lepší správu rezervací?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="font-medium text-sm">Výhody registrace:</h3>
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-primary/10 p-1.5 rounded">
                    <IconComponent className="h-3 w-3 text-primary" />
                  </div>
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{benefit.title}</div>
                    <div className="text-muted-foreground text-xs">{benefit.description}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Prefilled info preview */}
          {contactData && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="text-sm space-y-1">
                  <p className="font-medium">Předvyplněné údaje:</p>
                  <p className="text-muted-foreground">• {contactData.name}</p>
                  <p className="text-muted-foreground">• {contactData.email}</p>
                  <p className="text-muted-foreground">• {contactData.phone}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action buttons */}
          <div className="flex flex-col space-y-2 pt-2">
            <Button
              onClick={() => onClose(true)}
              className="btn-tennis"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Vytvořit účet hráče
            </Button>
            
            <Button
              variant="outline"
              onClick={() => onClose(false)}
            >
              Ne, pokračovat bez účtu
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Registrace je zcela zdarma a zabere méně než minutu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};