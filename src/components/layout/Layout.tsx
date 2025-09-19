import { ReactNode } from 'react';
import { Header } from './Header';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'player' | 'staff' | 'owner';
}

export const Layout = ({ children, requireAuth = false, requiredRole }: LayoutProps) => {
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
  if (requiredRole && profile) {
    if (requiredRole === 'staff' && !['staff', 'owner'].includes(profile.role)) {
      return <Navigate to="/" replace />;
    }
    if (requiredRole === 'owner' && profile.role !== 'owner') {
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