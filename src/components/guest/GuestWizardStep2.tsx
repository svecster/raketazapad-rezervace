import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, Mail, Users } from 'lucide-react';

interface ContactData {
  name: string;
  email: string;
  phone: string;
  playersCount: string;
  notes: string;
}

interface Props {
  data: ContactData;
  onChange: (data: ContactData) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export const GuestWizardStep2 = ({ data, onChange, onNext, onPrevious }: Props) => {
  const handleInputChange = (field: keyof ContactData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const canProceed = data.name.trim() !== '' && data.email.trim() !== '' && data.phone.trim() !== '';

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <User className="mr-2 h-5 w-5" />
          Krok 2: Kontaktní údaje
        </CardTitle>
        <CardDescription>
          Vyplňte své kontaktní údaje pro rezervaci
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Osobní údaje
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Jméno a příjmení *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Novák"
                value={data.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+420 123 456 789"
                value={data.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="jan.novak@email.cz"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium flex items-center">
            <Users className="mr-2 h-5 w-5" />
            Další informace
          </h3>

          <div className="space-y-2">
            <Label htmlFor="playersCount">Počet hráčů</Label>
            <Select 
              value={data.playersCount || '2'} 
              onValueChange={(value) => handleInputChange('playersCount', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hráč</SelectItem>
                <SelectItem value="2">2 hráči</SelectItem>
                <SelectItem value="3">3 hráči</SelectItem>
                <SelectItem value="4">4 hráči</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Poznámka (volitelné)</Label>
            <Textarea
              id="notes"
              placeholder="Další informace k rezervaci..."
              value={data.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={onPrevious}
            className="flex-1"
          >
            Zpět
          </Button>
          <Button 
            onClick={onNext}
            className="flex-1 btn-tennis"
            disabled={!canProceed}
          >
            Pokračovat na shrnutí
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};