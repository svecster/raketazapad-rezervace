import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from '@/auth/AuthProvider';
import { Block, BookingData } from '@/types/reservation';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BookingFormProps {
  selectedBlocks: Block[];
  onBack: () => void;
  onSuccess: () => void;
}

export const BookingForm = ({ selectedBlocks, onBack, onSuccess }: BookingFormProps) => {
  const { session } = useSession();
  const [formData, setFormData] = useState<BookingData>({
    name: session?.user?.user_metadata?.full_name || '',
    email: session?.user?.email || '',
    phone: session?.user?.user_metadata?.phone || '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const totalPrice = selectedBlocks.reduce((sum, block) => sum + block.totalPrice, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Vyplňte prosím všechna povinná pole');
      return;
    }

    setLoading(true);

    try {
      // Create bookings for each block
      const bookings = selectedBlocks.map(block => ({
        court_id: parseInt(block.courtId), // Convert string to number
        begins_at: parseISO(`${block.date}T${block.start}:00`).toISOString(),
        ends_at: parseISO(`${block.date}T${block.end}:00`).toISOString(),
        price: block.totalPrice,
        user_id: session?.user?.id || null,
        status: 'new',
        notes: session?.user?.id ? formData.notes : JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          notes: formData.notes
        })
      }));

      const { error } = await supabase
        .from('bookings')
        .insert(bookings);

      if (error) throw error;

      toast.success('Rezervace byla úspěšně vytvořena!');
      onSuccess();
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error('Chyba při vytváření rezervace. Zkuste to prosím znovu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Potvrzení rezervace</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected blocks summary */}
          <div>
            <h4 className="font-semibold mb-3">Vybrané termíny:</h4>
            <div className="space-y-2">
              {selectedBlocks.map((block, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                  <div>
                    <div className="font-medium">{block.courtName}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(parseISO(`${block.date}T00:00:00`), 'EEEE d. MMMM yyyy', { locale: cs })} • {block.start}–{block.end}
                    </div>
                  </div>
                  <Badge variant="outline">
                    {Math.round(block.totalPrice)} Kč
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Celková cena:</span>
              <span className="text-primary">{Math.round(totalPrice)} Kč</span>
            </div>
          </div>

          {/* Contact form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Jméno a příjmení *</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Poznámka</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Případné poznámky k rezervaci..."
                className="min-h-[100px]"
              />
            </div>

            {/* Auth suggestion */}
            {!session && (
              <Alert>
                <AlertDescription>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <span>Máte již účet? Přihlášením si zjednodušíte rezervace.</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/login">Přihlásit se</Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/register">Vytvořit účet</Link>
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={onBack} disabled={loading}>
                Zpět
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Vytváření rezervace...' : 'Potvrdit rezervaci'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};