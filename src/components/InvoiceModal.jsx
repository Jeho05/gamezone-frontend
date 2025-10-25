import React, { useState, useEffect } from 'react';
import { X, QrCode, Copy, Check, AlertCircle, Clock } from 'lucide-react';
import API_BASE from '../utils/apiBase';
import { toast } from 'sonner';

export default function InvoiceModal({ invoice, purchase, onClose }) {
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (invoice?.id) {
      loadQRCode();
    }
  }, [invoice?.id]);

  const loadQRCode = async () => {
    if (!invoice?.id) {
      console.log('Attente de la facture...');
      return;
    }
    
    try {
      setLoading(true);
      console.log('Chargement QR pour invoice:', invoice.id);
      
      const res = await fetch(
        `${API_BASE}/invoices/generate_qr.php?invoice_id=${invoice.id}`,
        { credentials: 'include' }
      );
      
      console.log('QR Response status:', res.status);
      const data = await res.json();
      console.log('QR Data:', data);

      if (data.error) {
        console.error('Erreur QR:', data.error);
        toast.error(`Erreur QR: ${data.error}`);
        // NE PAS FERMER LE MODAL - Afficher l'erreur mais garder le modal ouvert
        setQrData({ error: data.error });
        return;
      }

      console.log('✅ QR chargé avec succès');
      setQrData(data);
    } catch (error) {
      console.error('Erreur lors du chargement du QR code:', error);
      toast.error(`Erreur: ${error.message}`);
      // NE PAS FERMER LE MODAL
      setQrData({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (qrData?.invoice?.validation_code) {
      navigator.clipboard.writeText(qrData.invoice.validation_code);
      setCopied(true);
      toast.success('Code copié !');
      setTimeout(() => setCopied(false), 2000);
    }
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

  const getTimeUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 30) return `${Math.floor(days / 30)} mois`;
    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
    return 'Bientôt';
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold mb-1">{invoice.invoice_number}</h2>
              <p className="text-purple-200 text-sm">Facture de Temps de Jeu</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600 mb-4"></div>
              <p className="text-gray-600">Chargement du QR code...</p>
            </div>
          ) : qrData?.error ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">Erreur</h3>
              <p className="text-gray-600 mb-6">{qrData.error}</p>
              <button
                onClick={loadQRCode}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Réessayer
              </button>
            </div>
          ) : qrData ? (
            <>
              {/* QR Code */}
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
                <div className="text-center mb-4">
                  <QrCode className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-gray-800">Votre Code QR</h3>
                  <p className="text-sm text-gray-600">Présentez ce code à la réception</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-inner flex justify-center">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(qrData.qr_text || qrData.invoice.validation_code)}`}
                    alt="QR Code"
                    className="w-[280px] h-[280px]"
                  />
                </div>
              </div>

              {/* Validation Code */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code de Validation
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-lg px-4 py-4 font-mono text-2xl font-bold text-center tracking-wider text-purple-700 shadow-inner">
                    {qrData.invoice.validation_code}
                  </div>
                  <button
                    onClick={handleCopyCode}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Copier le code"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>{qrData.invoice.validation_code.replace(/-/g, '').length} caractères</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Format: {qrData.invoice.validation_code.length > 10 ? 'XXXX-XXXX-XXXX-XXXX' : 'XXXX-XXXX'}</span>
                  </div>
                </div>
                <p className="text-xs text-purple-600 mt-2 text-center font-medium bg-purple-50 py-2 px-4 rounded-lg border border-purple-200">
                  💡 L'admin peut scanner le QR ou taper le code manuellement (avec ou sans tirets)
                </p>
              </div>

              {/* Invoice Details */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 font-medium">Jeu:</span>
                  <span className="font-bold text-gray-800">{invoice.game_name}</span>
                </div>

                {invoice.package_name && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-gray-600 font-medium">Package:</span>
                    <span className="font-bold text-gray-800">{invoice.package_name}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 font-medium">Durée:</span>
                  <span className="font-bold text-purple-600">{qrData.invoice.duration_minutes} minutes</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 font-medium">Montant:</span>
                  <span className="font-bold text-green-600">{qrData.invoice.amount} XOF</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600 font-medium">Statut:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    invoice.status === 'active' ? 'bg-green-100 text-green-700' :
                    invoice.status === 'used' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {invoice.status === 'pending' ? 'En Attente' :
                     invoice.status === 'active' ? 'Active' :
                     invoice.status === 'used' ? 'Utilisée' :
                     invoice.status}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Expire:</span>
                  <span className="font-bold text-gray-800">{formatDate(qrData.invoice.expires_at)}</span>
                </div>
              </div>

              {/* Expiry Warning */}
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-yellow-800 mb-1">
                      ⏰ Expire dans {getTimeUntilExpiry(qrData.invoice.expires_at)}
                    </p>
                    <p className="text-yellow-700">
                      Présentez cette facture à la réception avant le {new Date(qrData.invoice.expires_at).toLocaleDateString('fr-FR')}.
                      Après cette date, elle ne sera plus utilisable.
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-bold mb-2">Comment utiliser cette facture ?</p>
                    <ol className="space-y-1 text-xs list-decimal list-inside">
                      <li>Présentez le QR code ou le code alphanumérique à la réception</li>
                      <li>L'administrateur scannera votre code</li>
                      <li>Votre session sera activée automatiquement</li>
                      <li>Le temps commencera à se décompter</li>
                      <li>Profitez de votre jeu !</li>
                    </ol>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600">Impossible de charger le QR code</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 p-4 rounded-b-2xl border-t">
          <button
            onClick={onClose}
            className="w-full py-3 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
