import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import Navigation from '../../../../components/Navigation';
import { 
  ArrowLeft,
  Star, 
  Clock, 
  Users, 
  Gamepad2,
  CreditCard,
  Zap,
  Tag,
  CheckCircle,
  AlertCircle,
  Calendar,
  Timer,
  Info
} from 'lucide-react';
import API_BASE from '../../../../utils/apiBase';
import { toast } from 'sonner';
import KkiapayWidget from '../../../../components/KkiapayWidget';

export default function GameDetail() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentSession, setPaymentSession] = useState(null);
  const [isReservation, setIsReservation] = useState(false);
  const [scheduledStart, setScheduledStart] = useState('');
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    loadGame();
    loadPaymentMethods();
  }, [gameId]);

  const loadGame = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/shop/games.php?id=${gameId}`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (data.game) {
        setGame(data.game);
      } else {
        toast.error('Jeu non trouvé');
        navigate('/player/shop');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      const res = await fetch(`${API_BASE}/shop/payment_methods.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      if (data.payment_methods) {
        setPaymentMethods(data.payment_methods);
      }
    } catch (err) {
      console.error('Erreur chargement méthodes paiement:', err);
    }
  };

  const handlePackageSelect = (pkg) => {
    if (!pkg.can_purchase) {
      toast.error('Vous avez atteint la limite d\'achats pour ce package');
      return;
    }
    setSelectedPackage(pkg);
    setIsReservation(false);
    setScheduledStart('');
    setAvailabilityChecked(false);
    setIsAvailable(false);
    setShowPaymentModal(true);
  };

  const checkAvailability = async () => {
    if (!scheduledStart || !selectedPackage) {
      toast.error('Veuillez sélectionner une date et heure');
      return;
    }

    try {
      setCheckingAvailability(true);
      const res = await fetch(
        `${API_BASE}/shop/check_availability.php?game_id=${game.id}&package_id=${selectedPackage.id}&scheduled_start=${encodeURIComponent(scheduledStart)}`,
        { credentials: 'include' }
      );
      const data = await res.json();

      if (data.available) {
        setIsAvailable(true);
        setAvailabilityChecked(true);
        toast.success('✅ Créneau disponible !');
      } else {
        setIsAvailable(false);
        setAvailabilityChecked(true);
        toast.error('❌ Créneau indisponible. Choisissez une autre date/heure.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la vérification');
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage || !selectedPaymentMethod) {
      toast.error('Veuillez sélectionner une méthode de paiement');
      return;
    }

    if (isReservation && !availabilityChecked) {
      toast.error('Veuillez vérifier la disponibilité avant de réserver');
      return;
    }

    if (isReservation && !isAvailable) {
      toast.error('Le créneau sélectionné n\'est pas disponible');
      return;
    }

    try {
      setPurchasing(true);
      const purchaseData = {
        game_id: game.id,
        package_id: selectedPackage.id,
        payment_method_id: selectedPaymentMethod
      };

      if (isReservation && scheduledStart) {
        purchaseData.scheduled_start = scheduledStart;
      }

      const res = await fetch(`${API_BASE}/shop/create_purchase.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      });

      const data = await res.json();

      if (data.success) {
        if (data.reservation) {
          toast.success('🎯 Réservation créée avec succès !');
        } else {
          toast.success('Achat créé avec succès !');
        }
        if (data.next_step === 'complete_payment' && data.payment_data) {
          setPaymentSession(data.payment_data);
        } else {
          setShowPaymentModal(false);
          setTimeout(() => {
            if (data.reservation) {
              navigate('/player/my-reservations');
            } else {
              navigate('/player/my-purchases');
            }
          }, 1000);
        }
      } else {
        toast.error(data.error || 'Erreur lors de l\'achat');
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors de la création de l\'achat');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <Navigation userType="player" />
        <div className="lg:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p className="text-xl text-white">Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="player" />
      
      {/* Main Content with Sidebar Offset */}
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/player/shop')}
          className="flex items-center gap-2 text-white mb-6 hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour à la boutique
        </button>

        {/* Game Header */}
        <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-8">
          <div className="relative h-64 md:h-80">
            <img
              src={game.image_url || 'https://via.placeholder.com/1200x400'}
              alt={game.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
              <h1 className="text-5xl font-bold text-white mb-2">{game.name}</h1>
              <div className="flex gap-3 flex-wrap">
                <span className="bg-purple-600 px-4 py-2 rounded-full text-white font-semibold capitalize">
                  {game.category}
                </span>
                {game.platform && (
                  <span className="bg-blue-600 px-4 py-2 rounded-full text-white font-semibold">
                    {game.platform}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-purple-900/50 p-4 rounded-lg text-center">
                <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{game.points_per_hour}</div>
                <div className="text-sm text-gray-400">Points/Heure</div>
              </div>
              
              <div className="bg-purple-900/50 p-4 rounded-lg text-center">
                <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{game.min_players}-{game.max_players}</div>
                <div className="text-sm text-gray-400">Joueurs</div>
              </div>
              
              <div className="bg-purple-900/50 p-4 rounded-lg text-center">
                <Gamepad2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{game.platform || 'Multi'}</div>
                <div className="text-sm text-gray-400">Plateforme</div>
              </div>
              
              <div className="bg-purple-900/50 p-4 rounded-lg text-center">
                <AlertCircle className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-white">{game.age_rating || 'Tous'}</div>
                <div className="text-sm text-gray-400">Âge</div>
              </div>
            </div>

            {/* Reservation Badge */}
            {game.is_reservable == 1 && (
              <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                  <div>
                    <h4 className="text-white font-bold flex items-center gap-2">
                      Ce jeu est réservable !
                      {parseFloat(game.reservation_fee) > 0 && (
                        <span className="text-cyan-400 text-sm">+{parseFloat(game.reservation_fee).toFixed(0)} XOF</span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-300">
                      Réservez un créneau à l'avance pour garantir votre session
                      {parseFloat(game.reservation_fee) > 0 && ' (frais de réservation appliqués)'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Description */}
            {game.description && (
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-3">Description</h3>
                <p className="text-gray-300 leading-relaxed">{game.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Packages */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-6">Choisissez votre Package</h2>
          
          {game.packages && game.packages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {game.packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className={`bg-gray-800 rounded-xl p-6 border-2 transition-all hover:scale-105 cursor-pointer relative ${
                    pkg.is_promotional ? 'border-yellow-500' : 'border-transparent hover:border-purple-500'
                  }`}
                  onClick={() => handlePackageSelect(pkg)}
                >
                  {/* Promo Badge */}
                  {pkg.is_promotional && pkg.promotional_label && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full font-bold text-sm shadow-lg">
                      {pkg.promotional_label}
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-white mb-3">{pkg.name}</h3>
                  
                  {/* Duration */}
                  <div className="flex items-center gap-2 text-gray-400 mb-4">
                    <Clock className="w-5 h-5" />
                    <span>{pkg.duration_minutes} minutes</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      {pkg.original_price && (
                        <div className="text-sm text-gray-500 line-through">
                          {pkg.original_price} XOF
                        </div>
                      )}
                      <div className="text-4xl font-bold text-green-400">
                        {pkg.price} <span className="text-xl">XOF</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-yellow-400 flex items-center gap-1">
                        <Star className="w-6 h-6 fill-current" />
                        +{pkg.points_earned}
                      </div>
                      <div className="text-sm text-gray-400">points</div>
                    </div>
                  </div>

                  {/* Bonus Multiplier */}
                  {pkg.bonus_multiplier > 1 && (
                    <div className="bg-yellow-600/20 border border-yellow-600 rounded-lg px-3 py-2 text-center mb-4">
                      <Zap className="w-4 h-4 inline-block mr-1" />
                      <span className="text-yellow-400 font-bold">
                        Bonus x{pkg.bonus_multiplier}
                      </span>
                    </div>
                  )}

                  {/* Purchase Limit */}
                  {!pkg.can_purchase && (
                    <div className="bg-red-600/20 border border-red-600 rounded-lg px-3 py-2 text-center text-red-400 text-sm">
                      Limite d'achats atteinte
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-800 rounded-xl">
              <p className="text-xl text-gray-400">Aucun package disponible pour ce jeu</p>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedPackage && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col">
            {/* Fixed Header */}
            <div className="p-6 border-b border-gray-800 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-8 h-8" />
                  Paiement
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-8">

              {/* Reservation Toggle */}
              {game.is_reservable == 1 && (
                <div className="bg-cyan-900/20 border border-cyan-600 rounded-lg p-4 mb-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isReservation}
                      onChange={(e) => {
                        setIsReservation(e.target.checked);
                        if (!e.target.checked) {
                          setScheduledStart('');
                          setAvailabilityChecked(false);
                          setIsAvailable(false);
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold text-white">Réserver pour une date précise</span>
                      </div>
                      {parseFloat(game.reservation_fee) > 0 && (
                        <p className="text-sm text-gray-400 mt-1">
                          Frais de réservation: +{parseFloat(game.reservation_fee).toFixed(0)} XOF
                        </p>
                      )}
                    </div>
                  </label>

                  {isReservation && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-bold text-white mb-2">
                          Date et Heure de début
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduledStart}
                          onChange={(e) => {
                            setScheduledStart(e.target.value);
                            setAvailabilityChecked(false);
                            setIsAvailable(false);
                          }}
                          min={new Date().toISOString().slice(0, 16)}
                          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <button
                        onClick={checkAvailability}
                        disabled={!scheduledStart || checkingAvailability}
                        className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {checkingAvailability ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            Vérification...
                          </>
                        ) : (
                          <>
                            <Timer className="w-5 h-5" />
                            Vérifier la Disponibilité
                          </>
                        )}
                      </button>

                      {availabilityChecked && (
                        <div className={`p-3 rounded-lg border ${isAvailable ? 'bg-green-900/30 border-green-600' : 'bg-red-900/30 border-red-600'}`}>
                          <p className={`text-sm font-bold flex items-center gap-2 ${isAvailable ? 'text-green-400' : 'text-red-400'}`}>
                            {isAvailable ? (
                              <>
                                <CheckCircle className="w-5 h-5" />
                                ✅ Créneau disponible
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-5 h-5" />
                                ❌ Créneau indisponible
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="bg-purple-900/30 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Récapitulatif</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Jeu:</span>
                    <span className="font-bold text-white">{game.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Package:</span>
                    <span className="font-bold text-white">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Durée:</span>
                    <span className="font-bold text-white">{selectedPackage.duration_minutes} min</span>
                  </div>
                  {isReservation && scheduledStart && (
                    <div className="flex justify-between text-cyan-300">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Début prévu:
                      </span>
                      <span className="font-bold text-white">
                        {new Date(scheduledStart).toLocaleString('fr-FR', { 
                          dateStyle: 'short', 
                          timeStyle: 'short' 
                        })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-300">
                    <span>Points à gagner:</span>
                    <span className="font-bold text-yellow-400 flex items-center gap-1">
                      <Star className="w-4 h-4 fill-current" />
                      +{selectedPackage.points_earned}
                    </span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 mt-2"></div>
                  <div className="flex justify-between text-lg">
                    <span className="text-gray-300">Prix package:</span>
                    <span className="text-white font-bold">{selectedPackage.price} XOF</span>
                  </div>
                  {isReservation && parseFloat(game.reservation_fee) > 0 && (
                    <div className="flex justify-between text-lg">
                      <span className="text-cyan-300">Frais de réservation:</span>
                      <span className="text-cyan-400 font-bold">+{parseFloat(game.reservation_fee).toFixed(0)} XOF</span>
                    </div>
                  )}
                  <div className="border-t border-gray-700 pt-2 mt-2"></div>
                  <div className="flex justify-between text-xl">
                    <span className="font-bold text-white">Total:</span>
                    <span className="font-bold text-green-400">
                      {(parseFloat(selectedPackage.price) + (isReservation ? parseFloat(game.reservation_fee || 0) : 0)).toFixed(0)} XOF
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <h3 className="text-xl font-bold text-white mb-4">Méthode de Paiement</h3>
              <div className="space-y-3 mb-6">
                {paymentMethods.map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-center p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 border-2 transition-all ${
                      selectedPaymentMethod === pm.id ? 'border-purple-500' : 'border-transparent'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment-method"
                      value={pm.id}
                      checked={selectedPaymentMethod === pm.id}
                      onChange={(e) => setSelectedPaymentMethod(parseInt(e.target.value))}
                      className="mr-4 w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-white">{pm.name}</div>
                      <div className="text-sm text-gray-400">
                        {pm.requires_online_payment ? 'Paiement en ligne' : 'Paiement sur place'}
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Instructions */}
              {selectedPaymentMethod && paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.instructions && (
                <div className="bg-blue-900/30 border border-blue-600 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Instructions
                  </h4>
                  <p className="text-sm text-gray-300">
                    {paymentMethods.find(pm => pm.id === selectedPaymentMethod)?.instructions}
                  </p>
                </div>
              )}

              {paymentSession && (
                <div className="bg-green-900/30 border border-green-600 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Paiement en ligne
                  </h4>
                  <div className="text-sm text-gray-300 space-y-3">
                    <div className="flex justify-between">
                      <span>Fournisseur</span>
                      <span className="font-semibold text-white">{String(paymentSession.provider || '').toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Montant</span>
                      <span className="font-semibold text-white">{paymentSession.amount} {paymentSession.currency}</span>
                    </div>
                    {(() => {
                      // Liste des providers qui utilisent KkiaPay pour les paiements
                      const kkiapayProviders = ['kkiapay', 'mtn_momo', 'orange_money', 'wave', 'moov_money'];
                      const provider = String(paymentSession.provider || '').toLowerCase();
                      const usesKkiapay = kkiapayProviders.includes(provider);
                      
                      return usesKkiapay && (
                        <div className="mt-4 flex flex-col items-center gap-3">
                          <p className="text-xs text-gray-400 text-center">
                            Paiement sécurisé via KkiaPay - Accepte tous les opérateurs Mobile Money
                          </p>
                          <KkiapayWidget
                            amount={paymentSession.amount}
                            apiKey={import.meta.env.NEXT_PUBLIC_KKIAPAY_PUBLIC_KEY}
                            sandbox={import.meta.env.NEXT_PUBLIC_KKIAPAY_SANDBOX === '1'}
                            callback={paymentSession.callback_url || window.location.origin + '/player/my-purchases'}
                            onSuccess={(response) => {
                              console.log('Paiement réussi:', response);
                              toast.success('🎉 Paiement effectué avec succès !');
                              setTimeout(() => {
                                navigate('/player/my-purchases');
                              }, 1500);
                            }}
                            onFailed={(error) => {
                              console.error('Paiement échoué:', error);
                              toast.error('❌ Le paiement a échoué. Veuillez réessayer.');
                            }}
                            data={`purchase-${paymentSession.reference || ''}`}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all cursor-pointer"
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>

            {/* Fixed Footer with Submit Button */}
            <div className="p-6 border-t border-gray-800 bg-gray-900 flex-shrink-0">
              {!paymentSession && (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !selectedPaymentMethod || (isReservation && (!availabilityChecked || !isAvailable))}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-700 disabled:to-gray-600 text-white py-4 rounded-lg font-bold text-lg transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {purchasing ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      <span>Traitement...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Confirmer l'achat
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full mt-3 py-3 text-gray-400 hover:text-white transition-colors font-medium"
              >
                ← Retour au choix du package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}
