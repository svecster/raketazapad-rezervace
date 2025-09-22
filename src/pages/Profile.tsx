import { useState, useEffect } from "react";
import { useSession } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  user_id: string;
  full_name: string;
  phone: string;
  app_role: string;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { session, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      } else {
        setProfile(data);
        setFullName(data.full_name || '');
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          full_name: fullName,
          phone: phone,
        })
        .eq('user_id', session.user.id);

      if (error) {
        toast({
          title: "Chyba při aktualizaci",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Profil aktualizován",
          description: "Vaše změny byly uloženy.",
        });
        fetchProfile(); // Refresh profile data
      }
    } catch (error: any) {
      toast({
        title: "Chyba při aktualizaci",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (sessionLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Majitel';
      case 'admin': return 'Administrátor';
      case 'staff': return 'Personál';
      case 'coach': return 'Trenér';
      case 'member': return 'Člen';
      case 'guest': return 'Host';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-primary/10 p-3 rounded-full">
                <User className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Můj profil</CardTitle>
              <CardDescription>
                Spravujte své údaje
              </CardDescription>
            </div>
            {profile && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-sm">
                  {getRoleLabel(profile.app_role)}
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  value={session?.user?.email || ''}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  E-mail nelze změnit
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Jméno a příjmení</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jan Novák"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+420 123 456 789"
                />
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Uložit změny
              </Button>
            </form>

            {profile && (
              <div className="mt-8 pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">Informace o účtu</h3>
                <div className="grid grid-cols-1 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Registrace:</span>
                    <span>{new Date(profile.created_at).toLocaleDateString('cs-CZ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Poslední aktualizace:</span>
                    <span>{new Date(profile.updated_at).toLocaleDateString('cs-CZ')}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}