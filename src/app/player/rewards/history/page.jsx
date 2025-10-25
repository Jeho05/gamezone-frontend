'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import API_BASE from '../../../../utils/apiBase';

export default function RewardsHistoryPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_spent: 0,
    total_earned: 0,
    total_redemptions: 0,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/check.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!data.authenticated || data.user?.role !== 'player') {
        navigate('/auth/login');
        return;
      }
      
      setUser(data.user);
      loadHistory();
    } catch (error) {
      console.error('Erreur auth:', error);
      navigate('/auth/login');
    }
  };

  const loadHistory = async () => {
    try {
      setLoading(true);
      // On va chercher les achats payés en points
      const response = await fetch(`${API_BASE}/shop/my_purchases.php`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (data.purchases) {
        // Filtrer seulement les achats payés en points
        const pointsPurchases = data.purchases.filter(p => p.paid_with_points);
        setHistory(pointsPurchases);

        // Calculer les statistiques
        const totalSpent = pointsPurchases.reduce((sum, p) => sum + (parseInt(p.points_spent) || 0), 0);
        const totalEarned = pointsPurchases.reduce((sum, p) => sum + (parseInt(p.points_earned) || 0), 0);
        
        setStats({
          total_spent: totalSpent,
          total_earned: totalEarned,
          total_redemptions: pointsPurchases.length,
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Complété', icon: '✅' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '⏳ En attente', icon: '⏳' },
      active: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🎮 En cours', icon: '🎮' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: '❌ Annulé', icon: '❌' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-sm font-semibold`}>
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">⏳ Chargement de l'historique...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-5xl">📜</span>
                Historique des Récompenses
              </h1>
              <p className="text-purple-200 text-lg">
                Retrouvez tous vos échanges de points
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/player/rewards')}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all"
              >
                🎁 Récompenses
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
              >
                ← Retour
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Total Échanges</h3>
              <div className="text-3xl">🎁</div>
            </div>
            <p className="text-4xl font-bold text-purple-600">{stats.total_redemptions}</p>
            <p className="text-gray-500 text-sm mt-1">Packages échangés</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Points Dépensés</h3>
              <div className="text-3xl">💸</div>
            </div>
            <p className="text-4xl font-bold text-red-600">{stats.total_spent.toLocaleString()}</p>
            <p className="text-gray-500 text-sm mt-1">Points utilisés</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 font-semibold">Points Gagnés</h3>
              <div className="text-3xl">✨</div>
            </div>
            <p className="text-4xl font-bold text-green-600">
              +{stats.total_earned.toLocaleString()}
            </p>
            <p className="text-gray-500 text-sm mt-1">Bonus reçus</p>
          </div>
        </div>

        {/* ROI Card */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl p-6 shadow-xl mb-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-2">📊 Retour sur Investissement</h3>
              <p className="text-3xl font-bold">
                {stats.total_spent > 0
                  ? `${Math.round((stats.total_earned / stats.total_spent) * 100)}%`
                  : '0%'}
              </p>
              <p className="text-sm opacity-90 mt-1">
                Coût net: {(stats.total_spent - stats.total_earned).toLocaleString()} points
              </p>
            </div>
            <div className="text-6xl">💰</div>
          </div>
        </div>

        {/* Historique */}
        {history.length === 0 ? (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-12 text-center text-white">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold mb-2">Aucun échange pour le moment</h3>
            <p className="text-white/70 mb-6">
              Commencez à échanger vos points contre des packages de jeu !
            </p>
            <button
              onClick={() => navigate('/player/rewards')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all"
            >
              🎁 Voir les Récompenses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">
              📋 Historique ({history.length})
            </h2>
            {history.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {purchase.game_name}
                      </h3>
                      {getStatusBadge(purchase.session_status)}
                    </div>
                    <p className="text-gray-600 text-lg">{purchase.package_name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatDate(purchase.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">Transaction #{purchase.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-purple-600 text-xs font-semibold mb-1">⏱️ DURÉE</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {purchase.duration_minutes}
                      <span className="text-sm ml-1">min</span>
                    </p>
                  </div>

                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-red-600 text-xs font-semibold mb-1">💸 DÉPENSÉ</p>
                    <p className="text-2xl font-bold text-red-900">
                      {purchase.points_spent || 0}
                      <span className="text-sm ml-1">pts</span>
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-green-600 text-xs font-semibold mb-1">✨ GAGNÉ</p>
                    <p className="text-2xl font-bold text-green-900">
                      +{purchase.points_earned || 0}
                      <span className="text-sm ml-1">pts</span>
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-blue-600 text-xs font-semibold mb-1">💰 NET</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {(purchase.points_spent || 0) - (purchase.points_earned || 0)}
                      <span className="text-sm ml-1">pts</span>
                    </p>
                  </div>
                </div>

                {purchase.session_status === 'pending' && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <p className="text-yellow-800 text-sm font-semibold">
                      ⏳ Session en attente d'activation
                    </p>
                  </div>
                )}

                {purchase.session_status === 'active' && (
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p className="text-blue-800 text-sm font-semibold">
                      🎮 Session en cours de jeu
                    </p>
                  </div>
                )}

                {purchase.session_status === 'completed' && (
                  <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                    <p className="text-green-800 text-sm font-semibold">
                      ✅ Session terminée - Points bonus crédités !
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
