import React from 'react';

export function StatsCard({ icon, label, value, subValue, color = 'cyan' }) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500',
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    red: 'from-red-500 to-rose-500',
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subValue && (
            <p className="text-xs text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatsGrid({ stats }) {
  if (!stats || !stats.statistics) {
    return <div className="text-gray-500">Chargement des statistiques...</div>;
  }

  const { statistics } = stats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Parties jouées - Grande carte mise en avant */}
      <div className="md:col-span-2 lg:col-span-1">
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-8 border-2 border-cyan-500/50 hover:border-cyan-400 transition-all hover:shadow-xl hover:shadow-cyan-500/20 group">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-4xl shadow-lg transform group-hover:scale-110 transition-transform">
              🎮
            </div>
            <div className="flex-1">
              <p className="text-sm text-cyan-300 font-semibold mb-2 uppercase tracking-wider">Parties jouées</p>
              <p className="text-5xl font-black text-white">{statistics.games_played}</p>
              <p className="text-xs text-gray-400 mt-1">Sessions de jeu complétées</p>
            </div>
          </div>
        </div>
      </div>

      {/* Points gagnés */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 border-2 border-green-500/50 hover:border-green-400 transition-all hover:shadow-xl hover:shadow-green-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl shadow-lg">
            ⬆️
          </div>
          <div className="flex-1">
            <p className="text-xs text-green-300 font-semibold uppercase tracking-wider">Points gagnés</p>
            <p className="text-3xl font-black text-white">{statistics.total_points_earned?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Points dépensés */}
      <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-2xl p-6 border-2 border-red-500/50 hover:border-red-400 transition-all hover:shadow-xl hover:shadow-red-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center text-3xl shadow-lg">
            ⬇️
          </div>
          <div className="flex-1">
            <p className="text-xs text-red-300 font-semibold uppercase tracking-wider">Points dépensés</p>
            <p className="text-3xl font-black text-white">{statistics.total_points_spent?.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Points nets - Grande carte */}
      <div className="md:col-span-2 lg:col-span-1">
        <div className={`bg-gradient-to-br ${statistics.net_points >= 0 ? 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50 hover:border-cyan-400 hover:shadow-cyan-500/20' : 'from-orange-500/20 to-red-500/20 border-orange-500/50 hover:border-orange-400 hover:shadow-orange-500/20'} rounded-2xl p-8 border-2 transition-all hover:shadow-xl group`}>
          <div className="flex items-center gap-6">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${statistics.net_points >= 0 ? 'from-cyan-500 to-blue-500' : 'from-orange-500 to-red-500'} flex items-center justify-center text-4xl shadow-lg transform group-hover:scale-110 transition-transform`}>
              💰
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold mb-2 uppercase tracking-wider ${statistics.net_points >= 0 ? 'text-cyan-300' : 'text-orange-300'}`}>Points nets</p>
              <p className="text-5xl font-black text-white">{statistics.net_points?.toLocaleString()}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statistics.net_points >= 0 ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'}`}>
                  {statistics.net_points >= 0 ? '✓ Positif' : '⚠ Négatif'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border-2 border-purple-500/50 hover:border-purple-400 transition-all hover:shadow-xl hover:shadow-purple-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
            🎖️
          </div>
          <div className="flex-1">
            <p className="text-xs text-purple-300 font-semibold uppercase tracking-wider">Badges</p>
            <p className="text-3xl font-black text-white">{statistics.badges_earned} / {statistics.badges_total}</p>
            <div className="mt-2">
              <div className="w-full bg-gray-700/50 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((statistics.badges_earned / statistics.badges_total) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round((statistics.badges_earned / statistics.badges_total) * 100)}% complétés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Récompenses échangées */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border-2 border-yellow-500/50 hover:border-yellow-400 transition-all hover:shadow-xl hover:shadow-yellow-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg">
            🎁
          </div>
          <div className="flex-1">
            <p className="text-xs text-yellow-300 font-semibold uppercase tracking-wider">Récompenses</p>
            <p className="text-3xl font-black text-white">{statistics.rewards_redeemed || 0}</p>
            <p className="text-xs text-gray-400 mt-1">échangées</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function StreakCard({ streak }) {
  if (!streak) {
    return null;
  }

  return (
    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-6 border-2 border-orange-500/50">
      <div className="flex items-center gap-6">
        <div className="text-6xl">🔥</div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-orange-400 mb-2">
            Série de connexion
          </h3>
          <div className="flex gap-8">
            <div>
              <p className="text-4xl font-bold text-white">{streak.current}</p>
              <p className="text-sm text-gray-400">jours actuels</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-300">{streak.longest}</p>
              <p className="text-sm text-gray-400">record personnel</p>
            </div>
          </div>
          {streak.last_login && (
            <p className="text-xs text-gray-500 mt-2">
              Dernière connexion: {new Date(streak.last_login).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Streak Milestones */}
      <div className="mt-4 grid grid-cols-4 gap-2">
        {[3, 7, 14, 30].map((milestone) => (
          <div
            key={milestone}
            className={`text-center p-2 rounded-lg ${
              streak.current >= milestone
                ? 'bg-orange-500/30 border border-orange-500'
                : 'bg-gray-700/30 border border-gray-600'
            }`}
          >
            <p className={`font-bold ${streak.current >= milestone ? 'text-orange-400' : 'text-gray-500'}`}>
              {milestone}
            </p>
            <p className="text-xs text-gray-400">jours</p>
            {streak.current >= milestone && <p className="text-xs">✓</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function RecentAchievements({ achievements }) {
  if (!achievements || achievements.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun achievement récent
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold mb-4">Achievements récents (30 jours)</h3>
      {achievements.map((achievement, index) => (
        <div
          key={index}
          className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700"
        >
          <div className="text-4xl">{achievement.icon}</div>
          <div className="flex-1">
            <h4 className="font-bold text-white">{achievement.name}</h4>
            <p className="text-sm text-gray-400">{achievement.rarity}</p>
          </div>
          <p className="text-xs text-gray-500">
            {new Date(achievement.earned_at).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}
