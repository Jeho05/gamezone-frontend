import React, { useState, useEffect, useCallback } from 'react';
import Navigation from '../../../components/Navigation';
import QRScanner from '../../../components/admin/QRScanner';
import { 
  QrCode, 
  Scan,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Pause,
  User,
  Gamepad2,
  DollarSign,
  Timer,
  RefreshCw,
  History,
  WifiOff,
  Server,
  AlertCircle,
  StopCircle
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function InvoiceScanner() {
  const [validationCode, setValidationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);
  const [networkStatus, setNetworkStatus] = useState('online');
  const [sessionDetails, setSessionDetails] = useState(null);
  const effectiveStatus = React.useMemo(() => {
    if (sessionDetails && typeof sessionDetails.progress_percent === 'number' && sessionDetails.progress_percent >= 100) {
      return 'completed';
    }
    return currentInvoice?.session_status;
  }, [currentInvoice?.session_status, sessionDetails?.progress_percent]);

  // Charger l'historique depuis localStorage
  useEffect(() => {
    const history = localStorage.getItem('scan_history');
    if (history) {
      setScanHistory(JSON.parse(history));
    }
  }, []);

  // Vérification connexion réseau
  useEffect(() => {
    const handleOnline = () => {
      setNetworkStatus('online');
      toast.success('Connexion rétablie', { duration: 2000 });
    };
    const handleOffline = () => {
      setNetworkStatus('offline');
      toast.error('⚠️ Connexion perdue! Vérifiez votre réseau.', { duration: 5000 });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addToHistory = (code, status, error = null) => {
    const entry = {
      code,
      status,
      error,
      timestamp: new Date().toISOString()
    };
    setScanHistory(prev => {
      const newHistory = [entry, ...(Array.isArray(prev) ? prev : [])].slice(0, 10);
      localStorage.setItem('scan_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Gestion des erreurs métier
  const handleBusinessError = (data, cleanCode) => {
    const errorCode = data.error || 'unknown';
    
    const errorMapping = {
      'invalid_code': {
        title: 'Code Invalide',
        message: 'Ce code de validation n\'existe pas',
        icon: '❌',
        canRetry: false,
        solution: 'Vérifiez le code et réessayez'
      },
      'already_active': {
        title: 'Déjà Activée',
        message: 'Cette facture a déjà été activée',
        icon: '⚠️',
        canRetry: false,
        solution: 'Utilisez un nouveau code QR'
      },
      'already_used': {
        title: 'Déjà Utilisée',
        message: 'Cette facture a déjà été utilisée',
        icon: '🔒',
        canRetry: false,
        solution: 'Cette facture ne peut plus être utilisée'
      },
      'already_cancelled': {
        title: 'Annulée',
        message: 'Cette facture a été annulée',
        icon: '🚫',
        canRetry: false,
        solution: 'Contactez l\'administration'
      },
      'expired': {
        title: 'Expirée',
        message: 'Cette facture a expiré (validité 2 mois)',
        icon: '⏰',
        canRetry: false,
        solution: 'Facture trop ancienne, créez un nouvel achat'
      },
      'fraud_detected': {
        title: 'Fraude Détectée',
        message: 'Activité suspecte - Facture bloquée',
        icon: '🚨',
        canRetry: false,
        solution: 'Contactez immédiatement l\'administration'
      },
      'too_early': {
        title: 'Trop Tôt',
        message: data.message || 'La session ne peut pas encore être activée',
        icon: '⏱️',
        canRetry: true,
        solution: `Réessayez dans ${data.minutes_until_start || '?'} minutes`
      },
      'payment_pending': {
        title: 'Paiement En Attente',
        message: 'Le paiement n\'a pas encore été confirmé',
        icon: '💳',
        canRetry: true,
        solution: 'Confirmez le paiement d\'abord dans Gestion Boutique'
      },
      'payment_failed': {
        title: 'Paiement Échoué',
        message: 'Le paiement a échoué ou a été refusé',
        icon: '❌',
        canRetry: false,
        solution: 'Créez un nouvel achat avec un nouveau paiement'
      },
      'session_creation_failed': {
        title: 'Erreur Technique',
        message: 'Impossible de créer la session',
        icon: '⚙️',
        canRetry: true,
        solution: 'Réessayez dans quelques instants'
      }
    };

    const errorInfo = errorMapping[errorCode] || {
      title: 'Erreur',
      message: data.message || 'Une erreur est survenue',
      icon: '❌',
      canRetry: false,
      solution: 'Contactez le support technique'
    };

    toast.error(`${errorInfo.icon} ${errorInfo.title}`, {
      description: errorInfo.message,
      duration: 5000
    });

    setResult({ 
      type: 'error', 
      message: errorInfo.message,
      title: errorInfo.title,
      error: errorCode,
      canRetry: errorInfo.canRetry,
      solution: errorInfo.solution,
      minutes_until_start: data.minutes_until_start,
      scheduled_start: data.scheduled_start,
      scheduled_end: data.scheduled_end
    });

    setErrorDetails({
      type: 'business',
      code: errorCode,
      ...errorInfo
    });

    addToHistory(cleanCode, 'error', errorCode);
  };

  // Gestion des erreurs techniques
  const handleTechnicalError = (error, cleanCode, isRetry) => {
    console.error('Technical Error:', error);

    let errorType = 'unknown';
    let errorMessage = 'Erreur inconnue';
    let canRetry = true;
    let solution = 'Réessayez dans quelques instants';

    if (error.name === 'AbortError') {
      errorType = 'timeout';
      errorMessage = 'Délai d\'attente dépassé (15s)';
      solution = 'Le serveur met trop de temps à répondre. Vérifiez votre connexion.';
      toast.error('⏱️ Timeout: Le serveur ne répond pas', { duration: 5000 });
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorType = 'network';
      errorMessage = 'Erreur de connexion réseau';
      solution = 'Vérifiez votre connexion internet et réessayez';
      toast.error('📡 Erreur réseau: Impossible de se connecter au serveur', { duration: 5000 });
    } else if (error.message.includes('500')) {
      errorType = 'server';
      errorMessage = 'Erreur serveur (500)';
      solution = 'Le serveur rencontre un problème. Réessayez dans 1 minute.';
      toast.error('🔧 Erreur serveur: Service temporairement indisponible', { duration: 5000 });
    } else {
      toast.error(`❌ Erreur: ${error.message}`, { duration: 5000 });
    }

    setResult({ 
      type: 'error', 
      message: errorMessage,
      error: errorType,
      canRetry,
      solution
    });

    setErrorDetails({
      type: 'technical',
      errorType,
      message: errorMessage,
      solution,
      canRetry,
      fullError: error.message
    });

    addToHistory(cleanCode, 'error', errorType);

    // Auto-retry pour les erreurs réseau (max 3 fois)
    if (canRetry && !isRetry && retryCount < 3 && (errorType === 'network' || errorType === 'timeout')) {
      setRetryCount(prev => prev + 1);
      toast.info(`🔄 Nouvelle tentative (${retryCount + 1}/3)...`, { duration: 3000 });
      setTimeout(() => {
        processCode(cleanCode, true);
      }, 2000);
    }
  };

  const processCode = useCallback(async (code, isRetry = false) => {
    // Validation du code
    if (!code || code.trim().length === 0) {
      toast.error('⚠️ Veuillez entrer un code valide');
      return;
    }

    // Vérification connexion réseau
    if (networkStatus === 'offline') {
      toast.error('❌ Pas de connexion internet. Impossible de scanner.', { duration: 4000 });
      setErrorDetails({
        type: 'network',
        message: 'Connexion internet perdue',
        solution: 'Vérifiez votre connexion et réessayez'
      });
      return;
    }

    // Nettoyer le code : enlever les tirets et espaces, mettre en majuscules
    const cleanCode = code.trim().toUpperCase().replace(/[-\s]/g, '');
    
    // Validation format (8 OU 16 caractères alphanumériques pour compatibilité)
    if (!/^[A-Z0-9]{8}$/.test(cleanCode) && !/^[A-Z0-9]{16}$/.test(cleanCode)) {
      toast.error('❌ Format invalide. Le code doit contenir 8 ou 16 caractères.', { duration: 4000 });
      setResult({ 
        type: 'error', 
        message: 'Format de code invalide (8 ou 16 caractères requis)',
        error: 'invalid_format'
      });
      return;
    }

    try {
      setLoading(true);
      setResult(null);
      setErrorDetails(null);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Timeout 15s

      const res = await fetch(`${API_BASE}/admin/scan_v2.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validation_code: cleanCode }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Lire la réponse JSON (même en cas d'erreur)
      let data;
      try {
        const responseText = await res.text();
        console.log('Response status:', res.status);
        console.log('Response text:', responseText);
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        throw new Error('Réponse serveur invalide');
      }

      // Vérification du statut HTTP
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('❌ Session expirée. Veuillez vous reconnecter.', { duration: 5000 });
          setErrorDetails({
            type: 'auth',
            message: 'Session expirée',
            solution: 'Reconnectez-vous et réessayez'
          });
          setTimeout(() => {
            window.location.href = '/admin/login';
          }, 2000);
          return;
        }
        
        if (res.status === 400) {
          // Erreur 400 avec message de l'API
          console.log('API error 400:', data);
          console.log('Error code:', data.error);
          console.log('Error message:', data.message);
          console.log('Debug info:', data.debug_info);
          
          // Afficher l'erreur dans un toast avec plus de détails
          toast.error(`❌ ${data.message || 'Erreur lors de l\'activation'}`, {
            description: data.debug_info ? `Code erreur: ${data.debug_info}` : undefined,
            duration: 6000
          });
          
          handleBusinessError(data, cleanCode);
          addToHistory(cleanCode, 'error', data.error || 'bad_request');
          return;
        }
        
        if (res.status === 500) {
          throw new Error('Erreur serveur. Réessayez dans quelques instants.');
        }
        
        throw new Error(`Erreur HTTP ${res.status}`);
      }

      if (data.success) {
        setResult({ type: 'success', data });
        setCurrentInvoice(data.invoice);
        setRetryCount(0);
        
        const autoStarted = data.next_action === 'session_started' || data.invoice?.session_status === 'active';
        
        if (autoStarted) {
          // Session démarrée automatiquement
          toast.success('✅ Facture Activée !', { duration: 3000 });
          toast.success('🎮 Session démarrée automatiquement', { duration: 4000 });
          toast.info('✨ Le joueur peut commencer à jouer immédiatement', { 
            duration: 5000,
            description: `${data.invoice.game_name} - ${data.invoice.duration_minutes} minutes`
          });
        } else {
          // Facture activée mais session pas encore démarrée (rare)
          toast.success('✅ Facture activée avec succès !', { duration: 3000 });
          toast.warning('⚠️ La session doit être démarrée manuellement', { duration: 4000 });
        }
        
        addToHistory(cleanCode, 'success');
        setValidationCode('');
        
      } else {
        // Gestion des erreurs métier
        handleBusinessError(data, cleanCode);
      }
    } catch (error) {
      handleTechnicalError(error, cleanCode, isRetry);
    } finally {
      setLoading(false);
    }
  }, [networkStatus, retryCount]);

  const handleScan = async (e) => {
    e?.preventDefault();
    processCode(validationCode);
  };

  const handleRetry = () => {
    if (validationCode) {
      setRetryCount(0);
      processCode(validationCode);
    } else {
      toast.warning('Veuillez entrer un code avant de réessayer');
    }
  };

  const resetScanner = () => {
    setValidationCode('');
    setResult(null);
    setCurrentInvoice(null);
    setErrorDetails(null);
    setRetryCount(0);
  };

  const handleQRDetected = (code) => {
    setValidationCode(code);
    processCode(code);
    setShowQRScanner(false);
  };

  const refreshSessionDetails = useCallback(async () => {
    if (!currentInvoice?.session_id) return;
    try {
      const res = await fetch(`${API_BASE}/admin/manage_session.php?id=${currentInvoice.session_id}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Session expirée. Veuillez vous reconnecter.', { duration: 4000 });
          setTimeout(() => { window.location.href = '/admin/login'; }, 1500);
          return;
        }
        return;
      }
      const data = await res.json();
      if (data?.session) {
        setSessionDetails(data.session);
      }
    } catch (e) {}
  }, [currentInvoice?.session_id]);

  useEffect(() => {
    if (currentInvoice?.session_id) {
      refreshSessionDetails();
    } else {
      setSessionDetails(null);
    }
  }, [currentInvoice?.session_id, refreshSessionDetails]);

  const performSessionAction = async (action) => {
    if (!currentInvoice?.session_id) {
      toast.error('Aucune session à contrôler');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/admin/manage_session.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: currentInvoice.session_id, action })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data?.error || 'Action impossible');
        return;
      }
      if (action === 'pause') {
        toast.success('Session mise en pause');
        setCurrentInvoice(prev => prev ? { ...prev, session_status: 'paused' } : prev);
      } else if (action === 'resume') {
        toast.success('Session reprise');
        setCurrentInvoice(prev => prev ? { ...prev, session_status: 'active' } : prev);
      }
      await refreshSessionDetails();
    } catch (e) {
      toast.error('Erreur lors de l\'action');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      success: { icon: CheckCircle, bg: 'bg-green-600', text: 'Succès' },
      error: { icon: XCircle, bg: 'bg-red-600', text: 'Échec' }
    };
    const config = configs[status] || configs.error;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold text-white ${config.bg}`}>
        <Icon className="w-3 h-3" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="admin" />
      
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header avec indicateur réseau */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <QrCode className="w-8 h-8 text-purple-600" />
                <h1 className="text-3xl font-bold text-purple-600">Scanner de Factures</h1>
              </div>
              {networkStatus === 'offline' && (
                <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
                  <WifiOff className="w-5 h-5" />
                  <span className="text-sm font-semibold text-white">Hors ligne</span>
                </div>
              )}
            </div>
            <p className="text-gray-600">Scannez ou entrez le code de validation pour activer une facture</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Scan className="w-6 h-6" />
                Scanner
              </h2>

              <form onSubmit={handleScan} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Code de Validation (8 ou 16 caractères)
                  </label>
                  <input
                    type="text"
                    value={validationCode}
                    onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX ou XXXX-XXXX"
                    maxLength={19}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-lg"
                    disabled={loading || networkStatus === 'offline'}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {validationCode.replace(/-/g, '').length} caractères (sans tirets)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loading || !validationCode || networkStatus === 'offline'}
                    className="flex-1 py-3 px-4 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        Scan en cours...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Valider
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    disabled={loading || networkStatus === 'offline'}
                    className="py-3 px-4 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5" />
                    QR
                  </button>
                </div>
              </form>

              {/* Results Display */}
              <div className="mt-6">
                {loading && (
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 text-center">
                    <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-3" />
                    <p className="text-blue-800 font-semibold">Vérification en cours...</p>
                    <p className="text-blue-600 text-sm mt-1">Veuillez patienter</p>
                  </div>
                )}

                {/* Success Display */}
                {result?.type === 'success' && currentInvoice && (
                  <div className="space-y-4">
                    <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <h3 className="font-bold text-green-800">✅ Facture Validée</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Facture:</span>
                          <span className="font-mono font-semibold">{currentInvoice.invoice_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Joueur:</span>
                          <span className="font-semibold">{currentInvoice.username}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Jeu:</span>
                          <span className="font-semibold">{currentInvoice.game_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Durée:</span>
                          <span className="font-semibold">{currentInvoice.duration_minutes} minutes</span>
                        </div>
                        {typeof sessionDetails?.progress_percent === 'number' && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Progression:</span>
                            <span className="font-semibold">{sessionDetails.progress_percent}%</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Session Status Messages */}
                    {effectiveStatus === 'active' && (
                      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <div className="flex items-start gap-4">
                          <div className="bg-white/20 p-3 rounded-full">
                            <Play className="w-8 h-8" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">🎮 Session Démarrée</h3>
                            <p className="text-green-50 text-sm mb-3">
                              La session a été activée et démarrée <strong>automatiquement</strong>. 
                              Le joueur peut commencer à jouer immédiatement.
                            </p>
                            <div className="bg-white/10 rounded-lg p-3 text-sm">
                              <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4" />
                                <span>{currentInvoice.total_minutes} minutes disponibles</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {effectiveStatus === 'ready' && (
                      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <AlertTriangle className="w-8 h-8 text-yellow-600" />
                          <div>
                            <h3 className="font-bold text-yellow-800 mb-2">⚠️ Session Non Démarrée</h3>
                            <p className="text-yellow-700 text-sm mb-3">
                              La facture est activée mais la session n'a pas démarré automatiquement.
                            </p>
                            <p className="text-yellow-600 text-xs bg-yellow-100 p-2 rounded">
                              <strong>Action:</strong> Allez dans "Gestion Sessions" et démarrez la session manuellement
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {effectiveStatus === 'paused' && (
                      <div className="bg-orange-50 border-2 border-orange-400 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <Clock className="w-8 h-8 text-orange-600" />
                          <div>
                            <h3 className="font-bold text-orange-800 mb-2">⏸️ Session en pause</h3>
                            <p className="text-orange-700 text-sm mb-1">Reprenez la session quand vous êtes prêt.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {effectiveStatus === 'completed' && (
                      <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                          <CheckCircle className="w-8 h-8 text-gray-700" />
                          <div>
                            <h3 className="font-bold text-gray-800 mb-2">✅ Session Terminée</h3>
                            <p className="text-gray-700 text-sm">Progression 100%. Aucune action requise.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {effectiveStatus === 'active' && (
                        <button
                          onClick={() => performSessionAction('pause')}
                          disabled={loading}
                          className="py-3 px-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Pause className="w-5 h-5" />
                          Mettre en pause
                        </button>
                      )}
                      {effectiveStatus === 'paused' && (
                        <button
                          onClick={() => performSessionAction('resume')}
                          disabled={loading}
                          className="py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          Reprendre
                        </button>
                      )}
                      <button
                        onClick={() => {
                          toast.info('Affichage arrêté. La session continue en arrière-plan.', { duration: 3000 });
                          setResult(null);
                          setErrorDetails(null);
                          setSessionDetails(null);
                          setCurrentInvoice(prev => prev ? { ...prev } : prev);
                        }}
                        className="py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 flex items-center gap-2"
                      >
                        <StopCircle className="w-5 h-5" />
                        Arrêter l'affichage
                      </button>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {result?.type === 'error' && errorDetails && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="bg-red-500 p-3 rounded-full flex-shrink-0">
                        <XCircle className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-red-800 mb-2">
                          {result.title || 'Erreur'}
                        </h3>
                        <p className="text-red-700 mb-4">{result.message}</p>
                        
                        {result.solution && (
                          <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                            <p className="text-sm font-semibold text-red-900 mb-2">💡 Solution:</p>
                            <p className="text-sm text-red-700">{result.solution}</p>
                          </div>
                        )}

                        {errorDetails.type === 'technical' && (
                          <details className="mt-3">
                            <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800 font-semibold">
                              Détails techniques ▼
                            </summary>
                            <div className="mt-2 bg-red-100 p-3 rounded text-xs font-mono text-red-800 space-y-1">
                              <p><strong>Type:</strong> {errorDetails.errorType}</p>
                              <p><strong>Message:</strong> {errorDetails.fullError}</p>
                              {retryCount > 0 && <p><strong>Tentatives:</strong> {retryCount}/3</p>}
                            </div>
                          </details>
                        )}

                        {result.canRetry && (
                          <button
                            onClick={handleRetry}
                            disabled={loading}
                            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 font-semibold transition-colors"
                          >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Réessayer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {result && (
                  <button
                    onClick={resetScanner}
                    className="w-full mt-4 py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Scanner un Autre Code
                  </button>
                )}
              </div>
            </div>

            {/* History Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <History className="w-6 h-6" />
                Historique des Scans
              </h2>

              {scanHistory.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Aucun scan pour le moment</p>
              ) : (
                <div className="space-y-2">
                  {scanHistory.map((entry, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm">{entry.code}</span>
                        {getStatusBadge(entry.status)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(entry.timestamp).toLocaleString('fr-FR')}
                        {entry.error && <span className="ml-2 text-red-600">({entry.error})</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onDetected={handleQRDetected}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
