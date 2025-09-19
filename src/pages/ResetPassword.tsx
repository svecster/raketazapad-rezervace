import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Circle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ResetPassword = () => {
  const { requestPasswordReset, updatePassword, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'request' | 'reset'>('request');
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    // Check if we're in recovery mode (user clicked email link)
    const checkRecoveryMode = async () => {
      // Parse URL hash fragment for type=recovery
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const isRecovery = hashParams.get('type') === 'recovery';
      
      console.log('URL hash:', window.location.hash);
      console.log('Recovery type detected:', isRecovery);
      
      if (isRecovery) {
        setMode('reset');
        return;
      }
      
      // Alternative: Check session for recovery
      const { data: { session } } = await supabase.auth.getSession();
      if (session && session.user?.app_metadata?.provider === 'recovery') {
        console.log('Recovery session detected');
        setMode('reset');
      }
    };
    
    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      if (event === 'PASSWORD_RECOVERY') {
        console.log('Password recovery event detected');
        setMode('reset');
      }
    });
    
    checkRecoveryMode();
    
    return () => subscription.unsubscribe();
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) return;

    setIsLoading(true);
    await requestPasswordReset(formData.email);
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.newPassword || formData.newPassword !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);
    const result = await updatePassword(formData.newPassword);
    setIsLoading(false);
    
    if (!result.error) {
      // Redirect based on user role
      setTimeout(() => {
        if (profile?.role === 'owner') {
          navigate('/admin/majitel');
        } else if (profile?.role === 'staff') {
          navigate('/admin/obsluha');
        } else if (profile?.role === 'player') {
          navigate('/app/hrac');
        } else {
          navigate('/');
        }
      }, 1000);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
          <p className="text-muted-foreground text-lg">
            {mode === 'request' ? 'Obnova hesla' : 'Nastavení nového hesla'}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>
              {mode === 'request' ? 'Zapomněli jste heslo?' : 'Nové heslo'}
            </CardTitle>
            <CardDescription>
              {mode === 'request' 
                ? 'Zadejte svou emailovou adresu a pošleme vám odkaz pro obnovu hesla'
                : 'Zadejte své nové heslo'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === 'request' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Emailová adresa</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="vase.jmeno@email.cz"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                      Odesílám...
                    </>
                  ) : (
                    'Odeslat odkaz pro obnovu'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nové heslo</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Potvrzení hesla</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
                {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                  <p className="text-sm text-destructive">Hesla se neshodují</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full btn-tennis" 
                  disabled={isLoading || formData.newPassword !== formData.confirmPassword}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Měním heslo...
                    </>
                  ) : (
                    'Změnit heslo'
                  )}
                </Button>
              </form>
            )}
            
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zpět na přihlášení
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};