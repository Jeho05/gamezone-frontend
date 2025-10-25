import React, { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  Play,
  Pause,
  Square,
  Timer,
  Clock,
  User,
  Gamepad2,
  Activity,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Filter,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [expiredSessions, setExpiredSessions] = useState([]);

  // Fonction pour calculer le temps restant réel d'une session
  const calculateRemainingTime = (session) => {
    if (session.status !== 'active') {
      return session.remaining_minutes || 0;
    }
    
    const lastUpdate = new Date(session.last_countdown_update || session.started_at).getTime();
    const elapsedMinutes = Math.floor((currentTime - lastUpdate) / 60000);
    const remaining = Math.max(0, session.remaining_minutes - elapsedMinutes);
    return remaining;
  };

  // Fonction pour calculer le temps utilisé réel d'une session
  const calculateUsedTime = (session) => {
    if (session.status !== 'active') {
      return session.used_minutes || 0;
    }
    
    const lastUpdate = new Date(session.last_countdown_update || session.started_at).getTime();
    const elapsedMinutes = Math.floor((currentTime - lastUpdate) / 60000);
    return session.used_minutes + elapsedMinutes;
  };

  // Fonction pour calculer la progression réelle d'une session
  const calculateProgressPercent = (session) => {
    if (session.total_minutes === 0) return 0;
    
    if (['completed', 'expired', 'terminated'].includes(session.status)) {
      return 100;
    }
    
    const usedTime = calculateUsedTime(session);
    const progress = Math.min(100, Math.round((usedTime / session.total_minutes) * 100));
    return progress;
  };

  // Détecte les sessions expirées (temps écoulé mais toujours actives)
  const detectExpiredSessions = () => {
    const expired = sessions.filter(session => {
      if (!['active', 'paused'].includes(session.status)) return false;
      const remaining = calculateRemainingTime(session);
      return remaining === 0;
    });
    setExpiredSessions(expired);
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 120000); // Sync serveur toutes les 2 minutes
    return () => clearInterval(interval);
  }, [filter]);
  
  // Mise à jour du temps actuel chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Détection des sessions expirées
  useEffect(() => {
    detectExpiredSessions();
  }, [currentTime, sessions]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const url = filter 
        ? `${API_BASE}/admin/manage_session.php?status=${filter}`
        : `${API_BASE}/admin/manage_session.php`;
      
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.sessions) {
        setSessions(data.sessions);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (sessionId, action) => {
    const confirmMessages = {
      start: 'Démarrer cette session ?',
      pause: 'Mettre en pause cette session ?',
      resume: 'Reprendre cette session ?',
      terminate: 'Terminer cette session ? Cette action est irréversible.'
    };

    if (!confirm(confirmMessages[action])) return;

    try {
      setActionLoading(sessionId);

      const res = await fetch(`${API_BASE}/admin/manage_session.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, action })
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        loadSessions();
      } else {
        toast.error(data.error || 'Erreur lors de l\'action');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur de connexion');
    } finally {
      setActionLoading(null);
    }
  };

  // Terminer toutes les sessions expirées en un clic
  const handleTerminateAllExpired = async () => {
    if (expiredSessions.length === 0) return;
    
    if (!confirm(`Terminer ${expiredSessions.length} session(s) expirée(s) ?`)) return;

    toast.info(`Terminaison de ${expiredSessions.length} session(s)...`);

    let successCount = 0;
    for (const session of expiredSessions) {
      try {
        const res = await fetch(`${API_BASE}/admin/manage_session.php`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: session.id, action: 'terminate' })
        });

        const data = await res.json();
        if (data.success) successCount++;
      } catch (error) {
        console.error(`Erreur session ${session.id}:`, error);
      }
    }

    toast.success(`${successCount} session(s) terminée(s) avec succès!`);
    loadSessions();
  };

  const getStatusConfig = (status) => {
    const configs = {
      ready: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Prête' },
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      paused: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'En Pause' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Terminée' },
      expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expirée' },
      terminated: { bg: 'bg-red-100', text: 'text-red-700', label: 'Arrêtée' }
    };
    return configs[status] || configs.ready;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filters = [
    { value: '', label: 'Toutes' },
    { value: 'ready', label: 'Prêtes' },
    { value: 'active', label: 'Actives' },
    { value: 'paused', label: 'En Pause' },
    { value: 'completed', label: 'Terminées' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="admin" />
      
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <Activity className="w-8 h-8" />
              Gestion des Sessions
            </h1>
            <p className="text-gray-600">Surveillance en temps réel • Calcul dynamique sans rechargement</p>
          </div>

          {/* ALERTE SESSIONS EXPIRÉES */}
          {expiredSessions.length > 0 && (
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-xl shadow-2xl p-6 mb-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="bg-white rounded-full p-3">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    ⚠️ {expiredSessions.length} Session(s) Expirée(s) Détectée(s)
                  </h2>
                  <p className="text-red-100 mb-4">
                    Ces sessions ont atteint 100% de leur temps mais sont toujours actives/en pause. 
                    Elles doivent être terminées pour libérer les ressources.
                  </p>
                  
                  {/* Liste des sessions expirées */}
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-4 space-y-2">
                    {expiredSessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between bg-white/20 rounded p-3">
                        <div className="flex items-center gap-3 text-white">
                          <User className="w-5 h-5" />
                          <div>
                            <div className="font-bold">{session.username}</div>
                            <div className="text-sm text-red-100">{session.game_name}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-white/30 px-3 py-1 rounded-full text-white font-semibold text-sm">
                            {formatTime(session.total_minutes)} écoulé
                          </span>
                          <button
                            onClick={() => handleAction(session.id, 'terminate')}
                            disabled={actionLoading === session.id}
                            className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 disabled:opacity-50 flex items-center gap-2 shadow-lg"
                          >
                            <Square className="w-4 h-4" />
                            {actionLoading === session.id ? 'Terminaison...' : 'Terminer'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Bouton pour tout terminer */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleTerminateAllExpired}
                      disabled={actionLoading}
                      className="px-6 py-3 bg-white text-red-600 rounded-xl font-bold hover:bg-red-50 disabled:opacity-50 flex items-center gap-2 shadow-xl transform hover:scale-105 transition-all"
                    >
                      <XCircle className="w-5 h-5" />
                      Terminer Toutes ({expiredSessions.length})
                    </button>
                    <button
                      onClick={loadSessions}
                      className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 flex items-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Actualiser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-purple-600">{stats.total || 0}</div>
                  <div className="text-gray-600 text-sm">Total</div>
                </div>
                <TrendingUp className="w-12 h-12 text-purple-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-green-600">{stats.active || 0}</div>
                  <div className="text-gray-600 text-sm">Actives</div>
                </div>
                <Play className="w-12 h-12 text-green-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-blue-600">{stats.ready || 0}</div>
                  <div className="text-gray-600 text-sm">Prêtes</div>
                </div>
                <Clock className="w-12 h-12 text-blue-300" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-yellow-600">{stats.paused || 0}</div>
                  <div className="text-gray-600 text-sm">Pause</div>
                </div>
                <Pause className="w-12 h-12 text-yellow-300" />
              </div>
            </div>

            {/* Carte sessions expirées */}
            <div className={`bg-white rounded-xl p-6 shadow-lg ${expiredSessions.length > 0 ? 'ring-4 ring-red-500 animate-pulse' : ''}`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-3xl font-bold ${expiredSessions.length > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                    {expiredSessions.length}
                  </div>
                  <div className="text-gray-600 text-sm">Expirées</div>
                </div>
                <AlertTriangle className={`w-12 h-12 ${expiredSessions.length > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-gray-700">
                <Filter className="w-5 h-5" />
                <span className="font-semibold">Filtrer:</span>
              </div>
              {filters.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filter === f.value
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                onClick={loadSessions}
                className="ml-auto px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Sessions List */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20">
                <Activity className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Aucune session</h3>
                <p className="text-gray-500">
                  {filter ? 'Aucune session avec ce statut' : 'Aucune session enregistrée'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Joueur</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Jeu</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Temps</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Progression</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Statut</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Début</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {sessions.map((session) => {
                      const statusConfig = getStatusConfig(session.status);
                      const remainingTime = calculateRemainingTime(session);
                      const usedTime = calculateUsedTime(session);
                      const progressPercent = calculateProgressPercent(session);
                      const isLowTime = remainingTime <= 10 && session.status === 'active';
                      const isExpired = remainingTime === 0 && ['active', 'paused'].includes(session.status);

                      return (
                        <tr 
                          key={session.id} 
                          className={`hover:bg-gray-50 ${isExpired ? 'bg-red-50 border-l-4 border-red-600' : ''}`}
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-semibold text-gray-800">{session.username}</div>
                                <div className="text-xs text-gray-500">{session.email}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <Gamepad2 className="w-5 h-5 text-purple-500" />
                              <span className="font-medium">{session.game_name}</span>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {['completed', 'expired', 'terminated'].includes(session.status) ? (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Timer className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-600 font-semibold">Terminée</span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatTime(session.used_minutes)} / {formatTime(session.total_minutes)}
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 text-sm">
                                    <Timer className="w-4 h-4" />
                                    <span className={isExpired ? 'text-red-600 font-bold' : isLowTime ? 'text-orange-600 font-bold' : ''}>
                                      {isExpired ? '0min - TEMPS ÉCOULÉ!' : `${formatTime(remainingTime)} restant`}
                                    </span>
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {formatTime(usedTime)} / {formatTime(session.total_minutes)}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="w-32">
                              <div className="flex justify-between text-xs mb-1">
                                <span className={isExpired ? 'text-red-600 font-bold' : ''}>{progressPercent}%</span>
                                {isExpired && <span className="text-red-600 font-bold">EXPIRÉ!</span>}
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                <div
                                  className={`h-3 rounded-full transition-all ${
                                    isExpired ? 'bg-red-600' :
                                    progressPercent >= 90 ? 'bg-red-500' :
                                    progressPercent >= 70 ? 'bg-yellow-500' :
                                    'bg-green-500'
                                  }`}
                                  style={{ width: `${progressPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-4 py-4">
                            {isExpired ? (
                              <div className="space-y-1">
                                <span className="px-3 py-1 rounded-full text-sm font-bold bg-red-600 text-white">
                                  ⏱️ TEMPS ÉCOULÉ
                                </span>
                                <div className="flex items-center gap-1 text-xs text-red-600 font-bold">
                                  <AlertCircle className="w-3 h-3" />
                                  À TERMINER
                                </div>
                              </div>
                            ) : (
                              <>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.bg} ${statusConfig.text}`}>
                                  {statusConfig.label}
                                </span>
                                {isLowTime && (
                                  <div className="flex items-center gap-1 text-xs text-orange-600 mt-1 font-semibold">
                                    <AlertCircle className="w-3 h-3" />
                                    Temps faible
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                          
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {formatDate(session.started_at)}
                          </td>
                          
                          <td className="px-4 py-4">
                            <div className="flex gap-2">
                              {session.status === 'ready' && (
                                <button
                                  onClick={() => handleAction(session.id, 'start')}
                                  disabled={actionLoading === session.id}
                                  className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 flex items-center gap-1 font-semibold"
                                >
                                  <Play className="w-4 h-4" />
                                  Démarrer
                                </button>
                              )}
                              
                              {session.status === 'active' && (
                                <>
                                  {!isExpired && (
                                    <button
                                      onClick={() => handleAction(session.id, 'pause')}
                                      disabled={actionLoading === session.id}
                                      className="px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm hover:bg-yellow-700 disabled:opacity-50 flex items-center gap-1 font-semibold"
                                    >
                                      <Pause className="w-4 h-4" />
                                      Pause
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleAction(session.id, 'terminate')}
                                    disabled={actionLoading === session.id}
                                    className={`px-3 py-2 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-1 font-semibold ${
                                      isExpired 
                                        ? 'bg-red-700 hover:bg-red-800 shadow-xl ring-2 ring-red-500 transform scale-110' 
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                  >
                                    <Square className="w-4 h-4" />
                                    {isExpired ? '⚠️ TERMINER' : 'Terminer'}
                                  </button>
                                </>
                              )}
                              
                              {session.status === 'paused' && (
                                <>
                                  {!isExpired && (
                                    <button
                                      onClick={() => handleAction(session.id, 'resume')}
                                      disabled={actionLoading === session.id}
                                      className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1 font-semibold"
                                    >
                                      <Play className="w-4 h-4" />
                                      Reprendre
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleAction(session.id, 'terminate')}
                                    disabled={actionLoading === session.id}
                                    className={`px-3 py-2 text-white rounded-lg text-sm disabled:opacity-50 flex items-center gap-1 font-semibold ${
                                      isExpired 
                                        ? 'bg-red-700 hover:bg-red-800 shadow-xl ring-2 ring-red-500 transform scale-110' 
                                        : 'bg-red-600 hover:bg-red-700'
                                    }`}
                                  >
                                    <Square className="w-4 h-4" />
                                    {isExpired ? '⚠️ TERMINER' : 'Terminer'}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
