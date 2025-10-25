import { useState } from 'react';
import { Play, Users, Trophy, Clock, Star, GamepadIcon, Zap, Sparkles, Gift, Rocket, Shield } from 'lucide-react';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-purple-900 via-black to-pink-900">
      {/* Header Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GamepadIcon className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold text-white">GameZone</span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300"
            >
              Se connecter
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 mb-8">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span className="text-purple-300 font-semibold tracking-widest uppercase text-sm">
                Bienvenue dans le futur du gaming
              </span>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl mb-8 font-bold text-purple-400">
              Votre Salle de Jeux
            </h1>
            
            <h2 className="text-2xl sm:text-4xl md:text-5xl mb-12 font-bold text-pink-400">
              Nouvelle Génération
            </h2>
            
            <p className="text-xl text-gray-200 mb-16 max-w-4xl mx-auto leading-relaxed">
              Rejoignez notre communauté grandissante et découvrez pourquoi nous sommes le gaming #1 de la région.
              Expérience gaming ultime avec consoles dernière génération et système de récompenses innovant!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Rocket className="w-6 h-6" />
                <span>Commencer à jouer</span>
              </button>
            </div>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <GamepadIcon className="w-8 h-8 text-purple-400 mb-3" />
              <div className="text-white font-bold">Consoles Next-Gen</div>
              <div className="text-gray-300 text-sm">PS5, Xbox Series X, Switch</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <Trophy className="w-8 h-8 text-yellow-400 mb-3" />
              <div className="text-white font-bold">Tournois & Prix</div>
              <div className="text-gray-300 text-sm">Compétitions régulières</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <Users className="w-8 h-8 text-pink-400 mb-3" />
              <div className="text-white font-bold">Multijoueur Local</div>
              <div className="text-gray-300 text-sm">Jouez entre amis</div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
              <Zap className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-white font-bold">Points & Récompenses</div>
              <div className="text-gray-300 text-sm">Gagnez en jouant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 bg-black/50">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl mb-4 font-bold text-pink-400">
              Nos Tarifs
            </h2>
            <p className="text-gray-300 text-lg">
              Des prix accessibles pour tous les gamers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { duree: "1 heure", prix: "100F", populaire: false },
              { duree: "3 heures", prix: "250F", populaire: true },
              { duree: "Journée complète", prix: "500F", populaire: false }
            ].map((tarif, index) => (
              <div
                key={index}
                className={`bg-white/10 backdrop-blur-md p-8 rounded-2xl border text-center ${
                  tarif.populaire ? 'border-purple-400' : 'border-white/20'
                }`}
              >
                {tarif.populaire && (
                  <div className="mb-3">
                    <span className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold">
                      ⭐ Meilleur choix
                    </span>
                  </div>
                )}
                <h3 className="text-3xl font-bold text-white mb-4">
                  {tarif.duree}
                </h3>
                <div className="text-5xl font-bold text-purple-400 mb-2">
                  {tarif.prix}
                </div>
                <p className="text-gray-400 mb-8">Prix par session</p>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-full font-bold transition-all duration-300"
                >
                  Réserver maintenant
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/80 py-12 border-t border-purple-500/20">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GamepadIcon className="w-8 h-8 text-purple-400" />
            <span className="text-xl font-bold text-white">GameZone</span>
          </div>
          <p className="text-gray-400">
            © 2025 GameZone Porto-Novo. Tous droits réservés.
          </p>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-purple-400">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">Rejoignez GameZone</h3>
            <p className="text-gray-300 mb-6 text-center">Connectez-vous pour accéder à votre espace</p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-full font-semibold"
              >
                Se connecter
              </button>
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="w-full border-2 border-purple-400 text-white py-3 rounded-full font-semibold"
              >
                S'inscrire
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="mt-4 w-full text-gray-400 hover:text-white"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
