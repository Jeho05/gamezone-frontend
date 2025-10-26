import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Navigation from '../../../components/Navigation';
import API_BASE from '../../../utils/apiBase';

 

export default function BonusesManagementPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [multipliers, setMultipliers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

  const fetchData = async () => {
    try {
      const multipliersRes = await fetch(
        `${API_BASE}/admin/bonus_multipliers.php`,
        { credentials: 'include' }
      );
      const multipliersData = await multipliersRes.json();
      setMultipliers(multipliersData.multipliers || []);

      const usersRes = await fetch(`${API_BASE}/users/index.php`, {
        credentials: 'include',
      });
      const usersData = await usersRes.json();
      setUsers(usersData.items || []);
    } catch (err) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const createMultiplier = async (data) => {
    try {
      console.log('Sending data:', data);
      const response = await fetch(`${API_BASE}/gamification/bonus_multiplier.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log('Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed');
      }

      toast.success('Multiplicateur créé');
      fetchData();
      setShowModal(false);
    } catch (err) {
      console.error('Create error:', err);
      toast.error('Erreur: ' + err.message);
    }
  };

  const deleteMultiplier = async (id) => {
    if (!confirm('Supprimer ce multiplicateur ?')) return;

    try {
      const response = await fetch(
        `${API_BASE}/gamification/bonus_multiplier.php?id=${id}`,
        { method: 'DELETE', credentials: 'include' }
      );

      if (!response.ok) throw new Error('Failed');

      toast.success('Multiplicateur supprimé');
      fetchData();
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="admin" currentPage="bonuses" />
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
      <Navigation userType="admin" currentPage="bonuses" />
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                  🎯 Bonus Spéciaux
                </h1>
                <p className="text-gray-400">Gérez les multiplicateurs de points temporaires</p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-bold"
              >
                + Nouveau multiplicateur
              </button>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Multiplicateurs actifs ({multipliers.length})</h2>

              {multipliers.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-500">Aucun multiplicateur actif</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {multipliers.map((mult) => {
                    const user = users.find((u) => u.id === mult.user_id);
                    return (
                      <div
                        key={mult.id}
                        className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg p-6 border-2 border-orange-500/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="text-4xl font-bold text-orange-400">x{mult.multiplier}</div>
                            <div>
                              <h3 className="text-lg font-bold">{user?.username || `User #${mult.user_id}`}</h3>
                              <p className="text-sm text-gray-400">{mult.reason}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteMultiplier(mult.id)}
                            className="px-4 py-2 bg-red-500/20 text-red-400 rounded"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {showModal && (
              <MultiplierModal
                users={users}
                onCreate={createMultiplier}
                onClose={() => setShowModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MultiplierModal({ users, onCreate, onClose }) {
  const [formData, setFormData] = useState({
    user_id: 0, multiplier: 2.0, reason: '', duration_hours: 24,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.user_id || formData.user_id === 0) {
      toast.error('Veuillez sélectionner un utilisateur');
      return;
    }
    
    if (!formData.reason.trim()) {
      toast.error('Veuillez entrer une raison');
      return;
    }
    
    onCreate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Nouveau Multiplicateur</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">Utilisateur</label>
            <select
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 bg-gray-700 rounded"
              required
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.username} (ID: {u.id})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Multiplicateur</label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="10.0"
              value={formData.multiplier}
              onChange={(e) => setFormData({ ...formData, multiplier: parseFloat(e.target.value) || 1.0 })}
              className="w-full px-4 py-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Raison</label>
            <input
              type="text"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-4 py-2 bg-gray-700 rounded"
            />
          </div>
          <div>
            <label className="block mb-2">Durée (heures)</label>
            <input
              type="number"
              min="1"
              value={formData.duration_hours}
              onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-2 bg-gray-700 rounded"
              required
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 bg-gray-700 rounded">
              Annuler
            </button>
            <button type="submit" className="flex-1 px-4 py-3 bg-cyan-500 rounded">
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
