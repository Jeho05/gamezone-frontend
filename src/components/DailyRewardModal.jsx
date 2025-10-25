import { useEffect, useState } from 'react';
import { X, Flame, Trophy, Star, Gift, Sparkles } from 'lucide-react';

export default function DailyRewardModal({ isOpen, onClose, rewardData }) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen && rewardData) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, rewardData]);

  if (!isOpen || !rewardData) return null;

  const { current_streak, points_awarded, streak_bonus, badges_earned } = rewardData;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-3xl max-w-md w-full p-8 relative overflow-hidden shadow-2xl border border-purple-500/30 animate-scale-in">
        {/* Animations de fond - Confetti CSS */}
        {isAnimating && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(30)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `-20px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981'][i % 7]
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="absolute top-0 left-0 w-full h-full">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 4}s`
                  }}
                >
                  <Sparkles 
                    className="w-4 h-4 text-yellow-300/30" 
                    style={{ transform: `rotate(${Math.random() * 360}deg)` }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Contenu */}
        <div className="relative z-10">
          {/* Icône principale */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-full shadow-2xl">
                <Gift className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>

          {/* Titre */}
          <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 text-transparent bg-clip-text">
            Récompense Journalière !
          </h2>
          
          <p className="text-center text-purple-200 mb-8">
            Connexion quotidienne réussie 🎉
          </p>

          {/* Série de jours */}
          <div className="bg-black/30 backdrop-blur rounded-2xl p-6 mb-6 border border-purple-500/20">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Flame className="w-8 h-8 text-orange-400 animate-pulse" />
              <span className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">
                {current_streak}
              </span>
              <span className="text-purple-200 text-xl">
                jour{current_streak > 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-center text-sm text-purple-300">
              Série de connexions consécutives
            </p>
          </div>

          {/* Points gagnés */}
          <div className="space-y-3 mb-6">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl p-4 border border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-semibold">Points gagnés</span>
                </div>
                <span className="text-2xl font-bold text-cyan-400">
                  +{points_awarded}
                </span>
              </div>
            </div>

            {streak_bonus > 0 && (
              <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-semibold">Bonus série</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-400">
                    +{streak_bonus}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Badges débloqués */}
          {badges_earned && badges_earned.length > 0 && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 mb-6 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-5 h-5 text-purple-400" />
                <span className="text-white font-semibold">Badges débloqués !</span>
              </div>
              <div className="space-y-2">
                {badges_earned.map((badge, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between bg-black/20 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <span className="text-white text-sm">{badge.name}</span>
                    </div>
                    <span className="text-yellow-400 font-semibold text-sm">
                      +{badge.points_reward} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message d'encouragement */}
          <div className="text-center mb-6">
            <p className="text-purple-200 text-sm">
              Revenez demain pour continuer votre série ! 🚀
            </p>
          </div>

          {/* Bouton de fermeture */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all transform hover:scale-105 shadow-lg"
          >
            Continuer
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.8;
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-confetti {
          animation: confetti 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
