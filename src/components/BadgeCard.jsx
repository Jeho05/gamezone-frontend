import React from 'react';
import { getRarityColor, getRarityBg } from '../utils/gamification-api';

export function BadgeCard({ badge, size = 'md', showProgress = true }) {
  const sizes = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-24 h-24 text-4xl',
    lg: 'w-32 h-32 text-5xl',
  };

  const containerSizes = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const isEarned = badge.earned || badge.earned_at;
  const progress = badge.progress || 0;

  const getConditionLabel = (badge) => {
    if (!badge || !badge.requirement_type || !badge.requirement_value) return '';
    const value = badge.requirement_value;
    switch (badge.requirement_type) {
      case 'points_total':
        return `Condition : Atteindre ${value} points totaux.`;
      case 'points_earned':
        return `Condition : Gagner ${value} points au total (toutes sources confondues).`;
      case 'games_played':
        return `Condition : Jouer ${value} parties.`;
      case 'events_attended':
        return `Condition : Participer à ${value} évènements ou tournois.`;
      case 'friends_referred':
        return `Condition : Parrainer ${value} ami(s).`;
      case 'login_streak':
        return `Condition : Série de connexion de ${value} jour(s) consécutifs.`;
      default:
        return '';
    }
  };

  return (
    <div
      className={`relative rounded-xl border-2 ${containerSizes[size]} transition-all duration-300 hover:scale-105 ${
        isEarned
          ? `${getRarityBg(badge.rarity)} shadow-lg`
          : 'bg-gray-800/50 border-gray-700 opacity-60'
      }`}
    >
      {/* Badge Icon */}
      <div className="flex flex-col items-center gap-2">
        <div
          className={`${sizes[size]} rounded-full flex items-center justify-center ${
            isEarned ? 'bg-white/10' : 'bg-gray-700/50'
          }`}
        >
          <span className="filter grayscale-0">{badge.icon}</span>
        </div>

        {/* Badge Name */}
        <h3
          className={`text-center font-bold ${
            size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
          } ${isEarned ? getRarityColor(badge.rarity) : 'text-gray-400'}`}
        >
          {badge.name}
        </h3>

        {/* Badge Description */}
        {size !== 'sm' && (
          <p className="text-xs text-gray-400 text-center line-clamp-2">
            {badge.description}
          </p>
        )}

        {/* Requirement / Condition */}
        {size !== 'sm' && getConditionLabel(badge) && (
          <p className="text-[11px] text-cyan-300 text-center mt-1">
            {getConditionLabel(badge)}
          </p>
        )}

        {/* Progress Bar */}
        {showProgress && !isEarned && badge.progress !== undefined && (
          <div className="w-full mt-2">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progrès</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            {badge.current_value !== undefined && badge.requirement_value && (
              <p className="text-xs text-gray-500 mt-1 text-center">
                {badge.current_value} / {badge.requirement_value}
              </p>
            )}
          </div>
        )}

        {/* Points Reward */}
        {badge.points_reward > 0 && (
          <div
            className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${
              isEarned ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700/50 text-gray-500'
            }`}
          >
            +{badge.points_reward}
          </div>
        )}

        {/* Earned Date */}
        {isEarned && badge.earned_at && size !== 'sm' && (
          <p className="text-xs text-gray-500 mt-1">
            Obtenu le {new Date(badge.earned_at).toLocaleDateString()}
          </p>
        )}

        {/* Rarity Badge */}
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold ${
            isEarned ? getRarityColor(badge.rarity) : 'text-gray-600'
          }`}
        >
          {badge.rarity}
        </div>
      </div>
    </div>
  );
}

export function BadgeGrid({ badges, showProgress = true }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        Aucun badge disponible
      </div>
    );
  }

  // Separate earned and unearned badges
  const earnedBadges = badges.filter((b) => b.earned || b.earned_at);
  const unearnedBadges = badges.filter((b) => !b.earned && !b.earned_at);

  return (
    <div className="space-y-8">
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🏆</span>
            <span>Badges obtenus ({earnedBadges.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {earnedBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                showProgress={false}
              />
            ))}
          </div>
        </div>
      )}

      {unearnedBadges.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🎯</span>
            <span>À débloquer ({unearnedBadges.length})</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {unearnedBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                showProgress={showProgress}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
