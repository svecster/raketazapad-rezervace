import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users as UsersIcon, UserCog, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  user_id: string;
  full_name: string;
  phone: string;
  app_role: string;
  created_at: string;
  updated_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Chyba při načítání",
          description: "Nepodařilo se načíst seznam uživatelů",
          variant: "destructive",
        });
      } else {
        setUsers(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ app_role: newRole })
        .eq('user_id', userId);

      if (error) {
        toast({
          title: "Chyba při změně role",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Role změněna",
          description: "Role uživatele byla úspěšně aktualizována",
        });
        fetchUsers(); // Refresh the list
      }
    } catch (error: any) {
      toast({
        title: "Chyba při změně role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

  const getRoleVariant = (role: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case 'owner': return 'destructive';
      case 'admin': return 'destructive';
      case 'staff': return 'default';
      case 'coach': return 'default';
      case 'member': return 'secondary';
      case 'guest': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Správa uživatelů</h1>
          <p className="text-muted-foreground">
            Přehled registrovaných uživatelů a správa rolí
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-5 w-5 text-primary" />
              <CardTitle>Registrovaní uživatelé</CardTitle>
            </div>
            <CardDescription>
              Celkem {users.length} uživatelů
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Žádní uživatelé</p>
                <p className="text-muted-foreground">
                  Zatím se neregistroval žádný uživatel
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h3 className="font-semibold">{user.full_name || 'Bez jména'}</h3>
                          <p className="text-sm text-muted-foreground">{user.user_id}</p>
                          {user.phone && (
                            <p className="text-sm text-muted-foreground">{user.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Registrace: {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge variant={getRoleVariant(user.app_role)}>
                        {getRoleLabel(user.app_role)}
                      </Badge>
                      
                      <div className="flex items-center space-x-2">
                        <Select
                          value={user.app_role}
                          onValueChange={(newRole) => updateUserRole(user.user_id, newRole)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Člen</SelectItem>
                            <SelectItem value="coach">Trenér</SelectItem>
                            <SelectItem value="staff">Personál</SelectItem>
                            <SelectItem value="admin">Administrátor</SelectItem>
                            <SelectItem value="owner">Majitel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}