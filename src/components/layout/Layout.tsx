import { ReactNode } from 'react';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'player' | 'staff' | 'owner';
  allowedRoles?: Array<'player' | 'staff' | 'owner'>;
}

export const Layout = ({ children, requireAuth = false, requiredRole, allowedRoles }: LayoutProps) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Redirect if user doesn't have required role
  if (profile && (requiredRole || allowedRoles)) {
    const hasRequiredRole = requiredRole ? profile.role === requiredRole : true;
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(profile.role) : true;
    
    if (!hasRequiredRole || !hasAllowedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
};