import React, { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  Coins, 
  Trophy, 
  Star, 
  Gift, 
  TrendingUp, 
  Calendar,
  Gamepad2,
  Users,
  Clock,
  Zap,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Flame
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState({
    username: 'PlayerOne',
    avatar: 'https://i.pravatar.cc/150?img=3',
    points: 0,
    level: 'Gamer',
    nextLevelPoints: 3000,
    rank: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  const [availableRewards, setAvailableRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const progressPercentage = (playerData.points / playerData.nextLevelPoints) * 100;

  const getActivityIcon = (type) => {
    const iconMap = {
      game: Gamepad2,
      tournament: Trophy,
      bonus: Star,
      reservation: Calendar,
      friend: Users
    };
    return iconMap[type] || Gamepad2;
  };

  const handleRewardExchange = async (rewardId) => {
    const reward = availableRewards.find(r => r.id === rewardId);
    if (!reward) return;
    try {
      const res = await fetch(`${API_BASE}/rewards/redeem.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reward_id: rewardId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec de l\'échange');
      setPlayerData(prev => ({ ...prev, points: Math.max(0, prev.points - (reward.cost || 0)) }));
      toast.success(`Récompense "${reward.name}" échangée avec succès !`, {
        description: `Vous avez dépensé ${reward.cost} points`,
        duration: 4000
      });
    } catch (e) {
      toast.error('Erreur lors de l\'échange', { description: e.message });
    }
  };

  const claimDailyBonus = async () => {
    try {
      const res = await fetch(`${API_BASE}/points/bonus.php`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec du bonus');
      const awarded = data?.awarded || 0;
      setPlayerData(prev => ({ ...prev, points: prev.points + awarded }));
      toast.success('Bonus quotidien réclamé !', {
        description: `+${awarded} points`,
        duration: 3000
      });
    } catch (e) {
      toast.error('Erreur lors du bonus', { description: e.message });
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Me
        const meRes = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });
        const me = await meRes.json();
        if (meRes.ok && me?.user) {
          setPlayerData(prev => ({
            ...prev,
            username: me.user.username,
            avatar: me.user.avatar_url || prev.avatar,
            points: me.user.points ?? 0,
            level: me.user.level || prev.level,
          }));
        }
        // Rewards
        const rwRes = await fetch(`${API_BASE}/rewards/index.php?available=1`, { credentials: 'include' });
        const rw = await rwRes.json();
        if (rwRes.ok) {
          setAvailableRewards((rw.items || []).map(r => ({ id: r.id, name: r.name, cost: r.cost, available: !!r.available })));
        }
        // History (recent activities)
        const hRes = await fetch(`${API_BASE}/points/history.php?limit=5`, { credentials: 'include' });
        const hist = await hRes.json();
        if (hRes.ok) {
          const mapped = (hist.items || []).map((it) => ({
            id: it.id,
            type: it.type || 'game',
            description: it.reason || 'Activité',
            points: it.points || 0,
            time: new Date(it.created_at).toLocaleString('fr-FR'),
            icon: Gamepad2,
          }));
          setRecentActivities(mapped);
        }
        // Weekly leaderboard rank
        const lbRes = await fetch(`${API_BASE}/leaderboard/index.php?period=weekly`, { credentials: 'include' });
        const lb = await lbRes.json();
        if (lbRes.ok && typeof lb.current_user_rank !== 'undefined') {
          setPlayerData(prev => ({ ...prev, rank: lb.current_user_rank || 0 }));
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="dashboard" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Salut {playerData.username} ! 👋
            </h1>
            <p className="text-gray-300">Voici un aperçu de ton activité gaming</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-aos="fade-up">
            {/* Points */}
            <div className="bg-white/10 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20" data-aos="fade-up" data-aos-delay="0">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Coins className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Points totaux</p>
                  <p className="text-2xl font-bold text-white">{playerData.points.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Niveau */}
            <div className="bg-white/10 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20" data-aos="fade-up" data-aos-delay="100">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Star className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Niveau actuel</p>
                  <p className="text-lg font-bold text-white">{playerData.level}</p>
                </div>
              </div>
            </div>

            {/* Classement */}
            <div className="bg-white/10 backdrop-blur-md border border-pink-400/30 hover:border-pink-400/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20" data-aos="fade-up" data-aos-delay="200">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Trophy className="w-8 h-8 text-pink-400" />
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Classement</p>
                  <p className="text-2xl font-bold text-white">#{playerData.rank}</p>
                </div>
              </div>
            </div>

            {/* Progression */}
            <div className="bg-white/10 backdrop-blur-md border border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20" data-aos="fade-up" data-aos-delay="300">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-300 text-sm">Prochain niveau</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className="flex-1 bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-300">{Math.round(progressPercentage)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Call-to-Action Banner */}
          <div className="mb-8">
            <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              
              <div className="relative p-8 lg:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  {/* Left Content */}
                  <div>
                    <div className="inline-flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold text-sm mb-4 animate-pulse">
                      <Sparkles className="w-4 h-4" />
                      NOUVEAU
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                      Achetez du Temps de Jeu !
                    </h2>
                    <p className="text-xl text-white/90 mb-6">
                      Découvrez nos offres exclusives et gagnez encore plus de points en jouant à vos jeux préférés.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <button
                        onClick={() => navigate('/player/shop')}
                        className="group flex items-center gap-2 px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-2xl font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        Voir la Boutique
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={() => navigate('/player/my-purchases')}
                        className="flex items-center gap-2 px-6 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white rounded-2xl font-bold transition-all"
                      >
                        Mes Achats
                      </button>
                    </div>
                  </div>

                  {/* Right Content - Features */}
                  <div className="space-y-4">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/30 rounded-xl">
                          <Star className="w-8 h-8 text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">Gagnez des Points</h3>
                          <p className="text-white/80 text-sm">Jusqu'à 20 pts/heure de jeu</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-500/30 rounded-xl">
                          <Flame className="w-8 h-8 text-green-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">Jeux Populaires</h3>
                          <p className="text-white/80 text-sm">FIFA, COD, GTA V et plus</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/30 rounded-xl">
                          <Zap className="w-8 h-8 text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-white font-bold text-lg">Offres Flexibles</h3>
                          <p className="text-white/80 text-sm">De 15 min à 8 heures</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Activities */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Clock className="w-6 h-6 text-purple-400" />
                  <span>Activités récentes</span>
                </h2>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-400/40 text-red-200 text-sm">{error}</div>
                )}
                {loading && (
                  <div className="mb-4 text-gray-300">Chargement...</div>
                )}
                
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const IconComponent = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-center space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all duration-200">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <IconComponent className="w-5 h-5 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">{activity.description}</p>
                          <p className="text-gray-300 text-sm">Il y a {activity.time}</p>
                        </div>
                        <div className="flex items-center space-x-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                          <Coins className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 font-semibold">+{activity.points}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Rewards */}
            <div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Gift className="w-6 h-6 text-purple-400" />
                  <span>Récompenses</span>
                </h2>
                
                <div className="space-y-6">
                  {/* Quick Action - Daily Bonus */}
                  <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30">
                    <div className="flex items-center space-x-3 mb-3">
                      <Zap className="w-6 h-6 text-purple-400" />
                      <span className="text-white font-semibold">Bonus journalier</span>
                    </div>
                    <p className="text-gray-300 text-sm mb-3">Récupère tes 25 points quotidiens !</p>
                    <button onClick={claimDailyBonus} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 rounded-lg font-semibold transition-all duration-200">
                      Récupérer
                    </button>
                  </div>

                  {/* Shop Promotion Widget */}
                  <div className="relative bg-gradient-to-br from-orange-500 to-pink-600 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                          <ShoppingCart className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm mb-1">Boutique de Jeux</h3>
                          <p className="text-white/90 text-xs">Achetez du temps et gagnez jusqu'à 20 pts/h !</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => navigate('/player/shop')}
                        className="w-full bg-white hover:bg-gray-100 text-orange-600 py-2 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        Explorer
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}