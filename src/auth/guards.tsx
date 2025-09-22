import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession, hasRole } from "./AuthProvider";
import { Loader2 } from "lucide-react";

export function PrivateRoute() {
  const { session, loading } = useSession();
  const loc = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return session ? <Outlet /> : <Navigate to="/login" state={{ from: loc.pathname }} replace />;
}

export function RoleRoute({ allow }: { allow: string[] }) {
  const { session } = useSession();
  return hasRole(session, allow) ? <Outlet /> : <Navigate to="/403" replace />;
}