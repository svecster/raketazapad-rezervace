import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Ctx = { session: any; loading: boolean };
const AuthCtx = createContext<Ctx>({ session: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { 
      setSession(data.session); 
      setLoading(false); 
    });
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setLoading(false);
    });
    
    return () => sub.subscription.unsubscribe();
  }, []);

  return <AuthCtx.Provider value={{ session, loading }}>{children}</AuthCtx.Provider>;
}

export const useSession = () => useContext(AuthCtx);

export const hasRole = (session: any, roles: string[]) => {
  const r = session?.user?.app_metadata?.app_role || session?.user?.user_metadata?.app_role;
  return roles.includes(r);
};