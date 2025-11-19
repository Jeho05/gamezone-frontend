import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { Trophy, Star, TrendingUp, Award, Zap, Target, Calendar, Coins } from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function ProgressionPage() {
  const [stats, setStats] = useState(null);
  const [level, setLevel] = useState(null);
  const [badges, setBadges] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load stats
      const statsRes = await fetch(`${API_BASE}/gamification/user_stats.php`, { credentials: 'include' });
      const statsData = await statsRes.json();
      let uid = null;
      if (statsData) {
        uid = statsData.user?.id ?? null;
        const mappedStats = {
          points: statsData.user?.points ?? 0,
          games_played: statsData.statistics?.games_played ?? 0,
          tournaments_won: statsData.statistics?.tournaments_won ?? 0,
          events_attended: statsData.statistics?.events_attended ?? 0,
        };
        setStats(mappedStats);
      }
      
      // Load level
      const levelRes = await fetch(`${API_BASE}/gamification/level_progress.php`, { credentials: 'include' });
      const levelData = await levelRes.json();
      if (levelData.level) setLevel(levelData.level);
      
      // Load badges (prefer user-specific version when possible)
      const badgesUrl = uid
        ? `${API_BASE}/gamification/badges.php?user_id=${uid}`
        : `${API_BASE}/gamification/badges.php`;
      const badgesRes = await fetch(badgesUrl, { credentials: 'include' });
      const badgesData = await badgesRes.json();
      if (badgesData.badges) setBadges(badgesData.badges.slice(0, 6));
      
      // Load recent activity
      const activityRes = await fetch(`${API_BASE}/gamification/points_transactions.php?limit=10`, { credentials: 'include' });
      const activityData = await activityRes.json();
      if (activityData.transactions) setRecentActivity(activityData.transactions);
      
    } catch (err) {
      console.error(err);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="player" />
        <div className="lg:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mb-4"></div>
            <p className="text-white">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  const progressPercent = level ? ((level.current_level_points / level.next_level_points) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="progression" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <TrendingUp className="w-10 h-10 text-purple-400" />
              <span>Ma Progression</span>
            </h1>
            <p className="text-gray-300">Suis ton évolution et débloque des récompenses</p>
          </div>

          {/* Level Progress Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Niveau {level?.level || 1}</h2>
                  <p className="text-purple-300">{level?.level_name || 'Débutant'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-yellow-400">{stats?.points || 0}</p>
                <p className="text-gray-300 text-sm">Points Totaux</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Progression vers Niveau {(level?.level || 1) + 1}</span>
                <span>{level?.current_level_points || 0} / {level?.next_level_points || 100} pts</span>
              </div>
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 text-center">
                {progressPercent >= 100 ? '🎉 Prêt pour le niveau suivant !' : `Encore ${(level?.next_level_points || 100) - (level?.current_level_points || 0)} points`}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Zap className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-white">{stats?.games_played || 0}</span>
              </div>
              <p className="text-gray-300 font-semibold">Jeux Joués</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Trophy className="w-8 h-8 text-purple-400" />
                <span className="text-3xl font-bold text-white">{stats?.tournaments_won || 0}</span>
              </div>
              <p className="text-gray-300 font-semibold">Tournois Gagnés</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Award className="w-8 h-8 text-blue-400" />
                <span className="text-3xl font-bold text-white">{badges.filter(b => b.earned_at).length}</span>
              </div>
              <p className="text-gray-300 font-semibold">Badges Débloqués</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-8 h-8 text-green-400" />
                <span className="text-3xl font-bold text-white">{stats?.events_attended || 0}</span>
              </div>
              <p className="text-gray-300 font-semibold">Événements</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Badges */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-6 h-6 text-purple-400" />
                Badges Récents
              </h3>
              <div className="space-y-3">
                {badges.length > 0 ? badges.map((badge) => (
                  <div 
                    key={badge.id}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      badge.earned_at ? 'bg-purple-500/20 border border-purple-400/30' : 'bg-gray-800/50'
                    }`}
                  >
                    <div className="text-3xl">{badge.icon || '🏆'}</div>
                    <div className="flex-1">
                      <p className={`font-semibold ${badge.earned_at ? 'text-white' : 'text-gray-400'}`}>
                        {badge.name}
                      </p>
                      <p className="text-xs text-gray-400">{badge.description}</p>
                    </div>
                    {badge.earned_at && (
                      <div className="text-green-400 text-sm font-semibold">✓ Débloqué</div>
                    )}
                  </div>
                )) : (
                  <p className="text-gray-400 text-center py-4">Aucun badge pour le moment</p>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Coins className="w-6 h-6 text-yellow-400" />
                Activité Récente
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{activity.reason}</p>
                      <p className="text-gray-400 text-xs">
                        {new Date(activity.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className={`text-lg font-bold ${
                      activity.change_amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {activity.change_amount > 0 ? '+' : ''}{activity.change_amount}
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-center py-4">Aucune activité récente</p>
                )}
              </div>
            </div>
          </div>

          {/* Milestones */}
          <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-pink-400" />
              Objectifs à Venir
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4">
                <div className="text-2xl mb-2">🎮</div>
                <h4 className="text-white font-bold mb-1">Joueur Actif</h4>
                <p className="text-gray-300 text-sm">Joue 10 jeux différents</p>
                <div className="mt-2 text-purple-300 text-sm font-semibold">
                  {stats?.games_played || 0}/10
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30 rounded-lg p-4">
                <div className="text-2xl mb-2">🏆</div>
                <h4 className="text-white font-bold mb-1">Champion</h4>
                <p className="text-gray-300 text-sm">Gagne 5 tournois</p>
                <div className="mt-2 text-blue-300 text-sm font-semibold">
                  {stats?.tournaments_won || 0}/5
                </div>
              </div>

              <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4">
                <div className="text-2xl mb-2">💎</div>
                <h4 className="text-white font-bold mb-1">Collectionneur</h4>
                <p className="text-gray-300 text-sm">Obtiens 10 badges</p>
                <div className="mt-2 text-yellow-300 text-sm font-semibold">
                  {badges.filter(b => b.earned_at).length}/10
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
