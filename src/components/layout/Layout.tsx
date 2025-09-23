import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner';
  allowedRoles?: Array<'guest' | 'member' | 'coach' | 'player' | 'staff' | 'owner'>;
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect if user doesn't have required role
  if (profile && (requiredRole || allowedRoles)) {
    const hasRequiredRole = requiredRole ? profile.role === requiredRole : true;
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(profile.role) : true;
    
    if (!hasRequiredRole || !hasAllowedRole) {
      return <Navigate to="/403" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <main className="flex-1">
        <div className="container mx-auto py-6 px-4">
          {children}
        </div>
      </main>
    </div>
  );
};