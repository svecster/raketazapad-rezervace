import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Loader2, Shield, Lock, UserCheck } from 'lucide-react';
import { OwnerBootstrapService } from '@/services/ownerBootstrap';
import { useToast } from '@/hooks/use-toast';

export const SetupOwner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    loginIdentifier: 'admin', // Fixed
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      toast({
        title: "Chyba",
        description: "Vyplňte všechna pole",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Chyba",
        description: "Hesla se neshodují",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Chyba",
        description: "Heslo musí mít alespoň 6 znaků",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const result = await OwnerBootstrapService.createOwner(formData.password);

    if (result.success) {
      toast({
        title: "Úspěch",
        description: "Vlastník byl úspěšně vytvořen. Nyní se můžete přihlásit.",
      });
      navigate('/auth');
    } else {
      toast({
        title: "Chyba při vytváření vlastníka",
        description: result.error || 'Neznámá chyba',
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary p-4 rounded-full shadow-lg">
              <Shield className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Nastavení vlastníka</h1>
          <p className="text-muted-foreground text-lg">
            Vytvořte hlavní administrátorský účet pro tenisový klub
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCheck className="mr-2 h-5 w-5" />
              Vytvoření vlastníka
            </CardTitle>
            <CardDescription>
              Nastavte heslo pro hlavní administrátorský účet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginIdentifier">Přihlašovací údaj</Label>
                <Input
                  id="loginIdentifier"
                  type="text"
                  value={formData.loginIdentifier}
                  disabled
                  className="bg-muted"
                />
                <p className="text-sm text-muted-foreground">
                  Přihlašovací jméno je fixně nastaveno na "admin"
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nové heslo</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Zadejte bezpečné heslo"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrzení hesla</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Zadejte heslo znovu"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-sm text-destructive">Hesla se neshodují</p>
              )}

              <Button 
                type="submit" 
                className="w-full btn-tennis" 
                disabled={isLoading || formData.password !== formData.confirmPassword || !formData.password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Vytvářím vlastníka...
                  </>
                ) : (
                  <>
                    <Lock className="mr-2 h-4 w-4" />
                    Vytvořit a přihlásit se
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Po vytvoření účtu:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Budete automaticky přesměrováni na přihlášení</li>
                <li>• Přihlašujte se s údaji: admin / vaše_heslo</li>
                <li>• Získáte plný přístup k administraci</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Tento účet bude mít plnou kontrolu nad celým systémem
        </div>
      </div>
    </div>
  );
};