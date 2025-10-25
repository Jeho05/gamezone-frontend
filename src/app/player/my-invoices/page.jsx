import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/Navigation';
import InvoiceModal from '../../../components/InvoiceModal';
import { 
  Receipt,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  Timer,
  RefreshCw,
  Gamepad2,
  Filter,
  TrendingUp
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function MyInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    loadInvoices();
  }, [filter]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const url = filter 
        ? `${API_BASE}/invoices/my_invoices.php?status=${filter}`
        : `${API_BASE}/invoices/my_invoices.php`;
      
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      if (data.invoices) {
        setInvoices(data.invoices);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = (invoice) => {
    setSelectedInvoice(invoice);
    setShowQRModal(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        icon: Clock,
        className: 'bg-yellow-100 text-yellow-700',
        label: 'En Attente',
        description: 'Présentez cette facture à la réception'
      },
      active: {
        icon: CheckCircle,
        className: 'bg-green-100 text-green-700',
        label: 'Active',
        description: 'Session prête à démarrer'
      },
      used: {
        icon: CheckCircle,
        className: 'bg-blue-100 text-blue-700',
        label: 'Utilisée',
        description: 'Session terminée'
      },
      expired: {
        icon: XCircle,
        className: 'bg-red-100 text-red-700',
        label: 'Expirée',
        description: 'Facture expirée (2 mois)'
      },
      cancelled: {
        icon: XCircle,
        className: 'bg-gray-100 text-gray-700',
        label: 'Annulée',
        description: 'Facture annulée'
      }
    };

    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatExpiry = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = date - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return 'Expirée';
    if (days === 0) return 'Expire aujourd\'hui';
    if (days === 1) return 'Expire demain';
    return `Expire dans ${days} jours`;
  };

  const filters = [
    { value: '', label: 'Toutes' },
    { value: 'pending', label: 'En Attente' },
    { value: 'active', label: 'Actives' },
    { value: 'used', label: 'Utilisées' },
    { value: 'expired', label: 'Expirées' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="player" />
      
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Receipt className="w-10 h-10" />
              Mes Factures
            </h1>
            <p className="text-gray-300">Consultez vos factures et codes QR</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">{stats.total_invoices || 0}</div>
              <div className="text-purple-200 text-sm">Total Factures</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">{stats.active || 0}</div>
              <div className="text-green-200 text-sm">Actives</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">{stats.used || 0}</div>
              <div className="text-blue-200 text-sm">Utilisées</div>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-xl p-6 text-white">
              <div className="text-3xl font-bold mb-1">{parseFloat(stats.total_spent || 0).toFixed(0)}</div>
              <div className="text-yellow-200 text-sm">XOF Dépensés</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 text-white">
              <Filter className="w-5 h-5" />
              <span className="font-semibold">Filtrer:</span>
            </div>
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === f.value
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-purple-700 text-white hover:bg-purple-600'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={loadInvoices}
              className="ml-auto px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </button>
          </div>

          {/* Invoices List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
              <p className="text-xl text-white">Chargement...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl">
              <Receipt className="w-24 h-24 text-gray-400 mx-auto mb-4 opacity-50" />
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Aucune facture</h2>
              <p className="text-gray-500 mb-6">
                {filter ? 'Aucune facture avec ce statut' : 'Vous n\'avez pas encore de factures'}
              </p>
              <button
                onClick={() => navigate('/player/shop')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
              >
                Parcourir la Boutique
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => {
                const statusConfig = getStatusConfig(invoice.status);
                const StatusIcon = statusConfig.icon;
                // Afficher le QR seulement si facture active ET session pas terminée
                const canShowQR = ['pending', 'active'].includes(invoice.status) && 
                                  (!invoice.session_status || !['completed', 'expired', 'terminated'].includes(invoice.session_status));
                const isExpiringSoon = invoice.days_until_expiry <= 7 && invoice.days_until_expiry > 0;

                return (
                  <div
                    key={invoice.id}
                    className="bg-white rounded-xl p-6 hover:shadow-xl transition-all"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Left: Invoice Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-1">
                              {invoice.invoice_number}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Calendar className="w-4 h-4" />
                              {formatDate(invoice.issued_at)}
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${statusConfig.className}`}>
                            <StatusIcon className="w-4 h-4" />
                            {statusConfig.label}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t">
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Jeu</div>
                            <div className="font-bold text-gray-800 flex items-center gap-1">
                              <Gamepad2 className="w-4 h-4" />
                              {invoice.game_name}
                            </div>
                          </div>

                          <div>
                            <div className="text-gray-500 text-xs mb-1">Durée</div>
                            <div className="font-bold text-gray-800 flex items-center gap-1">
                              <Timer className="w-4 h-4" />
                              {invoice.duration_minutes} min
                            </div>
                          </div>

                          <div>
                            <div className="text-gray-500 text-xs mb-1">Montant</div>
                            <div className="font-bold text-green-600 flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {invoice.amount} XOF
                            </div>
                          </div>

                          <div>
                            <div className="text-gray-500 text-xs mb-1">Expire</div>
                            <div className={`font-bold flex items-center gap-1 ${
                              isExpiringSoon ? 'text-red-600' : 'text-gray-800'
                            }`}>
                              <Clock className="w-4 h-4" />
                              {formatExpiry(invoice.expires_at)}
                            </div>
                          </div>
                        </div>

                        {isExpiringSoon && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-yellow-800">
                              <strong>Attention:</strong> Cette facture expire dans {invoice.days_until_expiry} jour(s) !
                            </div>
                          </div>
                        )}

                        {invoice.session_status && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="text-sm text-blue-800">
                              <strong>Session:</strong> {invoice.session_remaining_minutes || 0} minutes restantes
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 lg:min-w-[200px]">
                        {canShowQR && (
                          <button
                            onClick={() => handleShowQR(invoice)}
                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                          >
                            <QrCode className="w-5 h-5" />
                            Afficher QR Code
                          </button>
                        )}

                        {!canShowQR && invoice.session_status && ['completed', 'expired', 'terminated'].includes(invoice.session_status) && (
                          <div className="px-4 py-3 bg-gray-100 text-gray-600 font-semibold rounded-lg flex items-center justify-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Session Terminée
                          </div>
                        )}

                        <div className="text-xs text-gray-500 text-center">
                          {statusConfig.description}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QR Modal */}
      {showQRModal && selectedInvoice && (
        <InvoiceModal 
          invoice={selectedInvoice}
          onClose={() => {
            setShowQRModal(false);
            setSelectedInvoice(null);
          }}
        />
      )}
    </div>
  );
}
