import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Navigation from '../../../components/Navigation';
import API_BASE from '../../../utils/apiBase';

 

export default function RewardsManagementPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);

  // Vérifier auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data?.user || data.user.role !== 'admin') {
          toast.error('Accès non autorisé');
          setTimeout(() => navigate('/auth/login'), 1500);
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        toast.error('Erreur authentification');
        setTimeout(() => navigate('/auth/login'), 1500);
      }
    };
    checkAuth();
  }, [navigate]);

  const fetchGames = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/games.php`, {
        credentials: 'include',
      });
      const data = await response.json();
      console.log('Jeux chargés:', data.games);
      setGames(data.games || []);
      if (!data.games || data.games.length === 0) {
        toast.info('Aucun jeu disponible. Créez-en un d\'abord.');
      }
    } catch (err) {
      console.error('Erreur chargement jeux:', err);
      toast.error('Impossible de charger les jeux');
    }
  };

  const fetchRewards = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/rewards.php`, {
        credentials: 'include',
      });
      const data = await response.json();
      setRewards(data.rewards || []);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchRewards();
  }, []);

  const saveReward = async (rewardData) => {
    try {
      console.log('Tentative de sauvegarde:', rewardData);
      
      const method = rewardData.id ? 'PUT' : 'POST';
      const response = await fetch(`${API_BASE}/admin/rewards.php`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(rewardData),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erreur serveur:', data);
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      toast.success(rewardData.id ? 'Récompense mise à jour' : 'Récompense créée avec succès');
      await fetchRewards();
      setShowModal(false);
      setEditingReward(null);
    } catch (err) {
      console.error('Erreur complète:', err);
      toast.error('Erreur: ' + err.message);
    }
  };

  const deleteReward = async (id) => {
    if (!confirm('Supprimer cette récompense ?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/rewards.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id }),
      });

      if (!response.ok) throw new Error('Delete failed');

      toast.success('Récompense supprimée');
      fetchRewards();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="admin" currentPage="rewards" />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="rewards" />
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
              🎁 Gestion des Récompenses
            </h1>
            <p className="text-gray-400">
              Gérez le catalogue de récompenses échangeables
            </p>
          </div>
          <button
            onClick={() => {
              setEditingReward(null);
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold hover:shadow-lg transition-all"
          >
            + Nouvelle récompense
          </button>
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <div
              key={reward.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 ${
                reward.available ? 'border-cyan-500/50' : 'border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {reward.name}
                  </h3>
                  {!reward.available && (
                    <span className="inline-block px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full mb-2">
                      Indisponible
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-3xl font-bold text-cyan-400">
                  {reward.cost}
                </p>
                <p className="text-xs text-gray-500">points</p>
                {reward.reward_type && (
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                    {reward.reward_type === 'game_package' ? '🎮 Package Jeu' : 
                     reward.reward_type === 'game_time' ? '⏱️ Temps' :
                     reward.reward_type === 'physical' ? '🎁 Physique' :
                     reward.reward_type}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingReward(reward);
                    setShowModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all"
                >
                  Modifier
                </button>
                <button
                  onClick={() => deleteReward(reward.id)}
                  className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <RewardModal
            reward={editingReward}
            games={games}
            onSave={saveReward}
            onClose={() => {
              setShowModal(false);
              setEditingReward(null);
            }}
          />
        )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RewardModal({ reward, games, onSave, onClose }) {
  const [formData, setFormData] = useState({
    id: reward?.id || 0,
    name: reward?.name || '',
    description: reward?.description || '',
    cost: reward?.cost || 0,
    category: reward?.category || '',
    reward_type: reward?.reward_type || 'physical',
    game_time_minutes: reward?.game_time_minutes || 0,
    available: reward?.available !== undefined ? reward.available : 1,
    // Champs game_package
    game_id: reward?.game_id || '',
    duration_minutes: reward?.duration_minutes || 30,
    points_earned: reward?.points_earned || 0,
    bonus_multiplier: reward?.bonus_multiplier || 1.0,
    max_per_user: reward?.max_purchases_per_user || '',
    is_promotional: reward?.is_promotional || 0,
    promotional_label: reward?.promotional_label || '',
    is_featured: reward?.is_featured || 0,
    display_order: reward?.display_order || 0,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || formData.cost < 0) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    if (formData.reward_type === 'game_time' && formData.game_time_minutes <= 0) {
      toast.error('Veuillez spécifier le nombre de minutes de jeu');
      return;
    }
    if (formData.reward_type === 'game_package') {
      if (!formData.game_id) {
        toast.error('Veuillez sélectionner un jeu');
        return;
      }
      if (formData.duration_minutes <= 0) {
        toast.error('Veuillez spécifier la durée en minutes');
        return;
      }
      if (formData.points_earned < 0) {
        toast.error('Les points gagnés doivent être positifs');
        return;
      }
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-800 rounded-lg ${formData.reward_type === 'game_package' ? 'max-w-2xl' : 'max-w-md'} w-full border-2 border-cyan-500/50 max-h-[90vh] flex flex-col`}>
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-cyan-400">
            {reward ? 'Modifier' : 'Nouvelle'} Récompense
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">

        <form id="reward-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Nom de la récompense *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ex: 1h de jeu gratuite"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Description de la récompense"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Type de récompense *
            </label>
            <select
              value={formData.reward_type}
              onChange={(e) => setFormData({ ...formData, reward_type: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:border-cyan-500 focus:outline-none"
            >
              <option value="physical">🎁 Physique</option>
              <option value="game_package">🎮 Package de Jeu</option>
              <option value="game_time">⏱️ Temps de jeu</option>
              <option value="discount">🏷️ Réduction</option>
              <option value="item">🎉 Objet/Cadeau</option>
              <option value="badge">🏆 Badge</option>
            </select>
          </div>

          {formData.reward_type === 'game_time' && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded p-4">
              <label className="block text-sm font-bold text-cyan-400 mb-2">
                ⏱️ Temps de jeu (en minutes) *
              </label>
              <input
                type="number"
                value={formData.game_time_minutes}
                onChange={(e) =>
                  setFormData({ ...formData, game_time_minutes: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 bg-gray-700 rounded border border-cyan-500 text-white focus:border-cyan-400 focus:outline-none"
                min="0"
                placeholder="Ex: 60 pour 1 heure"
              />
              <p className="text-xs text-cyan-300 mt-2">
                Les minutes seront ajoutées au crédit de temps de jeu de l'utilisateur lors de l'échange
              </p>
            </div>
          )}

          {formData.reward_type === 'game_package' && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded p-4 space-y-4">
              <div className="bg-blue-900/30 border border-blue-500/30 rounded p-3">
                <p className="text-sm text-blue-300">
                  🎮 <strong>Package de Jeu:</strong> Créera automatiquement un package de jeu échangeable uniquement contre des points.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-400 mb-2">
                  Sélectionner un jeu *
                </label>
                <select
                  value={formData.game_id}
                  onChange={(e) => setFormData({ ...formData, game_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-gray-700 rounded border border-purple-500 text-white focus:border-purple-400 focus:outline-none"
                  required
                >
                  <option value="">
                    {games.length === 0 ? '⏳ Chargement des jeux...' : '-- Choisir un jeu --'}
                  </option>
                  {games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name} ({game.category})
                    </option>
                  ))}
                </select>
                {games.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ Aucun jeu disponible. Créez d'abord un jeu dans la section "Jeux".
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-purple-400 mb-2">
                    Durée (minutes) *
                  </label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 rounded border border-purple-500 text-white focus:border-purple-400 focus:outline-none"
                    min="5"
                    step="5"
                    placeholder="Ex: 30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-400 mb-2">
                    Points bonus *
                  </label>
                  <input
                    type="number"
                    value={formData.points_earned}
                    onChange={(e) => setFormData({ ...formData, points_earned: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-gray-700 rounded border border-purple-500 text-white focus:border-purple-400 focus:outline-none"
                    min="0"
                    placeholder="Ex: 10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-purple-400 mb-2">
                    Multiplicateur bonus
                  </label>
                  <input
                    type="number"
                    value={formData.bonus_multiplier}
                    onChange={(e) => setFormData({ ...formData, bonus_multiplier: parseFloat(e.target.value) || 1.0 })}
                    className="w-full px-4 py-2 bg-gray-700 rounded border border-purple-500 text-white focus:border-purple-400 focus:outline-none"
                    min="1"
                    max="5"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-400 mb-2">
                    Max achats/utilisateur
                  </label>
                  <input
                    type="number"
                    value={formData.max_per_user}
                    onChange={(e) => setFormData({ ...formData, max_per_user: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded border border-purple-500 text-white focus:border-purple-400 focus:outline-none"
                    min="1"
                    placeholder="Vide = illimité"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_promotional}
                    onChange={(e) => setFormData({ ...formData, is_promotional: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-purple-300">🔥 Package promotionnel</span>
                </label>
              </div>

              {formData.is_promotional === 1 && (
                <div>
                  <label className="block text-sm font-bold text-purple-400 mb-2">
                    Label promotionnel
                  </label>
                  <input
                    type="text"
                    value={formData.promotional_label}
                    onChange={(e) => setFormData({ ...formData, promotional_label: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-700 rounded border border-purple-500 text-white focus:border-purple-400 focus:outline-none"
                    placeholder="Ex: -20%, PROMO, NOUVEAU"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked ? 1 : 0 })}
                    className="w-5 h-5"
                  />
                  <span className="text-sm text-purple-300">⭐ Mettre en vedette</span>
                </label>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Catégorie
            </label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ex: gaming, cosmetic"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Coût en points *
            </label>
            <input
              type="number"
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 text-white focus:border-cyan-500 focus:outline-none"
              min="0"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.available}
                onChange={(e) =>
                  setFormData({ ...formData, available: e.target.checked ? 1 : 0 })
                }
                className="w-5 h-5"
              />
              <span className="text-sm text-gray-400">Disponible à l'échange</span>
            </label>
          </div>

        </form>
        </div>
        
        <div className="p-6 border-t border-gray-700 bg-gray-800">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-700 rounded font-bold hover:bg-gray-600 transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              form="reward-form"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded font-bold hover:shadow-lg transition-all"
            >
              Sauvegarder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
