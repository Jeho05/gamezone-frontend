import { useState } from 'react';
import { Play, Users, Trophy, Clock, Star, GamepadIcon, Zap, Sparkles, Gift, Rocket, Shield } from 'lucide-react';
import VideoBackground from '@/components/ui/VideoBackground';
import FloatingObjects from '@/components/ui/FloatingObjects';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ParallaxObject from '@/components/ui/ParallaxObject';

export default function HomePage() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      const navOffset = 80; // hauteur du header fixe
      const y = featuresSection.getBoundingClientRect().top + window.pageYOffset - navOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const gameFeatures = [
    {
      icon: <GamepadIcon className="w-8 h-8" />,
      title: "Console Gaming",
      description: "PS5, Xbox Series X, Nintendo Switch"
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Tournois",
      description: "Compétitions hebdomadaires avec prix"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Multijoueur",
      description: "Jouez avec vos amis en local"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Système de points",
      description: "Gagnez des points et débloquez des récompenses"
    }
  ];

  const tarifs = [
    { duree: "1 heure", prix: "100F", populaire: false },
    { duree: "3 heures", prix: "250F", populaire: true },
    { duree: "Journée complète", prix: "500F", populaire: false }
  ];

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-black">
      {/* Global Floating Objects - Plus visibles et plus gros */}
      <FloatingObjects count={8} opacity={0.2} />
      {/* Header Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GamepadIcon className="w-8 h-8 text-purple-400" />
              <span className="text-xl font-bold gradient-text">GameZone</span>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Se connecter
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <VideoBackground 
        videoSrc="/images/video/Cyber_Arcade_Neon_Ember.mp4"
        overlayOpacity={0.75}
        className="bg-black"
      >
        <section className="relative min-h-screen bg-transparent overflow-hidden pt-24 pb-20">
          {/* Parallax Gaming Objects - Tailles ajustées pour éviter débordement */}
          <ParallaxObject src="/images/objet/Goku-Blue-PNG-Photo.png" alt="Goku" size={180} speed={0.3} position={{ x: 15, y: 20 }} />
          <ParallaxObject src="/images/objet/Kratos-PNG-Clipart.png" alt="Kratos" size={150} speed={0.4} position={{ x: 80, y: 30 }} rotate />
          <ParallaxObject src="/images/objet/Console-PNG-Clipart.png" alt="Console" size={130} speed={0.5} position={{ x: 20, y: 65 }} />
          <ParallaxObject src="/images/objet/Dragon-Ball-Z-Logo-PNG-HD.png" alt="Dragon Ball" size={100} speed={0.6} position={{ x: 75, y: 70 }} />

          <div className="relative z-10 container mx-auto px-6 md:px-8 max-w-7xl">
            {/* Hero Text */}
            <div className="text-center mb-12 animate-slide-in-up">
              <div className="inline-flex items-center gap-2 mb-8">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
                <span className="text-purple-300 font-semibold tracking-widest uppercase text-sm">Bienvenue dans le futur du gaming</span>
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
              <NeonText color="purple" className="text-4xl sm:text-6xl md:text-7xl mb-8">
                Votre Salle de Jeux
              </NeonText>
              <NeonText color="pink" className="text-2xl sm:text-4xl md:text-6xl mb-12">
                Nouvelle Génération
              </NeonText>
              <p className="text-xl text-gray-200 mb-16 max-w-4xl mx-auto leading-relaxed animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
                Rejoignez notre communauté grandissante et découvrez pourquoi nous sommes le gaming #1 de la région.
                Expérience gaming ultime avec consoles dernière génération et système de récompenses innovant!
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20 animate-slide-in-up" style={{ animationDelay: '0.4s' }}>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-3 neon-border-purple hover-lift"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <Rocket className="w-6 h-6 animate-bounce-soft" />
                  <span>Commencer à jouer</span>
                </button>
                <button 
                  onClick={scrollToFeatures}
                  className="glass-strong border-2 border-purple-400/50 hover:border-pink-400 text-white px-10 py-5 rounded-full font-bold text-lg transition-all duration-300 hover:bg-purple-400/20 hover-lift flex items-center justify-center gap-3"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Découvrir</span>
                </button>
              </div>
            </div>
            
            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <GlassCard className="p-6">
                <div className="flex items-center gap-3">
                  <GamepadIcon className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-white font-bold">Consoles Next-Gen</div>
                    <div className="text-gray-300 text-sm">PS5, Xbox Series X, Switch</div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-white font-bold">Tournois & Prix</div>
                    <div className="text-gray-300 text-sm">Compétitions régulières</div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-pink-400" />
                  <div>
                    <div className="text-white font-bold">Multijoueur Local</div>
                    <div className="text-gray-300 text-sm">Jouez entre amis</div>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-6">
                <div className="flex items-center gap-3">
                  <Zap className="w-8 h-8 text-blue-400" />
                  <div>
                    <div className="text-white font-bold">Points & Récompenses</div>
                    <div className="text-gray-300 text-sm">Gagnez en jouant</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </section>
      </VideoBackground>

      {/* Section Avantages */}
      <section id="features" className="relative py-32 bg-gradient-to-b from-black via-zinc-900 to-black overflow-x-hidden scroll-mt-24">
          <div className="container mx-auto px-6 md:px-8 max-w-6xl relative z-10">
            <div className="text-center mb-16 animate-slide-in-up">
              <NeonText color="purple" className="text-4xl md:text-5xl mb-4">
                Pourquoi nous choisir ?
              </NeonText>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">Une expérience pensée pour vous, de l'accueil aux récompenses.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
              <GlassCard hover={false} className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center gap-3">
                  <GamepadIcon className="w-8 h-8 text-purple-400" />
                  <div className="text-white font-semibold text-xl">Matériel haut de gamme</div>
                  <p className="text-gray-400 text-sm">Consoles et écrans performants</p>
                </div>
              </GlassCard>
              <GlassCard hover={false} className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center gap-3">
                  <Trophy className="w-8 h-8 text-yellow-400" />
                  <div className="text-white font-semibold text-xl">Tournois & Classements</div>
                  <p className="text-gray-400 text-sm">Compétitions régulières</p>
                </div>
              </GlassCard>
              <GlassCard hover={false} className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center gap-3">
                  <Users className="w-8 h-8 text-pink-400" />
                  <div className="text-white font-semibold text-xl">Multijoueur Local</div>
                  <p className="text-gray-400 text-sm">Jouez entre amis</p>
                </div>
              </GlassCard>
              <GlassCard hover={false} className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center gap-3">
                  <Zap className="w-8 h-8 text-blue-400" />
                  <div className="text-white font-semibold text-xl">Points & Avantages</div>
                  <p className="text-gray-400 text-sm">Gagnez en jouant</p>
                </div>
              </GlassCard>
              <GlassCard hover={false} className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center gap-3">
                  <Clock className="w-8 h-8 text-cyan-400" />
                  <div className="text-white font-semibold text-xl">Horaires étendus</div>
                  <p className="text-gray-400 text-sm">Ouvert 08h - 23h</p>
                </div>
              </GlassCard>
              <GlassCard hover={false} className="p-8 md:p-10">
                <div className="flex flex-col items-center text-center gap-3">
                  <Shield className="w-8 h-8 text-green-400" />
                  <div className="text-white font-semibold text-xl">Ambiance sécurisée</div>
                  <p className="text-gray-400 text-sm">Confort et sécurité</p>
                </div>
              </GlassCard>
            </div>
          </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-24 bg-gradient-to-b from-black via-zinc-900 to-black overflow-x-hidden">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl relative z-10">
          <div className="text-center mb-12 animate-slide-in-up">
            <div className="inline-flex items-center gap-2 mb-6">
              <Gift className="w-6 h-6 text-yellow-400 animate-bounce-soft" />
              <span className="text-purple-300 font-semibold tracking-widest uppercase text-sm">Offres spéciales</span>
            </div>
            <NeonText color="pink" className="text-4xl md:text-5xl mb-4">
              Nos Tarifs
            </NeonText>
            <p className="text-gray-300 text-lg max-w-3xl mx-auto">
              Des prix accessibles pour tous les gamers
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 items-stretch gap-8 md:gap-12 max-w-6xl mx-auto">
            {tarifs.map((tarif, index) => (
              <div
                key={index}
                className="animate-scale-in h-full"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <GlassCard hover={false}
                  className={`p-8 md:p-10 text-center flex flex-col h-full ${
                    tarif.populaire 
                      ? 'border-purple-400/40' 
                      : ''
                  }`}
                >
                  {tarif.populaire && (
                    <div className="mb-3 flex justify-center">
                      <span className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 border border-yellow-400/40">
                        <Star className="w-3 h-3" />
                        Meilleur choix
                      </span>
                    </div>
                  )}
                  <h3 className="text-3xl font-bold gradient-text mb-4">
                    {tarif.duree}
                  </h3>
                  <div className="text-4xl font-bold mb-2">
                    <NeonText color="purple" className="text-4xl">
                      {tarif.prix}
                    </NeonText>
                  </div>
                  <p className="text-gray-400 mb-8">Prix par session</p>
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="mt-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-full font-bold transition-all duration-300 hover-lift neon-border-purple group"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <Play className="w-5 h-5 group-hover:animate-bounce-soft" />
                      Réserver maintenant
                    </span>
                  </button>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="relative py-32 bg-gradient-to-b from-black via-zinc-900 to-black overflow-x-hidden">
        <div className="container mx-auto px-6 md:px-8 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div className="animate-slide-in-right">
              <NeonText color="blue" className="text-3xl mb-8">
                <Clock className="inline-block w-10 h-10 mb-2 mr-3" />
                Horaires d'ouverture
              </NeonText>
              <div className="space-y-6">
                <GlassCard hover={false} className="p-8 md:p-10">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">Tous les jours</span>
                    <span className="text-purple-400 font-bold text-xl">08h - 23h</span>
                  </div>
                </GlassCard>
                <GlassCard hover={false} className="p-8 md:p-10 bg-gradient-to-r from-green-900/20 to-green-700/20 border border-green-400/30">
                  <div className="flex items-center justify-center gap-3">
                    <Shield className="w-6 h-6 text-green-400" />
                    <span className="text-green-400 font-bold text-lg">Ouvert tous les jours, pas de jour férié</span>
                  </div>
                </GlassCard>
                <GlassCard hover={false} className="p-8 md:p-10 bg-gradient-to-r from-blue-900/20 to-blue-700/20 border border-blue-400/30">
                  <div className="text-center">
                    <span className="text-blue-400 font-semibold">15 heures d'ouverture par jour</span>
                  </div>
                </GlassCard>
              </div>
            </div>
            <div className="animate-slide-in-up" style={{ animationDelay: '0.2s' }}>
              <NeonText color="pink" className="text-3xl mb-8">
                📍 Localisation
              </NeonText>
              <GlassCard hover={false} className="p-8 md:p-10">
                <p className="text-white text-lg mb-6 leading-relaxed">
                  <strong className="text-purple-400">📍 Adresse:</strong><br />
                  Kpobgomé von Cinéma King<br />
                  Porto-Novo, Bénin 🇧🇯
                </p>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  <strong className="text-pink-400">📞 Téléphone:</strong> <a href="tel:+2290161728810" className="hover:text-pink-300 transition-colors">+229 01 61 72 88 10</a><br />
                  <strong className="text-green-400">💬 WhatsApp:</strong> <a href="https://wa.me/2290161728810" target="_blank" rel="noopener noreferrer" className="hover:text-green-300 transition-colors">+229 01 61 72 88 10</a><br />
                  <strong className="text-blue-400">✉️ Email:</strong> <a href="mailto:moustaphaismail7@gmail.com" className="hover:text-blue-300 transition-colors">moustaphaismail7@gmail.com</a>
                </p>
                <div className="h-72 md:h-96 bg-gradient-to-br from-green-900/50 to-yellow-900/50 rounded-xl overflow-hidden border-2 border-green-400/30">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126168.58447265958!2d2.6288893!3d6.4968574!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x10238e1c316c8b9d%3A0x6e83b5d6ec4a2e4a!2sPorto-Novo%2C%20B%C3%A9nin!5e0!3m2!1sfr!2sfr!4v1729593600000!5m2!1sfr!2sfr"
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }}
                    allowFullScreen="" 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Carte Porto-Novo, Bénin"
                  ></iframe>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-12 border-t border-purple-500/20">
        <div className="container mx-auto px-6 md:px-8 max-w-7xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {/* GameZone Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GamepadIcon className="w-8 h-8 text-purple-400" />
                <span className="text-xl font-bold text-white">GameZone</span>
              </div>
              <p className="text-gray-400 text-sm">
                Le gaming #1 de la région<br />
                Porto-Novo, Bénin 🇧🇯
              </p>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="text-white font-bold mb-3">Contact</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-400">
                  📞 <a href="tel:+2290161728810" className="hover:text-purple-400 transition-colors">+229 01 61 72 88 10</a>
                </p>
                <p className="text-gray-400">
                  💬 <a href="https://wa.me/2290161728810" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp</a>
                </p>
                <p className="text-gray-400">
                  ✉️ <a href="mailto:moustaphaismail7@gmail.com" className="hover:text-blue-400 transition-colors">moustaphaismail7@gmail.com</a>
                </p>
              </div>
            </div>
            
            {/* Developer */}
            <div>
              <h3 className="text-white font-bold mb-3">Développeur</h3>
              <div className="space-y-2 text-sm">
                <p className="text-purple-400 font-semibold">JadaRiseLab</p>
                <p className="text-gray-400">
                  📞 <a href="tel:0140318288" className="hover:text-purple-400 transition-colors">01 40 31 82 88</a>
                </p>
                <p className="text-gray-400">
                  💬 <a href="https://wa.me/140318288" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors">WhatsApp</a>
                </p>
                <p className="text-gray-400">
                  ✉️ <a href="mailto:saccajeho@gmail.com" className="hover:text-blue-400 transition-colors">saccajeho@gmail.com</a>
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-purple-500/20 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 GameZone Porto-Novo. Tous droits réservés. | Développé par <span className="text-purple-400 font-semibold">JadaRiseLab</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Rejoignez GameZone</h3>
              <p className="text-gray-300">Connectez-vous pour accéder à votre espace</p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/auth/login';
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 rounded-full font-semibold transition-all duration-300"
              >
                Se connecter
              </button>
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  window.location.href = '/auth/register';
                }}
                className="w-full border-2 border-purple-400 hover:bg-purple-400/20 text-white py-3 rounded-full font-semibold transition-all duration-300"
              >
                S'inscrire
              </button>
            </div>
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}