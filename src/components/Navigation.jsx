import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  GamepadIcon, 
  LayoutDashboard, 
  Trophy, 
  Users, 
  Calendar, 
  Settings, 
  LogOut,
  Menu,
  X,
  Coins,
  Gift,
  Star,
  Target,
  Sparkles,
  ShoppingCart,
  ShoppingBag,
  QrCode,
  Activity,
  FileText
} from 'lucide-react';
import API_BASE from '../utils/apiBase';

export default function Navigation({ userType = 'player', currentPage = '', onPageChange }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const playerNavItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/player/dashboard' },
    { id: 'shop', label: 'Boutique', icon: ShoppingCart, href: '/player/shop' },
    { id: 'rewards', label: 'Récompenses', icon: Gift, href: '/player/rewards' },
    { id: 'my-purchases', label: 'Mes Achats', icon: ShoppingBag, href: '/player/my-purchases' },
    { id: 'my-reservations', label: 'Mes Réservations', icon: Calendar, href: '/player/my-reservations' },
    { id: 'my-session', label: 'Ma Session', icon: Activity, href: '/player/my-session' },
    { id: 'gamification', label: 'Progression', icon: Sparkles, href: '/player/gamification' },
    { id: 'leaderboard', label: 'Classements', icon: Trophy, href: '/player/leaderboard' },
    { id: 'gallery', label: 'Galerie & Actus', icon: FileText, href: '/player/gallery' },
    { id: 'profile', label: 'Mon Profil', icon: Settings, href: '/player/profile' }
  ];

  const adminNavItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, href: '/admin/dashboard' },
    { id: 'invoice-scanner', label: 'Scanner Factures', icon: QrCode, href: '/admin/invoice-scanner' },
    { id: 'sessions', label: 'Sessions Actives', icon: Activity, href: '/admin/sessions' },
    { id: 'shop', label: 'Gestion Boutique', icon: ShoppingCart, href: '/admin/shop' },
    { id: 'players', label: 'Gestion joueurs', icon: Users, href: '/admin/players' },
    { id: 'points', label: 'Règles de points', icon: Coins, href: '/admin/points' },
    { id: 'rewards', label: 'Récompenses', icon: Gift, href: '/admin/rewards' },
    { id: 'levels', label: 'Niveaux/Badges', icon: Star, href: '/admin/levels' },
    { id: 'bonuses', label: 'Bonus spéciaux', icon: Target, href: '/admin/bonuses' },
    { id: 'content', label: 'Contenu & Events', icon: FileText, href: '/admin/content' }
  ];

  const navItems = userType === 'admin' ? adminNavItems : playerNavItems;

  const handleNavClick = (item) => {
    if (onPageChange) {
      onPageChange(item.id);
    } else {
      navigate(item.href);
    }
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    document.body.classList.add('has-bottom-nav');
    return () => {
      document.body.classList.remove('has-bottom-nav');
    };
  }, []);

  // Détecter la page active depuis l'URL
  const getActivePageId = () => {
    if (currentPage) return currentPage;
    
    const path = location.pathname;
    // Correspondance exacte d'abord
    let activeItem = navItems.find(item => item.href === path);
    
    // Si pas de correspondance exacte, chercher une correspondance partielle
    if (!activeItem) {
      activeItem = navItems.find(item => path.startsWith(item.href));
    }
    
    return activeItem ? activeItem.id : '';
  };

  const activePage = getActivePageId();

  const handleLogout = () => {
    // Call backend to destroy session, then clear any stored user data
    fetch(`${API_BASE}/auth/logout.php`, { method: 'POST', credentials: 'include' })
      .catch(() => {})
      .finally(() => {
        localStorage.removeItem('userToken');
        localStorage.removeItem('userType');
        window.location.href = '/';
      });
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-slate-900/95 backdrop-blur-md border-r border-white/10 z-50">
        {/* Logo */}
        <div className="flex items-center space-x-3 p-6 border-b border-white/10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
            <GamepadIcon className="w-8 h-8 text-white relative" />
          </div>
          <div>
            <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">OnileGame</div>
            <div className="text-xs text-cyan-400 capitalize">{userType}</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Actions */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Déconnexion</span>
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-b border-white/10 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
              <GamepadIcon className="w-8 h-8 text-white relative" />
            </div>
            <div>
              <div className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-500 text-transparent bg-clip-text">OnileGame</div>
              <div className="text-xs text-cyan-400 capitalize">{userType}</div>
            </div>
          </div>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed top-[73px] left-0 right-0 border-t border-white/10 bg-slate-900/98 z-50 max-h-[calc(100vh-73px)] overflow-y-auto">
            <nav className="p-4">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleNavClick(item)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
                
                {/* Logout on mobile */}
                <li>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-red-500/20 hover:text-red-400 rounded-xl transition-all duration-200 border-t border-white/10 mt-4 pt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Déconnexion</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
    {(() => {
      const playerIds = ['dashboard', 'shop', 'my-session', 'rewards', 'profile'];
      const adminIds = ['dashboard', 'invoice-scanner', 'sessions', 'shop', 'players'];
      const ids = userType === 'admin' ? adminIds : playerIds;
      const items = ids.map(id => navItems.find(i => i.id === id)).filter(Boolean);
      return (
        <nav className="grid grid-cols-5 gap-x-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                aria-label={item.label}
                className={`flex flex-col items-center justify-center py-2 text-[10px] leading-tight ${
                  isActive ? 'text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 mb-0.5" />
                <span className="font-medium truncate max-w-[64px] px-0.5">{item.label}</span>
              </button>
            );
          })}
        </nav>
      );
    })()}
      </div>
    </>
  );
}