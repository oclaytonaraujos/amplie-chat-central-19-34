
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';

export function useNavigationTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isSuperAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    // Aguardar carregamento completo antes de tomar decisões de navegação
    if (authLoading || roleLoading) {
      return;
    }

    // Redirecionar usuários não autenticados para páginas protegidas
    if (!user && !['/', '/auth'].includes(location.pathname)) {
      navigate('/auth', { replace: true });
      return;
    }

    // Redirecionar usuários autenticados da página de auth
    if (user && location.pathname === '/auth') {
      navigate('/painel', { replace: true });
      return;
    }

    // Verificar acesso à página de super admin
    if (location.pathname === '/admin') {
      if (!user) {
        navigate('/auth', { replace: true });
        return;
      }
      
      if (!isSuperAdmin) {
        navigate('/painel', { replace: true });
        return;
      }
    }

    // Redirecionar página inicial para painel
    if (location.pathname === '/' && user) {
      navigate('/painel', { replace: true });
      return;
    }
  }, [location.pathname, user, isSuperAdmin, authLoading, roleLoading, navigate]);

  return {
    currentPath: location.pathname,
    canAccessSuperAdmin: isSuperAdmin,
    isAuthenticated: !!user
  };
}
