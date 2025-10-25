import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Navigation from '../../../components/Navigation';
import API_BASE from '../../../utils/apiBase';

 

export default function LevelsAndBadgesPage() {
  const [activeTab, setActiveTab] = useState('levels');
  const [levels, setLevels] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [levelsRes, badgesRes] = await Promise.all([
        fetch(`${API_BASE}/gamification/levels.php`, { credentials: 'include' }),
        fetch(`${API_BASE}/gamification/badges.php`, { credentials: 'include' }),
      ]);

      const levelsData = await levelsRes.json();
      const badgesData = await badgesRes.json();

      setLevels(levelsData.levels || []);
      setBadges(badgesData.badges || []);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="admin" currentPage="levels" />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="levels" />
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                ⭐ Niveaux & Badges
              </h1>
              <p className="text-gray-400">
                Consultez les niveaux et badges du système de gamification
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8">
              <button
                onClick={() => setActiveTab('levels')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'levels'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Niveaux ({levels.length})
              </button>
              <button
                onClick={() => setActiveTab('badges')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === 'badges'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Badges ({badges.length})
              </button>
            </div>

            {/* Levels Tab */}
            {activeTab === 'levels' && (
              <div className="space-y-4">
                {levels.map((level) => (
                  <div
                    key={level.number}
                    className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700"
                  >
                    <div className="flex items-center gap-6">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4"
                        style={{
                          borderColor: level.color,
                          backgroundColor: `${level.color}20`,
                        }}
                      >
                        {level.number}
                      </div>

                      <div className="flex-1">
                        <h3
                          className="text-2xl font-bold mb-1"
                          style={{ color: level.color }}
                        >
                          {level.name}
                        </h3>
                        <div className="flex gap-6 text-sm text-gray-400">
                          <span>
                            Points requis: <strong className="text-white">{level.points_required}</strong>
                          </span>
                          {level.points_bonus > 0 && (
                            <span>
                              Bonus: <strong className="text-yellow-400">+{level.points_bonus}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">Niveau {level.number}/10</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <h3 className="font-bold text-blue-400 mb-2">ℹ️ Information</h3>
                  <p className="text-sm text-gray-400">
                    Les niveaux sont calculés automatiquement en fonction des points totaux de l'utilisateur.
                    Pour modifier les niveaux, utilisez directement la base de données (table: <code className="text-cyan-400">levels</code>).
                  </p>
                </div>
              </div>
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className={`bg-gray-800 rounded-lg p-6 border-2 ${
                        badge.rarity === 'legendary'
                          ? 'border-yellow-500/50'
                          : badge.rarity === 'epic'
                          ? 'border-purple-500/50'
                          : badge.rarity === 'rare'
                          ? 'border-blue-500/50'
                          : 'border-gray-700'
                      }`}
                    >
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-3">{badge.icon}</div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {badge.name}
                        </h3>
                        <p
                          className={`text-xs font-bold uppercase ${
                            badge.rarity === 'legendary'
                              ? 'text-yellow-400'
                              : badge.rarity === 'epic'
                              ? 'text-purple-400'
                              : badge.rarity === 'rare'
                              ? 'text-blue-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {badge.rarity}
                        </p>
                      </div>

                      <p className="text-sm text-gray-400 text-center mb-4">
                        {badge.description}
                      </p>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Catégorie:</span>
                          <span className="text-white">{badge.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Condition:</span>
                          <span className="text-white">{badge.requirement_value}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Récompense:</span>
                          <span className="text-yellow-400 font-bold">
                            +{badge.points_reward} pts
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/50 rounded-lg">
                  <h3 className="font-bold text-blue-400 mb-2">ℹ️ Information</h3>
                  <p className="text-sm text-gray-400">
                    Les badges sont attribués automatiquement lorsque les conditions sont remplies.
                    Pour ajouter de nouveaux badges, utilisez la base de données (table: <code className="text-cyan-400">badges</code>).
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
