'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../../../components/Navigation';
import { 
  Activity, Timer, Play, AlertCircle, CheckCircle, Gamepad2, Calendar
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function MySessionSimple() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localMinutes, setLocalMinutes] = useState(0);
  const [localSeconds, setLocalSeconds] = useState(0);
  const [chronometerStarted, setChronometerStarted] = useState(false);

  // Charger la session
  const loadSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/player/my_active_session.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      console.log('[SimpleSession] Session loaded:', data.session);
      
      if (data.session) {
        setSession(data.session);
        setLocalMinutes(data.session.remaining_minutes);
        setLocalSeconds(0);
        
        // Si started_at est NULL, démarrer le chronomètre
        if (!data.session.started_at && !chronometerStarted) {
          console.log('[SimpleSession] Session pas encore démarrée, appel start_session...');
          startChronometer();
        } else if (data.session.started_at) {
          setChronometerStarted(true);
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('[SimpleSession] Error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Démarrer le chronomètre via l'endpoint dédié
  const startChronometer = async () => {
    try {
      console.log('[SimpleSession] Appel API start_session...');
      const res = await fetch(`${API_BASE}/player/start_session.php`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      console.log('[SimpleSession] start_session response:', data);
      
      if (data.success) {
        toast.success('🎬 Chronomètre démarré !', {
          description: 'Votre session de jeu commence maintenant'
        });
        setChronometerStarted(true);
        // Recharger pour avoir started_at
        await loadSession();
      }
    } catch (err) {
      console.error('[SimpleSession] Error starting chronometer:', err);
      toast.error('Erreur au démarrage du chronomètre');
    }
  };

  // Heartbeat simple (met juste à jour last_heartbeat)
  const sendHeartbeat = async () => {
    if (!session || !chronometerStarted) return;
    
    try {
      const res = await fetch(`${API_BASE}/player/simple_heartbeat.php`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      console.log('[SimpleSession] Heartbeat:', data);
    } catch (err) {
      console.error('[SimpleSession] Heartbeat error:', err);
    }
  };

  // Charger au montage
  useEffect(() => {
    loadSession();
  }, []);

  // Heartbeat toutes les 30 secondes
  useEffect(() => {
    if (!session || !chronometerStarted) return;

    const interval = setInterval(sendHeartbeat, 30000);
    return () => clearInterval(interval);
  }, [session, chronometerStarted]);

  // Décompte local
  useEffect(() => {
    if (!chronometerStarted || localMinutes === 0) return;

    const interval = setInterval(() => {
      setLocalSeconds(prev => {
        if (prev === 0) {
          setLocalMinutes(prevMin => {
            const newMin = Math.max(0, prevMin - 1);
            if (newMin === 0) {
              toast.error('Session terminée !');
              setTimeout(() => navigate('/player/my-purchases'), 3000);
            }
            return newMin;
          });
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [chronometerStarted, localMinutes, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="player" currentPage="my-session" />
        <div className="lg:ml-64 p-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <p className="text-white">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="player" currentPage="my-session" />
        <div className="lg:ml-64 p-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 text-center">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Aucune session active</h3>
            <p className="text-gray-400">Vous n'avez pas de session de jeu en cours.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="my-session" />
      
      <div className="lg:ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-purple-400" />
            Ma Session (Version Simple)
          </h1>
          <p className="text-gray-400">Logique simplifiée et robuste</p>
        </div>

        {/* Alert si chronomètre pas démarré */}
        {!chronometerStarted && (
          <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <div className="font-bold">En attente de démarrage...</div>
              <div className="text-sm">Le chronomètre va démarrer automatiquement</div>
            </div>
          </div>
        )}

        {/* Session Info */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-gray-400 text-sm">Jeu</div>
              <div className="text-white text-xl font-bold flex items-center gap-2">
                <Gamepad2 className="w-5 h-5" />
                {session.game_name}
              </div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Durée totale</div>
              <div className="text-white text-xl font-bold">{session.total_minutes} min</div>
            </div>
          </div>
          
          {session.started_at && (
            <div className="text-gray-300 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Démarré le: {new Date(session.started_at).toLocaleString('fr-FR')}
            </div>
          )}
          
          {!session.started_at && (
            <div className="text-yellow-300 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Chronomètre pas encore démarré
            </div>
          )}
        </div>

        {/* Décompte */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            {chronometerStarted ? (
              <CheckCircle className="w-12 h-12" />
            ) : (
              <Play className="w-12 h-12 animate-pulse" />
            )}
            <div>
              <div className="text-3xl font-bold">
                {chronometerStarted ? 'Session en cours' : 'En attente...'}
              </div>
              <div className="text-white/80">
                {chronometerStarted ? 'Décompte actif' : 'Démarrage automatique'}
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-8xl font-bold font-mono">
              {localMinutes}:{String(localSeconds).padStart(2, '0')}
            </div>
            <div className="text-white/80 mt-2">
              restant sur {session.total_minutes} minutes
            </div>
          </div>

          {/* Barre de progression */}
          <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-1000"
              style={{ width: `${(localMinutes / session.total_minutes) * 100}%` }}
            />
          </div>
          
          <div className="text-center mt-4 text-white/80 text-sm">
            {Math.round((localMinutes / session.total_minutes) * 100)}% restant
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4 text-white text-sm font-mono">
          <div className="font-bold mb-2">Debug Info:</div>
          <div>Session ID: {session.id}</div>
          <div>Status: {session.status}</div>
          <div>Started At: {session.started_at || 'NULL'}</div>
          <div>Chronometer Started: {chronometerStarted ? 'YES' : 'NO'}</div>
          <div>Remaining (server): {session.remaining_minutes} min</div>
          <div>Remaining (local): {localMinutes} min {localSeconds} sec</div>
        </div>

        {/* Bouton refresh */}
        <div className="mt-6 text-center">
          <button
            onClick={loadSession}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            🔄 Recharger
          </button>
        </div>
      </div>
    </div>
  );
}
