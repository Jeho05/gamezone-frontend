import React, { useState, useEffect } from 'react';
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
  User,
  Gamepad2,
  DollarSign,
  Timer,
  RefreshCw,
  History
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

  useEffect(() => {
    // Charger l'historique depuis localStorage
    const history = JSON.parse(localStorage.getItem('scanHistory') || '[]');
    setScanHistory(history);
  }, []);

  const addToHistory = (code, status) => {
    const newEntry = {
      code,
      status,
      timestamp: new Date().toISOString()
    };
    const history = [newEntry, ...scanHistory].slice(0, 10);
    setScanHistory(history);
    localStorage.setItem('scanHistory', JSON.stringify(history));
  };

  const handleQRScan = (scannedCode) => {
    setShowQRScanner(false);
    setValidationCode(scannedCode);
    // Auto-submit après scan
    setTimeout(() => {
      processCode(scannedCode);
    }, 100);
  };

  const processCode = async (code) => {
    const cleanCode = code.trim().toUpperCase();
    
    if (!cleanCode || cleanCode.length !== 16) {
      toast.error('Le code doit contenir exactement 16 caractères');
      return;
    }

    if (!/^[A-Z0-9]{16}$/.test(cleanCode)) {
      toast.error('Format de code invalide (alphanumériques uniquement)');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const res = await fetch(`${API_BASE}/admin/scan_invoice.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validation_code: cleanCode })
      });

      const data = await res.json();

      if (data.success) {
        setResult({ type: 'success', data });
        setCurrentInvoice(data.invoice);
        const autoStarted = data.next_action === 'session_started' || data.invoice?.session_status === 'active';
        if (autoStarted) {
          toast.success('✅ Facture activée et session démarrée automatiquement !', { duration: 4000 });
          toast.info('🎮 Le joueur peut commencer à jouer immédiatement', { duration: 4000 });
        } else {
          toast.success('Facture activée avec succès !');
        }
        addToHistory(cleanCode, 'success');
        setValidationCode('');
      } else {
        setResult({ 
          type: 'error', 
          message: data.message, 
          error: data.error, 
          minutes_until_start: data.minutes_until_start, 
          scheduled_start: data.scheduled_start, 
          scheduled_end: data.scheduled_end 
        });
        toast.error(data.message || 'Erreur lors du scan');
        addToHistory(cleanCode, 'error');
      }
    } catch (error) {
      console.error(error);
      setResult({ type: 'error', message: 'Erreur de connexion au serveur' });
      toast.error('Erreur de connexion');
      addToHistory(cleanCode, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e?.preventDefault();
    processCode(validationCode);
  };

  const handleStartSession = async () => {
    if (!currentInvoice?.session_id) {
      toast.error('Aucune session trouvée');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/admin/manage_session.php`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: currentInvoice.session_id,
          action: 'start'
        })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('🎮 Session démarrée ! Le joueur peut commencer à jouer.', { duration: 4000 });
        // Rafraîchir les infos de la facture
        setCurrentInvoice(prev => ({ ...prev, session_status: 'active' }));
      } else {
        toast.error(data.error || 'Impossible de démarrer la session');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erreur lors du démarrage');
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setValidationCode('');
    setResult(null);
    setCurrentInvoice(null);
  };

  const getStatusBadge = (status) => {
    const configs = {
      success: { icon: CheckCircle, bg: 'bg-green-600', text: 'Succès' },
      error: { icon: XCircle, bg: 'bg-red-600', text: 'Échec' }
    };
    const config = configs[status] || configs.error;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-semibold ${config.bg}`}>
        <Icon className="w-4 h-4" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="admin" />
      
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <QrCode className="w-8 h-8" />
              Scanner de Factures
            </h1>
            <p className="text-gray-600">Scannez ou saisissez le code de validation pour activer une session de jeu</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Scanner Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <form onSubmit={handleScan}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Code de Validation (16 caractères)
                    </label>
                    <input
                      type="text"
                      value={validationCode}
                      onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                      maxLength={16}
                      placeholder="ENTREZ LE CODE..."
                      className="w-full px-4 py-4 text-lg font-mono font-bold tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 uppercase"
                      autoComplete="off"
                      autoFocus
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {validationCode.length}/16 caractères
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <button
                      type="button"
                      onClick={() => setShowQRScanner(true)}
                      className="py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Scanner Caméra
                    </button>

                    <button
                      type="submit"
                      disabled={loading || validationCode.length !== 16}
                      className="py-4 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          Vérification en cours...
                        </>
                      ) : (
                        <>
                          <Scan className="w-5 h-5" />
                          Valider Code
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Result Display */}
                {result && (
                  <div className={`mt-6 p-6 rounded-lg ${
                    result.type === 'success' ? 'bg-green-50 border-2 border-green-500' : 'bg-red-50 border-2 border-red-500'
                  }`}>
                    <div className="flex items-start gap-3 mb-4">
                      {result.type === 'success' ? (
                        <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">
                          {result.type === 'success' ? '✅ Facture Activée !' : '❌ Échec du Scan'}
                        </h3>
                        <p className="text-gray-700">
                          {result.type === 'success' ? result.data.message : result.message}
                        </p>
                        {result.type === 'error' && result.error === 'reservation_too_early' && (
                          <div className="mt-3 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <div>
                              <div>Activation possible à partir de: <span className="font-mono font-semibold">{result.scheduled_start}</span></div>
                              {typeof result.minutes_until_start === 'number' && (
                                <div>Temps restant estimé: <span className="font-semibold">~{result.minutes_until_start} min</span></div>
                              )}
                            </div>
                          </div>
                        )}
                        {result.type === 'error' && result.error === 'reservation_expired' && (
                          <div className="mt-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            <div>
                              <div>Créneau dépassé. Fin programmée: <span className="font-mono font-semibold">{result.scheduled_end}</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Invoice Details */}
                    {result.type === 'success' && currentInvoice && (
                      <div className="bg-white rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Numéro Facture:</span>
                          <span className="font-mono font-bold">{currentInvoice.invoice_number}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Joueur:</span>
                          <span className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {currentInvoice.username} ({currentInvoice.email})
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Jeu:</span>
                          <span className="flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4" />
                            {currentInvoice.game_name}
                          </span>
                        </div>
                        {currentInvoice.package_name && (
                          <div className="flex justify-between items-center py-2 border-b">
                            <span className="font-semibold text-gray-600">Package:</span>
                            <span>{currentInvoice.package_name}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Durée:</span>
                          <span className="flex items-center gap-2 font-bold text-purple-600">
                            <Timer className="w-4 h-4" />
                            {currentInvoice.duration_minutes} minutes
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="font-semibold text-gray-600">Montant:</span>
                          <span className="flex items-center gap-2 font-bold text-green-600">
                            <DollarSign className="w-4 h-4" />
                            {currentInvoice.amount} {currentInvoice.currency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-semibold text-gray-600">Statut Session:</span>
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {currentInvoice.session_status}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 mt-4">
                      {/* Bouton de démarrage manuel (au cas où l'auto-start aurait échoué) */}
                      {result.type === 'success' && currentInvoice?.session_status === 'ready' && (
                        <button
                          onClick={handleStartSession}
                          disabled={loading}
                          className="flex-1 py-3 px-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="w-5 h-5 animate-spin" />
                              Démarrage...
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5" />
                              Démarrer la Session
                            </>
                          )}
                        </button>
                      )}
                      
                      {/* Affichage quand la session est déjà active */}
                      {result.type === 'success' && currentInvoice?.session_status === 'active' && (
                        <div className="flex-1">
                          <div className="py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-lg flex items-center justify-center gap-2 shadow-lg">
                            <CheckCircle className="w-5 h-5" />
                            🎮 Session Active
                          </div>
                          <p className="text-xs text-center text-gray-600 mt-2">
                            Le joueur peut commencer à jouer
                          </p>
                        </div>
                      )}
                      
                      {/* Affichage quand la session est en pause */}
                      {result.type === 'success' && currentInvoice?.session_status === 'paused' && (
                        <div className="flex-1 py-3 px-4 bg-orange-100 text-orange-700 font-bold rounded-lg flex items-center justify-center gap-2">
                          <Clock className="w-5 h-5" />
                          Session en pause
                        </div>
                      )}
                      
                      {/* Affichage quand la session est terminée */}
                      {result.type === 'success' && ['completed', 'terminated', 'expired'].includes(currentInvoice?.session_status) && (
                        <div className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Session terminée
                        </div>
                      )}
                      <button
                        onClick={resetScanner}
                        className="flex-1 py-3 px-4 bg-gray-600 text-white font-bold rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-5 h-5" />
                        {result.type === 'success' ? 'Scanner un Autre Code' : 'Réessayer'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scan History */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-purple-600 mb-4 flex items-center gap-2">
                  <History className="w-6 h-6" />
                  Historique
                </h3>

                {scanHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Aucun scan récent</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scanHistory.map((entry, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-mono text-sm font-bold break-all">
                            {entry.code}
                          </span>
                          {getStatusBadge(entry.status)}
                        </div>
                        <p className="text-xs text-gray-500">
                          {new Date(entry.timestamp).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Instructions:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Code: 16 caractères alphanumériques</li>
                      <li>• Scan unique par facture</li>
                      <li>• Validation en temps réel</li>
                      <li>• Session auto-démarrée après activation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <QRScanner
          onScan={handleQRScan}
          onClose={() => setShowQRScanner(false)}
        />
      )}
    </div>
  );
}
