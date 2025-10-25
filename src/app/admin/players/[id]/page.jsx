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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="players" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Back Button and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <button
              onClick={() => navigate('/admin/players')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour aux joueurs</span>
            </button>

            {/* Action Buttons - Hidden if viewing own profile */}
            {!isOwnProfile && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setShowSanctionModal(true)}
                  className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 rounded-xl text-yellow-400 transition-colors flex items-center space-x-2"
                  title="Appliquer une sanction"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Sanctionner</span>
                </button>

                {user.status === 'active' ? (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 rounded-xl text-orange-400 transition-colors flex items-center space-x-2"
                    title="Désactiver l'utilisateur (réinitialise les points)"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Désactiver</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowStatusModal(true)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-xl text-green-400 transition-colors flex items-center space-x-2"
                    title="Réactiver l'utilisateur"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Réactiver</span>
                  </button>
                )}
                
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl text-red-400 transition-colors flex items-center space-x-2"
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
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-2xl p-4 mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-200">
                  <p className="font-semibold mb-1">Note pour l'administrateur :</p>
                  <p>Vous pouvez appliquer des sanctions qui réduiront les points du joueur selon la gravité de l'infraction. 
                  <strong className="text-blue-100"> Désactiver un compte réinitialise automatiquement tous les points à 0.</strong> Les sanctions disponibles incluent :
                  avertissement (-50 pts), infractions mineures/majeures, triche, harcèlement, partage de compte, spam, ou une sanction personnalisée.</p>
                </div>
              </div>
            </div>
          )}

          {/* Header Section */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
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
                  <h1 className="text-3xl font-bold text-white">{user.username}</h1>
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Membre depuis le {formatShortDate(user.join_date)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Dernière activité: {formatShortDate(user.last_active)}</span>
                  </div>
                </div>

                {/* Level Badge */}
                <div className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${getLevelColor(user.level)} rounded-full text-white font-semibold`}>
                  <Award className="w-5 h-5" />
                  <span>{user.level || 'Gamer'}</span>
                </div>
              </div>

              {/* Points Display */}
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-center min-w-[200px]">
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
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="w-6 h-6 text-green-400" />
                <h3 className="text-white font-semibold">Activités Totales</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">{statistics.total_activities}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-400" />
                <h3 className="text-white font-semibold">Points Gagnés</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">{statistics.points_earned.toLocaleString()}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="w-6 h-6 text-purple-400" />
                <h3 className="text-white font-semibold">Jours Actifs</h3>
              </div>
              <p className="text-3xl font-bold text-purple-400">{statistics.active_days}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-2">
                <Gift className="w-6 h-6 text-cyan-400" />
                <h3 className="text-white font-semibold">Récompenses Réclamées</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-400">{statistics.total_redemptions}</p>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Coins className="w-6 h-6 text-orange-400" />
                <h3 className="text-white font-semibold text-lg">Points Dépensés</h3>
              </div>
              <p className="text-3xl font-bold text-orange-400">{statistics.points_spent.toLocaleString()}</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-400" />
              <span>Historique Récent</span>
            </h2>
            
            {recent_history && recent_history.length > 0 ? (
              <div className="space-y-3">
                {recent_history.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white font-medium">{item.description}</p>
                        <p className="text-gray-400 text-sm">{formatDate(item.created_at)}</p>
                      </div>
                      <div className={`flex items-center space-x-1 ${item.points >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        <Coins className="w-4 h-4" />
                        <span className="font-bold text-lg">
                          {item.points >= 0 ? '+' : ''}{item.points}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">Aucune activité récente</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Toggle Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">
              {user.status === 'active' ? 'Désactiver' : 'Réactiver'} l'utilisateur
            </h3>
            
            <p className="text-gray-300 mb-2">
              {user.status === 'active' 
                ? `Êtes-vous sûr de vouloir désactiver ${user.username} ? L'utilisateur ne pourra plus se connecter.`
                : `Êtes-vous sûr de vouloir réactiver ${user.username} ? L'utilisateur pourra à nouveau se connecter.`
              }
            </p>
            
            {user.status === 'active' && (
              <>
                <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-3 mb-4">
                  <p className="text-orange-200 text-sm">
                    <strong className="text-orange-400">⚠️ Attention :</strong> La désactivation réinitialisera automatiquement tous les points de l'utilisateur à 0.
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Motif de désactivation <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={deactivationReason}
                    onChange={(e) => setDeactivationReason(e.target.value)}
                    placeholder="Expliquez pourquoi ce compte est désactivé (ce message sera affiché à l'utilisateur lors de sa tentative de connexion)"
                    rows="4"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">Ce message sera affiché à l'utilisateur s'il tente de se connecter.</p>
                </div>
              </>
            )}
            
            {user.status === 'inactive' && (
              <p className="text-gray-400 text-sm mb-6">Les points ne seront pas restaurés lors de la réactivation.</p>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setDeactivationReason('');
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleToggleStatus}
                disabled={actionLoading}
                className={`flex-1 ${
                  user.status === 'active'
                    ? 'bg-orange-600 hover:bg-orange-700'
                    : 'bg-green-600 hover:bg-green-700'
                } disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors`}
              >
                {actionLoading ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sanction Modal */}
      {showSanctionModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md border border-yellow-400/30 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-yellow-500/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Appliquer une sanction
              </h3>
            </div>
            
            <p className="text-gray-300 mb-4">
              Sanctionnez <strong className="text-white">{user.username}</strong> pour comportement inapproprié.
            </p>

            {/* Sanction Type Selection */}
            <div className="mb-4">
              <label className="block text-white font-semibold mb-2">Type de sanction :</label>
              <select
                value={selectedSanction}
                onChange={(e) => setSelectedSanction(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                {sanctionOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-slate-800">
                    {option.label} ({option.points} points)
                  </option>
                ))}
              </select>
            </div>

            {/* Description of selected sanction */}
            <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg p-3 mb-4">
              <p className="text-yellow-200 text-sm">
                <strong>Description :</strong> {sanctionOptions.find(s => s.value === selectedSanction)?.description}
              </p>
              <p className="text-yellow-300 text-sm mt-1">
                <strong>Points qui seront déduits :</strong> {Math.abs(sanctionOptions.find(s => s.value === selectedSanction)?.points || 0)}
              </p>
            </div>

            {/* Custom Reason */}
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Raison personnalisée (optionnel) :
              </label>
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Ajoutez une note spécifique sur cette sanction..."
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowSanctionModal(false);
                  setCustomReason('');
                  setSelectedSanction('warning');
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApplySanction}
                disabled={actionLoading}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                {actionLoading ? 'Application...' : 'Appliquer la sanction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md border border-red-400/30 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-white">
                Supprimer l'utilisateur
              </h3>
            </div>
            
            <p className="text-gray-300 mb-2">
              <strong className="text-red-400">Attention :</strong> Cette action est irréversible !
            </p>
            <p className="text-gray-300 mb-4">
              Êtes-vous absolument sûr de vouloir supprimer définitivement <strong className="text-white">{user.username}</strong> ?
              Toutes les données associées seront perdues.
            </p>
            
            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">
                Motif de suppression <span className="text-red-400">*</span>
              </label>
              <textarea
                value={deletionReason}
                onChange={(e) => setDeletionReason(e.target.value)}
                placeholder="Expliquez pourquoi ce compte est supprimé (pour l'audit interne)"
                rows="3"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
              <p className="text-gray-400 text-xs mt-1">Ce motif sera conservé dans les logs pour traçabilité.</p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletionReason('');
                }}
                disabled={actionLoading}
                className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold transition-colors"
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
