import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      await supabase.auth.signOut();
      navigate("/");
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Odhlašování...</p>
      </div>
    </div>
  );
}