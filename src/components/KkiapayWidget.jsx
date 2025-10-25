import { useCallback, useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * Composant KkiaPay Widget - Version optimisée avec vérifications
 * Utilise directement openKkiapayWidget au lieu de <kkiapay-widget>
 */
export default function KkiapayWidget({
  amount,
  apiKey,
  sandbox = true,
  callback,
  onSuccess,
  onFailed,
  theme = '',
  data = '',
  name = '',
  email = '',
  phone = '',
  className = ''
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [scriptError, setScriptError] = useState(false);

  // Vérifier que le script est chargé
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 10 secondes max (20 * 500ms)
    
    const checkScript = () => {
      if (typeof window.openKkiapayWidget === 'function') {
        console.log('✅ KkiaPay script loaded successfully');
        setScriptLoaded(true);
        setScriptError(false);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          console.error('❌ KkiaPay script failed to load after', maxAttempts, 'attempts');
          setScriptError(true);
          setScriptLoaded(false);
        } else {
          console.warn('⚠️ KkiaPay script not yet loaded, retrying... (attempt', attempts, '/', maxAttempts, ')');
          setTimeout(checkScript, 500);
        }
      }
    };

    // Vérifier immédiatement et réessayer si nécessaire
    checkScript();
  }, []);

  // Event listeners pour les événements Kkiapay
  useEffect(() => {
    const handleSuccess = (e) => {
      console.log('✅ KkiaPay Payment Success:', e.detail);
      setIsLoading(false);
      toast.success('✅ Paiement réussi!');
      if (onSuccess) {
        onSuccess(e.detail);
      }
    };

    const handleFailed = (e) => {
      console.error('❌ KkiaPay Payment Failed:', e.detail);
      setIsLoading(false);
      toast.error('❌ Paiement échoué');
      if (onFailed) {
        onFailed(e.detail);
      }
    };

    // Ajouter les listeners
    window.addEventListener('success', handleSuccess);
    window.addEventListener('failed', handleFailed);

    // Cleanup
    return () => {
      window.removeEventListener('success', handleSuccess);
      window.removeEventListener('failed', handleFailed);
    };
  }, [onSuccess, onFailed]);

  const handlePayment = useCallback(() => {
    console.log('🔵 Button clicked - handlePayment called');
    
    // Vérifier que le script KkiaPay est chargé
    if (!window.openKkiapayWidget) {
      console.error('❌ KkiaPay script not loaded');
      console.error('window.openKkiapayWidget =', window.openKkiapayWidget);
      toast.error('❌ Erreur: Script KkiaPay non chargé. Rafraîchissez la page (F5).');
      if (onFailed) {
        onFailed({ error: 'KkiaPay script not loaded' });
      }
      return;
    }

    console.log('🚀 Opening KkiaPay widget with config:', {
      amount: parseInt(amount),
      apiKey: apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING',
      sandbox: sandbox
    });

    setIsLoading(true);

    try {
      // Ouvrir le widget KkiaPay SANS les callbacks (ils seront gérés via events)
      window.openKkiapayWidget({
        amount: parseInt(amount),
        api_key: apiKey,
        sandbox: sandbox,
        phone: phone || '',
        name: name || '',
        email: email || '',
        data: data || '',
        url: callback || window.location.href,
        theme: theme || ''
      });
      
      console.log('✅ openKkiapayWidget called successfully');
      // Le widget s'ouvre, on peut retirer le loading après un court délai
      setTimeout(() => setIsLoading(false), 1000);
      
    } catch (error) {
      console.error('❌ Error opening KkiaPay widget:', error);
      console.error('Error details:', error.message, error.stack);
      setIsLoading(false);
      toast.error('❌ Erreur lors de l\'ouverture du paiement: ' + error.message);
      if (onFailed) {
        onFailed(error);
      }
    }
  }, [amount, apiKey, sandbox, callback, onFailed, theme, data, name, email, phone]);

  if (scriptError) {
    return (
      <div className="w-full bg-red-600 text-white py-3 px-6 rounded-lg text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-lg">❌</span>
          <span className="text-sm">Erreur de chargement du module de paiement</span>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-xs underline hover:no-underline"
          >
            Rafraîchir la page (F5)
          </button>
        </div>
      </div>
    );
  }

  if (!scriptLoaded) {
    return (
      <div className="w-full bg-gray-600 text-white py-3 px-6 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          Chargement du module de paiement...
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handlePayment}
      disabled={isLoading}
      className={className || "w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-lg font-bold hover:from-purple-700 hover:to-indigo-700 transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
          Ouverture...
        </span>
      ) : (
        '💳 Payer Maintenant'
      )}
    </button>
  );
}
