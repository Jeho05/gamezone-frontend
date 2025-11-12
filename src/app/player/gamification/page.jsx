import React, { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import Navigation from '../../../components/Navigation';
import DailyRewardModal from '../../../components/DailyRewardModal';
import StatsInfoModal from '../../../components/StatsInfoModal';
import {
  useGamificationStats,
  useUserBadges,
  useLevelProgress,
  useDailyLogin,
} from '../../../utils/useGamification';
import { LevelProgress, AllLevelsDisplay } from '../../../components/LevelProgress';
import { BadgeGrid } from '../../../components/BadgeCard';
import { StatsGrid, StreakCard, RecentAchievements } from '../../../components/StatsCard';
import { RewardsShop } from '../../../components/RewardsShop';

export default function GamificationPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showStatsInfo, setShowStatsInfo] = useState(false);
  
  // Utilise les endpoints existants qui fonctionnent
  const { stats, loading: statsLoading, refetch: refetchStats } = useGamificationStats();
  const { badges, loading: badgesLoading, refetch: refetchBadges } = useUserBadges();
  const { levelData, loading: levelLoading, refetch: refetchLevel } = useLevelProgress();
  const { recordLogin, hasLoggedInToday, streakData, showRewardModal, closeRewardModal } = useDailyLogin();

  const loading = statsLoading || badgesLoading || levelLoading;
  const user = stats?.user;

  // Record login on mount
  useEffect(() => {
    if (user && !hasLoggedInToday) {
      recordLogin().catch((err) => {
        console.error('Error recording login:', err);
      });
    }
  }, [user, hasLoggedInToday, recordLogin]);

  // Refresh all data
  const refreshAllData = () => {
    refetchStats();
    refetchBadges();
    refetchLevel();
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="text-6xl mb-6">🔒</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentification Requise
          </h2>
          <p className="text-gray-400 mb-6">
            Connectez-vous pour accéder à vos statistiques de gamification
          </p>
          <a 
            href="/auth/login" 
            className="inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>
      
      <Navigation userType="player" />
      
      <div className="lg:pl-64 relative z-10">
        <div className="container mx-auto px-4 py-8 pt-20 lg:pt-8 max-w-7xl">
        {/* Header with better visual hierarchy */}
        <div className="mb-10 animate-fade-in" data-aos="fade-down">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/50">
                  🎮
                </div>
                <h1 className="text-6xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                  Gamification
                </h1>
              </div>
              <p className="text-gray-400 text-lg ml-20">
                Suivez votre progression et débloquez des récompenses
              </p>
            </div>
            <button
              onClick={() => setShowStatsInfo(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border-2 border-cyan-500/50 hover:border-cyan-400 rounded-xl transition-all group flex-shrink-0 shadow-lg hover:shadow-cyan-500/50"
              title="Comprendre les statistiques"
            >
              <Info className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300" />
              <span className="text-cyan-400 group-hover:text-cyan-300 font-bold text-sm">
                Guide
              </span>
            </button>
          </div>
        </div>

        {/* Tabs - Modern design with better indicators */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-2 scrollbar-hide" data-aos="fade-up">
          <button
            onClick={() => setActiveTab('overview')}
            className={`relative px-10 py-5 rounded-2xl font-black text-lg whitespace-nowrap transition-all transform hover:scale-105 ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/50'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white backdrop-blur-sm border-2 border-gray-700 hover:border-gray-600'
            }`}
          >
            {activeTab === 'overview' && (
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20 rounded-2xl animate-pulse"></div>
            )}
            <span className="relative flex items-center gap-3">
              <span className="text-2xl">📊</span>
              <span>Vue d'ensemble</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`relative px-10 py-5 rounded-2xl font-black text-lg whitespace-nowrap transition-all transform hover:scale-105 ${
              activeTab === 'badges'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-2xl shadow-purple-500/50'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white backdrop-blur-sm border-2 border-gray-700 hover:border-gray-600'
            }`}
          >
            {activeTab === 'badges' && (
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl animate-pulse"></div>
            )}
            <span className="relative flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <span>Badges {badges && `(${badges.total_earned}/${badges.total_available})`}</span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`relative px-10 py-5 rounded-2xl font-black text-lg whitespace-nowrap transition-all transform hover:scale-105 ${
              activeTab === 'rewards'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-2xl shadow-yellow-500/50'
                : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-white backdrop-blur-sm border-2 border-gray-700 hover:border-gray-600'
            }`}
          >
            {activeTab === 'rewards' && (
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-2xl animate-pulse"></div>
            )}
            <span className="relative flex items-center gap-3">
              <span className="text-2xl">🎁</span>
              <span>Boutique</span>
            </span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* Level Progress - Enhanced */}
            <section className="mb-10" data-aos="zoom-in">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl shadow-lg">
                  ⚡
                </div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                  Progression de Niveau
                </h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <LevelProgress levelData={levelData} />
                </div>
                <div className="lg:col-span-2">
                  <AllLevelsDisplay
                    allLevels={levelData?.all_levels}
                    userPoints={stats?.user?.points || 0}
                  />
                </div>
              </div>
            </section>

            {/* Streak */}
            {stats?.streak && (
              <section data-aos="fade-right">
                <StreakCard streak={stats.streak} />
              </section>
            )}

            {/* Statistics - Enhanced */}
            <section className="mb-10" data-aos="fade-left">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                  📈
                </div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text">
                  Vos Statistiques
                </h2>
              </div>
              <StatsGrid stats={stats} />
            </section>

            {/* Recent Achievements */}
            {stats?.recent_achievements && stats.recent_achievements.length > 0 && (
              <section>
                <RecentAchievements achievements={stats.recent_achievements} />
              </section>
            )}

            {/* Quick Actions - Enhanced design */}
            <section data-aos="zoom-in-up">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg">
                  ⚡
                </div>
                <h2 className="text-4xl font-black bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">
                  Actions Rapides
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('badges')}
                  className="relative overflow-hidden p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/50 transition-all text-left group transform hover:scale-105 hover:-translate-y-2 duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🏆</div>
                    <h3 className="font-black text-2xl mb-2 text-white group-hover:text-purple-300 transition-colors">
                      Mes Badges
                    </h3>
                    <p className="text-gray-400 font-semibold">
                      {badges?.total_earned || 0} badges débloqués
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('rewards')}
                  className="relative overflow-hidden p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border-2 border-yellow-500/50 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-500/50 transition-all text-left group transform hover:scale-105 hover:-translate-y-2 duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="text-6xl mb-4 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🎁</div>
                    <h3 className="font-black text-2xl mb-2 text-white group-hover:text-yellow-300 transition-colors">
                      Boutique
                    </h3>
                    <p className="text-gray-400 font-semibold">
                      {stats?.user?.points || 0} points disponibles
                    </p>
                  </div>
                </button>

                <button
                  onClick={refreshAllData}
                  className="relative overflow-hidden p-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl border-2 border-cyan-500/50 hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/50 transition-all text-left group transform hover:scale-105 hover:-translate-y-2 duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative">
                    <div className="text-6xl mb-4 transform group-hover:rotate-180 transition-all duration-500">🔄</div>
                    <h3 className="font-black text-2xl mb-2 text-white group-hover:text-cyan-300 transition-colors">
                      Actualiser
                    </h3>
                    <p className="text-gray-400 font-semibold">
                      Rafraîchir les données
                    </p>
                  </div>
                </button>
              </div>
            </section>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                Badges ({badges?.total_earned || 0} / {badges?.total_available || 0})
              </h2>
              <div className="text-right">
                <p className="text-3xl font-bold text-cyan-400">
                  {Math.round((badges?.total_earned / badges?.total_available) * 100 || 0)}%
                </p>
                <p className="text-sm text-gray-400">Complétés</p>
              </div>
            </div>
            <BadgeGrid badges={badges?.badges} showProgress={true} />
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Boutique de Récompenses</h2>
            <RewardsShop
              userPoints={stats?.user?.points || 0}
              onPointsUpdate={refreshAllData}
            />
          </div>
        )}

        {/* Daily Reward Modal */}
        <DailyRewardModal
          isOpen={showRewardModal}
          onClose={closeRewardModal}
          rewardData={streakData}
        />

        {/* Stats Info Modal */}
        <StatsInfoModal
          isOpen={showStatsInfo}
          onClose={() => setShowStatsInfo(false)}
        />
      </div>
      </div>
    </div>
  );
}
