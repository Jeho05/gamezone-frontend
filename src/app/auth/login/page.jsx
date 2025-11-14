'use client';
import { useState } from 'react';
import { Eye, EyeOff, GamepadIcon, Mail, Lock, Sparkles, Zap } from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import VideoBackground from '@/components/ui/VideoBackground';
import FloatingObjects from '@/components/ui/FloatingObjects';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ParallaxObject from '@/components/ui/ParallaxObject';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response is not JSON:', text);
        throw new Error('Erreur serveur (réponse invalide): ' + text.substring(0, 100));
      }
      if (!res.ok) {
        // Check if it's a deactivated account
        if (data?.is_deactivated && data?.message) {
          setError(data.message);
        } else {
          throw new Error(data?.error || 'Échec de connexion');
        }
        return;
      }
      const role = data?.user?.role || 'player';
      if (role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/player/dashboard';
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <VideoBackground 
      videoSrc="/images/video/Arcade_Welcome_Manager_Loop.mp4"
      overlayOpacity={0.8}
    >
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        {/* Floating Gaming Objects */}
        <FloatingObjects count={6} opacity={0.1} />
        
        {/* Parallax Objects */}
        <ParallaxObject src="/images/objet/Dragon-Ball-FighterZ-PNG-Isolated-File.png" alt="DBZ" size={120} speed={0.4} position={{ x: 10, y: 15 }} />
        <ParallaxObject src="/images/objet/Console-Transparent-Background.png" alt="Controller" size={100} speed={0.5} position={{ x: 85, y: 20 }} rotate />
        <ParallaxObject src="/images/objet/Itachi-Uchiha-PNG-Free-Download.png" alt="Itachi" size={110} speed={0.3} position={{ x: 15, y: 75 }} />
        <ParallaxObject src="/images/objet/Golden-Frieza-PNG-HD-Isolated.png" alt="Frieza" size={90} speed={0.6} position={{ x: 80, y: 70 }} />

        <div className="relative z-10 w-full max-w-md animate-slide-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg blur opacity-75 animate-pulse"></div>
                <GamepadIcon className="w-12 h-12 text-white relative animate-glow-pulse" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">OnileGame</span>
            </div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="text-cyan-300 font-semibold tracking-widest uppercase text-sm">Espace Gamer</span>
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <NeonText color="cyan" className="text-4xl md:text-5xl mb-3">
              Bon retour !
            </NeonText>
            <p className="text-gray-300 text-lg">Connectez-vous à votre compte</p>
          </div>

          {/* Login Form */}
          <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border-2 border-red-400/50 text-red-200 text-sm backdrop-blur-sm animate-scale-in">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  <div className="whitespace-pre-wrap">{error}</div>
                </div>
              </div>
            )}
            {/* Email Field */}
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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full glass-strong border-2 border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-white font-bold mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4 text-pink-400" />
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
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

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-white/20 bg-white/10 text-purple-400 focus:ring-purple-400 focus:ring-offset-0"
                />
                <span className="ml-2 text-sm text-gray-300">Se souvenir de moi</span>
              </label>
              <button
                type="button"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                onClick={() => window.location.href = '/auth/forgot-password'}
              >
                Mot de passe oublié ?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative overflow-hidden w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center neon-border-purple hover-lift"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Connexion en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    <span>Se connecter</span>
                  </div>
                )}
              </div>
            </button>
          </form>
        </GlassCard>

          {/* Sign up link */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-lg">
              Pas encore de compte ?{' '}
              <button
                onClick={() => window.location.href = '/auth/register'}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors hover:underline"
              >
                S'inscrire maintenant
              </button>
            </p>
          </div>

          {/* Back to home */}
          <div className="text-center mt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="text-gray-400 hover:text-white transition-colors font-semibold flex items-center gap-2 mx-auto"
            >
              ← Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </VideoBackground>
  );
}