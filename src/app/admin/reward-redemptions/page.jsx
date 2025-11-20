import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/Navigation';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function AdminRewardRedemptionsPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });

        if (res.status === 401) {
          toast.error('Session expirée');
          setTimeout(() => navigate('/auth/login'), 1500);
          return;
        }

        const data = await res.json();
        if (!res.ok || !data?.user || data.user.role !== 'admin') {
          toast.error('Accès non autorisé');
          setTimeout(() => navigate('/auth/login'), 1500);
          return;
        }

        setIsAuthenticated(true);

        // Garder la session admin active
        fetch(`${API_BASE}/auth/manage_session.php?action=keep_alive`, {
          credentials: 'include',
        }).catch(() => {});
      } catch (error) {
        toast.error('Erreur authentification');
        setTimeout(() => navigate('/auth/login'), 1500);
      }
    };

    checkAuth();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      const url = `${API_BASE}/admin/reward_redemptions.php${
        params.toString() ? `?${params.toString()}` : ''
      }`;
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Erreur de chargement');
      }
      setItems(data.items || []);
    } catch (err) {
      console.error('[AdminRewardRedemptions] loadData error:', err);
      toast.error("Erreur lors du chargement des échanges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadData();
  }, [statusFilter, isAuthenticated]);

  const updateRedemption = async (id, payload) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`${API_BASE}/admin/reward_redemptions.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, ...payload }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }
      toast.success('Échange mis à jour');
      await loadData();
    } catch (err) {
      console.error('[AdminRewardRedemptions] updateRedemption error:', err);
      toast.error("Erreur lors de la mise à jour de l'échange");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleString('fr-FR');
  };

  const getStatusOptions = () => [
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Validé' },
    { value: 'delivered', label: 'Livré' },
    { value: 'completed', label: 'Complété' },
    { value: 'cancelled', label: 'Annulé' },
  ];

  const getTypeLabel = (type) => {
    const map = {
      game_time: 'Temps de jeu',
      game_package: 'Package de jeu',
      badge: 'Badge',
      discount: 'Réduction',
      physical: 'Physique',
      digital: 'Digital',
      item: 'Objet',
      other: 'Autre',
    };
    return map[type] || type || 'Récompense';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="reward-redemptions" />
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white flex items-center gap-3">
                  <span className="text-4xl">📜</span>
                  Suivi des Échanges de Récompenses
                </h1>
                <p className="text-gray-300 text-sm md:text-base">
                  Vue d'ensemble de tous les échanges (reward_redemptions) pour aider l'équipe à valider et livrer les
                  avantages.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={loadData}
                  className="px-4 py-2 rounded-lg bg-slate-700 text-white text-sm font-semibold hover:bg-slate-600 transition-all"
                >
                  🔄 Actualiser
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="mb-4 flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-300 mr-2">Filtrer par statut :</span>
              {['all', 'pending', 'approved', 'delivered', 'completed', 'cancelled'].map((v) => (
                <button
                  key={v}
                  onClick={() => setStatusFilter(v)}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm font-semibold transition-all ${
                    statusFilter === v
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  }`}
                >
                  {v === 'all'
                    ? 'Tous'
                    : getStatusOptions().find((o) => o.value === v)?.label || v}
                </button>
              ))}
            </div>

            {/* Liste */}
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" />
              </div>
            ) : items.length === 0 ? (
              <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-8 text-center text-gray-300">
                <div className="text-5xl mb-3">📭</div>
                <h2 className="text-xl font-bold mb-2">Aucun échange trouvé</h2>
                <p className="text-sm text-gray-400">
                  Aucun échange ne correspond à ce filtre pour le moment.
                </p>
              </div>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800/80">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Joueur</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Récompense</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Coût</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Créé le</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Notes</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {items.map((rr) => (
                        <tr key={rr.id} className="hover:bg-slate-800/60">
                          <td className="px-4 py-3 align-top text-gray-100">
                            <div className="font-semibold text-sm">{rr.user_username}</div>
                            <div className="text-xs text-gray-400">{rr.user_email}</div>
                          </td>
                          <td className="px-4 py-3 align-top text-gray-100 max-w-xs">
                            <div className="font-semibold text-sm truncate" title={rr.reward_name}>
                              {rr.reward_name}
                            </div>
                            {rr.reward_description && (
                              <div className="text-xs text-gray-400 line-clamp-2" title={rr.reward_description}>
                                {rr.reward_description}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 align-top text-gray-100 text-xs">
                            <div>{getTypeLabel(rr.reward_type)}</div>
                          </td>
                          <td className="px-4 py-3 align-top text-yellow-300 text-sm font-semibold">
                            {rr.cost} pts
                          </td>
                          <td className="px-4 py-3 align-top">
                            <select
                              defaultValue={rr.status}
                              onChange={(e) =>
                                updateRedemption(rr.id, { status: e.target.value, notes: rr.notes })
                              }
                              disabled={updatingId === rr.id}
                              className="bg-slate-800 text-gray-100 text-xs px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-cyan-500"
                            >
                              {getStatusOptions().map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-400">
                            {formatDate(rr.created_at)}
                          </td>
                          <td className="px-4 py-3 align-top w-64">
                            <textarea
                              defaultValue={rr.notes || ''}
                              onBlur={(e) =>
                                e.target.value !== (rr.notes || '') &&
                                updateRedemption(rr.id, { status: rr.status, notes: e.target.value })
                              }
                              disabled={updatingId === rr.id}
                              rows={2}
                              className="w-full bg-slate-900 text-gray-100 text-xs px-2 py-1 rounded border border-slate-700 focus:outline-none focus:border-cyan-500 resize-none"
                              placeholder="Notes internes (par ex. comment la récompense a été livrée)"
                            />
                          </td>
                          <td className="px-4 py-3 align-top text-xs text-gray-300">
                            <div className="space-y-1">
                              <div>
                                Type : {getTypeLabel(rr.reward_type)}
                              </div>
                              <div>
                                ID : #{rr.id}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
