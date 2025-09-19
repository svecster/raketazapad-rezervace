import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RouteGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: 'player' | 'staff' | 'owner';
  allowedRoles?: Array<'player' | 'staff' | 'owner'>;
}

export const RouteGuard = ({ 
  children, 
  requireAuth = false, 
  requiredRole, 
  allowedRoles 
}: RouteGuardProps) => {
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

  // Redirect to entry page if authentication is required but user is not logged in
  if (requireAuth && !user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check role permissions
  if (user && profile && (requiredRole || allowedRoles)) {
    const hasRequiredRole = requiredRole ? profile.role === requiredRole : true;
    const hasAllowedRole = allowedRoles ? allowedRoles.includes(profile.role) : true;
    
    if (!hasRequiredRole || !hasAllowedRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-destructive/10 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl">Přístup zamítnut</CardTitle>
              <CardDescription>
                Nemáte oprávnění pro přístup k této části aplikace.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Vaše role: <span className="font-medium">
                  {profile.role === 'owner' && 'Majitel'}
                  {profile.role === 'staff' && 'Personál'}
                  {profile.role === 'player' && 'Hráč'}
                </span>
              </p>
              <Button 
                onClick={() => window.history.back()} 
                variant="outline" 
                className="mr-2"
              >
                Zpět
              </Button>
              <Button 
                onClick={() => window.location.href = '/'} 
                className="btn-tennis"
              >
                Domů
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return <>{children}</>;
};