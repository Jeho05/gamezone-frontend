import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import Navigation from '../../../components/Navigation';
import API_BASE from '../../../utils/apiBase';

 

export default function PointsRulesPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [showHelp, setShowHelp] = useState(false);

  // Vérifier auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me.php`, { credentials: 'include' });
        const data = await res.json();
        if (!res.ok || !data?.user || data.user.role !== 'admin') {
          toast.error('Accès non autorisé');
          setTimeout(() => navigate('/auth/login'), 1500);
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        toast.error('Erreur authentification');
        setTimeout(() => navigate('/auth/login'), 1500);
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch rules
  const fetchRules = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/points_rules.php`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setRules(data.rules || []);
    } catch (err) {
      console.error('Error fetching rules:', err);
      toast.error('Erreur lors du chargement des règles');
      setRules([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const updateRule = async (ruleId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/admin/points_rules.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: ruleId, ...updates }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || 'Update failed');
      }

      toast.success('✅ Règle mise à jour avec succès');
      fetchRules();
      setEditingRule(null);
    } catch (err) {
      console.error('Error updating rule:', err);
      toast.error('❌ ' + (err.message || 'Erreur lors de la mise à jour'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navigation userType="admin" currentPage="points" />
        <div className="lg:pl-64">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="admin" currentPage="points" />
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-transparent bg-clip-text">
                  💰 Règles de Points
                </h1>
                <p className="text-gray-400">
                  Gérez les points attribués automatiquement pour chaque action
                </p>
              </div>
              
              {/* Help Button */}
              <button
                onClick={() => setShowHelp(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                <span className="text-2xl">❓</span>
                <span className="font-bold">Aide & Exemples</span>
              </button>
            </div>

            {/* Empty State */}
            {rules.length === 0 && (
              <div className="bg-gray-800/50 rounded-lg p-12 text-center border-2 border-dashed border-gray-700">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-400 mb-2">
                  Aucune règle de points configurée
                </h3>
                <p className="text-gray-500">
                  Les règles de points seront affichées ici
                </p>
              </div>
            )}

            {/* Rules List */}
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`bg-gray-800 rounded-lg p-6 border-2 ${
                    rule.is_active ? 'border-cyan-500/50' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-1">
                        {rule.action_type.replace(/_/g, ' ').toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-400">{rule.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Points Display */}
                      {editingRule === rule.id ? (
                        <input
                          type="number"
                          defaultValue={rule.points_amount}
                          className="w-24 px-3 py-2 bg-gray-700 rounded text-center text-2xl font-bold text-cyan-400 border border-cyan-500"
                          onBlur={(e) => {
                            const newAmount = parseInt(e.target.value);
                            if (newAmount !== rule.points_amount) {
                              updateRule(rule.id, { points_amount: newAmount });
                            } else {
                              setEditingRule(null);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.target.blur();
                            } else if (e.key === 'Escape') {
                              setEditingRule(null);
                            }
                          }}
                          autoFocus
                        />
                      ) : (
                        <div
                          className="text-center cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => setEditingRule(rule.id)}
                        >
                          <p className="text-3xl font-bold text-cyan-400">
                            {rule.points_amount}
                          </p>
                          <p className="text-xs text-gray-500">points</p>
                        </div>
                      )}

                      {/* Active Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rule.is_active}
                          onChange={(e) => {
                            updateRule(rule.id, { is_active: e.target.checked ? 1 : 0 });
                          }}
                          className="w-5 h-5"
                        />
                        <span className="text-sm text-gray-400">Actif</span>
                      </label>
                    </div>
                  </div>

                  {/* Action Info */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type d'action:</span>
                      <p className="font-mono text-cyan-400">{rule.action_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Dernière mise à jour:</span>
                      <p className="text-gray-200">
                        {new Date(rule.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Statut:</span>
                      <p
                        className={`font-bold ${
                          rule.is_active ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {rule.is_active ? '✓ Actif' : '✗ Inactif'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Instructions rapides */}
            <div className="mt-8 p-6 bg-blue-500/10 border border-blue-500/50 rounded-lg">
              <h3 className="font-bold text-blue-400 mb-2">💡 Instructions Rapides</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Cliquez sur le nombre de points pour le modifier</li>
                <li>• Utilisez la case à cocher pour activer/désactiver une règle</li>
                <li>• Les règles inactives n'attribueront pas de points</li>
                <li>• Les changements sont appliqués immédiatement après validation</li>
              </ul>
              <button
                onClick={() => setShowHelp(true)}
                className="mt-3 text-sm text-blue-400 hover:text-blue-300 underline"
              >
                → Voir le guide complet avec exemples
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-cyan-500/50">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-4xl">📚</span>
                <h2 className="text-2xl font-bold text-white">Guide Complet - Règles de Points</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition"
              >
                <span className="text-2xl">✕</span>
              </button>
            </div>

            <div className="p-6 space-y-6 bg-slate-900">
              {/* Section 1: C'est quoi? */}
              <div className="bg-gradient-to-br from-purple-900/70 to-blue-900/70 p-6 rounded-xl border border-purple-500/50">
                <h3 className="text-xl font-bold text-purple-200 mb-3 flex items-center gap-2">
                  <span>🎯</span> C'est quoi les règles de points ?
                </h3>
                <p className="text-gray-200 leading-relaxed mb-3">
                  Les règles de points définissent <strong className="text-cyan-300">combien de points</strong> les joueurs gagnent automatiquement 
                  quand ils font une <strong className="text-cyan-300">action spécifique</strong> dans le système.
                </p>
                <div className="bg-black/50 p-4 rounded-lg border border-cyan-500/50">
                  <p className="text-sm text-gray-300 mb-2"><strong className="text-cyan-300">Exemple simple:</strong></p>
                  <p className="text-white">
                    Si vous configurez <span className="text-cyan-300 font-bold">session_complete = 100 points</span>,<br/>
                    alors chaque fois qu'un joueur termine une session de jeu, il gagne automatiquement 100 points.
                  </p>
                </div>
              </div>

              {/* Section 2: Types d'actions */}
              <div className="bg-gradient-to-br from-cyan-900/70 to-teal-900/70 p-6 rounded-xl border border-cyan-500/50">
                <h3 className="text-xl font-bold text-cyan-200 mb-4 flex items-center gap-2">
                  <span>⚡</span> Types d'actions disponibles
                </h3>
                
                <div className="space-y-4">
                  {/* session_complete */}
                  <div className="bg-black/60 p-4 rounded-lg border-l-4 border-green-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-green-400 text-lg">session_complete</h4>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">Recommandé: 100-200 pts</span>
                    </div>
                    <p className="text-gray-200 mb-2">
                      <strong>Quand ?</strong> À la fin d'une session de jeu complète (temps écoulé)
                    </p>
                    <div className="bg-green-900/20 p-3 rounded border border-green-500/30">
                      <p className="text-sm text-green-200">
                        <strong>Exemple:</strong> Un joueur réserve 2h de jeu sur FIFA. Quand les 2h se terminent, 
                        il gagne automatiquement 150 points (si vous avez configuré 150 pts).
                      </p>
                    </div>
                  </div>

                  {/* daily_login */}
                  <div className="bg-black/60 p-4 rounded-lg border-l-4 border-blue-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-blue-400 text-lg">daily_login</h4>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">Recommandé: 10-20 pts</span>
                    </div>
                    <p className="text-gray-200 mb-2">
                      <strong>Quand ?</strong> La première connexion de la journée du joueur
                    </p>
                    <div className="bg-blue-900/20 p-3 rounded border border-blue-500/30">
                      <p className="text-sm text-blue-200">
                        <strong>Exemple:</strong> Karim se connecte lundi à 10h → +10 pts. Il revient à 15h le même jour → 0 pts. 
                        Il revient mardi → +10 pts (nouvelle journée).
                      </p>
                    </div>
                  </div>

                  {/* first_purchase */}
                  <div className="bg-black/60 p-4 rounded-lg border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-yellow-400 text-lg">first_purchase</h4>
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">Recommandé: 50-100 pts</span>
                    </div>
                    <p className="text-gray-200 mb-2">
                      <strong>Quand ?</strong> Lors du tout premier achat du joueur (une seule fois)
                    </p>
                    <div className="bg-yellow-900/20 p-3 rounded border border-yellow-500/30">
                      <p className="text-sm text-yellow-200">
                        <strong>Exemple:</strong> Sarah fait son premier achat (package FIFA 2h) → +50 pts. 
                        Elle fait un 2e achat la semaine suivante → 0 pts (déjà eu le bonus).
                      </p>
                    </div>
                  </div>

                  {/* referral */}
                  <div className="bg-black/60 p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-purple-400 text-lg">referral</h4>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Recommandé: 150-300 pts</span>
                    </div>
                    <p className="text-gray-200 mb-2">
                      <strong>Quand ?</strong> Quand un joueur parraine un ami qui s'inscrit
                    </p>
                    <div className="bg-purple-900/20 p-3 rounded border border-purple-500/30">
                      <p className="text-sm text-purple-200">
                        <strong>Exemple:</strong> Ahmed partage son code de parrainage. Fatima s'inscrit avec ce code 
                        → Ahmed gagne 200 pts. Fatima peut aussi gagner des points en tant que filleul.
                      </p>
                    </div>
                  </div>

                  {/* achievement */}
                  <div className="bg-black/60 p-4 rounded-lg border-l-4 border-pink-500">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-pink-400 text-lg">achievement</h4>
                      <span className="px-3 py-1 bg-pink-500/20 text-pink-300 rounded-full text-sm">Recommandé: 100-200 pts</span>
                    </div>
                    <p className="text-gray-200 mb-2">
                      <strong>Quand ?</strong> Quand un joueur débloque un succès/achievement
                    </p>
                    <div className="bg-pink-900/20 p-3 rounded border border-pink-500/30">
                      <p className="text-sm text-pink-200">
                        <strong>Exemple:</strong> Marie joue 10h au total → débloque le succès "Joueur Dévoué" 
                        → +150 pts. Chaque succès peut donner des points différents.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Comment modifier */}
              <div className="bg-gradient-to-br from-orange-900/70 to-red-900/70 p-6 rounded-xl border border-orange-500/50">
                <h3 className="text-xl font-bold text-orange-200 mb-4 flex items-center gap-2">
                  <span>⚙️</span> Comment modifier une règle ?
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-orange-400 mb-2">1️⃣ Changer le nombre de points</h4>
                    <ol className="space-y-2 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Cliquez sur le <strong className="text-cyan-400">nombre de points</strong> (ex: 100)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Un champ éditable apparaît</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Tapez le nouveau montant (ex: 150)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Appuyez sur <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Enter</kbd> pour sauvegarder</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Ou appuyez sur <kbd className="px-2 py-1 bg-gray-700 rounded text-xs">Escape</kbd> pour annuler</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-orange-400 mb-2">2️⃣ Activer ou Désactiver une règle</h4>
                    <ol className="space-y-2 text-gray-200">
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Cochez la case <strong className="text-cyan-400">"Actif"</strong> pour activer la règle</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Décochez pour désactiver (les points ne seront plus donnés)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>La bordure devient <span className="text-gray-500">grise</span> quand désactivée</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-cyan-400">→</span>
                        <span>Le changement est <strong className="text-green-400">immédiat</strong></span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* Section 4: Stratégies */}
              <div className="bg-gradient-to-br from-green-900/70 to-emerald-900/70 p-6 rounded-xl border border-green-500/50">
                <h3 className="text-xl font-bold text-green-200 mb-4 flex items-center gap-2">
                  <span>💡</span> Stratégies et Conseils
                </h3>
                
                <div className="space-y-3">
                  <div className="bg-black/40 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-green-400 mb-1">✅ Commencez avec des petits montants</h4>
                    <p className="text-gray-200 text-sm">
                      Exemple: session_complete = 50 pts au lieu de 200. Vous pouvez toujours augmenter plus tard.
                    </p>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-green-400 mb-1">✅ Récompensez les actions importantes</h4>
                    <p className="text-gray-200 text-sm">
                      Les actions rares (referral, first_purchase) devraient donner plus de points que les actions quotidiennes (daily_login).
                    </p>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-bold text-green-400 mb-1">✅ Testez et ajustez</h4>
                    <p className="text-gray-200 text-sm">
                      Observez combien de points les joueurs accumulent en une semaine. Trop peu ? Augmentez. Trop ? Diminuez.
                    </p>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h4 className="font-bold text-yellow-400 mb-1">⚠️ Désactivez au lieu de supprimer</h4>
                    <p className="text-gray-200 text-sm">
                      Si une règle ne vous convient pas, décochez "Actif" plutôt que de mettre 0 points. Vous pourrez la réactiver facilement.
                    </p>
                  </div>

                  <div className="bg-black/40 p-4 rounded-lg border-l-4 border-red-500">
                    <h4 className="font-bold text-red-400 mb-1">❌ Évitez les montants trop élevés</h4>
                    <p className="text-gray-200 text-sm">
                      1000 points par session peut dévaluer votre système. Gardez un équilibre: 1000 pts = environ 1000 XOF de valeur.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 5: Exemples de configuration */}
              <div className="bg-gradient-to-br from-indigo-900/70 to-violet-900/70 p-6 rounded-xl border border-indigo-500/50">
                <h3 className="text-xl font-bold text-indigo-200 mb-4 flex items-center gap-2">
                  <span>📋</span> Exemples de configurations complètes
                </h3>

                <div className="space-y-4">
                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-indigo-400 mb-3">Configuration "Généreuse" 💰</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-200">• session_complete: <span className="text-cyan-400 font-bold">200 pts</span> - Encourage les sessions longues</p>
                      <p className="text-gray-200">• daily_login: <span className="text-cyan-400 font-bold">20 pts</span> - Fidélise les joueurs</p>
                      <p className="text-gray-200">• first_purchase: <span className="text-cyan-400 font-bold">100 pts</span> - Incite au premier achat</p>
                      <p className="text-gray-200">• referral: <span className="text-cyan-400 font-bold">300 pts</span> - Récompense le parrainage</p>
                      <p className="text-gray-200">• achievement: <span className="text-cyan-400 font-bold">150 pts</span> - Motive les joueurs</p>
                    </div>
                    <p className="text-yellow-300 text-xs mt-2">⚠️ Un joueur actif peut gagner ~500 pts/semaine</p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-indigo-400 mb-3">Configuration "Équilibrée" ⚖️</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-200">• session_complete: <span className="text-cyan-400 font-bold">100 pts</span> - Récompense standard</p>
                      <p className="text-gray-200">• daily_login: <span className="text-cyan-400 font-bold">10 pts</span> - Petit bonus quotidien</p>
                      <p className="text-gray-200">• first_purchase: <span className="text-cyan-400 font-bold">50 pts</span> - Bonus de bienvenue</p>
                      <p className="text-gray-200">• referral: <span className="text-cyan-400 font-bold">200 pts</span> - Parrainage valorisé</p>
                      <p className="text-gray-200">• achievement: <span className="text-cyan-400 font-bold">100 pts</span> - Succès motivants</p>
                    </div>
                    <p className="text-green-300 text-xs mt-2">✅ Recommandé pour démarrer</p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-indigo-400 mb-3">Configuration "Modérée" 📊</h4>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-200">• session_complete: <span className="text-cyan-400 font-bold">50 pts</span> - Points limités</p>
                      <p className="text-gray-200">• daily_login: <span className="text-cyan-400 font-bold">5 pts</span> - Micro-récompense</p>
                      <p className="text-gray-200">• first_purchase: <span className="text-cyan-400 font-bold">30 pts</span> - Petit bonus</p>
                      <p className="text-gray-200">• referral: <span className="text-cyan-400 font-bold">100 pts</span> - Parrainage modéré</p>
                      <p className="text-gray-200">• achievement: <span className="text-cyan-400 font-bold">50 pts</span> - Succès rares</p>
                    </div>
                    <p className="text-blue-300 text-xs mt-2">💎 Pour garder les points rares et précieux</p>
                  </div>
                </div>
              </div>

              {/* Section 6: FAQ */}
              <div className="bg-gradient-to-br from-rose-900/70 to-pink-900/70 p-6 rounded-xl border border-rose-500/50">
                <h3 className="text-xl font-bold text-rose-200 mb-4 flex items-center gap-2">
                  <span>❓</span> Questions Fréquentes
                </h3>

                <div className="space-y-3">
                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">Q: Les points sont-ils donnés immédiatement ?</h4>
                    <p className="text-gray-200 text-sm">
                      <strong className="text-green-400">R:</strong> Oui, dès que l'action est complétée, le système ajoute les points automatiquement 
                      et le joueur voit son solde mis à jour.
                    </p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">Q: Si je change une règle, ça affecte les points déjà gagnés ?</h4>
                    <p className="text-gray-200 text-sm">
                      <strong className="text-green-400">R:</strong> Non, les points déjà dans le compte des joueurs restent. Seules les 
                      <strong className="text-cyan-400"> futures actions</strong> utiliseront la nouvelle valeur.
                    </p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">Q: Que se passe-t-il si je désactive une règle ?</h4>
                    <p className="text-gray-200 text-sm">
                      <strong className="text-green-400">R:</strong> Les joueurs ne gagneront plus de points pour cette action. 
                      Vous pouvez la réactiver à tout moment.
                    </p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">Q: Puis-je mettre un montant négatif ?</h4>
                    <p className="text-gray-200 text-sm">
                      <strong className="text-red-400">R:</strong> Non, les règles de points sont uniquement pour <strong>donner</strong> des points. 
                      Pour retirer des points, utilisez la gestion manuelle des points.
                    </p>
                  </div>

                  <div className="bg-black/60 p-4 rounded-lg">
                    <h4 className="font-bold text-rose-400 mb-1">Q: Combien de points = 1 XOF ?</h4>
                    <p className="text-gray-200 text-sm">
                      <strong className="text-green-400">R:</strong> C'est vous qui décidez ! Généralement, 
                      <strong className="text-cyan-400"> 1 point = 1 XOF</strong> est un bon ratio. Donc 1000 pts = 1000 XOF de réduction.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-slate-800 to-slate-900 p-4 border-t border-cyan-500/30">
              <button
                onClick={() => setShowHelp(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all"
              >
                J'ai compris ! Fermer le guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
