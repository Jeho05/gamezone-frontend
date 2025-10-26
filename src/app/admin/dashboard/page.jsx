import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Navigation from '../../../components/Navigation';
import { 
  Users, 
  Coins, 
  Trophy, 
  TrendingUp, 
  Calendar,
  BarChart3,
  Clock,
  Star,
  Activity,
  UserCheck,
  Shield,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Eye,
  Loader2
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { resolveAvatarUrl } from '../../../utils/avatarUrl';

 

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [timeFilter, setTimeFilter] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    activeThisWeek: 0,
    newSignups: 0,
    pointsDistributed: {
      week: 0,
      month: 0
    },
    totalEvents: 0,
    totalGallery: 0,
    activeSanctions: 0,
    topPlayers: []
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [transactionStats, setTransactionStats] = useState({
    today: { count: 0, points: 0, success_rate: 0 },
    week: { count: 0, points: 0, success_rate: 0 },
    month: { count: 0, points: 0, success_rate: 0 },
    failed: { count: 0, last_failures: [] },
    pending: { count: 0 },
    refunded: { count: 0, total_points: 0 }
  });
  const [securityAlerts, setSecurityAlerts] = useState({
    stuck_transactions: 0,
    suspicious_activity: 0,
    failed_payments: 0,
    last_cleanup: null
  });

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Chargement des statistiques depuis:', `${API_BASE}/admin/statistics.php`);
      
      const response = await fetch(`${API_BASE}/admin/statistics.php`, {
        credentials: 'include'
      });
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API:', errorText);
        throw new Error('Erreur lors du chargement des statistiques');
      }
      
      const data = await response.json();
      console.log('📦 Données reçues:', data);
      
      if (data.success) {
        // Update stats
        setStats({
          totalPlayers: data.statistics.users.total || 0,
          activeThisWeek: data.statistics.users.active || 0,
          newSignups: data.statistics.users.new || 0,
          pointsDistributed: {
            week: data.statistics.gamification.totalPointsDistributed || 0,
            month: data.statistics.gamification.totalPointsDistributed || 0
          },
          totalEvents: data.statistics.events.total || 0,
          totalGallery: data.statistics.gallery.total || 0,
          activeSanctions: data.statistics.gamification.activeSanctions || 0,
          topPlayers: (data.topUsers || []).map(user => ({
            username: user.username,
            points: user.points,
            avatar: resolveAvatarUrl(user.avatar_url, user.username),
            level: user.level
          }))
        });
        
        // Update recent activities from events
        if (data.recentEvents && data.recentEvents.length > 0) {
          const activities = data.recentEvents.slice(0, 5).map((event, index) => ({
            id: event.id,
            player: event.creator_username || 'Admin',
            action: event.title,
            time: getRelativeTime(event.created_at)
          }));
          setRecentActivities(activities);
        }
        
        // Charger les statistiques de transactions
        loadTransactionStats();
        loadSecurityAlerts();
      } else {
        console.error('❌ API returned success: false');
        setError(data.error || 'Erreur inconnue');
      }
    } catch (error) {
      console.error('❌ Erreur de chargement:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get relative time
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds
    
    if (diff < 3600) return Math.floor(diff / 60) + 'min';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h';
    return Math.floor(diff / 86400) + 'j';
  };

  const loadTransactionStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/transaction_stats.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setTransactionStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats transactions:', error);
    }
  };

  const loadSecurityAlerts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/security_alerts.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setSecurityAlerts(data.alerts);
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
    }
  };

  // Pas besoin de maxPlayers/maxPoints

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="dashboard" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Shield className="w-10 h-10 text-purple-400" />
                Tableau de bord Admin
              </h1>
              <p className="text-gray-300 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Vue d'ensemble de votre salle de jeux
              </p>
            </div>
            <button 
              onClick={fetchDashboardData}
              disabled={loading}
              className="mt-4 lg:mt-0 flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Chargement...' : 'Actualiser'}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-red-400 font-bold text-lg">Erreur de chargement</h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                  <p className="text-gray-400 text-xs mt-2">
                    Vérifiez que vous êtes connecté en tant qu'admin et que l'API est accessible.
                  </p>
                  <button 
                    onClick={() => { setError(null); fetchDashboardData(); }}
                    className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                  >
                    Réessayer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              <span className="ml-4 text-white text-lg">Chargement des statistiques...</span>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Players */}
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/50">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/30 rounded-xl ring-2 ring-blue-400/50">
                  <Users className="w-8 h-8 text-blue-300" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                  <ArrowUp className="w-4 h-4" />
                  +{stats.totalPlayers > 0 ? Math.round((stats.newSignups / stats.totalPlayers) * 100) : 0}%
                </div>
              </div>
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">Joueurs totaux</p>
                <p className="text-3xl font-bold text-white mb-2">{stats.totalPlayers}</p>
                <p className="text-green-300 text-xs flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  +{stats.newSignups} cette semaine
                </p>
              </div>
            </div>

            {/* Active Players */}
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-md border border-green-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-green-500/50">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-green-500/30 rounded-xl ring-2 ring-green-400/50">
                  <TrendingUp className="w-8 h-8 text-green-300" />
                </div>
                <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                  <ArrowUp className="w-4 h-4" />
                  {Math.round((stats.activeThisWeek / stats.totalPlayers) * 100)}%
                </div>
              </div>
              <div>
                <p className="text-green-200 text-sm font-medium mb-1">Actifs cette semaine</p>
                <p className="text-3xl font-bold text-white mb-2">{stats.activeThisWeek}</p>
                <p className="text-green-300 text-xs flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  {Math.round((stats.activeThisWeek / stats.totalPlayers) * 100)}% taux d'engagement
                </p>
              </div>
            </div>

            {/* Points Distributed */}
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-yellow-500/50">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-yellow-500/30 rounded-xl ring-2 ring-yellow-400/50">
                  <Coins className="w-8 h-8 text-yellow-300" />
                </div>
                <div className="flex items-center gap-1 text-yellow-400 text-sm font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  +12%
                </div>
              </div>
              <div>
                <p className="text-yellow-200 text-sm font-medium mb-1">Points distribués</p>
                <p className="text-3xl font-bold text-white mb-2">
                  {timeFilter === 'week' 
                    ? stats.pointsDistributed.week.toLocaleString()
                    : stats.pointsDistributed.month.toLocaleString()
                  }
                </p>
                <p className="text-yellow-300 text-xs flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Cette {timeFilter === 'week' ? 'semaine' : 'mois'}
                </p>
              </div>
            </div>

            {/* Top Player */}
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/50">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-purple-500/30 rounded-xl ring-2 ring-purple-400/50">
                  <Trophy className="w-8 h-8 text-purple-300" />
                </div>
                <button className="p-2 hover:bg-purple-500/20 rounded-lg transition-colors">
                  <Eye className="w-4 h-4 text-purple-300" />
                </button>
              </div>
              <div>
                <p className="text-purple-200 text-sm font-medium mb-1">Top joueur</p>
                <p className="text-xl font-bold text-white truncate mb-2">
                  {stats.topPlayers && stats.topPlayers.length > 0 ? stats.topPlayers[0].username : 'N/A'}
                </p>
                <p className="text-purple-300 text-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {stats.topPlayers && stats.topPlayers.length > 0 ? stats.topPlayers[0].points.toLocaleString() : '0'} points
                </p>
              </div>
            </div>
          </div>
          )}

          {!loading && !error && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Transaction & Revenue Stats */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                    <span>Transactions & Sécurité</span>
                  </h2>
                  
                  <div className="flex items-center space-x-2 text-xs text-gray-300">
                    <Clock className="w-4 h-4" />
                    <span>Mis à jour en temps réel</span>
                  </div>
                </div>
                
                {/* Transaction Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Aujourd'hui */}
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="text-blue-300 text-xs font-medium mb-1">Aujourd'hui</div>
                    <div className="text-2xl font-bold text-white mb-1">{transactionStats.today.count}</div>
                    <div className="text-xs text-gray-300">{transactionStats.today.points.toLocaleString()} pts</div>
                    <div className="mt-2 flex items-center space-x-1">
                      <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${transactionStats.today.success_rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-400">{transactionStats.today.success_rate}%</span>
                    </div>
                  </div>

                  {/* Cette semaine */}
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4">
                    <div className="text-purple-300 text-xs font-medium mb-1">Cette semaine</div>
                    <div className="text-2xl font-bold text-white mb-1">{transactionStats.week.count}</div>
                    <div className="text-xs text-gray-300">{transactionStats.week.points.toLocaleString()} pts</div>
                    <div className="mt-2 flex items-center space-x-1">
                      <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${transactionStats.week.success_rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-400">{transactionStats.week.success_rate}%</span>
                    </div>
                  </div>

                  {/* Ce mois */}
                  <div className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/10 border border-indigo-500/30 rounded-xl p-4">
                    <div className="text-indigo-300 text-xs font-medium mb-1">Ce mois</div>
                    <div className="text-2xl font-bold text-white mb-1">{transactionStats.month.count}</div>
                    <div className="text-xs text-gray-300">{transactionStats.month.points.toLocaleString()} pts</div>
                    <div className="mt-2 flex items-center space-x-1">
                      <div className="h-1.5 flex-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-400"
                          style={{ width: `${transactionStats.month.success_rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-green-400">{transactionStats.month.success_rate}%</span>
                    </div>
                  </div>
                </div>

                {/* Alertes de Sécurité */}
                <div className="space-y-3">
                  <div className="text-sm font-semibold text-gray-300 mb-3">🔒 Alertes de Sécurité</div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* Transactions échouées */}
                    <div className={`p-3 rounded-lg border ${
                      transactionStats.failed.count > 5 
                        ? 'bg-red-500/10 border-red-500/30' 
                        : 'bg-gray-700/30 border-gray-600/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">Échecs récents</span>
                        <span className={`text-lg font-bold ${
                          transactionStats.failed.count > 5 ? 'text-red-400' : 'text-gray-400'
                        }`}>{transactionStats.failed.count}</span>
                      </div>
                    </div>

                    {/* Transactions bloquées */}
                    <div className={`p-3 rounded-lg border ${
                      securityAlerts.stuck_transactions > 0
                        ? 'bg-orange-500/10 border-orange-500/30'
                        : 'bg-gray-700/30 border-gray-600/30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">Bloquées</span>
                        <span className={`text-lg font-bold ${
                          securityAlerts.stuck_transactions > 0 ? 'text-orange-400' : 'text-gray-400'
                        }`}>{securityAlerts.stuck_transactions}</span>
                      </div>
                    </div>

                    {/* Remboursements */}
                    <div className="p-3 rounded-lg border bg-yellow-500/10 border-yellow-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">Remboursés</span>
                        <span className="text-lg font-bold text-yellow-400">{transactionStats.refunded.count}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">{transactionStats.refunded.total_points.toLocaleString()} pts</div>
                    </div>

                    {/* En attente */}
                    <div className="p-3 rounded-lg border bg-blue-500/10 border-blue-500/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-300">En attente</span>
                        <span className="text-lg font-bold text-blue-400">{transactionStats.pending.count}</span>
                      </div>
                    </div>
                  </div>

                  {/* Dernières erreurs */}
                  {transactionStats.failed.last_failures && transactionStats.failed.last_failures.length > 0 && (
                    <div className="mt-4 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                      <div className="text-xs font-medium text-red-300 mb-2">Dernières erreurs:</div>
                      <div className="space-y-1">
                        {transactionStats.failed.last_failures.slice(0, 3).map((failure, i) => (
                          <div key={i} className="text-xs text-gray-400 truncate">
                            • {failure.reason || 'Erreur inconnue'} 
                            <span className="text-gray-500 ml-2">{failure.when}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Top Players */}
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Star className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span>Top Joueurs</span>
                </h2>
                
                <div className="space-y-3">
                  {stats.topPlayers.map((player, index) => (
                    <div key={index} className={`flex items-center space-x-3 p-4 rounded-xl border transition-all duration-300 hover:scale-102 cursor-pointer ${
                      index === 0 ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/10 border-yellow-500/40 shadow-lg shadow-yellow-500/20' :
                      index === 1 ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/40' :
                      index === 2 ? 'bg-gradient-to-r from-amber-600/20 to-amber-700/10 border-amber-600/40' :
                      'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}>
                      <div className="w-10 h-10 flex items-center justify-center shrink-0">
                        {index < 3 ? (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 ring-2 ring-yellow-300' :
                            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-800 ring-2 ring-gray-200' :
                            'bg-gradient-to-br from-amber-500 to-amber-700 text-amber-900 ring-2 ring-amber-400'
                          }`}>
                            {index + 1}
                          </div>
                        ) : (
                          <span className="text-gray-400 font-bold text-lg">#{index + 1}</span>
                        )}
                      </div>
                      
                      <img
                        src={player.avatar}
                        alt={player.username}
                        className="w-12 h-12 rounded-full border-2 border-white/30 shadow-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate text-sm mb-1">{player.username}</p>
                        <div className="flex items-center space-x-1 text-yellow-400">
                          <Coins className="w-4 h-4 fill-current" />
                          <span className="text-sm font-bold">{player.points.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      {index < 3 && (
                        <Trophy className={`w-5 h-5 ${
                          index === 0 ? 'text-yellow-400' :
                          index === 1 ? 'text-gray-300' :
                          'text-amber-600'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6 shadow-xl">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <span>Activités récentes</span>
                </h2>
                
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200 hover:border-purple-500/30">
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-white font-bold text-sm">{activity.player}</p>
                        <span className="text-gray-400 text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {activity.time}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-3">{activity.action}</p>
                      <div className={`flex items-center justify-between`}>
                        <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${
                          activity.points > 0 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {activity.points > 0 ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )}
                          <Coins className="w-3 h-3" />
                          <span className="text-xs font-bold">
                            {activity.points > 0 ? '+' : ''}{activity.points}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}