import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner';
  created_at: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();
              
              if (error) {
                console.error('Error fetching profile:', error);
              } else {
                setProfile(profile);
                
                // Role-based redirect after profile is loaded
                if (event === 'SIGNED_IN' && profile) {
                  switch (profile.role) {
                    case 'owner':
                      navigate('/admin/majitel');
                      break;
                    case 'staff':
                      navigate('/admin/obsluha');
                      break;
                    case 'player':
                      navigate('/app/hrac');
                      break;
                  }
                }
              }
            } catch (error) {
              console.error('Error in profile fetch:', error);
            }
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
          }
        }
      });

      if (error) {
        toast({
          title: "Chyba při registraci",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Registrace úspěšná",
        description: "Zkontrolujte svůj email pro potvrzení účtu.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Chyba při registraci",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validate email format
      if (!email.includes('@')) {
        toast({
          title: "Chyba při přihlášení",
          description: "Zadejte platnou emailovou adresu",
          variant: "destructive",
        });
        return { error: new Error('Invalid email format') };
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Chyba při přihlášení",
          description: error.message === 'Invalid login credentials' 
            ? 'Neplatné přihlašovací údaje' 
            : error.message,
          variant: "destructive",
        });
        return { error };
      }

      // Handle owner assignment for jsvec.jr@gmail.com
      if (email === 'jsvec.jr@gmail.com') {
        setTimeout(async () => {
          try {
            const { OwnerBootstrapService } = await import('@/services/ownerBootstrap');
            const result = await OwnerBootstrapService.assignOwnerByEmail(email);
            if (result.success) {
              // Refresh profile after owner assignment
              const { data: updatedProfile } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.user.id)
                .single();
              
              if (updatedProfile) {
                setProfile(updatedProfile);
              }
            }
          } catch (error) {
            console.error('Error assigning owner role:', error);
          }
        }, 100);
      }

      toast({
        title: "Přihlášení úspěšné",
        description: `Vítejte zpět!`,
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Chyba při přihlášení",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-heslo`
      });

      if (error) {
        toast({
          title: "Chyba při obnově hesla",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Email odeslán",
        description: "Zkontrolujte svou emailovou schránku pro odkaz na obnovu hesla.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Chyba při obnově hesla",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        toast({
          title: "Chyba při změně hesla",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Heslo změněno",
        description: "Vaše heslo bylo úspěšně změněno.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Chyba při změně hesla",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Chyba při odhlášení",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Odhlášení úspěšné",
          description: "Nashledanou!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Chyba při odhlášení",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') };

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        toast({
          title: "Chyba při aktualizaci profilu",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      setProfile(data);
      toast({
        title: "Profil aktualizován",
        description: "Vaše změny byly uloženy.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Chyba při aktualizaci profilu",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    requestPasswordReset,
    updatePassword,
    isPlayer: profile?.role === 'player',
    isStaff: profile?.role === 'staff' || profile?.role === 'owner',
    isOwner: profile?.role === 'owner',
  };
};