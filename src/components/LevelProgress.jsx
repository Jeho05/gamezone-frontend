import React from 'react';

export function LevelProgress({ levelData, compact = false }) {
  if (!levelData || !levelData.user) {
    return <div className="text-gray-500">Chargement...</div>;
  }

  const { user } = levelData;
  const currentLevel = user.current_level;
  const nextLevel = user.next_level;
  const progress = user.progress_percentage || 0;
  const pointsToNext = user.points_to_next || 0;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-lg" style={{ color: currentLevel.color }}>
              {currentLevel.name}
            </h3>
            <p className="text-sm text-gray-400">Niveau {currentLevel.number}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-cyan-400">{user.points}</p>
            <p className="text-xs text-gray-500">Points</p>
          </div>
        </div>

        {nextLevel && (
          <>
            <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center">
              {pointsToNext} points jusqu'à <span style={{ color: nextLevel.color }}>{nextLevel.name}</span>
            </p>
          </>
        )}

        {!nextLevel && (
          <p className="text-sm text-yellow-400 text-center mt-2">
            ⭐ Niveau maximum atteint!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-xl p-6 border-2 border-gray-700 shadow-2xl">
      {/* Current Level */}
      <div className="text-center mb-6">
        <div className="inline-block">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center text-6xl mb-4 shadow-xl border-4"
            style={{ 
              borderColor: currentLevel.color,
              background: `linear-gradient(135deg, ${currentLevel.color}20, ${currentLevel.color}10)`
            }}
          >
            <span className="filter drop-shadow-lg">
              {currentLevel.number === 10 ? '👑' : '⭐'}
            </span>
          </div>
          <h2 className="text-3xl font-bold mb-1" style={{ color: currentLevel.color }}>
            {currentLevel.name}
          </h2>
          <p className="text-gray-400">Niveau {currentLevel.number} / 10</p>
        </div>
      </div>

      {/* Points Display */}
      <div className="text-center mb-6">
        <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          {user.points}
        </p>
        <p className="text-sm text-gray-400 mt-1">Points totaux</p>
      </div>

      {/* Progress to Next Level */}
      {nextLevel ? (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm text-gray-400">Prochain niveau</p>
              <p className="font-bold" style={{ color: nextLevel.color }}>
                {nextLevel.name}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-cyan-400">{pointsToNext}</p>
              <p className="text-xs text-gray-500">points restants</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 transition-all duration-500 shadow-lg"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm font-bold text-white absolute inset-0 flex items-center justify-center">
              {progress}%
            </p>
          </div>

          {/* Next Level Bonus */}
          {nextLevel.points_bonus > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-400 text-center">
                🎁 Bonus de niveau: <span className="font-bold">+{nextLevel.points_bonus} points</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/50">
          <p className="text-2xl mb-2">👑</p>
          <p className="text-xl font-bold text-yellow-400">Niveau Maximum Atteint!</p>
          <p className="text-sm text-gray-400 mt-2">
            Vous êtes au sommet de la hiérarchie
          </p>
        </div>
      )}
    </div>
  );
}

export function AllLevelsDisplay({ allLevels, userPoints }) {
  if (!allLevels || allLevels.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xl font-bold mb-4">Tous les niveaux</h3>
      {allLevels.map((level) => {
        const isUnlocked = userPoints >= level.points_required;
        const isCurrent = level.unlocked && !allLevels.find(
          (l) => l.points_required > level.points_required && userPoints >= l.points_required
        );

        return (
          <div
            key={level.number}
            className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
              isUnlocked
                ? 'bg-gray-800 border-gray-600'
                : 'bg-gray-900 border-gray-800 opacity-50'
            } ${isCurrent ? 'ring-2 ring-cyan-500' : ''}`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2`}
              style={{
                borderColor: isUnlocked ? level.color : '#4B5563',
                backgroundColor: isUnlocked ? `${level.color}20` : '#1F2937',
              }}
            >
              {level.number}
            </div>
            <div className="flex-1">
              <h4 className={`font-bold ${isUnlocked ? '' : 'text-gray-600'}`} style={{ color: isUnlocked ? level.color : undefined }}>
                {level.name}
              </h4>
              <p className="text-sm text-gray-500">
                {level.points_required} points requis
                {level.points_bonus > 0 && ` • +${level.points_bonus} bonus`}
              </p>
            </div>
            {isUnlocked && (
              <div className="text-green-400">
                ✓
              </div>
            )}
            {isCurrent && (
              <div className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-bold rounded-full">
                Actuel
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
