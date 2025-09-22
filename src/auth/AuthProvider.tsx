import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ctx = { session: any; loading: boolean; appRole: string | null; refreshRole: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ session: null, loading: true, appRole: null, refreshRole: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appRole, setAppRole] = useState<string | null>(null);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('app_role')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      
      return data?.app_role || null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  };

  const refreshRole = async () => {
    if (session?.user?.id) {
      const role = await fetchUserRole(session.user.id);
      setAppRole(role);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      
      if (data.session?.user?.id) {
        const role = await fetchUserRole(data.session.user.id);
        setAppRole(role);
      }
      
      setLoading(false);
    };

    initializeAuth();
    
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      
      if (s?.user?.id) {
        const role = await fetchUserRole(s.user.id);
        setAppRole(role);
      } else {
        setAppRole(null);
      }
      
      setLoading(false);
    });
    
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={{ session, loading, appRole, refreshRole }}>{children}</AuthCtx.Provider>;
}

export const useSession = () => useContext(AuthCtx);

export const hasRole = (session: any, roles: string[], appRole?: string | null) => {
  // Prioritize appRole from context (database), fall back to session metadata
  const role = appRole || session?.user?.app_metadata?.app_role || session?.user?.user_metadata?.app_role;
  return role && roles.includes(role);
};