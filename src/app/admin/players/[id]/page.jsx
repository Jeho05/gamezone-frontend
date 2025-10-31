import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navigation from '../../../../components/Navigation';
import { 
  User, 
  Mail, 
  Calendar,
  Award,
  TrendingUp,
  Activity,
  Gift,
  ArrowLeft,
  Coins,
  Clock,
  Shield,
  AlertCircle,
  UserX,
  UserCheck,
  Trash2,
  AlertTriangle,
  Ban
} from 'lucide-react';
import { toast } from 'sonner';
import API_BASE from '../../../../utils/apiBase';
import { resolveAvatarUrl } from '../../../../utils/avatarUrl';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedSanction, setSelectedSanction] = useState('warning');
  const [customReason, setCustomReason] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');
  const [deletionReason, setDeletionReason] = useState('');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/profile.php`, { 
          credentials: 'include' 
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setCurrentUser(data.user);
        }
      } catch (e) {
        console.error('Failed to fetch current user:', e);
      }
    };

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/users/admin_profile.php?id=${id}`, { 
          credentials: 'include' 
        });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data?.error || 'Échec du chargement du profil');
        }
        
        setProfile(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    if (id) {
      fetchProfile();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Diamond Elite': return 'from-cyan-500 to-blue-500';
      case 'Platinum Pro': return 'from-slate-400 to-slate-600';
      case 'Gold Gamer': return 'from-yellow-500 to-yellow-600';
      case 'Silver Star': return 'from-gray-400 to-gray-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'active') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-400/20 text-green-400 border border-green-400/30">
          Actif
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-400/20 text-red-400 border border-red-400/30">
        Inactif
      </span>
    );
  };

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-400/20 text-purple-400 border border-purple-400/30 flex items-center space-x-1">
          <Shield className="w-3 h-3" />
          <span>Administrateur</span>
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-400/20 text-blue-400 border border-blue-400/30">
        Joueur
      </span>
    );
  };

  // Toggle user status (active/inactive)
  const handleToggleStatus = async () => {
    if (!profile?.user) return;
    
    const newStatus = profile.user.status === 'active' ? 'inactive' : 'active';
    
    // If deactivating, require a reason
    if (newStatus === 'inactive' && !deactivationReason.trim()) {
      toast.error('Motif requis', {
        description: 'Le motif de désactivation est obligatoire',
        duration: 3000
      });
      return;
    }
    
    try {
      setActionLoading(true);
      
      const requestBody = { status: newStatus };
      if (newStatus === 'inactive') {
        requestBody.deactivation_reason = deactivationReason.trim();
      }
      
      const res = await fetch(`${API_BASE}/users/item.php?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || 'Échec de la mise à jour du statut');
      }
      
      // Update profile with new status
      setProfile(prev => ({
        ...prev,
        user: { ...prev.user, status: newStatus, points: newStatus === 'inactive' ? 0 : prev.user.points }
      }));
      
      setShowStatusModal(false);
      setDeactivationReason('');
      toast.success(`Compte ${newStatus === 'active' ? 'activé' : 'désactivé'}`, {
        description: `Le statut du compte a été modifié avec succès`,
        duration: 3000
      });
    } catch (e) {
      toast.error('Erreur lors de la modification du statut', {
        description: e.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Delete user permanently
  const handleDeleteUser = async () => {
    if (!profile?.user) return;
    
    // Require deletion reason
    if (!deletionReason.trim()) {
      toast.error('Motif requis', {
        description: 'Le motif de suppression est obligatoire',
        duration: 3000
      });
      return;
    }
    
    try {
      setActionLoading(true);
      
      const res = await fetch(`${API_BASE}/users/item.php?id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ deletion_reason: deletionReason.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || 'Échec de la suppression');
      }
      
      // Redirect to players list after successful deletion
      toast.success('Compte supprimé', {
        description: 'Le compte a été supprimé définitivement',
        duration: 2000
      });
      setTimeout(() => navigate('/admin/players'), 2000);
    } catch (e) {
      toast.error('Erreur lors de la suppression', {
        description: e.message
      });
      setActionLoading(false);
    }
  };

  // Apply sanction
  const handleApplySanction = async () => {
    if (!profile?.user) return;
    
    try {
      setActionLoading(true);
      
      const res = await fetch(`${API_BASE}/users/sanction.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          user_id: parseInt(id),
          sanction_type: selectedSanction,
          reason: customReason,
          custom_points: selectedSanction === 'custom' ? -100 : undefined
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data?.error || 'Échec de l\'application de la sanction');
      }
      
      // Refresh profile to show updated points
      const refreshRes = await fetch(`${API_BASE}/users/admin_profile.php?id=${id}`, { 
        credentials: 'include' 
      });
      const refreshData = await refreshRes.json();
      
      if (refreshRes.ok) {
        setProfile(refreshData);
      }
      
      setShowSanctionModal(false);
      setCustomReason('');
      toast.success('Sanction appliquée', {
        description: `Type: ${data.sanction.type} | Points déduits: ${data.sanction.points_deducted} | Nouveaux points: ${data.sanction.new_points}`,
        duration: 5000
      });
    } catch (e) {
      toast.error('Erreur lors de l\'application de la sanction', {
        description: e.message
      });
    } finally {
      setActionLoading(false);
    }
  };

  const sanctionOptions = [
    { value: 'warning', label: 'Avertissement', points: -50, description: 'Comportement inapproprié' },
    { value: 'minor_offense', label: 'Infraction mineure', points: -100, description: 'Langage inapproprié, non-respect des règles' },
    { value: 'major_offense', label: 'Infraction majeure', points: -250, description: 'Triche, comportement abusif' },
    { value: 'cheating', label: 'Triche détectée', points: -500, description: 'Utilisation de logiciels de triche' },
    { value: 'harassment', label: 'Harcèlement', points: -400, description: 'Harcèlement d\'autres joueurs' },
    { value: 'account_sharing', label: 'Partage de compte', points: -200, description: 'Partage de compte non autorisé' },
    { value: 'spam', label: 'Spam', points: -75, description: 'Messages répétitifs ou non sollicités' },
    { value: 'custom', label: 'Sanction personnalisée', points: -100, description: 'Raison personnalisée' }
  ];

  // Check if viewing own profile
  const isOwnProfile = currentUser && profile?.user && currentUser.id === profile.user.id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="admin" currentPage="players" />
        <div className="lg:pl-64">
          <div className="p-4 lg:p-8 flex items-center justify-center min-h-screen">
            <div className="text-white text-xl">Chargement...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="admin" currentPage="players" />
        <div className="lg:pl-64">
          <div className="p-4 lg:p-8">
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-6 text-red-200 flex items-center space-x-3">
              <AlertCircle className="w-6 h-6" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => navigate('/admin/players')}
              className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux joueurs</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.user) {
    return null;
  }

  const { user, statistics, recent_history } = profile;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navigation userType="admin" currentPage="players" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Back Button and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/players')}
              className="px-4 py-2 bg-white text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-2 border border-gray-200 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux joueurs</span>
            </button>

            {/* Action Buttons - Hidden if viewing own profile */}
            {!isOwnProfile && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowSanctionModal(true)}
                  className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-amber-600 transition-colors flex items-center space-x-2"
                  title="Appliquer une sanction"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Sanctionner</span>
                </button>

                {user.status === 'active' ? (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl text-orange-600 transition-colors flex items-center space-x-2"
                    title="Désactiver l'utilisateur (réinitialise les points)"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Désactiver</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-600 transition-colors flex items-center space-x-2"
                    title="Réactiver l'utilisateur"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Réactiver</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl text-red-600 transition-colors flex items-center space-x-2"
                  title="Supprimer définitivement"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>

          {/* Admin Notice */}
          {!isOwnProfile && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-700">
                  <p className="font-semibold mb-1 text-blue-700">Note pour l'administrateur :</p>
                  <p>Vous pouvez appliquer des sanctions qui réduiront les points du joueur selon la gravité de l'infraction. 
                  <strong className="text-blue-700"> Désactiver un compte réinitialise automatiquement tous les points à 0.</strong> Les sanctions disponibles incluent :
                  avertissement (-50 pts), infractions mineures/majeures, triche, harcèlement, partage de compte, spam, ou une sanction personnalisée.</p>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={resolveAvatarUrl(user.avatar_url, user.username)}
                  alt={user.username}
                  className="w-24 h-24 rounded-full border-4 border-white/20"
                />
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-r ${getLevelColor(user.level)} rounded-full flex items-center justify-center`}>
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{user.username}</h1>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>Membre depuis le {formatShortDate(user.join_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>Dernière activité: {formatShortDate(user.last_active)}</span>
                  </div>
                </div>

                {/* Level Badge */}
                <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${getLevelColor(user.level)} rounded-full text-white font-semibold shadow`}> 
                  <Award className="w-5 h-5" />
                  <span>{user.level || 'Gamer'}</span>
                </div>
              </div>

              {/* Points Display */}
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-center min-w-[200px] text-white shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Coins className="w-6 h-6 text-white" />
                  <span className="text-white font-semibold">Points Totaux</span>
                </div>
                <div className="text-4xl font-bold text-white">{user.points.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="w-6 h-6 text-emerald-500" />
                <h3 className="text-slate-900 font-semibold">Activités Totales</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{statistics.total_activities}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-500" />
                <h3 className="text-slate-900 font-semibold">Points Gagnés</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">{statistics.points_earned.toLocaleString()}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-6 h-6 text-purple-500" />
                <h3 className="text-slate-900 font-semibold">Jours Actifs</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">{statistics.active_days}</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-2">
                <Gift className="w-6 h-6 text-cyan-500" />
                <h3 className="text-slate-900 font-semibold">Récompenses Réclamées</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-600">{statistics.total_redemptions}</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <Coins className="w-6 h-6 text-orange-500" />
                <h3 className="text-slate-900 font-semibold text-lg">Points Dépensés</h3>
              </div>
              <p className="text-3xl font-bold text-orange-600">{statistics.points_spent.toLocaleString()}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-500" />
              <span>Historique Récent</span>
            </h2>
            
            {recent_history && recent_history.length > 0 ? (
              <div className="space-y-3">
                {recent_history.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-slate-50 border border-gray-200 rounded-xl p-4 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-slate-900 font-semibold">{item.action}</p>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                      </div>
                      <span className={`font-bold ${item.points_change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {item.points_change > 0 ? '+' : ''}{item.points_change}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{formatDate(item.created_at)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Aucune activité récente</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Toggle Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 max-w-md w-full shadow-xl">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              {user.status === 'active' ? 'Désactiver' : 'Réactiver'} l'utilisateur
            </h3>
            
            <p className="text-gray-600 mb-4">
              {user.status === 'active'
                ? 'La désactivation réinitialisera les points du joueur et bloquera l’accès à l’interface jusqu’à réactivation.'
                : 'La réactivation restaurera l’accès du joueur et lui permettra de gagner à nouveau des points.'}
            </p>

            {user.status === 'active' && (
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Motif de désactivation *</label>
                <textarea
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  placeholder="Expliquez pourquoi ce compte est désactivé (ce message sera affiché à l'utilisateur lors de sa tentative de connexion)"
                  rows="4"
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
                <p className="text-gray-500 text-xs mt-1">Ce message sera affiché à l'utilisateur s'il tente de se connecter.</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex-1 py-3 rounded-xl font-semibold transition-colors text-white ${
                  user.status === 'active'
                    ? 'bg-orange-500 hover:bg-orange-600'
                    : 'bg-green-500 hover:bg-green-600'
                } ${actionLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {actionLoading ? 'Traitement...' : user.status === 'active' ? 'Confirmer la désactivation' : 'Réactiver'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sanction Modal */}
      {showSanctionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-amber-200 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Appliquer une sanction</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Les sanctions retirent des points au joueur et sont enregistrées pour audit. Choisissez le niveau approprié ou définissez une sanction personnalisée.
            </p>

            <div className="space-y-4 mb-6">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Type de sanction</span>
                <select
                  value={selectedSanction}
                  onChange={(e) => setSelectedSanction(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {sanctionOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-white text-slate-900">
                      {option.label} ({option.points} pts)
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {sanctionOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`p-4 rounded-xl border ${
                      selectedSanction === option.value
                        ? 'border-amber-300 bg-amber-50'
                        : 'border-gray-200 bg-white hover:bg-amber-50'
                    } transition-colors cursor-pointer`}
                    onClick={() => setSelectedSanction(option.value)}
                  >
                    <p className="font-semibold text-slate-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                ))}
              </div>

              {selectedSanction === 'custom' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Raison personnalisée</label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Ajoutez une note spécifique sur cette sanction..."
                    rows="3"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowSanctionModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleApplySanction}
                disabled={actionLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {actionLoading ? 'Application...' : 'Appliquer la sanction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Supprimer le compte</h3>
            </div>

            <p className="text-gray-600 mb-4">
              Cette action est irréversible. Le compte sera définitivement supprimé et toutes les données liées seront perdues.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">Motif de suppression *</label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Expliquez pourquoi ce compte est supprimé (pour l'audit interne)"
                rows="3"
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
              <p className="text-gray-500 text-xs mt-1">Ce motif sera conservé dans les logs pour traçabilité.</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-3 rounded-xl font-semibold transition-colors"
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className={`flex-1 text-white py-3 rounded-xl font-semibold transition-colors ${
                  actionLoading
                    ? 'bg-red-400 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionLoading ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
