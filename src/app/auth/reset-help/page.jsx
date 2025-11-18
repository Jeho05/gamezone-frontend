'use client';

import { ArrowLeft, HelpCircle, KeyRound, Mail } from 'lucide-react';
import { useNavigate } from 'react-router';
import VideoBackground from '@/components/ui/VideoBackground';
import FloatingObjects from '@/components/ui/FloatingObjects';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ParallaxObject from '@/components/ui/ParallaxObject';

export default function ResetHelpPage() {
  const navigate = useNavigate();

  return (
    <VideoBackground
      videoSrc="/images/video/Arcade_Welcome_Manager_Loop.mp4"
      overlayOpacity={0.8}
    >
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <FloatingObjects count={6} opacity={0.1} />

        <ParallaxObject
          src="/images/objet/Dragon-Ball-FighterZ-PNG-Isolated-File.png"
          alt="DBZ"
          size={120}
          speed={0.4}
          position={{ x: 10, y: 15 }}
        />
        <ParallaxObject
          src="/images/objet/Console-Transparent-Background.png"
          alt="Controller"
          size={100}
          speed={0.5}
          position={{ x: 85, y: 20 }}
          rotate
        />

        <div className="relative z-10 w-full max-w-xl animate-slide-in-up">
          <div className="text-center mb-8">
            <NeonText color="cyan" className="text-3xl md:text-4xl mb-3 flex items-center justify-center gap-2">
              <HelpCircle className="w-7 h-7 text-cyan-300" />
              <span>Aide à la réinitialisation</span>
            </NeonText>
            <p className="text-gray-300 max-w-lg mx-auto">
              Choisis la bonne solution selon ta situation pour retrouver l'accès à ton compte joueur.
            </p>
          </div>

          <GlassCard className="p-8 space-y-6">
            <div className="bg-white/5 border border-white/15 rounded-xl p-4 flex gap-3">
              <div className="mt-1">
                <KeyRound className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-sm text-gray-100 space-y-1">
                <p className="font-semibold text-green-300">1. Tu as encore ton code de récupération</p>
                <p>
                  Utilise la page <span className="font-semibold text-cyan-300">"Réinitialiser avec un code de récupération"</span>.
                  Tu auras besoin de ton email et de ton code de récupération.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/auth/reset-with-recovery-code')}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 text-xs font-semibold transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Aller à la page de réinitialisation avec code</span>
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/15 rounded-xl p-4 flex gap-3">
              <div className="mt-1">
                <Mail className="w-5 h-5 text-yellow-300" />
              </div>
              <div className="text-sm text-gray-100 space-y-1">
                <p className="font-semibold text-yellow-200">2. Tu as tout oublié (mot de passe + code de récupération)</p>
                <p>
                  Dans ce cas, la réinitialisation doit être faite <span className="font-semibold text-white">manuellement par l'admin</span>.
                  Il vérifiera ton identité et générera un nouveau mot de passe ainsi qu'un nouveau code de récupération.
                </p>
                <p className="text-xs text-yellow-100/90">
                  Contacte l'admin <span className="font-semibold">Ismael Moustapha</span> en utilisant les informations
                  de contact disponibles sur la page d'accueil (téléphone, WhatsApp, email...).
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 text-xs font-semibold transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Aller à la page d'accueil pour voir les contacts</span>
                </button>
              </div>
            </div>

            <div className="bg-white/5 border border-white/15 rounded-xl p-4 text-xs text-gray-200 space-y-2">
              <p className="font-semibold text-amber-300">Important :</p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                <li>Ne partage jamais ton code de récupération ou ton mot de passe avec d'autres joueurs.</li>
                <li>Note ton code de récupération dans un endroit sûr (carnet, gestionnaire de mots de passe, etc.).</li>
                <li>En cas de doute, passe toujours par l'admin pour une réinitialisation manuelle sécurisée.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-100 text-sm font-semibold"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour à la connexion</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/auth/reset-with-recovery-code')}
                className="inline-flex items-center gap-2 text-cyan-300 hover:text-cyan-100 text-sm font-semibold"
              >
                <KeyRound className="w-4 h-4" />
                <span>J'ai mon code, je veux réinitialiser</span>
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </VideoBackground>
  );
}
