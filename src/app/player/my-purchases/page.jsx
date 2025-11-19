import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/Navigation';
import InvoiceModal from '../../../components/InvoiceModal';
import Modal, { useModal } from '../../../components/Modal';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Calendar,
  DollarSign,
  Star,
  Gamepad2,
  ArrowLeft,
  RefreshCw,
  Play,
  Receipt
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';
import { resolveGameImageUrl } from '../../../utils/gameImageUrl';

export default function MyPurchases() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [startingSession, setStartingSession] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingPurchaseId, setPendingPurchaseId] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const { modalState, hideModal, showSuccess, showError, showInfo } = useModal();

  useEffect(() => {
    loadPurchases();
  }, [filter]);

  const loadPurchases = async () => {
    try {
      setLoading(true);
      // Charger tous les achats sans filtre serveur
      const res = await fetch(`${API_BASE}/shop/my_purchases.php`, { credentials: 'include' });
      const data = await res.json();
      
      if (data.purchases) {
        // Filtrer côté client selon le statut de session
        let filteredPurchases = data.purchases;
        
        if (filter === 'active') {
          // Sessions EN COURS : Admin a démarré et joueur joue actuellement
          filteredPurchases = data.purchases.filter(p => 
            p.payment_status === 'completed' && 
            p.game_session_status && 
            ['active', 'paused'].includes(p.game_session_status)
          );
        } else if (filter === 'completed') {
          // Sessions TERMINÉES : Temps écoulé, expiré ou terminé par admin
          filteredPurchases = data.purchases.filter(p => 
            p.game_session_status && 
            ['completed', 'expired', 'terminated'].includes(p.game_session_status)
          );
        } else if (filter === 'pending') {
          // Sessions EN ATTENTE : Payé mais pas encore démarré par l'admin OU paiement en attente
          filteredPurchases = data.purchases.filter(p => 
            p.payment_status === 'pending' || 
            (p.payment_status === 'completed' && 
             (!p.game_session_status || 
              p.game_session_status === 'ready' || 
              p.game_session_status === 'pending' ||
              p.session_status === 'pending'))
          );
        }
        // Si filtre vide (''), afficher tous les achats sans filtrer
        
        setPurchases(filteredPurchases);
        return data.purchases; // Retourner tous les achats (non filtrés)
      }
      return [];
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const handleStartSession = async (purchaseId) => {
    setPendingPurchaseId(purchaseId);
    setShowConfirmModal(true);
  };

  const fetchInvoiceById = async (invoiceId, purchaseId) => {
    try {
      setLoadingInvoice(true);
      const invoiceRes = await fetch(`${API_BASE}/invoices/my_invoices.php?id=${invoiceId}`, {
        credentials: 'include'
      });
      const invoiceData = await invoiceRes.json();

      if (invoiceRes.ok && invoiceData.invoice) {
        const purchase = purchases.find((p) => p.id === purchaseId) || { id: purchaseId };
        setSelectedPurchase({ ...purchase, invoice: invoiceData.invoice });
        setShowInvoiceModal(true);
        toast.success('✅ Facture prête !', { duration: 2000 });

        setTimeout(() => {
          loadPurchases();
        }, 500);

        return true;
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture par ID:', error);
    } finally {
      setLoadingInvoice(false);
    }

    return false;
  };

  const confirmStartSession = async () => {
    const purchaseId = pendingPurchaseId;
    console.log('confirmStartSession appelé avec purchaseId:', purchaseId);
    
    try {
      setStartingSession(purchaseId);
      toast.loading('Activation de la session...');
      
      // Confirmer le paiement d'abord (génère la facture automatiquement)
      const confirmRes = await fetch(`${API_BASE}/shop/confirm_my_purchase.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          purchase_id: purchaseId
        })
      });
      
      console.log('Réponse confirm_my_purchase:', confirmRes.status);
      
      let confirmData;
      try {
        const responseText = await confirmRes.text();
        console.log('Response text:', responseText);
        confirmData = JSON.parse(responseText);
        console.log('confirmData:', confirmData);
      } catch (parseError) {
        console.error('Erreur parse JSON:', parseError);
        toast.dismiss();
        showError('Erreur Serveur', 'Le serveur a renvoyé une réponse invalide. Vérifiez les logs PHP.');
        return;
      }
      
      toast.dismiss();
      
      if (!confirmData.success) {
        // Si l'achat est déjà traité, essayer de récupérer la facture quand même
        if (confirmData.error && confirmData.error.includes('déjà été traité')) {
          showInfo('Déjà Confirmé', 'Achat déjà confirmé, récupération de votre facture...');
        } else {
          const errorDetails = confirmData.details ? `\n\nDétails: ${confirmData.details}` : '';
          showError('Erreur', `${confirmData.error || 'Erreur lors de la confirmation'}${errorDetails}`);
          console.error('Erreur complète:', confirmData);
          return;
        }
      } else {
        showSuccess('Session Activée', 'Récupération de votre facture en cours...');
      }
      
      const invoiceId = confirmData.purchase?.invoice_id;
      if (invoiceId) {
        const loaded = await fetchInvoiceById(invoiceId, purchaseId);
        if (loaded) {
          return;
        }
      }

      setLoadingInvoice(true);

      const fetchInvoiceWithTimeout = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          console.log(`Tentative ${i + 1}/${retries} de récupération de facture...`);
          
          try {
            const invoiceRes = await fetch(`${API_BASE}/invoices/my_invoices.php`, {
              credentials: 'include'
            });
            const invoiceData = await invoiceRes.json();
            console.log('Factures récupérées:', invoiceData.invoices?.length || 0);
            
            if (invoiceData.invoices && invoiceData.invoices.length > 0) {
              const invoice = invoiceData.invoices.find(inv => inv.purchase_id == purchaseId);
              if (invoice) {
                console.log('Facture trouvée pour purchase:', purchaseId);
                
                // Récupérer les détails de l'achat directement depuis l'API (pour éviter les problèmes de filtre)
                const purchaseRes = await fetch(`${API_BASE}/shop/my_purchases.php`, {
                  credentials: 'include'
                });
                const purchaseData = await purchaseRes.json();
                const purchase = purchaseData.purchases?.find(p => p.id == purchaseId);
                
                if (purchase) {
                  console.log('✅ Affichage de la facture');
                  setLoadingInvoice(false);
                  setSelectedPurchase({ ...purchase, invoice });
                  setShowInvoiceModal(true);
                  toast.success('✅ Facture prête !', { duration: 2000 });
                  
                  // Recharger les achats APRÈS avoir affiché le modal
                  setTimeout(() => {
                    loadPurchases();
                  }, 500);
                  
                  return true;
                }
              }
            }
          } catch (error) {
            console.error(`Erreur tentative ${i + 1}:`, error);
          }
          
          // Attendre avant de réessayer (sauf au dernier essai)
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1500));
          }
        }
        
        console.log('❌ Facture non trouvée après', retries, 'tentatives');
        return false;
      };
      
      // Essayer de récupérer la facture (ne bloque pas)
      fetchInvoiceWithTimeout().then(found => {
        setLoadingInvoice(false);
        if (!found) {
          showInfo('Facture en Cours', 'Votre facture est en cours de génération. Actualisez la page dans quelques secondes.');
          console.log('❌ Facture non disponible immédiatement');
          // Recharger quand même les achats
          loadPurchases();
        }
      });
      
    } catch (err) {
      console.error('Erreur complète:', err);
      toast.dismiss();
      showError('Erreur Réseau', `Impossible de démarrer la session.\n\nDétails: ${err.message}`);
    } finally {
      setStartingSession(null);
      setPendingPurchaseId(null);
    }
  };

  const handleViewInvoice = async (purchase) => {
    try {
      // Récupérer la facture associée
      const res = await fetch(`${API_BASE}/invoices/my_invoices.php`, {
        credentials: 'include'
      });
      
      const data = await res.json();
      
      if (data.invoices) {
        const invoice = data.invoices.find(inv => inv.purchase_id == purchase.id);
        if (invoice) {
          setSelectedPurchase({ ...purchase, invoice });
          setShowInvoiceModal(true);
        } else {
          toast.error('Facture non trouvée');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Erreur lors du chargement de la facture');
    }
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      completed: {
        icon: CheckCircle,
        className: 'bg-green-600 text-white',
        label: 'Payé'
      },
      pending: {
        icon: Clock,
        className: 'bg-yellow-600 text-white',
        label: 'En attente'
      },
      processing: {
        icon: RefreshCw,
        className: 'bg-blue-600 text-white',
        label: 'En cours'
      },
      failed: {
        icon: XCircle,
        className: 'bg-red-600 text-white',
        label: 'Échoué'
      },
      cancelled: {
        icon: XCircle,
        className: 'bg-gray-600 text-white',
        label: 'Annulé'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </span>
    );
  };

  const getSessionStatusBadge = (sessionStatus) => {
    const statusConfig = {
      ready: {
        icon: Clock,
        className: 'bg-blue-600 text-white',
        label: 'Prête'
      },
      active: {
        icon: Play,
        className: 'bg-green-600 text-white animate-pulse',
        label: 'En cours'
      },
      paused: {
        icon: Clock,
        className: 'bg-orange-600 text-white',
        label: 'En pause'
      },
      completed: {
        icon: CheckCircle,
        className: 'bg-gray-600 text-white',
        label: 'Terminée'
      },
      terminated: {
        icon: XCircle,
        className: 'bg-red-600 text-white',
        label: 'Terminée'
      },
      expired: {
        icon: AlertCircle,
        className: 'bg-gray-600 text-white',
        label: 'Expirée'
      },
      pending: {
        icon: Clock,
        className: 'bg-yellow-600 text-white',
        label: 'En attente'
      }
    };

    const config = statusConfig[sessionStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="player" />
      
      {/* Main Content with Sidebar Offset */}
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/player/shop')}
            className="flex items-center gap-2 text-white mb-4 hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à la boutique
          </button>

          <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <ShoppingBag className="w-10 h-10" />
            Mes Achats
          </h1>
          <p className="text-gray-300">Historique de vos achats de temps de jeu</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filter === '' 
                ? 'bg-white text-purple-900' 
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'active' 
                ? 'bg-white text-purple-900' 
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            <Play className="w-4 h-4" />
            Actifs
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'completed' 
                ? 'bg-white text-purple-900' 
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Complétés
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
              filter === 'pending' 
                ? 'bg-white text-purple-900' 
                : 'bg-purple-700 text-white hover:bg-purple-600'
            }`}
          >
            <Clock className="w-4 h-4" />
            En attente
          </button>

          <button
            onClick={loadPurchases}
            className="ml-auto px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
        </div>

        {/* Purchases List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p className="text-xl text-white">Chargement...</p>
          </div>
        ) : purchases.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 text-gray-500 mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-white mb-2">
              {filter === 'active' ? 'Aucune session active' : 
               filter === 'completed' ? 'Aucune session terminée' :
               filter === 'pending' ? 'Aucun achat en attente' :
               'Aucun achat'}
            </h2>
            <p className="text-gray-400 mb-6">
              {filter ? 'Aucun achat dans cette catégorie' : 'Vous n\'avez pas encore effectué d\'achat'}
            </p>
            {!filter && (
              <button
                onClick={() => navigate('/player/shop')}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
              >
                Parcourir la Boutique
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="bg-gray-800 rounded-xl p-6 hover:bg-gray-750 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Game Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <img
                      src={resolveGameImageUrl(purchase.image_url || purchase.thumbnail_url || '')}
                      alt={purchase.game_name}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100?text=Game';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {purchase.game_name}
                      </h3>
                      {purchase.package_name && (
                        <p className="text-gray-400 mb-2">{purchase.package_name}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-400">
                        <Calendar className="w-4 h-4" />
                        {formatDate(purchase.created_at)}
                      </div>
                    </div>
                  </div>

                  {/* Center: Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1">Durée</div>
                      <div className="font-bold text-white flex items-center justify-center gap-1">
                        <Clock className="w-4 h-4" />
                        {purchase.duration_minutes} min
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1">Prix</div>
                      <div className="font-bold text-green-400 flex items-center justify-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {purchase.price} XOF
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1">Points</div>
                      <div className="font-bold text-yellow-400 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        +{purchase.points_earned}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="text-gray-400 text-sm mb-1">Paiement</div>
                      <div className="text-sm text-white">
                        {purchase.payment_method_name || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Status */}
                  <div className="text-right space-y-2">
                    {/* Statut de paiement */}
                    <div>
                      <div className="text-xs text-gray-400 mb-1">Paiement</div>
                      {getPaymentStatusBadge(purchase.payment_status)}
                    </div>
                    
                    {/* Statut de session */}
                    {purchase.payment_status === 'completed' && (
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Session</div>
                        {getSessionStatusBadge(
                          purchase.game_session_status || purchase.session_status || 'pending'
                        )}
                      </div>
                    )}
                    
                    {purchase.payment_status === 'pending' && (
                      <div className="mt-2 text-sm text-gray-400">
                        <AlertCircle className="w-4 h-4 inline-block mr-1" />
                        En attente de confirmation
                      </div>
                    )}

                    {purchase.payment_status === 'completed' && 
                     (purchase.session_status === 'pending' || 
                      (!purchase.game_session_status && !purchase.session_status)) && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleStartSession(purchase.id)}
                          disabled={startingSession === purchase.id}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 text-sm font-semibold flex items-center gap-2"
                        >
                          {startingSession === purchase.id ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Activation...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4" />
                              Démarrer la Session
                            </>
                          )}
                        </button>
                      </div>
                    )}
                    
                    {purchase.payment_status === 'completed' && 
                     (purchase.game_session_status || purchase.session_status) &&
                     ['ready', 'active', 'paused'].includes(purchase.game_session_status || purchase.session_status) && (
                      <div className="mt-2">
                        <button
                          onClick={() => handleViewInvoice(purchase)}
                          className="text-sm text-purple-400 hover:text-purple-300 underline flex items-center gap-1"
                        >
                          <Receipt className="w-4 h-4" />
                          Voir ma facture QR
                        </button>
                      </div>
                    )}
                    
                    {purchase.payment_status === 'completed' && 
                     purchase.game_session_status && 
                     ['completed', 'expired', 'terminated'].includes(purchase.game_session_status) && (
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Session terminée
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Summary */}
        {!loading && purchases.length > 0 && (
          <div className="mt-8 bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Récapitulatif</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-900/30 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Total Achats</div>
                <div className="text-3xl font-bold text-white">{purchases.length}</div>
              </div>
              
              <div className="bg-green-900/30 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Montant Total</div>
                <div className="text-3xl font-bold text-green-400">
                  {purchases.reduce((sum, p) => sum + parseFloat(p.price), 0).toFixed(2)} XOF
                </div>
              </div>
              
              <div className="bg-yellow-900/30 p-4 rounded-lg">
                <div className="text-gray-400 text-sm mb-1">Points Gagnés</div>
                <div className="text-3xl font-bold text-yellow-400">
                  {purchases.reduce((sum, p) => sum + parseInt(p.points_earned), 0)}
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
      
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
          />
          
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Démarrer la Session</h3>
                  <p className="text-sm text-gray-500">Confirmation requise</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-4 mb-6">
                <p className="text-gray-700">
                  Cette action va <strong className="text-purple-700">générer votre facture</strong> avec un code QR unique. 
                  Vous pourrez l'utiliser pour accéder à votre session de jeu.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setPendingPurchaseId(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    confirmStartSession();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Invoice Modal */}
      {loadingInvoice && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Génération de votre facture...</h3>
            <p className="text-gray-600">Veuillez patienter quelques instants</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce"></div>
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="h-2 w-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && selectedPurchase && (
        <InvoiceModal 
          invoice={selectedPurchase.invoice}
          purchase={selectedPurchase}
          onClose={() => {
            setShowInvoiceModal(false);
            setSelectedPurchase(null);
          }}
        />
      )}

      {/* Modern Modal Component */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={hideModal}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onConfirm={modalState.onConfirm}
        confirmText={modalState.confirmText}
        cancelText={modalState.cancelText}
        showCancel={modalState.showCancel}
      />
    </div>
  );
}
