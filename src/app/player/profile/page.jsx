import { useState, useEffect, useRef } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  User, 
  Mail, 
  Key, 
  Camera, 
  Save, 
  Award,
  Calendar,
  Activity,
  TrendingUp,
  Shield,
  CheckCircle,
  XCircle,
  Loader,
  LogOut
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { useNavigate } from 'react-router';
import { resolveAvatarUrl } from '../../../utils/avatarUrl';

export default function PlayerProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const fileInputRef = useRef(null);

  // Charger le profil
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await fetch(`${API_BASE}/users/profile.php`, {
          credentials: 'include'
        });
        
        const data = await res.json();
        
        if (res.status === 401) {
          navigate('/auth/login');
          return;
        }
        if (!res.ok) {
          throw new Error(data.error || 'Erreur lors du chargement du profil');
        }
        
        setProfile(data.user);
        setFormData({
          username: data.user.username,
          email: data.user.email,
          current_password: '',
          new_password: '',
          confirm_password: ''
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, []);

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout.php`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      // ignore
    } finally {
      navigate('/auth/login');
    }
  };

  // Mise à jour du profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    
    // Validation
    if (formData.username.trim().length < 3 || formData.username.trim().length > 50) {
      setError("Le nom d'utilisateur doit contenir entre 3 et 50 caractères");
      return;
    }
    const usernamePattern = /^[A-Za-z0-9_.-]+$/;
    if (!usernamePattern.test(formData.username.trim())) {
      setError("Le nom d'utilisateur ne doit contenir que des lettres, chiffres, '.', '_' ou '-'");
      return;
    }
    if (formData.new_password && formData.new_password !== formData.confirm_password) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (formData.new_password && !formData.current_password) {
      setError('Le mot de passe actuel est requis pour changer de mot de passe');
      return;
    }
    
    try {
      setSaving(true);
      
      const payload = {
        username: formData.username,
        email: formData.email
      };
      
      if (formData.new_password) {
        payload.current_password = formData.current_password;
        payload.new_password = formData.new_password;
      }
      
      const res = await fetch(`${API_BASE}/users/profile.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (res.status === 401) {
        navigate('/auth/login');
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
      
      setProfile(data.user);
      setSuccess('Profil mis à jour avec succès!');
      
      // Réinitialiser les champs de mot de passe
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      
      // Fermer le message de succès après 5s
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Upload avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validation
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 5MB)');
      return;
    }
    
    try {
      setAvatarUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('avatar', file);
      
      const res = await fetch(`${API_BASE}/users/avatar.php`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await res.json();
      
      if (res.status === 401) {
        navigate('/auth/login');
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }
      
      setProfile(prev => ({
        ...prev,
        avatar_url: data.avatar_url
      }));
      
      setSuccess('Avatar mis à jour avec succès!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="profile" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Mon Profil 👤
            </h1>
            <p className="text-gray-300">Gérez vos informations personnelles et vos paramètres</p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/40 rounded-lg flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-400/40 rounded-lg flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-200">{success}</p>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative inline-block mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/50 bg-gradient-to-br from-purple-500 to-blue-500">
                      {profile?.avatar_url ? (
                        <img 
                          src={resolveAvatarUrl(profile.avatar_url, profile.username)}
                          alt={profile.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-16 h-16 text-white" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarUploading}
                      className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 rounded-full border-2 border-white transition-colors disabled:opacity-50"
                    >
                      {avatarUploading ? (
                        <Loader className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white mb-1">{profile?.username}</h2>
                  <p className="text-gray-300 text-sm mb-4">{profile?.email}</p>
                  
                  {/* Role Badge */}
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-400/30">
                    {profile?.role === 'admin' ? (
                      <>
                        <Shield className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 font-semibold">Administrateur</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-300 font-semibold">Joueur</span>
                      </>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="mt-6 space-y-4">
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-gray-300">Points</span>
                      </div>
                      <span className="text-white font-bold">{profile?.points?.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        <span className="text-gray-300">Niveau</span>
                      </div>
                      <span className="text-white font-bold">{profile?.level || 'Débutant'}</span>
                    </div>
                    
                    {profile?.stats && (
                      <>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            <span className="text-gray-300">Activités</span>
                          </div>
                          <span className="text-white font-bold">{profile.stats.total_activities}</span>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-5 h-5 text-purple-400" />
                            <span className="text-gray-300">Jours actifs</span>
                          </div>
                          <span className="text-white font-bold">{profile.stats.active_days}</span>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Member Since */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-gray-400 text-sm">
                      Membre depuis le {new Date(profile?.member_since).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Modifier le profil</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom d'utilisateur
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Votre nom d'utilisateur"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-slate-900 text-gray-400">Changer de mot de passe (optionnel)</span>
                    </div>
                  </div>

                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mot de passe actuel
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.current_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, current_password: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Votre mot de passe actuel"
                      />
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.new_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, new_password: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Nouveau mot de passe (min. 6 caractères)"
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirmer le nouveau mot de passe
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        value={formData.confirm_password}
                        onChange={(e) => setFormData(prev => ({ ...prev, confirm_password: e.target.value }))}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                        placeholder="Confirmer le nouveau mot de passe"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        <span>Enregistrement...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>Enregistrer les modifications</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
