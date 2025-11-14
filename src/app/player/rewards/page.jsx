'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from '../../../utils/apiBase';
import { resolveGameImageUrl, isGradient, getGradientClass } from '../../../utils/gameImageUrl';
import Modal, { useModal } from '../../../components/Modal';
import { toast } from 'sonner';

export default function RewardsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  const [filter, setFilter] = useState('all');
  const { modalState, hideModal, showSuccess, showError, showConfirm } = useModal();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/check.php`, {
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!data.authenticated || data.user?.role !== 'player') {
        navigate('/auth/login');
        return;
      }
      
      setUser(data.user);
      loadPackages();
    } catch (error) {
      console.error('Erreur auth:', error);
      navigate('/auth/login');
    }
  };

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/shop/redeem_with_points.php`, {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.packages) {
        setPackages(data.packages);
        setUserPoints(data.user_points || 0);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des récompenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = (pkg) => {
    // Vérifications de sécurité
    if (userPoints < pkg.points_cost) {
      showError(
        'Points Insuffisants',
        `Vous avez ${userPoints} points, il vous en faut ${pkg.points_cost}.\n\n` +
        `Il vous manque ${pkg.points_cost - userPoints} points.`
      );
      return;
    }

    if (pkg.max_purchases_per_user && pkg.user_purchases_count >= pkg.max_purchases_per_user) {
      showError(
        'Limite Atteinte',
        `Vous avez déjà acheté cette récompense ${pkg.user_purchases_count} fois.\n\n` +
        `Limite maximale: ${pkg.max_purchases_per_user} achats par utilisateur.`
      );
      return;
    }

    showConfirm(
      '🎁 Confirmer l\'Échange',
      `Échanger ${pkg.points_cost} points contre:\n\n` +
      `🎮 ${pkg.game_name}\n` +
      `⏱️ ${pkg.duration_minutes} minutes\n` +
      `✨ +${pkg.points_earned} points bonus après avoir joué`,
      () => confirmRedeem(pkg)
    );
  };

  const confirmRedeem = async (pkg) => {
    try {
      setRedeeming(true);
      toast.loading('Échange en cours (sécurisé)...');
      
      // Générer une clé d'idempotence unique (évite les doubles achats)
      const idempotencyKey = `reward-${pkg.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`${API_BASE}/transactions/secure_purchase.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          reward_id: pkg.reward_id,
          idempotency_key: idempotencyKey
        }),
      });

      console.log('Response status:', response.status);
      const contentType = response.headers.get('content-type');
      console.log('Content-Type:', contentType);

      let result;
      try {
        const text = await response.text();
        console.log('Raw response:', text);
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Parse error:', parseError);
        toast.dismiss();
        showError(
          'Erreur Serveur',
          'Le serveur a renvoyé une réponse invalide. Vérifiez les logs PHP pour plus de détails.'
        );
        return;
      }

      toast.dismiss();

      if (result.success) {
        const wasAlreadyProcessed = result.already_processed;
        
        showSuccess(
          wasAlreadyProcessed ? '✅ Déjà Traité' : '✅ Échange Réussi !',
          (wasAlreadyProcessed ? '🔒 Cette transaction a déjà été effectuée (protection activée)\n\n' : '') +
          `🎮 ${result.game_name || pkg.game_name}\n` +
          `⏱️ ${result.duration_minutes || pkg.duration_minutes} minutes\n` +
          `💸 Points dépensés: ${result.points_spent || pkg.points_cost}\n` +
          `💰 Nouveau solde: ${result.new_balance} points\n` +
          `🆔 Achat #${result.purchase_id}`
        );
        
        await loadPackages();
        setTimeout(() => navigate('/player/my-purchases'), 1500);
      } else {
        const isSafe = result.safe !== false; // Par défaut true
        
        showError(
          'Échange Impossible',
          `${result.message || result.error || 'Une erreur s\'est produite.'}\n\n` +
          (isSafe ? '✅ Vos points sont en sécurité (aucun débit effectué)' : '') +
          (result.can_retry ? '\n\n🔄 Vous pouvez réessayer' : '')
        );
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      toast.dismiss();
      showError(
        'Erreur Réseau',
        `Impossible de contacter le serveur.\n\nDétails: ${error.message}`
      );
    } finally {
      setRedeeming(false);
      setSelectedPackage(null);
    }
  };

  const filteredPackages = packages.filter((pkg) => {
    if (filter === 'all') return true;
    if (filter === 'affordable') return pkg.points_cost <= userPoints;
    if (filter === 'featured') return pkg.is_featured;
    if (filter === 'vr') return pkg.game_category === 'vr';
    return true;
  });

  const getGameCategoryIcon = (category) => {
    const icons = {
      sports: '⚽',
      action: '🎯',
      racing: '🏎️',
      vr: '🥽',
      fighting: '🥊',
      adventure: '🗺️',
      rpg: '⚔️',
      strategy: '♟️',
    };
    return icons[category] || '🎮';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6 flex items-center justify-center">
        <div className="text-white text-xl">⏳ Chargement des récompenses...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-5xl">🎁</span>
                Récompenses & Packages
              </h1>
              <p className="text-purple-200 text-lg">
                Échangez vos points contre du temps de jeu !
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all"
            >
              ← Retour
            </button>
          </div>

          {/* Solde de points */}
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-yellow-900 font-semibold mb-1">Vos Points</p>
                <p className="text-5xl font-bold text-white">{userPoints.toLocaleString()}</p>
              </div>
              <div className="text-6xl sm:text-7xl">⭐</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/player/gamification')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-all"
              >
                📊 Historique
              </button>
              <button
                onClick={() => navigate('/player/progression')}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-sm transition-all"
              >
                📈 Progression
              </button>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="mb-6 flex gap-3 flex-wrap">
          {[
            { id: 'all', label: '🎮 Tous', icon: '' },
            { id: 'affordable', label: '💰 Accessible', icon: '' },
            { id: 'featured', label: '⭐ En vedette', icon: '' },
            { id: 'vr', label: '🥽 VR', icon: '' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                filter === f.id
                  ? 'bg-white text-purple-900 shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Packages disponibles</p>
                <p className="text-3xl font-bold">{packages.length}</p>
              </div>
              <div className="text-4xl">🎁</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Packages accessibles</p>
                <p className="text-3xl font-bold">
                  {packages.filter((p) => p.points_cost <= userPoints).length}
                </p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm">Mes échanges</p>
                <p className="text-3xl font-bold">
                  {packages.reduce((sum, p) => sum + (p.user_purchases_count || 0), 0)}
                </p>
              </div>
              <div className="text-4xl">🏆</div>
            </div>
          </div>
        </div>

        {/* Liste des packages */}
        {filteredPackages.length === 0 ? (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-12 text-center text-white">
            <div className="text-6xl mb-4">😕</div>
            <h3 className="text-2xl font-bold mb-2">Aucune récompense disponible</h3>
            <p className="text-white/70">
              {filter === 'affordable'
                ? 'Vous n\'avez pas assez de points pour les packages disponibles. Jouez pour gagner plus de points !'
                : 'Revenez plus tard pour découvrir de nouvelles récompenses !'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPackages.map((pkg) => {
              const canAfford = userPoints >= pkg.points_cost;
              const isLimitReached =
                pkg.max_purchases_per_user &&
                pkg.user_purchases_count >= pkg.max_purchases_per_user;
              const bgUrl = resolveGameImageUrl(pkg.game_image, pkg.game_slug);
              const isGrad = isGradient(bgUrl);

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all hover:scale-105 ${
                    !canAfford || isLimitReached ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image/Header */}
                  <div
                    className={`h-48 relative flex items-center justify-center ${
                      isGrad ? `bg-gradient-to-br ${getGradientClass(bgUrl)}` : 'bg-gradient-to-br from-purple-500 to-pink-500'
                    }`}
                    style={
                      !isGrad
                        ? {
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${bgUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }
                        : undefined
                    }
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-2">
                        {getGameCategoryIcon(pkg.game_category)}
                      </div>
                      <h3 className="text-2xl font-bold text-white">{pkg.game_name}</h3>
                    </div>
                    {pkg.is_featured && (
                      <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-bold">
                        ⭐ Vedette
                      </div>
                    )}
                    {pkg.is_promotional && pkg.promotional_label && (
                      <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        🔥 {pkg.promotional_label}
                      </div>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">
                      {pkg.reward_name || pkg.package_name}
                    </h4>

                    {pkg.reward_description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {pkg.reward_description}
                      </p>
                    )}

                    {/* Info du jeu */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <span>🎮</span>
                        <span className="font-medium">{pkg.game_name}</span>
                      </span>
                      {pkg.game_category && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                          {pkg.game_category}
                        </span>
                      )}
                    </div>

                    {/* Détails */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">⏱️ Durée</span>
                        <span className="font-semibold text-gray-900">
                          {pkg.duration_minutes} minutes
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">✨ Points bonus</span>
                        <span className="font-semibold text-green-600">
                          +{pkg.points_earned} pts
                        </span>
                      </div>
                      {pkg.bonus_multiplier > 1 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">🚀 Multiplicateur</span>
                          <span className="font-semibold text-purple-600">
                            ×{pkg.bonus_multiplier}
                          </span>
                        </div>
                      )}
                      {pkg.user_purchases_count > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">🎯 Vos échanges</span>
                          <span className="font-semibold text-blue-600">
                            {pkg.user_purchases_count}
                            {pkg.max_purchases_per_user
                              ? ` / ${pkg.max_purchases_per_user}`
                              : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Prix et action */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-gray-600 text-sm">Coût</p>
                        <p className="text-3xl font-bold text-purple-600">
                          {pkg.points_cost}
                          <span className="text-lg ml-1">pts</span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleRedeem(pkg)}
                        disabled={!canAfford || isLimitReached || redeeming}
                        className={`px-6 py-3 rounded-xl font-bold transition-all ${
                          canAfford && !isLimitReached && !redeeming
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {redeeming
                          ? '⏳'
                          : isLimitReached
                          ? '🔒 Limite'
                          : !canAfford
                          ? '❌ Trop cher'
                          : '🎁 Échanger'}
                      </button>
                    </div>

                    {!canAfford && (
                      <p className="text-red-600 text-sm mt-2 text-center">
                        Il vous manque {pkg.points_cost - userPoints} points
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info bulle */}
        <div className="mt-8 bg-blue-500/20 border-2 border-blue-400 rounded-xl p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Comment ça marche ?</h3>
              <ul className="space-y-1 text-blue-100">
                <li>• Accumulez des points en jouant</li>
                <li>• Échangez vos points contre des packages de jeu</li>
                <li>• Recevez des points bonus après avoir joué !</li>
                <li>• Profitez de packages promotionnels avec plus d'avantages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Component */}
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
