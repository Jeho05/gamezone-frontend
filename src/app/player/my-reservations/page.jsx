import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Gamepad2,
  Timer,
  Star,
  ArrowLeft,
  Filter,
  RefreshCw
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function MyReservations() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');

  const statusOptions = [
    { value: '', label: 'Toutes', color: 'purple' },
    { value: 'pending_payment', label: 'En attente', color: 'yellow' },
    { value: 'paid', label: 'Payées', color: 'green' },
    { value: 'completed', label: 'Terminées', color: 'blue' },
    { value: 'cancelled', label: 'Annulées', color: 'red' }
  ];

  useEffect(() => {
    loadReservations();
  }, [selectedStatus]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const url = selectedStatus 
        ? `${API_BASE}/shop/my_reservations.php?status=${selectedStatus}`
        : `${API_BASE}/shop/my_reservations.php`;
      
      const res = await fetch(url, { credentials: 'include' });
      
      if (res.status === 401) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        navigate('/auth/login');
        return;
      }

      const data = await res.json();
      
      if (data.reservations) {
        setReservations(data.reservations);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_payment: { label: 'En attente de paiement', color: 'bg-yellow-600', icon: AlertCircle },
      paid: { label: 'Payée', color: 'bg-green-600', icon: CheckCircle },
      cancelled: { label: 'Annulée', color: 'bg-red-600', icon: XCircle },
      completed: { label: 'Terminée', color: 'bg-blue-600', icon: CheckCircle },
      no_show: { label: 'Non présenté', color: 'bg-gray-600', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.pending_payment;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-bold ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getTimeStatus = (reservation) => {
    const now = Date.now();
    const start = new Date(reservation.scheduled_start).getTime();
    const end = new Date(reservation.scheduled_end).getTime();

    if (reservation.status === 'cancelled' || reservation.status === 'no_show') {
      return null;
    }

    if (now < start) {
      const hoursUntil = Math.floor((start - now) / (1000 * 60 * 60));
      const minutesUntil = Math.floor((start - now) / (1000 * 60)) % 60;
      return (
        <div className="flex items-center gap-2 text-cyan-400 text-sm">
          <Timer className="w-4 h-4" />
          <span>Dans {hoursUntil > 0 ? `${hoursUntil}h ` : ''}{minutesUntil}min</span>
        </div>
      );
    }

    if (now >= start && now <= end) {
      return (
        <div className="flex items-center gap-2 text-green-400 text-sm font-bold animate-pulse">
          <Clock className="w-4 h-4" />
          <span>EN COURS</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <CheckCircle className="w-4 h-4" />
        <span>Terminée</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navigation userType="player" />
      
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/player/shop')}
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour à la boutique
            </button>

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                  <Calendar className="w-10 h-10 text-cyan-400" />
                  Mes Réservations
                </h1>
                <p className="text-gray-300">
                  Gérez vos sessions de jeu réservées
                </p>
              </div>
              <button
                onClick={loadReservations}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
              <div className="text-3xl font-bold text-white mb-1">{stats.total || 0}</div>
              <div className="text-sm text-gray-300">Total</div>
            </div>
            <div className="bg-green-900/30 border border-green-600 rounded-xl p-4">
              <div className="text-3xl font-bold text-green-400 mb-1">{stats.paid || 0}</div>
              <div className="text-sm text-gray-300">Payées</div>
            </div>
            <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-4">
              <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.pending_payment || 0}</div>
              <div className="text-sm text-gray-300">En attente</div>
            </div>
            <div className="bg-blue-900/30 border border-blue-600 rounded-xl p-4">
              <div className="text-3xl font-bold text-blue-400 mb-1">{stats.completed || 0}</div>
              <div className="text-sm text-gray-300">Terminées</div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-300" />
              <span className="text-white font-bold">Filtrer par statut</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedStatus(option.value)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    selectedStatus === option.value
                      ? `bg-${option.color}-600 text-white`
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reservations List */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
              <p className="text-xl text-white">Chargement...</p>
            </div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-32 h-32 text-gray-600 mx-auto mb-6 opacity-50" />
              <p className="text-2xl font-bold text-white mb-2">Aucune réservation</p>
              <p className="text-gray-400 mb-6">Vous n'avez pas encore de réservations</p>
              <button
                onClick={() => navigate('/player/shop')}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Parcourir les jeux
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="bg-gray-800/50 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Game Image */}
                    <div className="w-full lg:w-48 h-32 lg:h-auto rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={reservation.game_image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(reservation.game_name)}`}
                        alt={reservation.game_name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=Game';
                        }}
                      />
                    </div>

                    {/* Reservation Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
                            <Gamepad2 className="w-6 h-6 text-purple-400" />
                            {reservation.game_name}
                          </h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        {getTimeStatus(reservation)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-5 h-5 text-cyan-400" />
                          <div>
                            <div className="text-sm text-gray-400">Date de début</div>
                            <div className="font-bold text-white">
                              {new Date(reservation.scheduled_start).toLocaleString('fr-FR', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-5 h-5 text-green-400" />
                          <div>
                            <div className="text-sm text-gray-400">Durée</div>
                            <div className="font-bold text-white">{reservation.duration_minutes} minutes</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-300">
                          <Star className="w-5 h-5 text-yellow-400" />
                          <div>
                            <div className="text-sm text-gray-400">Prix total</div>
                            <div className="font-bold text-green-400">
                              {parseFloat(reservation.total_price || reservation.base_price).toFixed(0)} XOF
                            </div>
                          </div>
                        </div>

                        {reservation.reservation_fee > 0 && (
                          <div className="flex items-center gap-2 text-gray-300">
                            <AlertCircle className="w-5 h-5 text-cyan-400" />
                            <div>
                              <div className="text-sm text-gray-400">Frais de réservation</div>
                              <div className="font-bold text-cyan-400">{parseFloat(reservation.reservation_fee).toFixed(0)} XOF</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {reservation.notes && (
                        <div className="bg-blue-900/20 border border-blue-600/50 rounded-lg p-3">
                          <p className="text-sm text-gray-300">{reservation.notes}</p>
                        </div>
                      )}

                      {/* Payment Info */}
                      {reservation.payment_status && (
                        <div className="text-sm text-gray-400">
                          Paiement: <span className="text-white font-semibold capitalize">{reservation.payment_status}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
