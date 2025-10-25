import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/Navigation';
import { 
  Users, 
  Search, 
  Plus,
  Minus,
  Edit3,
  Eye,
  Coins,
  Star,
  Calendar,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import API_BASE from '../../../utils/apiBase';
import { resolveAvatarUrl } from '../../../utils/avatarUrl';

export default function PlayersManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [pointsToAdd, setPointsToAdd] = useState(0);
  const [playersData, setPlayersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPlayers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/users/index.php?limit=100`, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec du chargement des joueurs');
      const items = (data.items || []).map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        avatar: resolveAvatarUrl(u.avatar_url, u.username),
        points: u.points ?? 0,
        level: u.level || 'Gamer',
        joinDate: u.join_date || '',
        lastActive: u.last_active || '',
        totalSessions: u.totalSessions || 0,
        status: u.status || 'active',
      }));
      setPlayersData(items);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const filteredPlayers = playersData.filter(player => {
    const matchesSearch = player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    return matchesSearch && player.status === selectedFilter;
  });

  const handlePointsAdjustment = (player, action) => {
    setSelectedPlayer(player);
    setShowPointsModal(true);
  };

  const applyPointsChange = async () => {
    if (selectedPlayer && pointsToAdd !== 0) {
      try {
        const res = await fetch(`${API_BASE}/points/adjust.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ user_id: selectedPlayer.id, amount: pointsToAdd, reason: 'Ajustement admin', type: 'adjustment' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Échec de l\'ajustement');
        setPlayersData(prev => prev.map(player => 
          player.id === selectedPlayer.id 
            ? { ...player, points: Math.max(0, player.points + pointsToAdd) }
            : player
        ));
        toast.success('Points ajustés avec succès', {
          description: `${pointsToAdd > 0 ? '+' : ''}${pointsToAdd} points pour ${selectedPlayer.username}`,
          duration: 3000
        });
      } catch (e) {
        toast.error('Erreur lors de l\'ajustement', { description: e.message });
      } finally {
        setShowPointsModal(false);
        setPointsToAdd(0);
        setSelectedPlayer(null);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Diamond Elite': return 'text-cyan-400 bg-cyan-400/20';
      case 'Platinum Pro': return 'text-slate-300 bg-slate-300/20';
      case 'Gold Gamer': return 'text-yellow-400 bg-yellow-400/20';
      case 'Silver Star': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'text-green-400 bg-green-400/20 border-green-400/30'
      : 'text-red-400 bg-red-400/20 border-red-400/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="players" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
              <Users className="w-10 h-10 text-blue-400" />
              <span>Gestion des Joueurs</span>
            </h1>
            <p className="text-gray-300">Gérez les comptes et points de vos joueurs</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par pseudo ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
              </div>

              {/* Filter */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    selectedFilter === 'all'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>Tous</span>
                </button>
                <button
                  onClick={() => setSelectedFilter('active')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    selectedFilter === 'active'
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Actifs
                </button>
                <button
                  onClick={() => setSelectedFilter('inactive')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                    selectedFilter === 'inactive'
                      ? 'bg-gradient-to-r from-red-600 to-red-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  Inactifs
                </button>
              </div>
            </div>
          </div>

          {/* Players Table */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              {error && (
                <div className="p-4 text-red-200 bg-red-500/20 border-b border-red-400/30">{error}</div>
              )}
              {loading && (
                <div className="p-4 text-gray-300">Chargement...</div>
              )}
              <table className="w-full">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Joueur</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Points</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Niveau</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Sessions</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Statut</th>
                    <th className="text-left py-4 px-6 text-gray-300 font-semibold">Dernière activité</th>
                    <th className="text-center py-4 px-6 text-gray-300 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <img
                            src={player.avatar}
                            alt={player.username}
                            className="w-10 h-10 rounded-full border-2 border-white/20"
                          />
                          <div>
                            <p className="text-white font-semibold">{player.username}</p>
                            <p className="text-gray-400 text-sm">{player.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Coins className="w-4 h-4" />
                          <span className="font-semibold">{player.points.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getLevelColor(player.level)}`}>
                          {player.level}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-white font-medium">{player.totalSessions}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(player.status)}`}>
                          {player.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-300">{formatDate(player.lastActive)}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => navigate(`/admin/players/${player.id}`)}
                            className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-colors"
                            title="Voir le profil"
                          >
                            <Eye className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => handlePointsAdjustment(player, 'add')}
                            className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                            title="Ajuster les points"
                          >
                            <Coins className="w-4 h-4 text-green-400" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/players/${player.id}`)}
                            className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                            title="Éditer"
                          >
                            <Edit3 className="w-4 h-4 text-purple-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Total Joueurs</h3>
              <p className="text-blue-400 text-2xl font-bold">{playersData.length}</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <Star className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Joueurs Actifs</h3>
              <p className="text-green-400 text-2xl font-bold">
                {playersData.filter(p => p.status === 'active').length}
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Points Totaux</h3>
              <p className="text-yellow-400 text-2xl font-bold">
                {playersData.reduce((sum, p) => sum + p.points, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Points Adjustment Modal */}
      {showPointsModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ajuster les points de {selectedPlayer.username}
            </h3>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Points actuels: 
                <span className="text-yellow-400 font-semibold ml-2">
                  {selectedPlayer.points.toLocaleString()}
                </span>
              </p>
              
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => setPointsToAdd(prev => prev - 10)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
                >
                  <Minus className="w-4 h-4 text-red-400" />
                </button>
                
                <input
                  type="number"
                  value={pointsToAdd}
                  onChange={(e) => setPointsToAdd(parseInt(e.target.value) || 0)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                  placeholder="0"
                />
                
                <button
                  onClick={() => setPointsToAdd(prev => prev + 10)}
                  className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 text-green-400" />
                </button>
              </div>
              
              <p className="text-gray-300 text-sm">
                Nouveaux points: 
                <span className={`font-semibold ml-2 ${
                  selectedPlayer.points + pointsToAdd >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {Math.max(0, selectedPlayer.points + pointsToAdd).toLocaleString()}
                </span>
              </p>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setShowPointsModal(false);
                  setPointsToAdd(0);
                  setSelectedPlayer(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-xl font-semibold transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={applyPointsChange}
                disabled={pointsToAdd === 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}