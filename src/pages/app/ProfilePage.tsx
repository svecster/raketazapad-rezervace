import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSession } from '@/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types';
import { toast } from 'sonner';
import { User, Save, Mail, Phone, Calendar } from 'lucide-react';

export const ProfilePage = () => {
  const { session, appRole, refreshRole } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: ''
  });

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session?.user?.id)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        throw error;
      }
      
      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Chyba při načítání profilu');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!session?.user?.id) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: session.user.id,
          full_name: formData.full_name,
          phone: formData.phone,
          app_role: appRole || 'player'
        });
      
      if (error) throw error;
      
      toast.success('Profil byl úspěšně uložen');
      await fetchProfile();
      await refreshRole();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Chyba při ukládání profilu');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role: string | null) => {
    const labels = {
      'guest': 'Host',
      'player': 'Hráč',
      'trainer': 'Trenér',
      'staff': 'Obsluha',
      'owner': 'Majitel',
      'admin': 'Administrátor'
    };
    return role ? labels[role as keyof typeof labels] || role : 'Uživatel';
  };

  const getRoleColor = (role: string | null) => {
    const colors = {
      'guest': 'secondary',
      'player': 'default',
      'trainer': 'outline',
      'staff': 'default',
      'owner': 'default',
      'admin': 'destructive'
    };
    return colors[role as keyof typeof colors] || 'default';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-8">
            <div className="animate-pulse">Načítám profil...</div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Můj profil</h1>
          <p className="text-muted-foreground">
            Správa vašich osobních údajů a nastavení účtu
          </p>
        </div>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Informace o účtu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{session?.user?.email}</p>
                  <p className="text-sm text-muted-foreground">E-mailová adresa</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {profile?.created_at 
                      ? new Date(profile.created_at).toLocaleDateString('cs-CZ')
                      : 'Neznámé'
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Datum registrace</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Badge variant={getRoleColor(appRole) as any}>
                    {getRoleLabel(appRole)}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Role v systému</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Osobní údaje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Celé jméno</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Zadejte vaše celé jméno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+420 xxx xxx xxx"
                  className="pl-10"
                />
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Ukládám...' : 'Uložit změny'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};