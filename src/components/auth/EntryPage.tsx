import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Loader2, Circle, UserPlus, LogIn, Calendar } from 'lucide-react';
import { ReservationModal } from '@/components/reservation/ReservationModal';

export const EntryPage = () => {
  const { signIn, signUp, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [formData, setFormData] = useState({
    loginIdentifier: '',
    password: '',
    name: '',
    email: '',
    confirmPassword: '',
  });

  // Redirect if already authenticated
  if (!loading && user) {
    return <Navigate to="/" replace />;
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.loginIdentifier || !formData.password) return;

    setIsLoading(true);
    await signIn(formData.loginIdentifier, formData.password);
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.name) return;
    
    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    await signUp(formData.email, formData.password, formData.name);
    setIsLoading(false);
  };

  const [showReservationModal, setShowReservationModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-primary p-4 rounded-full shadow-lg">
              <Circle className="h-12 w-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Tenisový klub Raketa</h1>
          <p className="text-muted-foreground text-lg">Vítejte v našem rezervačním systému</p>
        </div>

        <div className="space-y-4 mb-6">
          <Button 
            size="lg" 
            className="w-full h-14 text-lg btn-tennis" 
            onClick={() => setActiveTab('signin')}
            disabled={activeTab === 'signin'}
          >
            <LogIn className="mr-3 h-5 w-5" />
            Přihlásit se
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full h-14 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
            onClick={() => setActiveTab('signup')}
            disabled={activeTab === 'signup'}
          >
            <UserPlus className="mr-3 h-5 w-5" />
            Registrovat se (hráč)
          </Button>
          
          <Button 
            size="lg" 
            variant="secondary" 
            className="w-full h-14 text-lg" 
            onClick={() => setShowReservationModal(true)}
          >
            <Calendar className="mr-3 h-5 w-5" />
            Rezervovat bez registrace
          </Button>
        </div>

        {(activeTab === 'signin' || activeTab === 'signup') && (
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>
                {activeTab === 'signin' ? 'Přihlášení' : 'Registrace hráče'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'signin' 
                  ? 'Zadejte svůj email nebo uživatelské jméno a heslo'
                  : 'Vytvořte si nový účet pro rezervace kurtů'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeTab === 'signin' ? (
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-identifier">Přihlašovací údaj</Label>
                    <Input
                      id="signin-identifier"
                      type="text"
                      placeholder="email@example.cz nebo uživatelské jméno"
                      value={formData.loginIdentifier}
                      onChange={(e) => handleInputChange('loginIdentifier', e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Hráči zadávají email. Zaměstnanci zadávají uživatelské jméno.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Heslo</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full btn-tennis" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Přihlašuji...
                      </>
                    ) : (
                      'Přihlásit se'
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Jméno a příjmení</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Jan Novák"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="vase.jmeno@email.cz"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Heslo</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Potvrzení hesla</Label>
                    <Input
                      id="signup-confirm"
                      type="password"
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
                    disabled={isLoading || formData.password !== formData.confirmPassword}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registruji...
                      </>
                    ) : (
                      'Zaregistrovat se'
                    )}
                  </Button>
                </form>
              )}
              
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {activeTab === 'signin' 
                    ? 'Nemáte účet? Zaregistrujte se' 
                    : 'Již máte účet? Přihlaste se'
                  }
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Registrací souhlasíte s podmínkami používání tenisového klubu
        </div>
      </div>
      
      <ReservationModal
        isOpen={showReservationModal}
        onClose={() => setShowReservationModal(false)}
      />
    </div>
  );
};