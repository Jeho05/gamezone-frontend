import { useEffect, useRef, useState } from 'react';
import { Camera, XCircle, AlertTriangle } from 'lucide-react';

export default function QRScanner({ onScan, onDetected, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const streamRef = useRef(null);
  const frameCountRef = useRef(0);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Caméra arrière sur mobile
      });
      
      streamRef.current = stream;
      setDebugInfo('Caméra démarrée, en attente du QR code...');
      console.log('QRScanner: caméra démarrée');
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.error('Erreur caméra:', err);
      setError('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      setDebugInfo('Erreur lors de l\'accès à la caméra');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const scanFrame = () => {
    // Si le flux caméra est arrêté, on arrête la boucle
    if (!streamRef.current) {
      return;
    }

    // S'assurer que les refs vidéo/canvas sont prêtes
    if (!videoRef.current || !canvasRef.current) {
      requestAnimationFrame(scanFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    frameCountRef.current += 1;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Utiliser jsQR pour décoder
      if (typeof window !== 'undefined' && window.jsQR) {
        const code = window.jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });
        
        if (code && code.data) {
          console.log('QRScanner: QR code détecté', code.data);
          setDebugInfo('QR détecté, traitement en cours...');
          // QR Code détecté
          stopCamera();
          if (typeof onScan === 'function') {
            onScan(code.data);
          } else if (typeof onDetected === 'function') {
            onDetected(code.data);
          }
          return;
        }
      } else if (typeof window !== 'undefined' && !window.jsQR) {
        console.warn('QRScanner: jsQR non chargé pour le moment');
        setDebugInfo('Chargement du moteur de scan QR...');
      }
    }
    
    if (streamRef.current) {
      requestAnimationFrame(scanFrame);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Scanner QR Code
          </h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-all"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Scanner */}
        <div className="p-6">
          {error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-red-800 mb-2">Erreur Caméra</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
              >
                Fermer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  playsInline
                  muted
                />
                
                {/* Overlay de visée */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 border-4 border-white/50 rounded-xl shadow-lg">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-xl"></div>
                  </div>
                </div>

                {/* Canvas caché pour le traitement */}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <div className="animate-pulse w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-semibold">Positionnez le QR code dans le cadre</span>
                </div>
                <p className="text-sm text-gray-500">
                  Le code sera scanné automatiquement
                </p>
                {debugInfo && (
                  <p className="text-xs text-gray-400">
                    {debugInfo}
                  </p>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
