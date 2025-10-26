import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import API_BASE from '../utils/apiBase';
import { toast } from 'sonner';

/**
 * Composant wrapper pour protéger les routes admin
 * Vérifie l'authentification et redirige si nécessaire
 */
export default function AdminProtected({ children }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });
        const data = await res.json();
        
        if (!res.ok || !data?.user || data.user.role !== 'admin') {
          toast.error('Accès non autorisé. Connexion requise.');
          setTimeout(() => navigate('/auth/login'), 1500);
          return;
        }
        
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-white text-xl">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirection en cours
  }

  return <>{children}</>;
}
