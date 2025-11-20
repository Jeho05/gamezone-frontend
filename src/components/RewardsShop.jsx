import React, { useState } from 'react';
import { useRewards } from '../utils/useGamification';

export function RewardCard({ reward, userPoints, onRedeem, isRedeeming }) {
  const safeUserPoints = userPoints || 0;
  const canAfford = safeUserPoints >= reward.cost;
  const isAvailable = reward.available;
  
  const getRewardIcon = (type) => {
    const icons = {
      game_time: '⏱️',
      discount: '🏷️',
      item: '🎉',
      badge: '🏆',
      physical: '📦',
      digital: '💻',
      game_package: '🎮',
      other: '🎁'
    };
    return icons[type] || '🎁';
  };
  
  const formatGameTime = (minutes) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}` : `${mins}min`;
  };

  return (
    <div
      className={`bg-gray-800 rounded-lg p-6 border-2 transition-all ${
        canAfford && isAvailable
          ? 'border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/50'
          : 'border-gray-700 opacity-60'
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{getRewardIcon(reward.reward_type)}</span>
            <h3 className="text-lg font-bold text-white">{reward.name}</h3>
          </div>
          {reward.description && (
            <p className="text-sm text-gray-400 mb-2">{reward.description}</p>
          )}
          {reward.reward_type === 'game_time' && reward.game_time_minutes > 0 && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded px-2 py-1 inline-block mb-2">
              <span className="text-xs text-cyan-400 font-semibold">
                +{formatGameTime(reward.game_time_minutes)} de jeu
              </span>
            </div>
          )}
          {!isAvailable && (
            <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
              Indisponible
            </span>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-cyan-400">{reward.cost}</p>
          <p className="text-xs text-gray-400">points</p>
        </div>
      </div>

      <button
        onClick={() => onRedeem(reward.id)}
        disabled={!canAfford || !isAvailable || isRedeeming}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          canAfford && isAvailable
            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white'
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isRedeeming ? (
          'Échange en cours...'
        ) : !isAvailable ? (
          'Indisponible'
        ) : !canAfford ? (
          `Besoin de ${reward.cost - safeUserPoints} points`
        ) : (
          'Échanger'
        )}
      </button>
    </div>
  );
}

export function RewardsShop({ userPoints, onPointsUpdate }) {
  const { rewards, loading, redeeming, redeemReward } = useRewards();
  const [filter, setFilter] = useState('all'); // all, affordable, unavailable

  const handleRedeem = async (rewardId) => {
    try {
      await redeemReward(rewardId);
      if (onPointsUpdate) {
        onPointsUpdate();
      }
    } catch (err) {
      // Error handled in hook
    }
  };

  // Sécurité: S'assurer que rewards est un tableau et userPoints est un nombre
  const safeRewards = Array.isArray(rewards) ? rewards : [];
  const safeUserPoints = userPoints || 0;
  
  const filteredRewards = safeRewards.filter((reward) => {
    if (filter === 'affordable') {
      return safeUserPoints >= reward.cost && reward.available;
    }
    if (filter === 'unavailable') {
      return !reward.available;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'all'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Toutes ({safeRewards.length})
        </button>
        <button
          onClick={() => setFilter('affordable')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'affordable'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Accessibles ({safeRewards.filter((r) => safeUserPoints >= r.cost && r.available).length})
        </button>
        <button
          onClick={() => setFilter('unavailable')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            filter === 'unavailable'
              ? 'bg-cyan-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          Indisponibles ({safeRewards.filter((r) => !r.available).length})
        </button>
      </div>

      {/* User Points Display */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg p-4 mb-6 border border-cyan-500/50">
        <p className="text-sm text-gray-400 mb-1">Vos points</p>
        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {userPoints?.toLocaleString()}
        </p>
      </div>

      {/* Info Banner explicative */}
      {filteredRewards.length > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">ℹ️</span>
            <div>
              <p className="text-blue-300 font-semibold mb-1">Boutique de Récompenses</p>
              <p className="text-blue-200 text-sm">
                Échangez vos points contre des récompenses exclusives : temps de jeu, badges, packs de jeu et avantages gérés par l'équipe (cadeaux physiques, codes digitaux, remises).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rewards Grid */}
      {filteredRewards.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎁</div>
          <p className="text-gray-400 text-lg mb-2">Aucune récompense disponible</p>
          <p className="text-gray-500 text-sm">Les récompenses seront bientôt ajoutées!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              userPoints={safeUserPoints}
              onRedeem={handleRedeem}
              isRedeeming={redeeming}
            />
          ))}
        </div>
      )}
    </div>
  );
}
