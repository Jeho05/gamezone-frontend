'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import API_BASE from '../../../../utils/apiBase';
import VideoBackground from '@/components/ui/VideoBackground';
import FloatingObjects from '@/components/ui/FloatingObjects';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ParallaxObject from '@/components/ui/ParallaxObject';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('Lien de réinitialisation invalide');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/reset_password.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password })
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

      setSuccess(data?.message || 'Mot de passe réinitialisé avec succès');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
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
          src="/images/objet/Itachi-Uchiha-PNG-Free-Download.png"
          alt="Itachi"
          size={110}
          speed={0.3}
          position={{ x: 15, y: 75 }}
        />
        <ParallaxObject
          src="/images/objet/Golden-Frieza-PNG-HD-Isolated.png"
          alt="Frieza"
          size={90}
          speed={0.6}
          position={{ x: 80, y: 70 }}
        />

        <div className="relative z-10 w-full max-w-md animate-slide-in-up">
          <div className="text-center mb-8">
            <NeonText color="cyan" className="text-3xl md:text-4xl mb-3">
              Réinitialiser le mot de passe
            </NeonText>
            <p className="text-gray-300">Choisissez un nouveau mot de passe sécurisé.</p>
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
                  <Lock className="w-4 h-4 text-pink-400" />
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full glass-strong border-2 border-white/20 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-bold mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-400" />
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full glass-strong border-2 border-white/20 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <span className="relative z-10">
                  {isLoading ? 'Mise à jour en cours...' : 'Mettre à jour le mot de passe'}
                </span>
              </button>
            </form>
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
