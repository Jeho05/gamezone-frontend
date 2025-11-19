import React, { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MoreVertical,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    has_more: false
  });
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    search: '' // client-side filter or backend if supported
  });

  const statusOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'pending_payment', label: 'En attente de paiement' },
    { value: 'paid', label: 'Payée / Confirmée' },
    { value: 'completed', label: 'Terminée' },
    { value: 'cancelled', label: 'Annulée' },
    { value: 'no_show', label: 'Non présenté' }
  ];

  useEffect(() => {
    fetchReservations();
  }, [pagination.page, filters.status, filters.date_from, filters.date_to]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const offset = (pagination.page - 1) * pagination.limit;
      const queryParams = new URLSearchParams({
        limit: pagination.limit,
        offset,
        status: filters.status,
        date_from: filters.date_from,
        date_to: filters.date_to
      });

      const response = await fetch(`${API_BASE}/admin/reservations.php?${queryParams}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des réservations');
      }

      const data = await response.json();
      setReservations(data.reservations || []);
      setPagination(prev => ({
        ...prev,
        total: data.pagination?.total || 0,
        has_more: data.pagination?.has_more || false
      }));
    } catch (error) {
      console.error(error);
      toast.error('Impossible de charger les réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    if (!confirm('Êtes-vous sûr de vouloir effectuer cette action ?')) return;

    try {
      const response = await fetch(`${API_BASE}/admin/reservations.php`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id, action }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      toast.success(data.message);
      fetchReservations(); // Refresh list
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      pending_payment: { color: 'bg-yellow-100 text-yellow-800', label: 'En attente' },
      paid: { color: 'bg-green-100 text-green-800', label: 'Payée' },
      completed: { color: 'bg-blue-100 text-blue-800', label: 'Terminée' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Annulée' },
      no_show: { color: 'bg-gray-100 text-gray-800', label: 'Non présenté' }
    };
    const config = configs[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation userType="admin" currentPage="reservations" />
      
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-purple-600" />
              Gestion des Réservations
            </h1>
            <button 
              onClick={fetchReservations}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value, page: 1 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value, page: 1 }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ status: '', date_from: '', date_to: '', search: '' })}
                  className="w-full p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Jeu</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Date & Heure</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Durée</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Chargement en cours...
                      </td>
                    </tr>
                  ) : reservations.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        Aucune réservation trouvée
                      </td>
                    </tr>
                  ) : (
                    reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">#{res.id}</td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{res.username}</div>
                          <div className="text-xs text-gray-500">{res.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{res.game_name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {new Date(res.scheduled_start).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(res.scheduled_start).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {res.duration_minutes} min
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(res.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {res.status === 'pending_payment' && (
                              <button 
                                onClick={() => handleAction(res.id, 'confirm')}
                                className="p-1 text-green-600 hover:bg-green-50 rounded tooltip"
                                title="Confirmer le paiement"
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                            )}
                            {['pending_payment', 'paid'].includes(res.status) && (
                              <button 
                                onClick={() => handleAction(res.id, 'cancel')}
                                className="p-1 text-red-600 hover:bg-red-50 rounded tooltip"
                                title="Annuler"
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            )}
                            {res.status === 'paid' && (
                              <>
                                <button 
                                  onClick={() => handleAction(res.id, 'mark_completed')}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded tooltip"
                                  title="Marquer terminé"
                                >
                                  <CheckCircle className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={() => handleAction(res.id, 'mark_no_show')}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded tooltip"
                                  title="Marquer absent"
                                >
                                  <AlertCircle className="w-5 h-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {pagination.page} sur {Math.ceil(pagination.total / pagination.limit) || 1}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={!pagination.has_more}
                  className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
