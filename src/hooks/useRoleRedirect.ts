import { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';

export const useRoleRedirect = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && profile) {
      // Role-based redirect after successful authentication
      switch (profile.role) {
        case 'owner':
          navigate('/admin/majitel', { replace: true });
          break;
        case 'staff':
          navigate('/admin/obsluha', { replace: true });
          break;
        case 'player':
          navigate('/app/hrac', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
      }
    }
  }, [user, profile, loading, navigate]);

  return { user, profile, loading };
};