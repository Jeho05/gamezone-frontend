import { X, Info } from 'lucide-react';

export default function StatsInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const statsExplanations = [
    {
      icon: '⭐',
      title: 'Points Totaux',
      description: 'Le nombre total de points que vous avez accumulés depuis le début.',
      howToEarn: [
        'Connexion quotidienne: +10 points',
        'Jouer des parties: Points selon la durée',
        'Séries de connexion: Bonus progressif',
        'Débloquer des badges: Points bonus',
        'Passer de niveau: Récompense importante'
      ]
    },
    {
      icon: '🎯',
      title: 'Niveau Actuel',
      description: 'Votre niveau de joueur. Plus vous gagnez de points, plus vous montez de niveau.',
      howToEarn: [
        'Accumulez des points pour progresser',
        'Chaque niveau nécessite plus de points',
        'Bonus de points à chaque niveau franchi',
        'Nouveaux badges débloqués par niveau'
      ]
    },
    {
      icon: '🔥',
      title: 'Série de Connexion',
      description: 'Nombre de jours consécutifs où vous vous êtes connecté.',
      howToEarn: [
        'Connectez-vous chaque jour pour maintenir la série',
        'Jour 1-6: +10 points par jour',
        'Jour 7+: Bonus progressif (+2 points par jour)',
        'Jour 30: Badge spécial débloqué',
        'Si vous manquez un jour, la série repart à 0'
      ]
    },
    {
      icon: '🏆',
      title: 'Badges Débloqués',
      description: 'Les badges sont des récompenses spéciales pour vos accomplissements.',
      types: [
        'Badges de niveau: Obtenu en montant de niveau',
        'Badges de série: Pour les connexions régulières',
        'Badges d\'activité: Pour vos actions dans le jeu',
        'Badges spéciaux: Pour des exploits uniques'
      ],
      rewards: 'Chaque badge donne des points bonus!'
    },
    {
      icon: '🎮',
      title: 'Parties Jouées',
      description: 'Le nombre total de sessions de jeu que vous avez effectuées.',
      details: [
        'Chaque session compte pour 1 partie',
        'Les points gagnés dépendent du temps joué',
        'Certains badges nécessitent un nombre de parties'
      ]
    },
    {
      icon: '⏱️',
      title: 'Temps de Jeu Total',
      description: 'La durée totale que vous avez passée à jouer.',
      calculation: [
        'Calculé en heures et minutes',
        'Points gagnés par heure de jeu',
        'Influence votre niveau et progression'
      ]
    },
    {
      icon: '📊',
      title: 'Rang au Classement',
      description: 'Votre position par rapport aux autres joueurs.',
      howItWorks: [
        'Basé sur vos points totaux',
        'Mis à jour en temps réel',
        'Top 10: Badges spéciaux',
        'Compétition hebdomadaire et mensuelle'
      ]
    },
    {
      icon: '🎁',
      title: 'Récompenses Échangées',
      description: 'Nombre de récompenses que vous avez échangées avec vos points.',
      usage: [
        'Utilisez vos points pour acheter des récompenses',
        'Temps de jeu gratuit',
        'Réductions sur les achats',
        'Items spéciaux exclusifs'
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-500/30">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 p-6 rounded-t-2xl border-b border-cyan-500/30 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Info className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Guide des Statistiques</h2>
                <p className="text-cyan-100 text-sm">Comprendre votre progression</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {statsExplanations.map((stat, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">{stat.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{stat.title}</h3>
                  <p className="text-gray-300 mb-3">{stat.description}</p>
                  
                  {stat.howToEarn && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-cyan-400">💡 Comment gagner:</p>
                      <ul className="space-y-1">
                        {stat.howToEarn.map((tip, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-cyan-500 flex-shrink-0">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stat.types && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-purple-400">🏅 Types de badges:</p>
                      <ul className="space-y-1">
                        {stat.types.map((type, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-purple-500 flex-shrink-0">•</span>
                            <span>{type}</span>
                          </li>
                        ))}
                      </ul>
                      {stat.rewards && (
                        <div className="mt-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
                          <p className="text-sm text-yellow-300">✨ {stat.rewards}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {stat.details && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-blue-400">ℹ️ Détails:</p>
                      <ul className="space-y-1">
                        {stat.details.map((detail, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-blue-500 flex-shrink-0">•</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stat.calculation && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-green-400">📐 Calcul:</p>
                      <ul className="space-y-1">
                        {stat.calculation.map((calc, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-green-500 flex-shrink-0">•</span>
                            <span>{calc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stat.howItWorks && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-orange-400">⚙️ Fonctionnement:</p>
                      <ul className="space-y-1">
                        {stat.howItWorks.map((work, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-orange-500 flex-shrink-0">•</span>
                            <span>{work}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {stat.usage && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-pink-400">💎 Utilisation:</p>
                      <ul className="space-y-1">
                        {stat.usage.map((use, i) => (
                          <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                            <span className="text-pink-500 flex-shrink-0">•</span>
                            <span>{use}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Tips généraux */}
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/30 mt-6">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span>💡</span>
              <span>Conseils pour Progresser Rapidement</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-cyan-400 mb-1">🔥 Connexion quotidienne</p>
                <p className="text-xs text-gray-400">Ne manquez pas un jour pour maximiser vos bonus!</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-cyan-400 mb-1">🎯 Objectifs de badges</p>
                <p className="text-xs text-gray-400">Visez les badges pour des points bonus importants</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-cyan-400 mb-1">🎮 Jouez régulièrement</p>
                <p className="text-xs text-gray-400">Plus de temps de jeu = Plus de points</p>
              </div>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-sm font-semibold text-cyan-400 mb-1">🏆 Compétition</p>
                <p className="text-xs text-gray-400">Montez dans le classement pour des récompenses exclusives</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800/90 backdrop-blur p-4 rounded-b-2xl border-t border-gray-700/50">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all"
          >
            J'ai compris !
          </button>
        </div>
      </div>
    </div>
  );
}
