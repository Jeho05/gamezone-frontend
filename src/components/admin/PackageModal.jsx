import { useState, useEffect } from 'react';
import { X, Package } from 'lucide-react';
import API_BASE from '../../utils/apiBase';
import { toast } from 'sonner';

export default function PackageModal({ isOpen, onClose, editingPackage, games, onSuccess }) {
  const [form, setForm] = useState({
    game_id: '',
    name: '',
    duration_minutes: 60,
    price: 0,
    original_price: '',
    points_earned: 0,
    bonus_multiplier: 1.0,
    is_promotional: false,
    promotional_label: '',
    max_purchases_per_user: '',
    is_active: true,
    display_order: 0
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingPackage) {
      setForm({
        game_id: editingPackage.game_id || '',
        name: editingPackage.name || '',
        duration_minutes: editingPackage.duration_minutes || 60,
        price: parseFloat(editingPackage.price) || 0,
        original_price: editingPackage.original_price || '',
        points_earned: parseFloat(editingPackage.points_earned) || 0,
        bonus_multiplier: parseFloat(editingPackage.bonus_multiplier) || 1.0,
        is_promotional: editingPackage.is_promotional == 1,
        promotional_label: editingPackage.promotional_label || '',
        max_purchases_per_user: editingPackage.max_purchases_per_user || '',
        is_active: editingPackage.is_active == 1,
        display_order: editingPackage.display_order || 0
      });
    } else {
      // Reset form for new package
      setForm({
        game_id: games[0]?.id || '',
        name: '',
        duration_minutes: 60,
        price: 0,
        original_price: '',
        points_earned: 0,
        bonus_multiplier: 1.0,
        is_promotional: false,
        promotional_label: '',
        max_purchases_per_user: '',
        is_active: true,
        display_order: 0
      });
    }
  }, [editingPackage, games, isOpen]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.game_id || !form.name || !form.duration_minutes || !form.price) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }
    
    try {
      setSubmitting(true);
      
      const payload = {
        ...form,
        original_price: form.original_price || null,
        max_purchases_per_user: form.max_purchases_per_user || null,
      };
      
      if (editingPackage) {
        payload.id = editingPackage.id;
      }
      
      const res = await fetch(`${API_BASE}/admin/game_packages.php`, {
        method: editingPackage ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (data.success) {
        toast.success(editingPackage ? 'Package mis à jour !' : 'Package créé !');
        // Petit délai pour s'assurer que la mise à jour est terminée
        await new Promise(resolve => setTimeout(resolve, 300));
        onSuccess();
        onClose();
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      toast.error('Erreur de connexion');
      console.error(err);
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
            <Package className="w-6 h-6" />
            {editingPackage ? 'Modifier le Package' : 'Nouveau Package'}
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
            {/* Jeu */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Jeu *</label>
              <select
                value={form.game_id}
                onChange={(e) => handleChange('game_id', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Sélectionnez un jeu</option>
                {games.map(game => (
                  <option key={game.id} value={game.id}>{game.name}</option>
                ))}
              </select>
            </div>

            {/* Nom */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Nom du Package *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ex: Standard 1h"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Durée (minutes) *</label>
              <input
                type="number"
                value={form.duration_minutes}
                onChange={(e) => handleChange('duration_minutes', parseInt(e.target.value))}
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Prix */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Prix (XOF) *</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Prix Original */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Prix Original (Promo)</label>
              <input
                type="number"
                value={form.original_price}
                onChange={(e) => handleChange('original_price', e.target.value)}
                min="0"
                step="0.01"
                placeholder="Pour afficher une réduction"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Points Gagnés (INFO ONLY) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Points Gagnés 
                <span className="text-xs text-gray-500 ml-2">(Auto-calculés par temps réel)</span>
              </label>
              <input
                type="number"
                value={form.points_earned}
                onChange={(e) => handleChange('points_earned', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                disabled
                title="Les points sont calculés automatiquement: (durée/60) × points_per_hour du jeu"
              />
              <p className="text-xs text-gray-500 mt-1">
                Note : Les points réels dépendent du temps joué
              </p>
            </div>

            {/* Bonus Multiplier */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Multiplicateur Bonus</label>
              <input
                type="number"
                value={form.bonus_multiplier}
                onChange={(e) => handleChange('bonus_multiplier', parseFloat(e.target.value))}
                min="1.0"
                step="0.1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Max Achats par Utilisateur */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Achats/Utilisateur</label>
              <input
                type="number"
                value={form.max_purchases_per_user}
                onChange={(e) => handleChange('max_purchases_per_user', e.target.value)}
                min="1"
                placeholder="Illimité si vide"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              />
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

            {/* Promotional */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_promotional}
                  onChange={(e) => handleChange('is_promotional', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-900">Package Promotionnel</span>
              </label>
            </div>

            {/* Promotional Label (if promotional) */}
            {form.is_promotional && (
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Label Promotionnel</label>
                <input
                  type="text"
                  value={form.promotional_label}
                  onChange={(e) => handleChange('promotional_label', e.target.value)}
                  placeholder="Ex: ⭐ POPULAIRE, 🔥 PROMO -20%"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {/* Actif */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => handleChange('is_active', e.target.checked)}
                  className="w-4 h-4"
                />
                <span className="text-sm font-semibold text-gray-900">Package Actif</span>
              </label>
            </div>
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
                ? (editingPackage ? 'Mise à jour...' : 'Création...') 
                : (editingPackage ? 'Mettre à Jour' : 'Créer le Package')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
