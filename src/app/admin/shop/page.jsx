'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../../../components/Navigation';
import ImageUpload from '../../../components/ImageUpload';
import PackageModal from '../../../components/admin/PackageModal';
import PaymentMethodModal from '../../../components/admin/PaymentMethodModal';
import { 
  Gamepad2, 
  Package, 
  CreditCard, 
  ShoppingCart,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  DollarSign,
  Calendar
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';
import { resolveGameImageUrl, isGradient, getGradientClass } from '../../../utils/gameImageUrl';

export default function AdminShop() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('games');
  const [games, setGames] = useState([]);
  const [packages, setPackages] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showGameModal, setShowGameModal] = useState(false);
  const [editingGame, setEditingGame] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [packageForm, setPackageForm] = useState({
    game_id: '',
    name: '',
    duration_minutes: 60,
    price: 0,
    original_price: null,
    points_earned: 0,
    bonus_multiplier: 1.0,
    is_promotional: false,
    promotional_label: '',
    max_purchases_per_user: null,
    is_active: true,
    display_order: 0
  });
  const [paymentForm, setPaymentForm] = useState({
    name: '',
    description: '',
    provider: 'manual',
    fee_percentage: 0,
    fee_fixed: 0,
    is_active: true,
    auto_confirm: false,
    requires_online_payment: false,
    display_order: 0
  });
  const [gameForm, setGameForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    image_url: '',
    thumbnail_url: '',
    category: 'action',
    platform: '',
    min_players: 1,
    max_players: 1,
    age_rating: '',
    points_per_hour: 10,
    base_price: 0,
    is_reservable: false,
    reservation_fee: 0,
    is_featured: false
  });
  const [submitting, setSubmitting] = useState(false);

  // Helpers: formatters for UI
  const formatPriceXOF = (value) => {
    const n = Number(value ?? 0);
    try {
      return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
    } catch {
      return `${n.toLocaleString('fr-FR')} XOF`;
    }
  };

  const loadReservations = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des réservations...');
      const res = await fetch(`${API_BASE}/admin/reservations.php`, { credentials: 'include' });
      const data = await res.json();
      console.log('📅 Réservations reçues:', data);
      if (data.reservations) {
        setReservations(data.reservations);
        console.log('✅ Réservations chargées:', data.reservations.length);
      } else {
        console.log('⚠️ Aucune réservation dans la réponse');
      }
    } catch (err) {
      console.error('❌ Erreur chargement réservations:', err);
      toast.error('Erreur chargement réservations');
    } finally {
      setLoading(false);
    }
  };

  const confirmReservation = async (reservationId) => {
    if (!confirm('Confirmer cette réservation ? Le paiement sera validé.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/reservations.php`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservationId, action: 'confirm' })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Réservation confirmée avec succès');
        loadReservations();
      } else {
        toast.error(data.error || 'Erreur lors de la confirmation');
      }
    } catch (err) {
      console.error('Erreur confirmation réservation:', err);
      toast.error('Erreur lors de la confirmation');
    }
  };

  const cancelReservation = async (reservationId) => {
    if (!confirm('Annuler cette réservation ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/reservations.php`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservationId, action: 'cancel' })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Réservation annulée');
        loadReservations();
      } else {
        toast.error(data.error || 'Erreur lors de l\'annulation');
      }
    } catch (err) {
      console.error('Erreur annulation réservation:', err);
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const markReservationCompleted = async (reservationId) => {
    if (!confirm('Marquer cette réservation comme complétée ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/reservations.php`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservationId, action: 'mark_completed' })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Réservation marquée comme complétée');
        loadReservations();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur');
    }
  };

  const markReservationNoShow = async (reservationId) => {
    if (!confirm('Marquer cette réservation comme no-show ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/reservations.php`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reservationId, action: 'mark_no_show' })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Marqué comme no-show');
        loadReservations();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      console.error('Erreur:', err);
      toast.error('Erreur');
    }
  };
  const formatNumber = (value) => Number(value ?? 0).toLocaleString('fr-FR');
  const formatDateTime = (value) => (value ? new Date(value).toLocaleString('fr-FR') : '—');

  const emptyForm = {
    name: '',
    slug: '',
    description: '',
    short_description: '',
    image_url: '',
    thumbnail_url: '',
    category: 'action',
    platform: '',
    min_players: 1,
    max_players: 1,
    age_rating: '',
    points_per_hour: 10,
    base_price: 0,
    is_reservable: false,
    reservation_fee: 0,
    is_featured: false
  };

  // Vérifier l'authentification au chargement
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
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erreur authentification:', error);
        toast.error('Erreur d\'authentification');
        setTimeout(() => navigate('/auth/login'), 1500);
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (!isAuthenticated) return; // Ne charger que si authentifié
    console.log('🔀 Onglet actif changé:', activeTab);
    if (activeTab === 'games') loadGames();
    if (activeTab === 'packages') loadPackages();
    if (activeTab === 'payment-methods') loadPaymentMethods();
    if (activeTab === 'purchases') loadPurchases();
    if (activeTab === 'reservations') loadReservations();
  }, [activeTab, isAuthenticated]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/games.php`, { credentials: 'include' });
      const data = await res.json();
      if (data.games) setGames(data.games);
    } catch (err) {
      toast.error('Erreur chargement jeux');
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des packages...');
      // Ajouter un timestamp pour éviter le cache
      const res = await fetch(`${API_BASE}/admin/game_packages.php?t=${Date.now()}`, { 
        credentials: 'include',
        cache: 'no-cache'
      });
      const data = await res.json();
      console.log('📦 Packages reçus:', data);
      if (data.packages) {
        setPackages(data.packages);
        console.log('✅ Packages chargés:', data.packages.length);
      } else {
        console.log('⚠️ Aucun package dans la réponse');
      }
    } catch (err) {
      console.error('❌ Erreur chargement packages:', err);
      toast.error('Erreur chargement packages');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des méthodes de paiement...');
      const res = await fetch(`${API_BASE}/admin/payment_methods_simple.php`, { credentials: 'include' });
      const data = await res.json();
      console.log('💳 Méthodes de paiement reçues:', data);
      if (data.payment_methods) {
        setPaymentMethods(data.payment_methods);
        console.log('✅ Méthodes chargées:', data.payment_methods.length);
      } else {
        console.log('⚠️ Aucune méthode dans la réponse');
      }
    } catch (err) {
      console.error('❌ Erreur chargement méthodes paiement:', err);
      toast.error('Erreur chargement méthodes paiement');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchases = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des achats...');
      const res = await fetch(`${API_BASE}/admin/purchases.php`, { credentials: 'include' });
      const data = await res.json();
      console.log('🛒 Achats reçus:', data);
      if (data.purchases) {
        setPurchases(data.purchases);
        console.log('✅ Achats chargés:', data.purchases.length);
      } else {
        console.log('⚠️ Aucun achat dans la réponse');
      }
    } catch (err) {
      console.error('❌ Erreur chargement achats:', err);
      toast.error('Erreur chargement achats');
    } finally {
      setLoading(false);
    }
  };

  const confirmPurchase = async (purchaseId) => {
    if (!confirm('Confirmer ce paiement ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/purchases.php`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: purchaseId, action: 'confirm_payment' })
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Paiement confirmé avec succès');
        loadPurchases();
      } else {
        toast.error(data.error || 'Erreur lors de la confirmation');
      }
    } catch (err) {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const deleteGame = async (gameId) => {
    if (!confirm('Supprimer ce jeu ? Cette action est irréversible.')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/games.php?id=${gameId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Jeu supprimé avec succès');
        loadGames();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deletePackage = async (packageId) => {
    if (!confirm('Supprimer ce package ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/game_packages.php?id=${packageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Package supprimé avec succès');
        loadPackages();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const deletePaymentMethod = async (methodId) => {
    if (!confirm('Supprimer cette méthode de paiement ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/payment_methods_simple.php?id=${methodId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await res.json();
      if (data.success) {
        toast.success('Méthode supprimée avec succès');
        loadPaymentMethods();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleGameFormChange = (field, value) => {
    setGameForm(prev => ({ ...prev, [field]: value }));
    // Auto-generate slug from name (only when creating, not editing)
    if (field === 'name' && !editingGame && !gameForm.slug) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setGameForm(prev => ({ ...prev, slug }));
    }
  };

  const handleOpenCreateModal = () => {
    setEditingGame(null);
    setGameForm(emptyForm);
    setShowGameModal(true);
  };

  const handleOpenEditModal = (game) => {
    setEditingGame(game);
    setGameForm({
      name: game.name || '',
      slug: game.slug || '',
      description: game.description || '',
      short_description: game.short_description || '',
      image_url: game.image_url || '',
      thumbnail_url: game.thumbnail_url || '',
      category: game.category || 'action',
      platform: game.platform || '',
      min_players: game.min_players || 1,
      max_players: game.max_players || 1,
      age_rating: game.age_rating || '',
      points_per_hour: game.points_per_hour || 10,
      base_price: parseFloat(game.base_price) || 0,
      is_reservable: game.is_reservable == 1,
      reservation_fee: parseFloat(game.reservation_fee) || 0,
      is_featured: game.is_featured == 1
    });
    setShowGameModal(true);
  };

  const handleCreateGame = async (e) => {
    e.preventDefault();
    
    if (!gameForm.name) {
      toast.error('Le nom du jeu est requis');
      return;
    }
    
    // Générer le slug automatiquement si non fourni
    const slug = gameForm.slug || gameForm.name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/admin/games.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...gameForm,
          slug: slug
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Jeu créé avec succès !');
        setShowGameModal(false);
        setGameForm(emptyForm);
        setEditingGame(null);
        loadGames();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      toast.error('Erreur lors de la création du jeu');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateGame = async (e) => {
    e.preventDefault();
    
    if (!gameForm.name) {
      toast.error('Le nom du jeu est requis');
      return;
    }
    
    // Générer le slug automatiquement si non fourni
    const slug = gameForm.slug || gameForm.name.toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/admin/games.php`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingGame.id,
          ...gameForm,
          slug: slug
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success('Jeu mis à jour avec succès !');
        setShowGameModal(false);
        setGameForm(emptyForm);
        setEditingGame(null);
        loadGames();
      } else {
        toast.error(data.error || 'Erreur lors de la mise à jour');
      }
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du jeu');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'games', label: 'Jeux', icon: Gamepad2 },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'payment-methods', label: 'Paiements', icon: CreditCard },
    { id: 'purchases', label: 'Achats', icon: ShoppingCart },
    { id: 'reservations', label: 'Réservations', icon: Calendar }
  ];

  // Afficher loading pendant vérification auth
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="inline-block h-16 w-16 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin"></div>
          <p className="text-slate-600 text-lg font-semibold">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navigation userType="admin" />
      
      {/* Main Content with Sidebar Offset */}
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-gray-900">
            <h1 className="text-3xl font-bold text-purple-700 mb-2 flex items-center gap-3">
              <Gamepad2 className="w-8 h-8" />
              Gestion Boutique de Jeux
            </h1>
            <p className="text-gray-600">Gérez vos jeux, packages et méthodes de paiement</p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mt-6 border-b border-gray-200 pb-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold border-b-2 rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-700 bg-purple-50'
                        : 'border-transparent text-gray-500 hover:text-purple-600 hover:bg-purple-50/60'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Games Tab */}
          {activeTab === 'games' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-gray-900">
            <div className="flex justify-between items-center mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un jeu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ajouter Jeu
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Chargement des jeux...</p>
              </div>
            ) : games.length === 0 ? (
              <div className="text-center py-12">
                <Gamepad2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun jeu disponible</h3>
                <p className="text-gray-500 mb-4">Commencez par créer votre premier jeu</p>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-5 h-5" />
                  Créer le Premier Jeu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {games.map((game) => {
                  const resolvedImage = resolveGameImageUrl(game.image_url || game.thumbnail_url, game.slug || game.name);
                  const fallbackImage = `https://via.placeholder.com/600x400?text=${encodeURIComponent(game.name || 'Jeu')}`;
                  const isGradientBg = isGradient(resolvedImage);
                  const gradientClass = isGradientBg ? getGradientClass(resolvedImage) : '';

                  return (
                    <div
                      key={game.id}
                      className="group rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow bg-white"
                    >
                      <div className="relative h-44">
                        {isGradientBg ? (
                          <div className={`w-full h-full bg-gradient-to-br ${gradientClass} flex items-center justify-center text-white text-3xl font-bold`}> 
                            {game.name?.charAt(0) || '🎮'}
                          </div>
                        ) : (
                          <img
                            src={resolvedImage}
                            alt={game.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = fallbackImage;
                            }}
                          />
                        )}
                        {game.is_featured == 1 && (
                          <div className="absolute top-3 right-3 bg-white/95 text-purple-600 text-xs font-semibold px-3 py-1 rounded-full shadow">
                            ⭐ Mis en avant
                          </div>
                        )}
                      </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2">{game.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{game.short_description}</p>
                      <div className="flex gap-2 mb-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          game.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {game.is_active == 1 ? 'Actif' : 'Inactif'}
                        </span>
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 capitalize">
                          {game.category}
                        </span>
                        {game.is_reservable == 1 && (
                          <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700">
                            Réservable
                          </span>
                        )}
                      </div>
                      <div className="text-sm mb-3">
                        <strong>{game.points_per_hour} pts/h</strong> • 
                        <strong> {game.base_price} XOF/h</strong>
                      </div>
                      {game.is_reservable == 1 && (
                        <div className="text-xs text-gray-600 mb-3">
                          Frais de réservation: <strong className="text-purple-700">{game.reservation_fee} XOF</strong>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mb-3">
                        📦 {game.active_packages_count || 0} packages • 
                        🛒 {game.total_purchases || 0} achats
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenEditModal(game)}
                          className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          <Edit className="w-4 h-4 inline-block mr-1" />
                          Modifier
                        </button>
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          )}

          {/* Packages Tab */}
          {activeTab === 'packages' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-gray-900">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setShowPackageModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
                Ajouter Package
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Chargement des packages...</p>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun package</h3>
                <p className="text-gray-500 mb-4">Commencez par ajouter un package de jeu</p>
                <button
                  onClick={() => {
                    setEditingPackage(null);
                    setShowPackageModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter le Premier Package
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Jeu</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Package</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Durée</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Prix</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Points</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Achats</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Revenus</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {packages.map((pkg) => (
                      <tr key={pkg.id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50/60">
                        <td className="px-4 py-3 text-sm max-w-[220px]"><div className="truncate" title={pkg.game_name}>{pkg.game_name}</div></td>
                        <td className="px-4 py-3 text-sm font-medium max-w-[260px]"><div className="truncate" title={pkg.name}>{pkg.name}</div></td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">{formatNumber(pkg.duration_minutes)} min</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatPriceXOF(pkg.price)}</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatNumber(pkg.points_earned)} pts</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatNumber(pkg.purchases_count ?? 0)}</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{pkg.revenue != null ? formatPriceXOF(pkg.revenue) : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            pkg.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {pkg.is_active == 1 ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingPackage(pkg);
                              setShowPackageModal(true);
                            }}
                            className="text-blue-600 hover:underline text-sm mr-3 font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deletePackage(pkg.id)}
                            className="text-red-600 hover:underline text-sm font-medium"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* Payment Methods Tab */}
          {activeTab === 'payment-methods' && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 text-gray-900">
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  setEditingPayment(null);
                  setShowPaymentModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Plus className="w-5 h-5" />
                Ajouter Méthode
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Chargement des méthodes de paiement...</p>
              </div>
            ) : paymentMethods.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune méthode de paiement</h3>
                <p className="text-gray-500 mb-4">Ajoutez une première méthode de paiement</p>
                <button
                  onClick={() => {
                    setEditingPayment(null);
                    setShowPaymentModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter la Première Méthode
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Nom</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Slug</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Provider</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Type</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Frais</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {paymentMethods.map((pm) => (
                      <tr key={pm.id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50/60">
                        <td className="px-4 py-3 text-sm font-medium max-w-[240px]"><div className="truncate" title={pm.name}>{pm.name}</div></td>
                        <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{pm.slug || '—'}</td>
                        <td className="px-4 py-3 text-sm">{pm.provider || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm">{pm.requires_online_payment ? '🌐 En ligne' : '🏪 Sur place'}</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatNumber(pm.fee_percentage ?? 0)}% + {formatPriceXOF(pm.fee_fixed ?? 0)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            pm.is_active == 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {pm.is_active == 1 ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setEditingPayment(pm);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:underline text-sm mr-3 font-medium"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => deletePaymentMethod(pm.id)}
                            className="text-red-600 hover:underline text-sm font-medium"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* Purchases Tab */}
          {activeTab === 'purchases' && (
          <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
                <p className="text-gray-600 mt-4">Chargement des achats...</p>
              </div>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun achat</h3>
                <p className="text-gray-500">Les achats des joueurs apparaîtront ici</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Jeu</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Durée</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Prix</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Méthode</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Paiement</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-900">
                    {purchases.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50/60">
                        <td className="px-4 py-3 text-sm font-medium max-w-[220px]"><div className="truncate" title={p.username}>{p.username}</div></td>
                        <td className="px-4 py-3 text-sm max-w-[260px]"><div className="truncate" title={p.game_name}>{p.game_name}</div></td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatNumber(p.duration_minutes)} min</td>
                        <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatPriceXOF(p.price)}</td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">{p.payment_method_name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded font-medium ${
                            p.payment_status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : p.payment_status === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDateTime(p.created_at)}</td>
                        <td className="px-4 py-3">
                          {p.payment_status === 'pending' && (
                            <button
                              onClick={() => confirmPurchase(p.id)}
                              className="text-green-600 hover:underline text-sm flex items-center gap-1 font-medium"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirmer
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
      <div className="bg-white rounded-xl shadow-lg p-6 text-gray-900">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Chargement des réservations...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucune réservation</h3>
            <p className="text-gray-500">Les réservations des joueurs apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Jeu</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Fin</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Durée</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 sticky top-0 bg-gray-50 z-10">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Prix</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Frais</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 whitespace-nowrap sticky top-0 bg-gray-50 z-10">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                {reservations.map((r) => (
                  <tr key={r.id} className="border-b hover:bg-gray-50 odd:bg-white even:bg-gray-50/60">
                    <td className="px-4 py-3 text-sm font-medium max-w-[220px]"><div className="truncate" title={r.username}>{r.username}</div></td>
                    <td className="px-4 py-3 text-sm max-w-[260px]"><div className="truncate" title={r.game_name}>{r.game_name}</div></td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDateTime(r.scheduled_start)}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDateTime(r.scheduled_end)}</td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatNumber(r.duration_minutes)} min</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded font-medium ${
                        r.status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : r.status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : r.status === 'no_show'
                          ? 'bg-gray-200 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatPriceXOF(r.base_price)}</td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatPriceXOF(r.reservation_fee)}</td>
                    <td className="px-4 py-3 text-sm text-right whitespace-nowrap">{formatPriceXOF(r.total_price)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {r.status === 'pending_payment' && (
                          <>
                            <button
                              onClick={() => confirmReservation(r.id)}
                              className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                              title="Confirmer la réservation"
                            >
                              ✓ Confirmer
                            </button>
                            <button
                              onClick={() => cancelReservation(r.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              title="Annuler la réservation"
                            >
                              ✕ Annuler
                            </button>
                          </>
                        )}
                        {r.status === 'paid' && (
                          <>
                            <button
                              onClick={() => markReservationCompleted(r.id)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                              title="Marquer comme complétée"
                            >
                              ✓ Complétée
                            </button>
                            <button
                              onClick={() => markReservationNoShow(r.id)}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                              title="Marquer comme no-show"
                            >
                              ⊘ No-show
                            </button>
                            <button
                              onClick={() => cancelReservation(r.id)}
                              className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                              title="Annuler"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        {(r.status === 'cancelled' || r.status === 'completed' || r.status === 'no_show') && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* Game Form Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-600">
                {editingGame ? 'Modifier le Jeu' : 'Ajouter un Nouveau Jeu'}
              </h2>
              <button
                onClick={() => {
                  setShowGameModal(false);
                  setEditingGame(null);
                  setGameForm(emptyForm);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={editingGame ? handleUpdateGame : handleCreateGame} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Nom du Jeu *</label>
                  <input
                    type="text"
                    required
                    value={gameForm.name}
                    onChange={(e) => handleGameFormChange('name', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: FIFA 2024"
                  />
                </div>

                {/* Slug */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Slug (URL) - Auto-généré</label>
                  <input
                    type="text"
                    value={gameForm.slug}
                    onChange={(e) => handleGameFormChange('slug', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50"
                    placeholder="Laissez vide pour génération automatique"
                  />
                  <p className="text-xs text-gray-500 mt-1">Si vide, sera généré automatiquement à partir du nom</p>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description Courte</label>
                  <input
                    type="text"
                    value={gameForm.short_description}
                    onChange={(e) => handleGameFormChange('short_description', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Jeu de football avec tous les championnats officiels"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description Complète</label>
                  <textarea
                    value={gameForm.description}
                    onChange={(e) => handleGameFormChange('description', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder="Description détaillée du jeu..."
                  />
                </div>

                {/* Image Upload */}
                <div className="md:col-span-2">
                  <ImageUpload
                    label="Image du Jeu"
                    value={gameForm.image_url}
                    onChange={(url) => handleGameFormChange('image_url', url)}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Catégorie *</label>
                  <select
                    value={gameForm.category}
                    onChange={(e) => handleGameFormChange('category', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="action">Action</option>
                    <option value="adventure">Adventure</option>
                    <option value="sports">Sports</option>
                    <option value="racing">Racing</option>
                    <option value="strategy">Strategy</option>
                    <option value="rpg">RPG</option>
                    <option value="fighting">Fighting</option>
                    <option value="simulation">Simulation</option>
                    <option value="vr">VR</option>
                    <option value="retro">Retro</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Platform */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Plateforme</label>
                  <input
                    type="text"
                    value={gameForm.platform}
                    onChange={(e) => handleGameFormChange('platform', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="PS5, Xbox, PC..."
                  />
                </div>

                {/* Min Players */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Joueurs Min</label>
                  <input
                    type="number"
                    min="1"
                    value={gameForm.min_players}
                    onChange={(e) => handleGameFormChange('min_players', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Max Players */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Joueurs Max</label>
                  <input
                    type="number"
                    min="1"
                    value={gameForm.max_players}
                    onChange={(e) => handleGameFormChange('max_players', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Age Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Classification d'âge</label>
                  <input
                    type="text"
                    value={gameForm.age_rating}
                    onChange={(e) => handleGameFormChange('age_rating', e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="PEGI 3, 12, 18..."
                  />
                </div>

                {/* Points per Hour */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Points par Heure</label>
                  <input
                    type="number"
                    min="0"
                    value={gameForm.points_per_hour}
                    onChange={(e) => handleGameFormChange('points_per_hour', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Base Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Prix de Base (XOF/h)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={gameForm.base_price}
                    onChange={(e) => handleGameFormChange('base_price', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Reservable Checkbox */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gameForm.is_reservable}
                      onChange={(e) => handleGameFormChange('is_reservable', e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">Jeu réservable (avec créneau horaire)</span>
                  </label>
                </div>

                {/* Reservation Fee (shown only if reservable) */}
                {gameForm.is_reservable && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Frais de Réservation (XOF)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={gameForm.reservation_fee}
                      onChange={(e) => handleGameFormChange('reservation_fee', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Ex: 500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Frais supplémentaires pour réserver un créneau horaire précis</p>
                  </div>
                )}

                {/* Featured */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gameForm.is_featured}
                      onChange={(e) => handleGameFormChange('is_featured', e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                    />
                    <span className="text-sm font-semibold text-gray-900">Mettre en avant (Featured)</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowGameModal(false);
                    setEditingGame(null);
                    setGameForm(emptyForm);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                  disabled={submitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting 
                    ? (editingGame ? 'Mise à jour...' : 'Création...') 
                    : (editingGame ? 'Mettre à Jour' : 'Créer le Jeu')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Package Modal */}
      <PackageModal
        isOpen={showPackageModal}
        onClose={() => {
          setShowPackageModal(false);
          setEditingPackage(null);
        }}
        editingPackage={editingPackage}
        games={games}
        onSuccess={loadPackages}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setEditingPayment(null);
        }}
        editingPayment={editingPayment}
        onSuccess={loadPaymentMethods}
      />
    </div>
  );
}
