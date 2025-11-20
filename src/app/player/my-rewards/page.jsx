'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/Navigation';
import { useMyRewardsHistory } from '../../../utils/useGamification';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function MyRewardsPage() {
  const navigate = useNavigate();
  const { history, loading, error, refetch } = useMyRewardsHistory();
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = Array.isArray(history)
    ? history.filter((item) => {
        if (statusFilter === 'all') return true;
        return item.status === statusFilter;
      })
    : [];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const d = new Date(dateString);
      return format(d, "dd MMM yyyy 'à' HH:mm", { locale: fr });
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: {
        label: 'En attente',
        classes: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
      },
      approved: {
        label: 'Validé',
        classes: 'bg-green-500/20 text-green-300 border-green-500/50',
      },
      delivered: {
        label: 'Livré',
        classes: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      },
      completed: {
        label: 'Complété',
        classes: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
      },
      cancelled: {
        label: 'Annulé',
        classes: 'bg-red-500/20 text-red-300 border-red-500/50',
      },
    };

    const conf = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${conf.classes}`}>
        {conf.label}
      </span>
    );
  };

  const getTypeLabel = (type) => {
    const map = {
      game_time: 'Crédit de temps de jeu',
      game_package: 'Package de jeu (session)',
      badge: 'Badge / titre',
      discount: 'Réduction',
      physical: 'Cadeau physique',
      digital: 'Avantage digital',
      item: 'Objet / avantage',
      other: 'Autre avantage',
    };
    return map[type] || type || 'Récompense';
  };

  const getTypeHelper = (item) => {
    const type = item.reward_type;
    if (type === 'game_time') {
      return "Crédit temps ajouté à votre solde global (visible dans Gamification > Crédit de temps).";
    }
    if (type === 'game_package') {
      return "Une session de jeu a été créée et est visible dans 'Mes achats' / 'Ma session'.";
    }
    if (type === 'badge') {
      return "Badge spécial sur votre profil (voir onglet Badges dans Gamification).";
    }
    if (type === 'discount') {
      return "Réduction appliquée manuellement par l'équipe sur un prochain achat.";
    }
    if (type === 'physical') {
      return "Cadeau physique à récupérer en salle auprès de l'équipe.";
    }
    if (type === 'digital') {
      return "Avantage numérique (code, accès...) communiqué ou activé par l'équipe.";
    }
    if (type === 'item' || type === 'other') {
      return "Avantage spécial appliqué manuellement par l'équipe (voir détails avec eux si besoin).";
    }
    return '';
  };

  const safeHistory = Array.isArray(history) ? history : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="player" />
      <div className="lg:pl-64">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <span className="text-4xl">📜</span>
                Mes Récompenses
              </h1>
              <p className="text-indigo-100 max-w-xl">
                Historique de tous vos échanges de récompenses (temps de jeu, badges, cadeaux, remises...).
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/player/gamification')}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm font-semibold transition-all"
              >
                🎮 Retour Gamification
              </button>
              <button
                onClick={refetch}
                className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-sm font-semibold transition-all"
              >
                🔄 Actualiser
              </button>
            </div>
          </div>

          {/* Filtres */}
          <div className="mb-6 flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Toutes' },
              { id: 'pending', label: 'En attente' },
              { id: 'approved', label: 'Validées' },
              { id: 'delivered', label: 'Livrées' },
              { id: 'completed', label: 'Complétées' },
              { id: 'cancelled', label: 'Annulées' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-white text-purple-900 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-400"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500/50 text-red-100 rounded-xl p-6">
              <h2 className="text-lg font-bold mb-2">Erreur</h2>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white">
              <div className="text-6xl mb-4">🎁</div>
              <h2 className="text-2xl font-bold mb-2">Aucune récompense trouvée</h2>
              <p className="text-white/70 mb-4">
                Vous n'avez pas encore échangé de récompense dans cette catégorie.
              </p>
              <button
                onClick={() => navigate('/player/gamification')}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                Aller à la Boutique
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900/70 border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:border-indigo-500/60 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white mr-2">
                        {item.reward_name || 'Récompense'}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-indigo-200 text-sm mb-1">
                      {getTypeLabel(item.reward_type)}
                    </p>
                    {item.reward_description && (
                      <p className="text-gray-300 text-sm mb-1 line-clamp-2">
                        {item.reward_description}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{getTypeHelper(item)}</p>
                    {item.notes && (
                      <p className="text-xs text-gray-400 mt-1">Note équipe : {item.notes}</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[160px]">
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Coût</p>
                      <p className="text-xl font-bold text-yellow-400">{item.cost} pts</p>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      Echangé le<br />
                      <span className="font-semibold text-gray-200">
                        {formatDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
