import { useState, useEffect } from 'react';
import { X, CreditCard } from 'lucide-react';
import API_BASE from '../../utils/apiBase';
import { toast } from 'sonner';

export default function PaymentMethodModal({ isOpen, onClose, editingPayment, onSuccess }) {
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    provider: 'manual',
    fee_percentage: 0,
    fee_fixed: 0,
    is_active: true,
    auto_confirm: false,
    requires_online_payment: false,
    display_order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingPayment) {
      setForm({
        name: editingPayment.name || '',
        slug: editingPayment.slug || '',
        description: editingPayment.description || '',
        provider: editingPayment.provider || 'manual',
        fee_percentage: parseFloat(editingPayment.fee_percentage) || 0,
        fee_fixed: parseFloat(editingPayment.fee_fixed) || 0,
        is_active: editingPayment.is_active == 1,
        auto_confirm: editingPayment.auto_confirm == 1,
        requires_online_payment: editingPayment.requires_online_payment == 1,
        display_order: editingPayment.display_order || 0
      });
    } else {
      setForm({
        name: '',
        slug: '',
        description: '',
        provider: 'manual',
        fee_percentage: 0,
        fee_fixed: 0,
        is_active: true,
        auto_confirm: false,
        requires_online_payment: false,
        display_order: 0
      });
    }
  }, [editingPayment, isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name (only when creating, not editing)
    if (field === 'name' && !editingPayment && !form.slug) {
      const slug = value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setForm(prev => ({ ...prev, slug }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.slug) {
      toast.error('Le nom et le slug sont requis');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Convertir les booléens en 0/1 pour l'API
      const payload = {
        ...form,
        is_active: form.is_active ? 1 : 0,
        auto_confirm: form.auto_confirm ? 1 : 0,
        requires_online_payment: form.requires_online_payment ? 1 : 0
      };
      
      if (editingPayment) {
        payload.id = editingPayment.id;
      }
      
      const res = await fetch(`${API_BASE}/admin/payment_methods_simple.php`, {
        method: editingPayment ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success || res.ok) {
        toast.success(editingPayment ? 'Méthode mise à jour !' : 'Méthode créée !');
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
        console.error('API Error:', data);
      }
    } catch (err) {
      toast.error('Erreur de connexion: ' + err.message);
      console.error('Connection Error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-purple-600 flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            {editingPayment ? 'Modifier la Méthode' : 'Nouvelle Méthode de Paiement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nom *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Orange Money, Wave, Espèces"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Slug (identifiant) *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="orange-money"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Auto-généré depuis le nom</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Instructions pour le paiement..."
                rows="3"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Provider */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Fournisseur</label>
              <select
                value={form.provider}
                onChange={(e) => handleChange('provider', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="manual">Manuel</option>
                <option value="orange_money">Orange Money</option>
                <option value="wave">Wave</option>
                <option value="moov_money">Moov Money</option>
                <option value="mtn_momo">MTN Mobile Money</option>
                <option value="cash">Espèces</option>
                <option value="bank_transfer">Virement Bancaire</option>
              </select>
            </div>

            {/* Display Order */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Ordre d'Affichage</label>
              <input
                type="number"
                value={form.display_order}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Frais Pourcentage */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Frais (%)</label>
              <input
                type="number"
                value={form.fee_percentage}
                onChange={(e) => handleChange('fee_percentage', parseFloat(e.target.value))}
                min="0"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Frais Fixes */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Frais Fixes (XOF)</label>
              <input
                type="number"
                value={form.fee_fixed}
                onChange={(e) => handleChange('fee_fixed', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Options */}
            <div className="md:col-span-2 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-900">Méthode Active</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.auto_confirm}
                  onChange={(e) => handleChange('auto_confirm', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-900">Confirmation Automatique</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.requires_online_payment}
                  onChange={(e) => handleChange('requires_online_payment', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-900">Paiement en Ligne Requis</span>
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 Astuce :</strong> Les frais seront ajoutés au prix final.
              Exemple : Prix 1000 XOF + 2% + 50 XOF = 1070 XOF total.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-50"
              disabled={submitting}
            >
              {submitting 
                ? (editingPayment ? 'Mise à jour...' : 'Création...') 
                : (editingPayment ? 'Mettre à Jour' : 'Créer la Méthode')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
