import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User,
  Mail,
  Phone,
  Users,
  MessageSquare,
  CheckCircle
} from 'lucide-react';

interface ContactData {
  name: string;
  email: string;
  phone: string;
  playersCount?: string;
  notes?: string;
}

interface ContactInfoProps {
  contactData?: ContactData;
  onContactUpdate: (data: ContactData) => void;
}

export const ContactInfo = ({ contactData, onContactUpdate }: ContactInfoProps) => {
  const [formData, setFormData] = useState<ContactData>({
    name: contactData?.name || '',
    email: contactData?.email || '',
    phone: contactData?.phone || '',
    playersCount: contactData?.playersCount || '2',
    notes: contactData?.notes || ''
  });

  const [errors, setErrors] = useState<Partial<ContactData>>({});

  useEffect(() => {
    // Validate and update parent component
    const newErrors: Partial<ContactData> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Jméno je povinné';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email je povinný';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neplatný email';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefon je povinný';
    } else if (!/^(\+420|00420)?\s*[0-9\s]{9,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Neplatné telefonní číslo';
    }

    setErrors(newErrors);
    
    // Only update parent if no errors
    if (Object.keys(newErrors).length === 0) {
      onContactUpdate(formData);
    }
  }, [formData, onContactUpdate]);

  const handleInputChange = (field: keyof ContactData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits except +
    const cleaned = value.replace(/[^\d+]/g, '');
    
    // Format Czech phone numbers
    if (cleaned.startsWith('+420')) {
      const digits = cleaned.substring(4);
      if (digits.length <= 3) return `+420 ${digits}`;
      if (digits.length <= 6) return `+420 ${digits.substring(0, 3)} ${digits.substring(3)}`;
      return `+420 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`;
    }
    
    if (cleaned.startsWith('420')) {
      const digits = cleaned.substring(3);
      if (digits.length <= 3) return `+420 ${digits}`;
      if (digits.length <= 6) return `+420 ${digits.substring(0, 3)} ${digits.substring(3)}`;
      return `+420 ${digits.substring(0, 3)} ${digits.substring(3, 6)} ${digits.substring(6, 9)}`;
    }

    // If it's a 9-digit number, assume Czech format
    if (cleaned.length === 9) {
      return `+420 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }

    return value;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  const isFormValid = !errors.name && !errors.email && !errors.phone && 
                     formData.name.trim() && formData.email.trim() && formData.phone.trim();

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Kontaktní údaje</h2>
        <p className="text-muted-foreground">
          Zadejte své kontaktní informace pro potvrzení rezervace
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column: Required fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Povinné údaje
            </CardTitle>
            <CardDescription>
              Tyto informace jsou nutné pro vytvoření rezervace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Jméno a příjmení *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Jan Novák"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="jan.novak@email.cz"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Na tento email dostanete potvrzení rezervace
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefon *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+420 123 456 789"
                value={formData.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && (
                <p className="text-sm text-destructive">{errors.phone}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Pro případné důležité informace o rezervaci
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Right column: Optional fields */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Dodatečné informace
            </CardTitle>
            <CardDescription>
              Volitelné údaje pro lepší služby
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="playersCount">
                Počet hráčů
              </Label>
              <Select 
                value={formData.playersCount} 
                onValueChange={(value) => handleInputChange('playersCount', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hráč (trénink)</SelectItem>
                  <SelectItem value="2">2 hráči (singl)</SelectItem>
                  <SelectItem value="4">4 hráči (debl)</SelectItem>
                  <SelectItem value="more">Více hráčů</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Pomáhá nám připravit vhodné vybavení
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                Poznámka
              </Label>
              <Textarea
                id="notes"
                placeholder="Speciální požadavky, potřeba vybavení, atd..."
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Máte-li nějaké speciální požadavky nebo potřeby
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation of valid form */}
      {isFormValid && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-center">
              <div>
                <h3 className="font-semibold text-primary">Kontaktní údaje vyplněny</h3>
                <p className="text-sm text-muted-foreground">
                  {formData.name} • {formData.email} • {formData.phone}
                </p>
              </div>
              <CheckCircle className="ml-3 h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* GDPR Notice */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Ochrana osobních údajů</p>
              <p>
                Vaše osobní údaje budou použity pouze pro účely rezervace a komunikace 
                týkající se tenisového klubu. Údaje nebudeme sdílet s třetími stranami 
                bez vašeho souhlasu.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};