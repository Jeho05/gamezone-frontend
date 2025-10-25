'use client';

import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  Coins, 
  Clock, 
  Zap, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  XCircle,
  Calendar,
  Award,
  ArrowRight,
  RefreshCw,
  Info
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function ConvertPoints() {
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [config, setConfig] = useState(null);
  const [conversions, setConversions] = useState([]);
  const [stats, setStats] = useState(null);
  const [today, setToday] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  
  // États pour le formulaire
  const [pointsToConvert, setPointsToConvert] = useState(0);
  const [selectedGame, setSelectedGame] = useState(null);
  const [games, setGames] = useState([]);
  
  // Calculs en temps réel
  const minutesGained = config ? Math.floor(pointsToConvert / config.points_per_minute) : 0;
  const canConvert = config && 
    pointsToConvert >= config.min_conversion_points &&
    pointsToConvert <= userPoints &&
    (!config.max_minutes || minutesGained <= config.max_minutes) &&
    (!today || !config.max_conversion_per_day || today.remaining_today > 0);

  useEffect(() => {
    loadData();
    loadGames();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/player/convert_points.php`, {
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Erreur de chargement');
      }
      
      const data = await res.json();
      setConfig(data.config);
      setConversions(data.conversions || []);
      setStats(data.stats);
      setToday(data.today);
      setUserPoints(data.user_points);
      
      // Initialiser le slider au minimum
      setPointsToConvert(data.config.min_conversion_points);
      
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadGames = async () => {
    try {
      const res = await fetch(`${API_BASE}/shop/games.php`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setGames(data.games || []);
      }
    } catch (err) {
      console.error('Erreur chargement jeux:', err);
    }
  };

  const handleConvert = async () => {
    if (!canConvert) return;
    
    if (!confirm(`Confirmer la conversion de ${pointsToConvert} points en ${minutesGained} minutes ?`)) {
      return;
    }
    
    try {
      setConverting(true);
      const res = await fetch(`${API_BASE}/player/convert_points.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          points_to_convert: pointsToConvert,
          game_id: selectedGame
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        toast.error(data.error || 'Erreur lors de la conversion');
        return;
      }
      
      toast.success(data.message, {
        description: `Nouveau solde: ${data.new_balance} points`
      });
      
      // Recharger les données
      await loadData();
      
      // Réinitialiser le formulaire
      setPointsToConvert(config.min_conversion_points);
      setSelectedGame(null);
      
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la conversion');
    } finally {
      setConverting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Actif', icon: CheckCircle },
      used: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Utilisé', icon: CheckCircle },
      expired: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Expiré', icon: XCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Annulé', icon: XCircle }
    };
    return configs[status] || configs.active;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}min` : ''}` : `${mins}min`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (!config || !config.is_active) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <Navigation userType="player" />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-xl p-12 text-center">
            <XCircle className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Système de Conversion Désactivé
            </h2>
            <p className="text-gray-600">
              Le système de conversion de points est temporairement désactivé.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="player" />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-purple-600 mb-2 flex items-center gap-3">
                <Zap className="w-8 h-8" />
                Convertir Mes Points
              </h1>
              <p className="text-gray-600">Transformez vos points en temps de jeu</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Solde actuel</div>
              <div className="text-3xl font-bold text-purple-600 flex items-center gap-2">
                <Coins className="w-8 h-8" />
                {userPoints.toLocaleString()} pts
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {formatTime(stats?.minutes_available || 0)}
            </div>
            <div className="text-sm text-gray-600">Disponibles</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-8 h-8 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {stats?.total_conversions || 0}
            </div>
            <div className="text-sm text-gray-600">Conversions</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Coins className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {stats?.total_points_spent?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-gray-600">Points Dépensés</div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {today?.conversions_count || 0} / {config.max_conversion_per_day || '∞'}
            </div>
            <div className="text-sm text-gray-600">Aujourd'hui</div>
          </div>
        </div>

        {/* Formulaire de Conversion */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-purple-600" />
            Nouvelle Conversion
          </h2>

          {/* Info Rate */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Taux de conversion:</strong> {config.points_per_minute} points = 1 minute de jeu
              {config.conversion_fee_percent > 0 && (
                <span> (frais: {config.conversion_fee_percent}%)</span>
              )}
            </div>
          </div>

          {/* Slider */}
          <div className="mb-8">
            <label className="block text-gray-700 font-semibold mb-3">
              Combien de points voulez-vous convertir ?
            </label>
            
            <div className="relative">
              <input
                type="range"
                min={config.min_conversion_points}
                max={Math.min(userPoints, config.max_minutes ? config.max_minutes * config.points_per_minute : userPoints)}
                step={config.points_per_minute}
                value={pointsToConvert}
                onChange={(e) => setPointsToConvert(parseInt(e.target.value))}
                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>{config.min_conversion_points} pts</span>
              <span>{Math.min(userPoints, config.max_minutes ? config.max_minutes * config.points_per_minute : userPoints)} pts</span>
            </div>
          </div>

          {/* Affichage Conversion */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {pointsToConvert.toLocaleString()}
                </div>
                <div className="text-gray-700 font-semibold flex items-center justify-center gap-2">
                  <Coins className="w-5 h-5" />
                  Points
                </div>
              </div>

              <ArrowRight className="w-12 h-12 text-purple-600 mx-8" />

              <div className="text-center flex-1">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {minutesGained}
                </div>
                <div className="text-gray-700 font-semibold flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  {formatTime(minutesGained)}
                </div>
              </div>
            </div>
          </div>

          {/* Choix du jeu (optionnel) */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3">
              Choisir un jeu (optionnel)
            </label>
            <select
              value={selectedGame || ''}
              onChange={(e) => setSelectedGame(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Tous les jeux</option>
              {games.filter(g => g.is_active).map(game => (
                <option key={game.id} value={game.id}>
                  {game.name}
                </option>
              ))}
            </select>
          </div>

          {/* Avertissement */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              Le temps converti expire dans <strong>{config.expiry_days} jours</strong>. 
              Utilisez-le avant expiration.
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button
              onClick={handleConvert}
              disabled={!canConvert || converting}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              {converting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Conversion en cours...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Convertir Maintenant
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setPointsToConvert(config.min_conversion_points);
                setSelectedGame(null);
              }}
              className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
            >
              Réinitialiser
            </button>
          </div>

          {/* Erreurs */}
          {!canConvert && pointsToConvert > 0 && (
            <div className="mt-4 text-sm text-red-600">
              {pointsToConvert < config.min_conversion_points && 
                `Minimum ${config.min_conversion_points} points requis`
              }
              {pointsToConvert > userPoints && 
                `Points insuffisants (vous avez ${userPoints} points)`
              }
              {config.max_minutes && minutesGained > config.max_minutes &&
                `Maximum ${config.max_minutes} minutes par conversion`
              }
              {today && config.max_conversion_per_day && today.remaining_today === 0 &&
                `Limite quotidienne atteinte (${config.max_conversion_per_day} conversions/jour)`
              }
            </div>
          )}
        </div>

        {/* Historique */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              Historique des Conversions
            </h2>
          </div>

          {conversions.length === 0 ? (
            <div className="p-12 text-center">
              <Coins className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">Aucune conversion effectuée</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Points</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Temps</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jeu</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expire le</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {conversions.map((conversion) => {
                    const statusConfig = getStatusConfig(conversion.status);
                    const StatusIcon = statusConfig.icon;
                    return (
                      <tr key={conversion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(conversion.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-purple-600">
                          {conversion.points_spent} pts
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                          {formatTime(conversion.minutes_gained)}
                          {conversion.minutes_used > 0 && (
                            <span className="text-gray-500 ml-2">
                              (utilisé: {formatTime(conversion.minutes_used)})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {conversion.game_name || 'Tous les jeux'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text} flex items-center gap-1 w-fit`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(conversion.expires_at).toLocaleDateString('fr-FR')}
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
  );
}
