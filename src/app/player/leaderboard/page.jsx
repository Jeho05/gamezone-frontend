import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { Trophy, Medal, Crown, Coins, TrendingUp, Calendar } from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { resolveAvatarUrl } from '../../../utils/avatarUrl';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLeaderboard = async (period) => {
    try {
      setLoading(true);
      setError(null);
      
      // Utilise le nouveau endpoint player/leaderboard.php
      const res = await fetch(`${API_BASE}/player/leaderboard.php?period=${period}&limit=50`, { 
        credentials: 'include' 
      });
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data?.error || 'Échec du chargement du classement');
      }
      
      // Map les nouvelles données au format attendu
      const items = (data.leaderboard?.rankings || []).map((p) => {
        return {
          rank: p.rank,
          username: p.user.username,
          avatar: resolveAvatarUrl(p.user.avatar_url, p.user.username),
          points: p.points ?? 0,
          change: String(p.rank_change || 0),
          isCurrentUser: !!p.is_current_user,
          level: p.user.level,
          levelInfo: p.user.level_info,
          totalPoints: p.total_points,
          badges: p.badges_earned,
          activeDays: p.active_days,
        };
      });
      
      if (period === 'weekly') setWeeklyData(items);
      else setMonthlyData(items);
    } catch (e) {
      setError(e.message);
      console.error('Erreur leaderboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);

  const currentData = activeTab === 'weekly' ? weeklyData : monthlyData;
  const podium = currentData.length >= 3
    ? currentData
    : [...currentData, ...Array(3 - currentData.length).fill({ username: '-', avatar: 'https://i.pravatar.cc/150?u=placeholder', points: 0, rank: 0, change: '0' })];

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">#{rank}</span>;
    }
  };

  const getRankBackground = (rank, isCurrentUser) => {
    if (isCurrentUser) return 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/30';
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-400/30';
      case 2: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/30';
      case 3: return 'bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-amber-500/30';
      default: return 'bg-white/5 border-white/10';
    }
  };

  const getChangeIndicator = (change) => {
    const numChange = parseInt(change);
    if (numChange > 0) {
      return (
        <div className="flex items-center space-x-1 text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">{change}</span>
        </div>
      );
    } else if (numChange < 0) {
      return (
        <div className="flex items-center space-x-1 text-red-400">
          <TrendingUp className="w-4 h-4 transform rotate-180" />
          <span className="text-sm font-semibold">{change}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1 text-gray-400">
          <span className="text-sm font-semibold">-</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="leaderboard" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
              <Trophy className="w-10 h-10 text-yellow-400" />
              <span>Classements</span>
            </h1>
            <p className="text-gray-300">Découvre qui domine l'arène gaming</p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 inline-flex">
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'weekly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Hebdomadaire</span>
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  activeTab === 'monthly'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Mensuel</span>
              </button>
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-6 text-center">
                🏆 Podium {activeTab === 'weekly' ? 'de la semaine' : 'du mois'}
              </h2>
              
              <div className="flex justify-center items-end space-x-4 lg:space-x-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={podium[1].avatar}
                      alt={podium[1].username}
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-gray-400 mx-auto"
                    />
                    <div className="absolute -top-2 -right-2 p-2 bg-gray-500 rounded-full">
                      <Medal className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg p-4 h-20 lg:h-24 flex flex-col justify-center">
                    <p className="text-white font-bold text-sm lg:text-base">{podium[1].username}</p>
                    <p className="text-gray-200 text-sm flex items-center justify-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>{podium[1].points.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={podium[0].avatar}
                      alt={podium[0].username}
                      className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-4 border-yellow-400 mx-auto"
                    />
                    <div className="absolute -top-2 -right-2 p-2 bg-yellow-500 rounded-full">
                      <Crown className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-t from-yellow-600 to-yellow-500 rounded-t-lg p-4 h-24 lg:h-28 flex flex-col justify-center">
                    <p className="text-white font-bold text-base lg:text-lg">{podium[0].username}</p>
                    <p className="text-yellow-200 text-sm flex items-center justify-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>{podium[0].points.toLocaleString()}</span>
                    </p>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="relative mb-4">
                    <img
                      src={podium[2].avatar}
                      alt={podium[2].username}
                      className="w-16 h-16 lg:w-20 lg:h-20 rounded-full border-4 border-amber-600 mx-auto"
                    />
                    <div className="absolute -top-2 -right-2 p-2 bg-amber-600 rounded-full">
                      <Medal className="w-4 h-4 lg:w-5 lg:h-5 text-white" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-t from-amber-700 to-amber-600 rounded-t-lg p-4 h-16 lg:h-20 flex flex-col justify-center">
                    <p className="text-white font-bold text-sm lg:text-base">{podium[2].username}</p>
                    <p className="text-amber-200 text-sm flex items-center justify-center space-x-1">
                      <Coins className="w-4 h-4" />
                      <span>{podium[2].points.toLocaleString()}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Leaderboard */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Classement complet
            </h2>
            
            <div className="space-y-3">
              {currentData.map((player) => (
                <div
                  key={player.rank}
                  className={`flex items-center space-x-4 p-4 rounded-xl border transition-all duration-200 hover:scale-105 ${getRankBackground(player.rank, player.isCurrentUser)}`}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center">
                    {getRankIcon(player.rank)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={player.avatar}
                      alt={player.username}
                      className="w-12 h-12 rounded-full border-2 border-white/20"
                    />
                  </div>

                  {/* Username */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${player.isCurrentUser ? 'text-purple-300' : 'text-white'}`}>
                      {player.username}
                      {player.isCurrentUser && <span className="text-purple-400 ml-2">(Vous)</span>}
                    </p>
                  </div>

                  {/* Points */}
                  <div className="flex items-center space-x-2 text-yellow-400">
                    <Coins className="w-5 h-5" />
                    <span className="font-bold">{player.points.toLocaleString()}</span>
                  </div>

                  {/* Change */}
                  <div className="flex-shrink-0 w-16 flex justify-center">
                    {getChangeIndicator(player.change)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Summary */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Votre meilleur rang</h3>
              <p className="text-purple-400 text-2xl font-bold">#5</p>
              <p className="text-gray-300 text-sm">Cette semaine</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Progression</h3>
              <p className="text-green-400 text-2xl font-bold">+4</p>
              <p className="text-gray-300 text-sm">Positions gagnées</p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg">Points cette semaine</h3>
              <p className="text-yellow-400 text-2xl font-bold">+427</p>
              <p className="text-gray-300 text-sm">Nouveaux points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}