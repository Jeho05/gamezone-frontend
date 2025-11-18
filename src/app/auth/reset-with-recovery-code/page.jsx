'use client';

import { useState } from 'react';
import { Mail, Lock, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import API_BASE from '../../../utils/apiBase';
import VideoBackground from '@/components/ui/VideoBackground';
import FloatingObjects from '@/components/ui/FloatingObjects';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ParallaxObject from '@/components/ui/ParallaxObject';

export default function ResetWithRecoveryCodePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset_with_recovery_code.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          recovery_code: recoveryCode,
          new_password: newPassword,
        }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        throw new Error('Erreur serveur (réponse invalide)');
      }

      if (!res.ok) {
        throw new Error(data?.error || 'Échec de la réinitialisation');
      }

      const message = data?.message || 'Mot de passe réinitialisé avec succès.';
      const newRecovery = data?.recovery_code;
      setSuccess(
        newRecovery
          ? `${message}\nNouveau code de récupération : ${newRecovery}`
          : message
      );
      setNewPassword('');
      setConfirmPassword('');
      setRecoveryCode('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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

        <div className="relative z-10 w-full max-w-md animate-slide-in-up">
          <div className="text-center mb-8">
            <NeonText color="cyan" className="text-3xl md:text-4xl mb-3">
              Réinitialisation avec code
            </NeonText>
            <p className="text-gray-300">
              Utilisez votre email et votre code de récupération pour choisir un nouveau mot de passe.
            </p>
          </div>

          <GlassCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/20 border-2 border-red-400/50 text-red-200 text-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    <div className="whitespace-pre-wrap">{error}</div>
                  </div>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-400/50 text-emerald-200 text-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    <div className="whitespace-pre-wrap">{success}</div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-white font-bold mb-3 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full glass-strong border-2 border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-3 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  Code de récupération
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={recoveryCode}
                    onChange={(e) => setRecoveryCode(e.target.value)}
                    className="w-full glass-strong border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                    placeholder="Code fourni lors de l'inscription"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-400" />
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full glass-strong border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-strong border-2 border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span className="relative z-10">
                  {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser mon mot de passe'}
                </span>
              </button>
            </form>
            <div className="mt-6 text-xs text-gray-300 space-y-1">
              <p className="font-semibold text-amber-300">Code de récupération oublié ?</p>
              <p>
                Si tu n'as plus accès à ton code, contacte l'admin (Ismael Moustapha) en utilisant les
                informations de contact disponibles sur la page d'accueil.
              </p>
              <p>
                Tu peux utiliser le bouton « Retour à l'accueil » ci-dessous pour retrouver ces informations.
              </p>
            </div>
          </GlassCard>

          <div className="text-center mt-6 space-y-2">
            <button
              onClick={() => navigate('/auth/login')}
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la connexion</span>
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white transition-colors font-semibold flex items-center gap-2 mx-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à l'accueil</span>
            </button>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}
