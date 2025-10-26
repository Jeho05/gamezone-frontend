import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import API_BASE from '../utils/apiBase';
import { toast } from 'sonner';

/**
 * Hook personnalisé pour vérifier l'authentification admin
 * Redirige vers /auth/login si non connecté ou non admin
 */
export function useAdminAuth() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });
        const data = await res.json();
        
        if (!res.ok || !data?.user || data.user.role !== 'admin') {
          toast.error('Accès non autorisé. Redirection...');
          setTimeout(() => navigate('/auth/login'), 1500);
          return;
        }
        
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur authentification:', error);
        toast.error('Erreur d\'authentification');
        setTimeout(() => navigate('/auth/login'), 1500);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  return { isAuthenticated, isLoading, user };
}
