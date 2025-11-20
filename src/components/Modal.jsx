import React from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info, HelpCircle } from 'lucide-react';

/**
 * Composant Modal moderne et réutilisable
 * Remplace les alert() et confirm() basiques
 */
export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', // 'success', 'error', 'warning', 'info', 'confirm'
  onConfirm,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  showCancel = false
}) {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: CheckCircle,
      bgColor: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      borderColor: 'border-green-500'
    },
    error: {
      icon: XCircle,
      bgColor: 'from-red-500 to-red-600',
      textColor: 'text-red-600',
      borderColor: 'border-red-500'
    },
    warning: {
      icon: AlertTriangle,
      bgColor: 'from-yellow-500 to-orange-600',
      textColor: 'text-yellow-600',
      borderColor: 'border-yellow-500'
    },
    info: {
      icon: Info,
      bgColor: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-500'
    },
    confirm: {
      icon: HelpCircle,
      bgColor: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-500'
    }
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  const handleConfirm = () => {
    if (onConfirm) onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all animate-scaleIn max-h-[80vh] flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Icon */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.bgColor} flex items-center justify-center flex-shrink-0 shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="text-gray-700 leading-relaxed whitespace-pre-line break-words">
            {message}
          </div>
        </div>

        {/* Footer with Actions */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          {showCancel && (
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={handleConfirm}
            className={`flex-1 px-4 py-3 bg-gradient-to-r ${config.bgColor} text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

/**
 * Hook personnalisé pour utiliser les modals facilement
 */
export function useModal() {
  const [modalState, setModalState] = React.useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: 'OK',
    cancelText: 'Annuler',
    showCancel: false
  });

  const showModal = (config) => {
    setModalState({
      isOpen: true,
      ...config
    });
  };

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  // Méthodes simplifiées
  const showSuccess = (title, message) => {
    showModal({ title, message, type: 'success', confirmText: 'Super !' });
  };

  const showError = (title, message) => {
    showModal({ title, message, type: 'error', confirmText: 'Compris' });
  };

  const showWarning = (title, message) => {
    showModal({ title, message, type: 'warning', confirmText: 'OK' });
  };

  const showInfo = (title, message) => {
    showModal({ title, message, type: 'info', confirmText: 'OK' });
  };

  const showConfirm = (title, message, onConfirm) => {
    showModal({ 
      title, 
      message, 
      type: 'confirm', 
      onConfirm,
      confirmText: 'Confirmer',
      cancelText: 'Annuler',
      showCancel: true 
    });
  };

  return {
    modalState,
    hideModal,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
}
