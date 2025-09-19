import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, MapPin, User, Phone, Mail, Users, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Link } from 'react-router-dom';

export const GuestReservation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    players: '2',
    courtType: '',
    date: '',
    time: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState(0);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Calculate price based on court type and time
    if (field === 'courtType' || field === 'time') {
      calculatePrice(field === 'courtType' ? value : formData.courtType, field === 'time' ? value : formData.time);
    }
  };

  const calculatePrice = (courtType: string, time: string) => {
    // Mock pricing logic - replace with real pricing from database
    let basePrice = 0;
    
    if (courtType === 'indoor') {
      basePrice = 800; // Indoor courts more expensive
    } else if (courtType === 'outdoor') {
      basePrice = 600; // Outdoor courts cheaper
    }
    
    // Time-based pricing
    if (time) {
      const hour = parseInt(time.split(':')[0]);
      if (hour >= 16 && hour <= 20) {
        basePrice *= 1.2; // Peak hours 20% more expensive
      }
    }
    
    setCalculatedPrice(basePrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create guest reservation
      // This would call a Supabase function or API endpoint
      console.log('Creating guest reservation:', formData);
      
      // Mock success - redirect to confirmation page
      setTimeout(() => {
        window.location.href = '/guest/potvrzeni/123'; // Mock token
      }, 2000);
      
    } catch (error) {
      console.error('Error creating guest reservation:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/auth" className="inline-flex items-center text-muted-foreground hover:text-primary">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na přihlášení
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary p-3 rounded-full">
              <Calendar className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">Rezervace bez registrace</h1>
          <p className="text-muted-foreground mt-2">Rychle a jednoduše si rezervujte kurt</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Údaje pro rezervaci</CardTitle>
            <CardDescription>
              Vyplňte všechny povinné údaje pro vytvoření rezervace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Osobní údaje
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Jméno a příjmení *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Jan Novák"
                      value={formData.name}
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
                      value={formData.phone}
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
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Reservation Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Detaily rezervace
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="players">Počet hráčů</Label>
                    <Select value={formData.players} onValueChange={(value) => handleInputChange('players', value)}>
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
                    <Label htmlFor="courtType">Typ kurtu *</Label>
                    <Select value={formData.courtType} onValueChange={(value) => handleInputChange('courtType', value)} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Vyberte typ kurtu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor - krytý kurt</SelectItem>
                        <SelectItem value="outdoor">Outdoor - venkovní kurt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Datum *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="time">Čas začátku *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      min="07:00"
                      max="22:00"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Poznámka (volitelné)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Další informace k rezervaci..."
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Price Display */}
              {calculatedPrice > 0 && (
                <div className="border rounded-lg p-4 bg-secondary/10">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">Celková cena:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(calculatedPrice)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Cena za 1,5 hodiny hraní • Platba při příchodu nebo QR kódem
                  </p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full btn-tennis text-lg h-12" 
                disabled={isSubmitting || !calculatedPrice}
              >
                {isSubmitting ? 'Vytvářím rezervaci...' : 'Vytvořit rezervaci'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>Provozní doba: 7:00 - 23:00</p>
          <p>Minimální doba rezervace: 30 minut</p>
          <p>Po vytvoření rezervace obdržíte email s potvrzením a možností platby</p>
        </div>
      </div>
    </div>
  );
};