import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Navigation from '../../../components/Navigation';
import ImageUpload from '../../../components/ImageUpload';
import { 
  Newspaper, 
  Calendar, 
  Image as ImageIcon, 
  Video,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Pin,
  Search
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { toast } from 'sonner';

export default function AdminContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('news');
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({
    type: 'news',
    title: '',
    description: '',
    content: '',
    image_url: '',
    video_url: '',
    external_link: '',
    event_date: '',
    event_location: '',
    stream_url: '',
    is_published: true,
    is_pinned: false
  });

  const tabs = [
    { id: 'news', label: 'Actualités', icon: Newspaper },
    { id: 'event', label: 'Événements', icon: Calendar },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'stream', label: 'Streams', icon: Video }
  ];

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

  useEffect(() => {
    if (!isAuthenticated) return;
    loadContent();
    loadStats();
  }, [activeTab]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/stats.php`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          console.log('[Admin] Stats loaded:', data.stats);
        }
      }
    } catch (e) {
      console.error('[Admin] Error loading stats:', e);
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      console.log('[Content] Loading content for type:', activeTab);
      const res = await fetch(`${API_BASE}/admin/content.php?type=${activeTab}`, {
        credentials: 'include'
      });
      console.log('[Content] Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[Content] Error response:', errorText);
        toast.error(`Erreur ${res.status}: ${errorText}`);
        return;
      }
      
      const data = await res.json();
      console.log('[Content] Data received:', data);
      
      if (data.content) {
        console.log('[Content] Setting contents, count:', data.content.length);
        setContents(data.content);
      } else {
        console.warn('[Content] No content in response');
        setContents([]);
      }
    } catch (err) {
      console.error('[Content] Load error:', err);
      toast.error('Erreur de chargement: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingContent(null);
    setForm({
      type: activeTab,
      title: '',
      description: '',
      content: '',
      image_url: '',
      video_url: '',
      external_link: '',
      event_date: '',
      event_location: '',
      stream_url: '',
      is_published: true,
      is_pinned: false
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (content) => {
    setEditingContent(content);
    setForm({
      type: content.type,
      title: content.title || '',
      description: content.description || '',
      content: content.content || '',
      image_url: content.image_url || '',
      video_url: content.video_url || '',
      external_link: content.external_link || '',
      event_date: content.event_date ? content.event_date.replace(' ', 'T').substring(0, 16) : '',
      event_location: content.event_location || '',
      stream_url: content.stream_url || '',
      is_published: content.is_published == 1,
      is_pinned: content.is_pinned == 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title) {
      toast.error('Le titre est requis');
      return;
    }

    try {
      const payload = { ...form };
      if (editingContent) {
        payload.id = editingContent.id;
      }

      // Convert datetime-local to MySQL format
      if (payload.event_date) {
        payload.event_date = payload.event_date.replace('T', ' ') + ':00';
      }

      console.log('[Content] Submitting:', payload);
      const res = await fetch(`${API_BASE}/admin/content.php`, {
        method: editingContent ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('[Content] Submit response status:', res.status);
      const data = await res.json();
      console.log('[Content] Submit response data:', data);

      if (data.success || res.ok) {
        toast.success(editingContent ? 'Contenu mis à jour !' : 'Contenu créé !');
        setShowModal(false);
        console.log('[Content] Reloading content after submit...');
        await loadContent();
        await loadStats(); // Reload stats to keep them in sync
      } else {
        toast.error(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      toast.error('Erreur de connexion');
      console.error('[Content] Submit error:', err);
    }
  };

  const deleteContent = async (id) => {
    if (!confirm('Supprimer ce contenu ?')) return;

    try {
      console.log('[Content] Deleting content id:', id);
      const res = await fetch(`${API_BASE}/admin/content.php?id=${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      console.log('[Content] Delete response status:', res.status);
      const data = await res.json();
      console.log('[Content] Delete response data:', data);
      
      if (data.success) {
        toast.success('Contenu supprimé');
        await loadContent();
        await loadStats(); // Reload stats to keep them in sync
      } else {
        toast.error(data.error || 'Erreur');
      }
    } catch (err) {
      console.error('[Content] Delete error:', err);
      toast.error('Erreur de suppression: ' + err.message);
    }
  };

  const filteredContents = contents.filter(c =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <Navigation userType="admin" />
      
      <div className="lg:pl-64">
        <div className="px-4 pt-8 pb-24 max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h1 className="text-3xl font-bold text-purple-600 mb-2 flex items-center gap-3">
              <Newspaper className="w-8 h-8" />
              Gestion de Contenu
            </h1>
            <p className="text-gray-600">Gérez vos actualités, événements, galerie et streams</p>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-4 mt-6 border-b pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm md:text-base font-semibold border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-purple-600 text-purple-600'
                        : 'border-transparent text-gray-500 hover:text-purple-600'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Global Statistics */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {/* Gallery Stats */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <ImageIcon className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.by_type.gallery.count}</span>
                </div>
                <h3 className="text-lg font-semibold">Galerie</h3>
                <div className="mt-3 text-sm opacity-90 space-y-1">
                  <div className="flex justify-between">
                    <span>👁️ Vues:</span>
                    <span className="font-semibold">{stats.by_type.gallery.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔗 Partages:</span>
                    <span className="font-semibold">{stats.by_type.gallery.shares}</span>
                  </div>
                </div>
              </div>

              {/* Events Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.by_type.event.count}</span>
                </div>
                <h3 className="text-lg font-semibold">Événements</h3>
                <div className="mt-3 text-sm opacity-90 space-y-1">
                  <div className="flex justify-between">
                    <span>👁️ Vues:</span>
                    <span className="font-semibold">{stats.by_type.event.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔗 Partages:</span>
                    <span className="font-semibold">{stats.by_type.event.shares}</span>
                  </div>
                </div>
              </div>

              {/* News Stats */}
              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Newspaper className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.by_type.news.count}</span>
                </div>
                <h3 className="text-lg font-semibold">Actualités</h3>
                <div className="mt-3 text-sm opacity-90 space-y-1">
                  <div className="flex justify-between">
                    <span>👁️ Vues:</span>
                    <span className="font-semibold">{stats.by_type.news.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔗 Partages:</span>
                    <span className="font-semibold">{stats.by_type.news.shares}</span>
                  </div>
                </div>
              </div>

              {/* Streams Stats */}
              <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <Video className="w-8 h-8 opacity-80" />
                  <span className="text-3xl font-bold">{stats.by_type.stream.count}</span>
                </div>
                <h3 className="text-lg font-semibold">Streams</h3>
                <div className="mt-3 text-sm opacity-90 space-y-1">
                  <div className="flex justify-between">
                    <span>👁️ Vues:</span>
                    <span className="font-semibold">{stats.by_type.stream.views.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>🔗 Partages:</span>
                    <span className="font-semibold">{stats.by_type.stream.shares}</span>
                  </div>
                </div>
              </div>

              {/* Total Engagement Stats */}
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl shadow-lg p-6 text-white md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 flex items-center justify-between">
                  <span>Engagement Total</span>
                  <button 
                    onClick={loadStats}
                    className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
                    title="Actualiser"
                  >
                    🔄 Actualiser
                  </button>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{stats.total_likes.toLocaleString()}</div>
                    <div className="text-sm opacity-90">❤️ Likes totaux</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.total_comments.toLocaleString()}</div>
                    <div className="text-sm opacity-90">💬 Commentaires</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Object.values(stats.by_type).reduce((sum, type) => sum + type.views, 0).toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90">👁️ Vues totales</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {Object.values(stats.by_type).reduce((sum, type) => sum + type.shares, 0).toLocaleString()}
                    </div>
                    <div className="text-sm opacity-90">🔗 Partages totaux</div>
                  </div>
                </div>
              </div>

              {/* Top Content */}
              <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                  🔥 Top Contenus (Vues)
                </h3>
                {stats.top_views && stats.top_views.length > 0 ? (
                  <div className="space-y-3">
                    {stats.top_views.slice(0, 5).map((item, idx) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl font-bold text-gray-400 min-w-[30px]">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 truncate">{item.title}</div>
                            <div className="text-xs text-gray-500 capitalize">{item.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-purple-600 font-bold">
                          <Eye className="w-4 h-4" />
                          <span>{item.views_count.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    Aucun contenu pour le moment
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Content List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Créer
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left">Titre</th>
                      <th className="px-4 py-3 text-left">Auteur</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Statut</th>
                      <th className="px-4 py-3 text-left">Stats</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContents.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-12 text-center text-gray-500">
                          <div className="text-lg mb-2">Aucun contenu pour le moment</div>
                          <div className="text-sm">Cliquez sur "Créer" pour ajouter du contenu</div>
                        </td>
                      </tr>
                    ) : (
                      filteredContents.map((content) => (
                        <tr key={content.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold">{content.title}</div>
                            {content.is_pinned == 1 && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                <Pin className="w-3 h-3" />
                                Épinglé
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">{content.author_name || 'Admin'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(content.published_at || content.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded ${
                              content.is_published == 1 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {content.is_published == 1 ? (
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Publié
                                </span>
                              ) : (
                                <span className="flex items-center gap-1">
                                  <EyeOff className="w-3 h-3" />
                                  Brouillon
                                </span>
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            👁️ {content.views_count || 0} • 
                            ❤️ {content.likes_count || 0} • 
                            💬 {content.comments_count || 0}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleOpenEditModal(content)}
                              className="text-blue-600 hover:underline text-sm mr-2"
                            >
                              Modifier
                            </button>
                            <button
                              onClick={() => deleteContent(content.id)}
                              className="text-red-600 hover:underline text-sm"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-purple-600">
                {editingContent ? 'Modifier' : 'Créer'} - {tabs.find(t => t.id === form.type)?.label}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Titre *</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({...form, title: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Titre du contenu"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description courte</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({...form, description: e.target.value})}
                    rows="2"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Description courte pour l'aperçu"
                  />
                </div>

                {/* Contenu */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Contenu complet</label>
                  <textarea
                    value={form.content}
                    onChange={(e) => setForm({...form, content: e.target.value})}
                    rows="6"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="Contenu détaillé (HTML supporté)"
                  />
                </div>

                {/* Image URL */}
                <div>
                  <ImageUpload
                    value={form.image_url}
                    onChange={(url) => setForm({ ...form, image_url: url })}
                    label="URL de l'image"
                  />
                </div>

                {/* Champs spécifiques événement */}
                {form.type === 'event' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Date événement</label>
                        <input
                          type="datetime-local"
                          value={form.event_date}
                          onChange={(e) => setForm({...form, event_date: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Lieu</label>
                        <input
                          type="text"
                          value={form.event_location}
                          onChange={(e) => setForm({...form, event_location: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Lieu de l'événement"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Champs spécifiques stream */}
                {form.type === 'stream' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">URL du Stream</label>
                    <input
                      type="url"
                      value={form.stream_url}
                      onChange={(e) => setForm({...form, stream_url: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://twitch.tv/..."
                    />
                  </div>
                )}

                {/* Champs spécifiques galerie */}
                {form.type === 'gallery' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">URL de la vidéo</label>
                    <input
                      type="url"
                      value={form.video_url}
                      onChange={(e) => setForm({...form, video_url: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                )}

                {/* Lien externe */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Lien externe (optionnel)</label>
                  <input
                    type="url"
                    value={form.external_link}
                    onChange={(e) => setForm({...form, external_link: e.target.value})}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    placeholder="https://..."
                  />
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({...form, is_published: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-900">Publier immédiatement</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_pinned}
                      onChange={(e) => setForm({...form, is_pinned: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-semibold text-gray-900">Épingler en haut</span>
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                >
                  {editingContent ? 'Mettre à Jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
