'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Activity, Timer, Play, AlertCircle } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost';

export default function TestSessionPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localMinutes, setLocalMinutes] = useState(0);
  const [localSeconds, setLocalSeconds] = useState(0);

  // Charger la session
  const loadSession = async () => {
    try {
      const res = await fetch(`${API_BASE}/player/simple_session.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      console.log('[TestSession] Session loaded:', data);
      
      if (data.session) {
        setSession(data.session);
        setLocalMinutes(data.session.remaining_minutes);
        setLocalSeconds(0);
        setError(null);
        
        // Afficher debug info
        if (data.debug) {
          console.log('[TestSession] Debug info:', data.debug);
          if (data.debug.total_is_zero) {
            setError('⚠️ ATTENTION: total_minutes = 0 en base de données');
          }
        }
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('[TestSession] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Heartbeat simple (toutes les 30 secondes)
  useEffect(() => {
    if (!session || session.status !== 'active') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/player/simple_heartbeat.php`, {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        console.log('[TestSession] Heartbeat response:', data);
      } catch (err) {
        console.error('[TestSession] Heartbeat error:', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [session]);

  // Décompte local SIMPLE (chaque seconde)
  useEffect(() => {
    if (!session || session.status !== 'active' || localMinutes === 0) return;

    const interval = setInterval(() => {
      setLocalSeconds(prev => {
        if (prev === 0) {
          setLocalMinutes(prevMin => Math.max(0, prevMin - 1));
          return 59;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [session, localMinutes]);

  // Charger au montage
  useEffect(() => {
    loadSession();
  }, []);

  // Recharger toutes les 2 minutes
  useEffect(() => {
    const interval = setInterval(loadSession, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="player" currentPage="test-session" />
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
        <Navigation userType="player" currentPage="test-session" />
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
      <Navigation userType="player" currentPage="test-session" />
      
      <div className="lg:ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-10 h-10 text-purple-400" />
            Test Session Simple
          </h1>
          <p className="text-gray-400">Version simplifiée sans calculs complexes</p>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
            <AlertCircle className="w-5 h-5 inline mr-2" />
            {error}
          </div>
        )}

        {/* Infos brutes de la BDD */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4">Données Brutes (Base de Données)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
            <div>
              <div className="text-gray-400 text-sm">Session ID</div>
              <div className="text-2xl font-bold">#{session.id}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Minutes</div>
              <div className="text-2xl font-bold">{session.total_minutes}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Used Minutes</div>
              <div className="text-2xl font-bold">{session.used_minutes}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm">Remaining Minutes</div>
              <div className="text-2xl font-bold">{session.remaining_minutes}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-300">
            <div>Status: <span className="font-bold">{session.status}</span></div>
            <div>Started At: <span className="font-mono">{session.started_at || 'NULL'}</span></div>
            <div>Game: <span className="font-bold">{session.game_name}</span></div>
          </div>
        </div>

        {/* Décompte visuel */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white">
          <div className="flex items-center gap-4 mb-6">
            <Play className="w-12 h-12" />
            <div>
              <div className="text-3xl font-bold">Session en cours</div>
              <div className="text-white/80">Décompte local (client)</div>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="text-7xl font-bold font-mono">
              {localMinutes}:{String(localSeconds).padStart(2, '0')}
            </div>
            <div className="text-white/80 mt-2">
              sur {session.total_minutes} minutes
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

        {/* Bouton refresh */}
        <div className="mt-6 text-center">
          <button
            onClick={loadSession}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            🔄 Recharger depuis le serveur
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-600/20 border border-blue-500/50 rounded-lg p-6 text-white">
          <h3 className="font-bold mb-2">ℹ️ Comment ça marche</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
            <li>Le décompte diminue chaque seconde côté client</li>
            <li>Un heartbeat est envoyé toutes les 30 secondes (juste pour signaler que vous êtes là)</li>
            <li>Le temps réel est mis à jour par un cron job côté serveur toutes les 1-2 minutes</li>
            <li>Appuyez sur "Recharger" pour voir les vraies données de la base</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
