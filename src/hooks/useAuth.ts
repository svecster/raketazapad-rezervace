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

// Helper function to normalize role
const normalizeRole = (role: string): 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner' => {
  const roleMap: Record<string, 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner'> = {
    'member': 'member',
    'guest': 'guest', 
    'coach': 'coach',
    'player': 'player',
    'staff': 'staff',
    'owner': 'owner'
  };
  return roleMap[role] || 'player';
};

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
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              console.log('Fetching user profile for:', session.user.id);
              
              // Try user_profiles first
              const { data: userProfile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', session.user.id)
                .maybeSingle();
              
              if (userProfile) {
                console.log('Found user_profiles record:', userProfile);
                const profile: UserProfile = {
                  id: userProfile.user_id,
                  name: userProfile.full_name || session.user.email || 'Uživatel',
                  email: session.user.email || '',
                  phone: userProfile.phone,
                  role: normalizeRole(userProfile.app_role),
                  created_at: userProfile.created_at
                };
                setProfile(profile);
                
                // Role-based redirect after profile is loaded
                if (event === 'SIGNED_IN') {
                  switch (profile.role) {
                    case 'owner':
                      navigate('/nastaveni');
                      break;
                    case 'staff':
                      navigate('/sprava');
                      break;
                    case 'player':
                    case 'member':
                      navigate('/profile');
                      break;
                    default:
                      navigate('/');
                  }
                }
              } else {
                // Try users table as fallback
                console.log('No user_profiles found, trying users table');
                const { data: userData, error: userError } = await supabase
                  .from('users')
                  .select('*')
                  .eq('id', session.user.id)
                  .maybeSingle();
                
                if (userData) {
                  console.log('Found users record:', userData);
                  const profile: UserProfile = {
                    id: userData.id,
                    name: userData.name || session.user.email || 'Uživatel',
                    email: userData.email || session.user.email || '',
                    phone: userData.phone,
                    role: normalizeRole(userData.role),
                    created_at: userData.created_at
                  };
                  setProfile(profile);
                  
                  // Role-based redirect
                  if (event === 'SIGNED_IN') {
                    switch (profile.role) {
                      case 'owner':
                        navigate('/nastaveni');
                        break;
                      case 'staff':
                        navigate('/sprava');
                        break;
                      case 'player':
                      case 'member':
                        navigate('/profile');
                        break;
                      default:
                        navigate('/');
                    }
                  }
                } else {
                  console.log('No profile found in either table, creating default');
                  // No profile found, create default
                  const defaultProfile: UserProfile = {
                    id: session.user.id,
                    name: session.user.email || 'Uživatel',
                    email: session.user.email || '',
                    role: 'player',
                    created_at: new Date().toISOString()
                  };
                  setProfile(defaultProfile);
                }
              }
            } catch (error) {
              console.error('Error fetching user profile:', error);
              // Create fallback profile
              const fallbackProfile: UserProfile = {
                id: session.user.id,
                name: session.user.email || 'Uživatel',
                email: session.user.email || '',
                role: 'player',
                created_at: new Date().toISOString()
              };
              setProfile(fallbackProfile);
            }
          }, 100);
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
      
      if (!session) {
        setLoading(false);
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name
          }
        }
      });

      if (error) {
        toast({
          title: 'Chyba registrace',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: 'Registrace úspěšná!',
          description: 'Zkontrolujte svůj email a potvrďte registraci.',
        });
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Chyba registrace',
        description: 'Došlo k neočekávané chybě',
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Special handling for admin@club.local - auto-assign owner role
      if (email === 'admin@club.local') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: 'Chyba přihlášení',
            description: error.message,
            variant: 'destructive'
          });
          return { error };
        }

        if (data.user) {
          // Check if user has owner role in users table
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .single();
          
          if (!userData || userData.role !== 'owner') {
            // Create or update user with owner role
            await supabase
              .from('users')
              .upsert({
                id: data.user.id,
                email: data.user.email,
                name: 'Hlavní administrátor',
                role: 'owner'
              });
          }
        }

        return { data, error: null };
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: 'Chyba přihlášení',
            description: error.message,
            variant: 'destructive'
          });
          return { error };
        }

        return { data, error: null };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Chyba přihlášení',
        description: 'Došlo k neočekávané chybě',
        variant: 'destructive'
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        toast({
          title: 'Chyba',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }
      
      toast({
        title: 'Email odeslán',
        description: 'Zkontrolujte svůj email pro další instrukce'
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
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
          title: 'Chyba',
          description: error.message,
          variant: 'destructive'
        });
        return { error };
      }
      
      toast({
        title: 'Heslo změněno',
        description: 'Vaše heslo bylo úspěšně změněno'
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Password update error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        toast({
          title: 'Chyba odhlášení',
          description: error.message,
          variant: 'destructive'
        });
      } else {
        navigate('/');
        toast({
          title: 'Odhlášení úspěšné',
          description: 'Byli jste úspěšně odhlášeni'
        });
      }
    } catch (error: any) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user || !profile) return { error: 'Uživatel není přihlášen' };

      // Update in both tables if they exist
      const promises = [];
      
      // Update in user_profiles table
      promises.push(
        supabase
          .from('user_profiles')
          .upsert({
            user_id: user.id,
            full_name: updates.name || profile.name,
            phone: updates.phone || profile.phone,
            app_role: updates.role || profile.role,
            updated_at: new Date().toISOString()
          })
      );
      
      // Update in users table
      promises.push(
        supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            name: updates.name || profile.name,
            phone: updates.phone || profile.phone,
            role: updates.role || profile.role
          })
      );

      const results = await Promise.allSettled(promises);
      console.log('Profile update results:', results);

      // Update local state
      setProfile({
        ...profile,
        ...updates
      });

      toast({
        title: 'Profil aktualizován',
        description: 'Vaše údaje byly úspěšně uloženy'
      });

      return { error: null };
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Chyba aktualizace',
        description: 'Nepodařilo se aktualizovat profil',
        variant: 'destructive'
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
    isPlayer: profile?.role === 'player' || profile?.role === 'member',
    isStaff: profile?.role === 'staff',
    isOwner: profile?.role === 'owner',
  };
};