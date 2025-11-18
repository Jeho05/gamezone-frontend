import React, { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  Play, Pause, Square, Clock, User, Gamepad2, 
  AlertTriangle, CheckCircle, RefreshCw, Timer,
  Activity, TrendingUp
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';
import { resolveAvatarUrl } from '../../../utils/avatarUrl';

export default function ActiveSessions() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    loadSessions();
    
    // Auto-refresh toutes les 30 secondes
    const interval = autoRefresh ? setInterval(loadSessions, 30000) : null;
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Mettre à jour l'heure courante côté client pour un décompte fluide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/active_sessions.php`, {
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSessions(data.sessions || []);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionAction = async (sessionId, action) => {
    try {
      setActionLoading(`${sessionId}-${action}`);
      
      const res = await fetch(`${API_BASE}/admin/manage_session.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, action })
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(data.message || 'Action effectuée');
        loadSessions();
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      active: { bg: 'bg-green-600', text: 'En cours', icon: Play },
      paused: { bg: 'bg-yellow-600', text: 'En pause', icon: Pause },
      ready: { bg: 'bg-blue-600', text: 'Prêt', icon: Clock },
      completed: { bg: 'bg-gray-600', text: 'Terminé', icon: CheckCircle }
    };
    
    const c = config[status] || config.ready;
    const Icon = c.icon;
    
    return (
      <span className={`${c.bg} text-white px-3 py-1 rounded-full text-sm flex items-center gap-1`}>
        <Icon className="w-4 h-4" />
        {c.text}
      </span>
    );
  };

   // Calcul du temps restant réel pour une session
  const calculateRemainingTime = (session) => {
    const total = Number(session.total_minutes) || 0;

    // Pour les sessions non actives, utiliser la valeur serveur si disponible
    if (session.status !== 'active') {
      if (session.remaining_minutes !== undefined && session.remaining_minutes !== null) {
        return Number(session.remaining_minutes) || 0;
      }
      const used = Number(session.used_minutes) || 0;
      return Math.max(0, total - used);
    }

    // Si la session n'a pas encore de started_at, tout le temps est disponible
    if (!session.started_at) {
      return total;
    }

    const lastUpdateTs = new Date(session.last_countdown_update || session.started_at).getTime();
    const elapsedMinutes = Math.max(0, Math.floor((currentTime - lastUpdateTs) / 60000));
    const baseRemaining = Math.max(0, total - (Number(session.used_minutes) || 0));
    const remaining = Math.max(0, baseRemaining - elapsedMinutes);
    return remaining;
  };

  // Calcul du temps utilisé réel pour une session
  const calculateUsedTime = (session) => {
    const total = Number(session.total_minutes) || 0;

    // Pour les sessions non actives ou non démarrées, utiliser used_minutes directement
    if (session.status !== 'active' || !session.started_at) {
      return Math.min(total, Number(session.used_minutes) || 0);
    }

    const lastUpdateTs = new Date(session.last_countdown_update || session.started_at).getTime();
    const elapsedMinutes = Math.max(0, Math.floor((currentTime - lastUpdateTs) / 60000));
    const baseUsed = Number(session.used_minutes) || 0;
    const used = Math.min(total, baseUsed + elapsedMinutes);
    return used;
  };

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const getProgressColor = (remaining, total) => {
    const percent = (remaining / total) * 100;
    if (percent > 50) return 'bg-green-500';
    if (percent > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="w-10 h-10 text-purple-400" />
                Sessions Actives
              </h1>
              <p className="text-gray-400">Gérez les sessions de jeu en temps réel</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}
              </button>
              
              <button
                onClick={loadSessions}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Play className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.active || 0}</span>
              </div>
              <div className="text-green-100">Sessions Actives</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.ready || 0}</span>
              </div>
              <div className="text-blue-100">En Attente</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <Pause className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.paused || 0}</span>
              </div>
              <div className="text-yellow-100">En Pause</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-8 h-8" />
                <span className="text-3xl font-bold">{stats.total || 0}</span>
              </div>
              <div className="text-purple-100">Total Aujourd'hui</div>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {loading && !sessions.length ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Chargement des sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Aucune session active</h3>
            <p className="text-gray-400">Les sessions apparaîtront ici une fois qu'un joueur aura scanné sa facture</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                {(() => {
                  // Pré-calculer les valeurs de temps pour cette session
                  // afin que le rendu soit cohérent
                  session.__remainingTime = calculateRemainingTime(session);
                  session.__usedTime = calculateUsedTime(session);
                  return null;
                })()}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(session.status)}
                      {session.__remainingTime <= 5 && session.status === 'active' && (
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-4 h-4" />
                          Temps faible !
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Joueur</div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          {session.avatar_url ? (
                            <img 
                              src={resolveAvatarUrl(session.avatar_url, session.username)}
                              alt={session.username}
                              className="w-8 h-8 rounded-full border-2 border-purple-400"
                              onError={(e) => e.target.style.display = 'none'}
                            />
                          ) : (
                            <User className="w-6 h-6 text-purple-400" />
                          )}
                          <div>
                            <div>{session.username}</div>
                            <div className="text-xs text-gray-400">Niv. {session.level || 1} • {session.points || 0} pts</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-gray-400 text-sm mb-1">Jeu</div>
                        <div className="text-white font-semibold flex items-center gap-2">
                          <Gamepad2 className="w-4 h-4 text-purple-400" />
                          {session.game_name}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    {session.status === 'ready' && (
                      <button
                        onClick={() => handleSessionAction(session.id, 'start')}
                        disabled={actionLoading === `${session.id}-start`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Démarrer
                      </button>
                    )}
                    
                    {session.status === 'active' && (
                      <>
                        <button
                          onClick={() => handleSessionAction(session.id, 'pause')}
                          disabled={actionLoading === `${session.id}-pause`}
                          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Pause className="w-4 h-4" />
                          Pause
                        </button>
                        <button
                          onClick={() => handleSessionAction(session.id, 'terminate')}
                          disabled={actionLoading === `${session.id}-terminate`}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Square className="w-4 h-4" />
                          Terminer
                        </button>
                      </>
                    )}
                    
                    {session.status === 'paused' && (
                      <button
                        onClick={() => handleSessionAction(session.id, 'resume')}
                        disabled={actionLoading === `${session.id}-resume`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Reprendre
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Temps restant</span>
                    <span className="text-white font-semibold">
                      {formatTime(session.__remainingTime)} / {formatTime(session.total_minutes)}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ${getProgressColor(session.__remainingTime, session.total_minutes)}`}
                      style={{ width: `${(session.__remainingTime / session.total_minutes) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                    <span>Démarré: {new Date(session.started_at || session.ready_at).toLocaleString('fr-FR')}</span>
                    {session.pause_count > 0 && (
                      <span>Pauses: {session.pause_count}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
