import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../../../components/Navigation';
import { 
  Activity, Clock, Play, Pause, AlertCircle, CheckCircle,
  Timer, Gamepad2, Calendar, RefreshCw, Trophy
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';
import { useSessionCountdown } from '../../../hooks/useSessionCountdown';

export default function MySession() {
  const navigate = useNavigate();
  const [serverSession, setServerSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(Date.now());

  // Callback quand la session se termine côté client
  const handleSessionEnd = useCallback(() => {
    toast.error('Votre session de jeu est terminée !', {
      duration: 10000,
      description: 'Votre facture a été utilisée et est maintenant inactive.'
    });
    
    // Redirection après 5 secondes
    setTimeout(() => {
      navigate('/player/my-purchases');
    }, 5000);
  }, [navigate]);

  // Hook personnalisé pour le décompte local
  const countdown = useSessionCountdown(serverSession, handleSessionEnd);

  // Démarrer le chronomètre si started_at est NULL
  const startChronometerIfNeeded = useCallback(async () => {
    try {
      console.log('[MySession] Appel start_session pour démarrer le chronomètre...');
      const res = await fetch(`${API_BASE}/player/start_session.php`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      console.log('[MySession] start_session response:', data);
      
      if (data.success) {
        toast.success('🎬 Chronomètre démarré !', {
          description: 'Votre session commence maintenant'
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('[MySession] Error starting chronometer:', err);
      return false;
    }
  }, []);

  // Définir loadSession AVEC useCallback
  const loadSession = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/player/my_active_session.php`, {
        credentials: 'include'
      });
      
      const data = await res.json();
      
      console.log('[MySession] Loaded session from server:', data.session);
      
      if (data.session) {
        setServerSession(data.session);
        setLastSync(Date.now());
        
        // Si started_at est NULL, démarrer le chronomètre
        if (!data.session.started_at) {
          console.log('[MySession] started_at est NULL, démarrage automatique...');
          const started = await startChronometerIfNeeded();
          if (started) {
            // Recharger pour avoir started_at
            setTimeout(() => loadSession(), 1000);
          }
        }
      } else {
        setServerSession(null);
      }
    } catch (err) {
      console.error('[MySession] Error loading session:', err);
    } finally {
      setLoading(false);
    }
  }, [startChronometerIfNeeded]);

  // Définir sendHeartbeat simplifié
  const sendHeartbeat = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/player/simple_heartbeat.php`, {
        method: 'POST',
        credentials: 'include'
      });
      
      const data = await res.json();
      console.log('[MySession] Heartbeat:', data);
    } catch (err) {
      console.error('[MySession] Heartbeat error:', err);
    }
  }, []);

  // Charger la session initiale
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Heartbeat simple toutes les 30 secondes
  useEffect(() => {
    if (!serverSession || serverSession.status !== 'active' || !serverSession.started_at) {
      return;
    }

    console.log('[MySession] Setting up heartbeat interval');

    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [serverSession, sendHeartbeat]);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}min` : `${m}min`;
  };

  const getStatusConfig = (status) => {
    const config = {
      active: {
        bg: 'bg-gradient-to-br from-green-600 to-green-700',
        text: 'Session en cours',
        icon: Play,
        pulse: true
      },
      paused: {
        bg: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
        text: 'Session en pause',
        icon: Pause,
        pulse: false
      },
      ready: {
        bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
        text: 'Session prête',
        icon: Clock,
        pulse: false
      },
      completed: {
        bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
        text: 'Session terminée',
        icon: CheckCircle,
        pulse: false
      }
    };
    return config[status] || config.ready;
  };

  const getProgressColor = (remaining, total) => {
    const percent = (remaining / total) * 100;
    if (percent > 50) return 'from-green-500 to-green-600';
    if (percent > 20) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="my-session" />
      
      <div className="lg:ml-64 p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Activity className="w-10 h-10 text-purple-400" />
                Ma Session de Jeu
              </h1>
              <p className="text-gray-400">Décompte en temps réel • Sync serveur: {Math.floor((Date.now() - lastSync) / 1000)}s</p>
            </div>
            
            <button
              onClick={loadSession}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Synchroniser
            </button>
          </div>
        </div>

        {loading && !countdown.session ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
            <RefreshCw className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-300">Chargement de votre session...</p>
          </div>
        ) : !countdown.session ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center border border-white/20">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Aucune session active</h3>
            <p className="text-gray-400 mb-6">
              Vous n'avez pas de session de jeu en cours actuellement.
            </p>
            <a
              href="/player/shop"
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
            >
              Acheter du temps de jeu
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <div className={`${getStatusConfig(countdown.session.status).bg} rounded-xl p-8 text-white relative overflow-hidden`}>
              {getStatusConfig(countdown.session.status).pulse && (
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
              )}
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    {React.createElement(getStatusConfig(countdown.session.status).icon, {
                      className: "w-12 h-12"
                    })}
                    <div>
                      <div className="text-3xl font-bold">{getStatusConfig(countdown.session.status).text}</div>
                      <div className="text-white/80 text-sm">Session #{countdown.session.id}</div>
                    </div>
                  </div>
                  
                  {countdown.session.status === 'active' && (
                    <div className="text-right">
                      <div className="text-sm text-white/80">Décompte live</div>
                      <div className="text-2xl font-bold animate-pulse">⏱️</div>
                    </div>
                  )}
                  
                  {(countdown.session.status === 'completed' || countdown.isExpired) && (
                    <div className="bg-red-600/20 border-2 border-red-500 rounded-lg px-4 py-2 animate-pulse">
                      <div className="text-red-100 font-bold">SESSION TERMINÉE</div>
                      <div className="text-red-200 text-sm">Redirection en cours...</div>
                    </div>
                  )}
                </div>

                {/* Game Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <Gamepad2 className="w-4 h-4" />
                      Jeu
                    </div>
                    <div className="text-xl font-semibold">{countdown.session.game_name}</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Démarré le
                    </div>
                    <div className="text-xl font-semibold">
                      {new Date(countdown.session.started_at || countdown.session.ready_at).toLocaleString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Progress */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Timer className="w-8 h-8 text-purple-400" />
                  <h3 className="text-2xl font-bold text-white">Temps de Jeu</h3>
                </div>
                
                {countdown.isLowTime && countdown.session.status === 'active' && (
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2 animate-pulse">
                    <AlertCircle className="w-5 h-5" />
                    Temps faible !
                  </div>
                )}
              </div>

              {/* Big Time Display */}
              <div className="text-center mb-6">
                <div className="text-6xl font-bold text-white mb-2 font-mono">
                  {countdown.remainingMinutes}:{String(countdown.remainingSeconds).padStart(2, '0')}
                </div>
                <div className="text-gray-400">restant sur {formatTime(countdown.totalMinutes)}</div>
              </div>

              {/* Progress Bar */}
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(countdown.remainingMinutes, countdown.totalMinutes)} transition-all duration-1000`}
                    style={{ width: `${(countdown.remainingMinutes / countdown.totalMinutes) * 100}%` }}
                  >
                    <div className="h-full w-full bg-white/20 animate-pulse" />
                  </div>
                </div>
                
                {/* Percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-bold text-sm drop-shadow-lg">
                    {countdown.progressPercent}%
                  </span>
                </div>
              </div>

              {/* Time Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">{formatTime(countdown.totalMinutes)}</div>
                  <div className="text-gray-400 text-sm">Total acheté</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">{formatTime(countdown.usedMinutes)}</div>
                  <div className="text-gray-400 text-sm">Utilisé</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400">{formatTime(countdown.remainingMinutes)}</div>
                  <div className="text-gray-400 text-sm">Restant</div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            {countdown.session.pause_count > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <div className="flex items-center gap-3 text-yellow-400">
                  <Pause className="w-6 h-6" />
                  <div>
                    <div className="font-semibold">Session mise en pause {countdown.session.pause_count} fois</div>
                    <div className="text-sm text-gray-400">Temps total de pause: {formatTime(countdown.session.total_pause_time || 0)}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Invoice Info */}
            {countdown.session.invoice_number && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h4 className="text-lg font-semibold text-white mb-3">Informations de Facturation</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400">Numéro de facture</div>
                    <div className="text-white font-mono">{countdown.session.invoice_number}</div>
                  </div>
                  <div>
                    <div className="text-gray-400">Code de validation</div>
                    <div className="text-white font-mono">{countdown.session.validation_code}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-600/20 border-2 border-blue-500 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                <div className="text-blue-100">
                  <div className="font-semibold mb-1">Comment ça fonctionne ?</div>
                  <ul className="text-sm space-y-1 text-blue-200">
                    <li>• Décompte en temps réel (chaque seconde) côté client</li>
                    <li>• Synchronisation serveur toutes les 30 secondes</li>
                    <li>• Alerte automatique à 5 minutes restantes</li>
                    <li>• Redirection automatique quand le temps expire</li>
                    <li>• Aucun rechargement de page, fluidité maximale</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
