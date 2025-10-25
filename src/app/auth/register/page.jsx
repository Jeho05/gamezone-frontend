'use client';
import { useState } from 'react';
import { Eye, EyeOff, GamepadIcon, Mail, Lock, User, Upload, Sparkles, Zap, Trophy } from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import VideoBackground from '@/components/ui/VideoBackground';
import FloatingObjects from '@/components/ui/FloatingObjects';
import GlassCard from '@/components/ui/GlassCard';
import NeonText from '@/components/ui/NeonText';
import ParallaxObject from '@/components/ui/ParallaxObject';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    profileImage: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setIsLoading(true);
    try {
      let res;
      if (formData.profileImage) {
        const fd = new FormData();
        fd.append('username', formData.username);
        fd.append('email', formData.email);
        fd.append('password', formData.password);
        fd.append('profileImage', formData.profileImage);
        res = await fetch(`${API_BASE}/auth/register.php`, {
          method: 'POST',
          body: fd,
          credentials: 'include',
        });
      } else {
        res = await fetch(`${API_BASE}/auth/register.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: formData.username, email: formData.email, password: formData.password })
        });
      }
      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Response is not JSON:', text);
        throw new Error('Erreur serveur (réponse invalide): ' + text.substring(0, 100));
      }
      if (!res.ok) {
        throw new Error(data?.error || 'Échec de l\'inscription');
      }
      toast.success('Compte créé avec succès !', {
        description: 'Redirection vers la page de connexion...',
        duration: 2000
      });
      setTimeout(() => navigate('/auth/login'), 2000);
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        profileImage: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <VideoBackground 
      videoSrc="/images/video/kling_20251010_Image_to_Video_Use_the_up_4875_0.mp4"
      overlayOpacity={0.8}
    >
      <div className="min-h-screen flex items-center justify-center p-4 py-12 relative">
        {/* Floating Gaming Objects */}
        <FloatingObjects count={6} opacity={0.1} />
        
        {/* Parallax Objects */}
        <ParallaxObject src="/images/objet/Naruto-Ashura-Transparent-PNG.png" alt="Naruto" size={130} speed={0.4} position={{ x: 8, y: 10 }} />
        <ParallaxObject src="/images/objet/Madara-Transparent-Images-PNG.png" alt="Madara" size={110} speed={0.5} position={{ x: 88, y: 15 }} rotate />
        <ParallaxObject src="/images/objet/FIFA-PNG-Photo.png" alt="FIFA" size={100} speed={0.3} position={{ x: 12, y: 80 }} />
        <ParallaxObject src="/images/objet/Goku-Black-Rose-PNG-Free-Download.png" alt="Goku Black" size={90} speed={0.6} position={{ x: 85, y: 75 }} />

        <div className="relative z-10 w-full max-w-md animate-slide-in-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <GamepadIcon className="w-12 h-12 text-purple-400 animate-glow-pulse" />
              <span className="text-3xl font-bold gradient-text">GameZone</span>
            </div>
            <div className="inline-flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce-soft" />
              <span className="text-purple-300 font-semibold tracking-widest uppercase text-sm">Nouveau Joueur</span>
              <Trophy className="w-5 h-5 text-yellow-400 animate-bounce-soft" />
            </div>
            <NeonText color="pink" className="text-4xl md:text-5xl mb-3">
              Rejoignez-nous !
            </NeonText>
            <p className="text-gray-300 text-lg">Créez votre compte gamer</p>
          </div>

          {/* Registration Form */}
          <GlassCard className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border-2 border-red-400/50 text-red-200 text-sm backdrop-blur-sm animate-scale-in">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-red-400" />
                  <div>{error}</div>
                </div>
              </div>
            )}
            {/* Profile Image Upload */}
            <div className="text-center">
              <label className="block text-white font-bold mb-4 flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-purple-400" />
                Photo de profil (optionnel)
              </label>
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-full glass-strong border-2 border-dashed border-purple-400/50 flex items-center justify-center overflow-hidden hover:border-purple-400 transition-all duration-300">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label className="block text-white font-bold mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-400" />
                Pseudo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="w-full glass-strong border-2 border-white/20 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 hover:border-purple-400/50"
                  placeholder="Votre pseudo"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-white font-bold mb-3 flex items-center gap-2">
                <Mail className="w-4 h-4 text-pink-400" />
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
                <Lock className="w-4 h-4 text-blue-400" />
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

            {/* Confirm Password Field */}
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
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
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

            {/* Terms checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="rounded border-white/20 bg-white/10 text-purple-400 focus:ring-purple-400 focus:ring-offset-0"
              />
              <span className="ml-2 text-sm text-gray-300">
                J'accepte les{' '}
                <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                  conditions d'utilisation
                </button>
                {' '}et la{' '}
                <button type="button" className="text-purple-400 hover:text-purple-300 transition-colors">
                  politique de confidentialité
                </button>
              </span>
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
                    <span>Création en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    <span>Créer mon compte</span>
                  </div>
                )}
              </div>
            </button>
          </form>
        </GlassCard>

          {/* Login link */}
          <div className="text-center mt-8">
            <p className="text-gray-300 text-lg">
              Déjà un compte ?{' '}
              <button
                onClick={() => window.location.href = '/auth/login'}
                className="text-purple-400 hover:text-purple-300 font-bold transition-colors hover:underline"
              >
                Se connecter maintenant
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