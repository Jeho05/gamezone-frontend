import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { 
  Calendar, Users, Trophy, Play, Heart, MessageCircle, Share2, Filter, Image as ImageIcon, Eye, X, Send,
  Images, Grid, List, Search, SortAsc, 
  ChevronLeft, ChevronRight,
  User, Clock, Tag, FileImage, Upload,
  Edit, Trash2, Check, XCircle, Loader
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { resolveAvatarUrl } from '../../../utils/avatarUrl';
import { toast } from 'sonner';

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [gallery, setGallery] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailContent, setDetailContent] = useState(null);
  const [detailComments, setDetailComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [userLikes, setUserLikes] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [stats, setStats] = useState(null);

  const handleLike = async (id, type) => {
    try {
      const res = await fetch(`${API_BASE}/content/like.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content_id: id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec du like');
      
      const isLiked = data.action === 'liked';
      toast.success(data.message || (isLiked ? 'Like ajouté !' : 'Like retiré !'));
      
      // Update user likes set
      setUserLikes(prev => {
        const newSet = new Set(prev);
        if (isLiked) {
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
      
      // Update the like count in the appropriate state
      const updateLikes = (prev) => prev.map(item => 
        item.id === id ? { 
          ...item, 
          likes_count: isLiked ? (item.likes_count || 0) + 1 : Math.max(0, (item.likes_count || 0) - 1)
        } : item
      );
      
      setGallery(updateLikes);
      setEvents(updateLikes);
      setNews(updateLikes);
      setStreams(updateLikes);
      
      // Update detail content if open
      if (detailContent && detailContent.id === id) {
        setDetailContent(prev => ({
          ...prev,
          likes_count: isLiked ? (prev.likes_count || 0) + 1 : Math.max(0, (prev.likes_count || 0) - 1)
        }));
      }
      
      // Reload stats to keep them in sync
      loadStats();
    } catch (e) {
      toast.error(e.message || 'Erreur lors du like');
    }
  };

  useEffect(() => {
    loadContent();
    loadCurrentUser();
    loadStats();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/check.php`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          console.log('[Gallery] Current user:', data.user);
        }
      }
    } catch (e) {
      console.error('[Gallery] Error loading current user:', e);
    }
  };

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/content/stats.php`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStats(data.stats);
          console.log('[Gallery] Stats loaded:', data.stats);
        }
      }
    } catch (e) {
      console.error('[Gallery] Error loading stats:', e);
    }
  };

  const openDetailModal = async (content) => {
    try {
      console.log('[Gallery] Opening detail for content:', content.id);
      setShowDetailModal(true);
      setDetailContent(content);
      
      // Load full content details including comments
      const res = await fetch(`${API_BASE}/content/public.php?id=${content.id}`, {
        credentials: 'include'
      });
      const data = await res.json();
      console.log('[Gallery] Detail data:', data);
      
      if (data.success) {
        setDetailContent(data.content);
        setDetailComments(data.comments || []);
        
        // Check if user has liked
        if (data.has_liked) {
          setUserLikes(prev => {
            const newSet = new Set(prev);
            newSet.add(content.id);
            return newSet;
          });
        }
      }
    } catch (e) {
      console.error('[Gallery] Error loading details:', e);
      toast.error('Erreur de chargement des détails');
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setDetailContent(null);
    setDetailComments([]);
    setNewComment('');
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !detailContent) return;
    
    try {
      setSubmittingComment(true);
      const res = await fetch(`${API_BASE}/content/comment.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content_id: detailContent.id,
          comment: newComment.trim(),
          parent_id: replyingTo
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec de l\'ajout du commentaire');
      
      toast.success(replyingTo ? 'Réponse ajoutée !' : 'Commentaire ajouté !');
      setNewComment('');
      setReplyingTo(null);
      
      // Reload detail to get updated comments
      await openDetailModal(detailContent);
      
      // Update comment count in lists
      const updateComments = (prev) => prev.map(item => 
        item.id === detailContent.id ? { ...item, comments_count: (item.comments_count || 0) + 1 } : item
      );
      
      setGallery(updateComments);
      setEvents(updateComments);
      setNews(updateComments);
      setStreams(updateComments);
      
      // Reload stats to keep them in sync
      loadStats();
    } catch (e) {
      toast.error(e.message || 'Erreur lors de l\'ajout du commentaire');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Supprimer ce commentaire ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/content/delete_comment.php?id=${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec de la suppression');
      
      toast.success('Commentaire supprimé');
      
      // Reload detail to get updated comments
      await openDetailModal(detailContent);
      
      // Update comment count in lists
      const updateComments = (prev) => prev.map(item => 
        item.id === detailContent.id ? { ...item, comments_count: Math.max(0, (item.comments_count || 0) - 1) } : item
      );
      
      setGallery(updateComments);
      setEvents(updateComments);
      setNews(updateComments);
      setStreams(updateComments);
      
      // Reload stats to keep them in sync
      loadStats();
    } catch (e) {
      toast.error(e.message || 'Erreur lors de la suppression');
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editCommentText.trim()) return;
    
    try {
      const res = await fetch(`${API_BASE}/content/edit_comment.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id: commentId,
          comment: editCommentText.trim()
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Échec de la modification');
      
      toast.success('Commentaire modifié');
      setEditingComment(null);
      setEditCommentText('');
      
      // Reload detail to get updated comments
      await openDetailModal(detailContent);
    } catch (e) {
      toast.error(e.message || 'Erreur lors de la modification');
    }
  };

  const handleShare = async (platform) => {
    try {
      const contentUrl = `${window.location.origin}/player/gallery?id=${detailContent.id}`;
      const title = detailContent.title;
      const text = detailContent.description || title;
      
      let shareUrl = '';
      
      switch (platform) {
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(contentUrl)}`;
          break;
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(contentUrl)}&text=${encodeURIComponent(title)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + contentUrl)}`;
          break;
        case 'telegram':
          shareUrl = `https://t.me/share/url?url=${encodeURIComponent(contentUrl)}&text=${encodeURIComponent(title)}`;
          break;
        case 'copy_link':
          await navigator.clipboard.writeText(contentUrl);
          toast.success('Lien copié dans le presse-papier !');
          setShowShareMenu(false);
          
          // Track share
          await fetch(`${API_BASE}/content/share.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              content_id: detailContent.id,
              platform: 'copy_link'
            })
          });
          return;
      }
      
      if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
        
        // Track share
        await fetch(`${API_BASE}/content/share.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content_id: detailContent.id,
            platform: platform
          })
        });
        
        toast.success('Merci pour le partage !');
      }
    } catch (e) {
      console.error('[Gallery] Share error:', e);
      toast.error('Erreur lors du partage');
    }
  };

  const loadContent = async () => {
    try {
      setLoading(true);
      console.log('[Gallery] Loading all content types...');
      
      // Load gallery content
      const galleryRes = await fetch(`${API_BASE}/content/public.php?type=gallery&limit=50`, { 
        credentials: 'include' 
      });
      const galleryData = await galleryRes.json();
      console.log('[Gallery] Gallery data:', galleryData);
      if (galleryData.success && galleryData.content) {
        setGallery(galleryData.content);
      }
      
      // Load events
      const eventsRes = await fetch(`${API_BASE}/content/public.php?type=event&limit=20`, { 
        credentials: 'include' 
      });
      const eventsData = await eventsRes.json();
      console.log('[Gallery] Events data:', eventsData);
      if (eventsData.success && eventsData.content) {
        setEvents(eventsData.content);
      }
      
      // Load news
      const newsRes = await fetch(`${API_BASE}/content/public.php?type=news&limit=10`, { 
        credentials: 'include' 
      });
      const newsData = await newsRes.json();
      console.log('[Gallery] News data:', newsData);
      if (newsData.success && newsData.content) {
        setNews(newsData.content);
      }
      
      // Load streams
      const streamsRes = await fetch(`${API_BASE}/content/public.php?type=stream&limit=10`, { 
        credentials: 'include' 
      });
      const streamsData = await streamsRes.json();
      console.log('[Gallery] Streams data:', streamsData);
      if (streamsData.success && streamsData.content) {
        setStreams(streamsData.content);
      }
    } catch (e) {
      console.error('[Gallery] Load error:', e);
      toast.error('Erreur de chargement: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  // Combine all content for filtering
  const allContent = [
    ...gallery.map(item => ({ ...item, type: 'gallery' })),
    ...events.map(item => ({ ...item, type: 'event' })),
    ...news.map(item => ({ ...item, type: 'news' })),
    ...streams.map(item => ({ ...item, type: 'stream' }))
  ];

  // Sort: pinned first, then by date
  const sortedContent = allContent.sort((a, b) => {
    // Pinned items first
    if (a.is_pinned && !b.is_pinned) return -1;
    if (!a.is_pinned && b.is_pinned) return 1;
    // Then by date (newest first)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const filteredContent = activeFilter === 'all' 
    ? sortedContent 
    : sortedContent.filter(item => item.type === activeFilter);

  const getEventIcon = (type) => {
    switch (type) {
      case 'gallery': return <ImageIcon className="w-5 h-5 text-purple-400" />;
      case 'event': return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'stream': return <Play className="w-5 h-5 text-red-400" />;
      case 'news': return <MessageCircle className="w-5 h-5 text-green-400" />;
      default: return <ImageIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getEventTypeLabel = (type) => {
    switch (type) {
      case 'gallery': return 'Galerie';
      case 'event': return 'Événement';
      case 'stream': return 'Stream';
      case 'news': return 'News';
      default: return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const filters = [
    { id: 'all', label: 'Tout', icon: Filter },
    { id: 'gallery', label: 'Galerie', icon: ImageIcon },
    { id: 'event', label: 'Événements', icon: Calendar },
    { id: 'stream', label: 'Streams', icon: Play },
    { id: 'news', label: 'News', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navigation userType="player" currentPage="gallery" />
      
      <div className="lg:pl-64">
        <div className="p-4 lg:p-8">
          {/* Header */}
          <div className="mb-8" data-aos="fade-down">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2 flex items-center space-x-3">
              <Calendar className="w-10 h-10 text-purple-400" />
              <span>Galerie & Actus</span>
            </h1>
            <p className="text-gray-300">Revivez les meilleurs moments gaming</p>
          </div>

          {/* Filters */}
          <div className="mb-8" data-aos="fade-up">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const IconComponent = filter.icon;
                return (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                      activeFilter === filter.id
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                        : 'bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 backdrop-blur-md border border-white/20'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{filter.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Events Gallery */}
            <div className="lg:col-span-2" data-aos="fade-right">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-between">
                  <span>
                    {activeFilter === 'all' && 'Tout le Contenu'}
                    {activeFilter === 'gallery' && 'Galerie d\'Images'}
                    {activeFilter === 'event' && 'Événements'}
                    {activeFilter === 'stream' && 'Streams'}
                    {activeFilter === 'news' && 'Actualités'}
                  </span>
                  <span className="text-sm text-gray-400 font-normal">
                    {filteredContent.length} élément{filteredContent.length > 1 ? 's' : ''}
                  </span>
                </h2>
                
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
                  </div>
                ) : filteredContent.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Aucun contenu pour le moment</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {filteredContent.map((item, index) => (
                      <div key={item.id} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden hover:bg-white/10 transition-all duration-200 group" data-aos="zoom-in" data-aos-delay={index * 50}>
                        {item.image_url && (
                          <div 
                            className="aspect-video relative overflow-hidden cursor-pointer"
                            onClick={() => openDetailModal(item)}
                          >
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/800x450?text=Image+non+disponible';
                              }}
                            />
                            <div className="absolute top-4 left-4 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                              {getEventIcon(item.type)}
                              <span className="text-white text-sm font-semibold">
                                {getEventTypeLabel(item.type)}
                              </span>
                            </div>
                            {item.is_pinned == 1 && (
                              <div className="absolute top-4 right-4 bg-amber-500 backdrop-blur-sm rounded-full px-3 py-1 shadow-lg border-2 border-amber-300">
                                <span className="text-white text-sm font-bold drop-shadow-lg">
                                  📌 Épinglé
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 
                              className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors cursor-pointer"
                              onClick={() => openDetailModal(item)}
                            >
                              {item.title}
                            </h3>
                            <span className="text-gray-400 text-sm">
                              {formatDate(item.published_at || item.created_at)}
                            </span>
                          </div>
                          
                          {item.description && (
                            <p className="text-gray-300 mb-4">
                              {item.description}
                            </p>
                          )}
                          
                          {item.event_location && (
                            <p className="text-gray-400 text-sm mb-2">
                              📍 {item.event_location}
                            </p>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span className="text-sm">{item.views_count || 0}</span>
                              </div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLike(item.id, item.type);
                                }} 
                                className={`flex items-center space-x-1 transition-colors ${
                                  userLikes.has(item.id) 
                                    ? 'text-red-500 hover:text-red-400' 
                                    : 'text-gray-400 hover:text-red-400'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${userLikes.has(item.id) ? 'fill-current' : ''}`} />
                                <span className="text-sm">{item.likes_count || 0}</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openDetailModal(item);
                                }}
                                className="flex items-center space-x-1 hover:text-blue-400 transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-sm">{item.comments_count || 0}</span>
                              </button>
                            </div>
                            
                            {item.author_name && (
                              <span className="text-xs text-gray-500">
                                Par {item.author_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* News Sidebar */}
            <div data-aos="fade-left">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6 text-blue-400" />
                  <span>Actualités</span>
                </h2>
                
                <div className="space-y-6">
                  {news.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-8">Aucune actualité disponible</p>
                  ) : (
                    news.map((article) => (
                      <div key={article.id} className="group cursor-pointer">
                        {article.image_url && (
                          <div className="aspect-video rounded-lg overflow-hidden mb-3">
                            <img
                              src={article.image_url}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/400x225?text=Image+non+disponible';
                              }}
                            />
                          </div>
                        )}
                        
                        <div>
                          <p className="text-gray-400 text-xs mb-2">
                            {formatDate(article.published_at || article.created_at)}
                          </p>
                          <h3 className="text-white font-semibold mb-2 group-hover:text-purple-300 transition-colors">
                            {article.title}
                          </h3>
                          {article.description && (
                            <p className="text-gray-300 text-sm line-clamp-3">
                              {article.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl border border-purple-400/30 p-4">
                  <h3 className="text-white font-semibold mb-4 flex items-center justify-between">
                    <span className="text-lg">📊 Statistiques</span>
                    <button 
                      onClick={loadStats}
                      className="text-xs text-white bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-lg transition-colors font-semibold"
                      title="Actualiser"
                    >
                      🔄 Actualiser
                    </button>
                  </h3>
                  {stats ? (
                    <div className="space-y-4">
                      {/* Stats par type */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-gray-700/30 px-3 py-2 rounded-lg">
                          <span className="text-white text-sm font-semibold">🖼️ Images galerie</span>
                          <span className="text-purple-400 font-bold text-lg">{stats.by_type.gallery.count}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-700/30 px-3 py-2 rounded-lg">
                          <span className="text-white text-sm font-semibold">📅 Événements</span>
                          <span className="text-blue-400 font-bold text-lg">{stats.by_type.event.count}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-700/30 px-3 py-2 rounded-lg">
                          <span className="text-white text-sm font-semibold">📰 Actualités</span>
                          <span className="text-green-400 font-bold text-lg">{stats.by_type.news.count}</span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-700/30 px-3 py-2 rounded-lg">
                          <span className="text-white text-sm font-semibold">▶️ Streams</span>
                          <span className="text-red-400 font-bold text-lg">{stats.by_type.stream.count}</span>
                        </div>
                      </div>
                      
                      {/* Stats globales */}
                      <div className="pt-3 border-t border-white/20 space-y-2">
                        <div className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-white text-xs font-semibold">👁️ Vues totales</span>
                          <span className="text-cyan-400 text-sm font-bold">
                            {Object.values(stats.by_type).reduce((sum, type) => sum + type.views, 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-white text-xs font-semibold">❤️ Likes totaux</span>
                          <span className="text-red-400 text-sm font-bold">
                            {stats.total_likes.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-white text-xs font-semibold">💬 Commentaires</span>
                          <span className="text-blue-400 text-sm font-bold">
                            {stats.total_comments.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center bg-gray-800/50 px-3 py-2 rounded">
                          <span className="text-white text-xs font-semibold">🔗 Partages</span>
                          <span className="text-green-400 text-sm font-bold">
                            {Object.values(stats.by_type).reduce((sum, type) => sum + type.shares, 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Top contenu */}
                      {stats.top_views && stats.top_views.length > 0 && (
                        <div className="pt-3 border-t border-white/20">
                          <h4 className="text-sm text-white font-bold mb-3">🔥 Plus vus</h4>
                          <div className="space-y-2">
                            {stats.top_views.slice(0, 3).map((item, idx) => (
                              <div key={item.id} className="flex items-center justify-between text-xs bg-gray-800/50 px-2 py-2 rounded">
                                <span className="text-white truncate flex-1 font-semibold" title={item.title}>
                                  {idx + 1}. {item.title.substring(0, 20)}{item.title.length > 20 ? '...' : ''}
                                </span>
                                <span className="text-purple-400 ml-2 font-bold bg-purple-500/20 px-2 py-1 rounded">{item.views_count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && detailContent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDetailModal();
            }
            setShowShareMenu(false);
          }}
        >
          <div 
            className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl"
            onClick={() => setShowShareMenu(false)}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center space-x-3">
                {getEventIcon(detailContent.type)}
                <h2 className="text-2xl font-bold text-white">{detailContent.title}</h2>
              </div>
              <button
                onClick={closeDetailModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Image */}
              {detailContent.image_url && (
                <div className="aspect-video w-full">
                  <img
                    src={detailContent.image_url}
                    alt={detailContent.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/800x450?text=Image+non+disponible';
                    }}
                  />
                </div>
              )}

              {/* Info & Description */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center space-x-4">
                    <span>Par {detailContent.author_name || 'Admin'}</span>
                    <span>•</span>
                    <span>{formatDate(detailContent.published_at || detailContent.created_at)}</span>
                  </div>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold">
                    {getEventTypeLabel(detailContent.type)}
                  </span>
                </div>

                {detailContent.description && (
                  <p className="text-gray-300 leading-relaxed">{detailContent.description}</p>
                )}

                {detailContent.content && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-300">{detailContent.content}</p>
                  </div>
                )}

                {detailContent.event_location && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>📍 {detailContent.event_location}</span>
                  </div>
                )}

                {detailContent.event_date && detailContent.event_date !== '0000-00-00 00:00:00' && (
                  <div className="flex items-center space-x-2 text-gray-300">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(detailContent.event_date)}</span>
                  </div>
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <Eye className="w-5 h-5" />
                      <span>{detailContent.views_count || 0} vues</span>
                    </div>
                    <button
                      onClick={() => handleLike(detailContent.id, detailContent.type)}
                      className={`flex items-center space-x-2 transition-colors ${
                        userLikes.has(detailContent.id)
                          ? 'text-red-500 hover:text-red-400'
                          : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${userLikes.has(detailContent.id) ? 'fill-current' : ''}`} />
                      <span>{detailContent.likes_count || 0} likes</span>
                    </button>
                    <div className="flex items-center space-x-2 text-gray-400">
                      <MessageCircle className="w-5 h-5" />
                      <span>{detailComments.length} commentaire{detailComments.length > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  
                  {/* Share Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowShareMenu(!showShareMenu)}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white rounded-lg transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Partager</span>
                    </button>
                    
                    {/* Share Menu */}
                    {showShareMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-lg shadow-xl overflow-hidden z-10">
                        <button
                          onClick={() => handleShare('facebook')}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 text-white transition-colors"
                        >
                          <span className="text-xl">📘</span>
                          <span>Facebook</span>
                        </button>
                        <button
                          onClick={() => handleShare('twitter')}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 text-white transition-colors"
                        >
                          <span className="text-xl">🐦</span>
                          <span>Twitter</span>
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 text-white transition-colors"
                        >
                          <span className="text-xl">💬</span>
                          <span>WhatsApp</span>
                        </button>
                        <button
                          onClick={() => handleShare('telegram')}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 text-white transition-colors"
                        >
                          <span className="text-xl">✈️</span>
                          <span>Telegram</span>
                        </button>
                        <button
                          onClick={() => handleShare('copy_link')}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-white/10 text-white transition-colors border-t border-white/10"
                        >
                          <span className="text-xl">🔗</span>
                          <span>Copier le lien</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Section */}
                <div className="pt-6 border-t border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Commentaires</span>
                  </h3>

                  {/* Comment Form */}
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    {replyingTo && (
                      <div className="mb-2 flex items-center justify-between bg-blue-500/10 border border-blue-400/30 rounded-lg px-3 py-2">
                        <span className="text-sm text-blue-300">Répondre à un commentaire...</span>
                        <button
                          type="button"
                          onClick={() => setReplyingTo(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={replyingTo ? "Votre réponse..." : "Ajouter un commentaire..."}
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={submittingComment}
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                        <span>{replyingTo ? 'Répondre' : 'Envoyer'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {detailComments.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">Aucun commentaire pour le moment. Soyez le premier à commenter !</p>
                    ) : (
                      detailComments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-start space-x-3">
                            {comment.avatar_url ? (
                              <img
                                src={resolveAvatarUrl(comment.avatar_url, comment.username)}
                                alt={comment.username}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
                                {comment.username?.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center space-x-2">
                                  <span className="font-semibold text-white">{comment.username}</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                  {comment.created_at !== comment.updated_at && (
                                    <span className="text-xs text-gray-500 italic">(édité)</span>
                                  )}
                                </div>
                                {currentUser && (currentUser.id === comment.user_id || currentUser.role === 'admin') && (
                                  <div className="flex items-center space-x-2">
                                    {currentUser.id === comment.user_id && (
                                      <button
                                        onClick={() => {
                                          setEditingComment(comment.id);
                                          setEditCommentText(comment.comment);
                                        }}
                                        className="text-xs text-blue-400 hover:text-blue-300"
                                      >
                                        Modifier
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-xs text-red-400 hover:text-red-300"
                                    >
                                      Supprimer
                                    </button>
                                  </div>
                                )}
                              </div>
                              
                              {editingComment === comment.id ? (
                                <div className="mt-2">
                                  <div className="flex space-x-2">
                                    <input
                                      type="text"
                                      value={editCommentText}
                                      onChange={(e) => setEditCommentText(e.target.value)}
                                      className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleEditComment(comment.id)}
                                      className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded"
                                    >
                                      OK
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingComment(null);
                                        setEditCommentText('');
                                      }}
                                      className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded"
                                    >
                                      Annuler
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-300">{comment.comment}</p>
                                  <button
                                    onClick={() => setReplyingTo(comment.id)}
                                    className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                                  >
                                    <MessageCircle className="w-3 h-3" />
                                    <span>Répondre</span>
                                  </button>
                                </>
                              )}

                              
                              {/* Replies */}
                              {!editingComment && comment.replies && comment.replies.length > 0 && (
                                <div className="mt-3 ml-4 space-y-2 border-l-2 border-purple-500/30 pl-4">
                                  {comment.replies.map((reply) => (
                                    <div key={reply.id} className="flex items-start space-x-2">
                                      {reply.avatar_url ? (
                                        <img
                                          src={resolveAvatarUrl(reply.avatar_url, reply.username)}
                                          alt={reply.username}
                                          className="w-8 h-8 rounded-full"
                                        />
                                      ) : (
                                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                          {reply.username?.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2">
                                          <span className="font-semibold text-white text-sm">{reply.username}</span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(reply.created_at).toLocaleDateString('fr-FR', {
                                              day: 'numeric',
                                              month: 'short'
                                            })}
                                          </span>
                                        </div>
                                        <p className="text-gray-300 text-sm">{reply.comment}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}