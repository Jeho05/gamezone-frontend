import { useState, useEffect } from 'react';
import { useState, useEffect } from 'react';
import Navigation from '../../../components/Navigation';
import { resolveGameImageUrl, isGradient, getGradientClass } from '../../../utils/gameImageUrl';
import { 
  ShoppingCart, 
  Star, 
  Gamepad2, 
  Clock, 
  TrendingUp,
  Search,
  Sparkles,
  Zap,
  Gift,
  ArrowRight,
  Filter,
  Heart,
  Users,
  Flame
} from 'lucide-react';
import API_BASE from '../../../utils/apiBase';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function GameShop() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [userPoints, setUserPoints] = useState(0);
  const [userData, setUserData] = useState(null);

  const categories = [
    { value: '', label: 'Tous', icon: Gamepad2, color: 'from-purple-500 to-pink-500' },
    { value: 'action', label: 'Action', icon: Zap, color: 'from-red-500 to-orange-500' },
    { value: 'sports', label: 'Sports', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { value: 'racing', label: 'Course', icon: Flame, color: 'from-yellow-500 to-orange-500' },
    { value: 'fighting', label: 'Combat', icon: Star, color: 'from-red-600 to-rose-500' },
    { value: 'vr', label: 'VR', icon: Sparkles, color: 'from-cyan-500 to-blue-500' },
    { value: 'retro', label: 'Rétro', icon: Gamepad2, color: 'from-indigo-500 to-purple-500' }
  ];

  useEffect(() => {
    loadGames();
    loadUserData();
  }, [selectedCategory]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const url = selectedCategory 
        ? `${API_BASE}/shop/games.php?category=${selectedCategory}`
        : `${API_BASE}/shop/games.php`;
      
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      
      if (data.games) {
        setGames(data.games);
      }
    } catch (err) {
      setError('Erreur lors du chargement des jeux');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/check.php`, { credentials: 'include' });
      const data = await res.json();
      if (data.user) {
        setUserPoints(data.user.points || 0);
        setUserData(data.user);
      }
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
    }
  };

  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (game.description && game.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleGameClick = (gameId) => {
    navigate(`/player/shop/${gameId}`);
  };

  const featuredGames = filteredGames.filter(g => g.is_featured == 1).slice(0, 3);
  const regularGames = filteredGames.filter(g => g.is_featured != 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <Navigation userType="player" />
      
      {/* Main Content with Sidebar Offset */}
      <div className="lg:pl-64">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
          <div className="relative container mx-auto px-4 py-12 lg:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-bold text-sm mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              OFFRES SPÉCIALES DISPONIBLES
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-6 leading-tight">
              Plongez dans l'univers Gaming
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Achetez du temps de jeu, gagnez des points et devenez le champion !
            </p>

            {/* User Stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Star className="w-6 h-6 text-yellow-400 fill-current" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-300">Vos Points</p>
                  <p className="text-2xl font-bold text-white">{userPoints.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-xl">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-300">Jeux Disponibles</p>
                  <p className="text-2xl font-bold text-white">{games.length}</p>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => {
                  const gamesSection = document.getElementById('games-section');
                  gamesSection?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-2xl font-bold text-lg shadow-2xl transition-all transform hover:scale-105"
              >
                Explorer les Jeux
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/player/my-purchases')}
                className="flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white rounded-2xl font-bold text-lg transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                Mes Achats
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Category Pills */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Filter className="w-6 h-6" />
            Catégories
          </h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`group relative overflow-hidden px-6 py-3 rounded-2xl font-bold transition-all transform hover:scale-105 ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r ' + cat.color + ' text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-md border border-white/20 text-gray-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    <span>{cat.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-12">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Rechercher un jeu par nom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-16 pr-6 py-5 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
            />
          </div>
        </div>

        {/* Games Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-500 mb-4"></div>
            <p className="text-2xl font-bold text-white">Chargement de l'aventure...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 inline-block">
              <p className="text-xl text-red-400">{error}</p>
            </div>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-20">
            <Gamepad2 className="w-32 h-32 text-gray-600 mx-auto mb-6 opacity-50" />
            <p className="text-3xl font-bold text-white mb-2">Aucun jeu trouvé</p>
            <p className="text-gray-400">Essayez une autre catégorie ou recherche</p>
          </div>
        ) : (
          <div id="games-section">
            {/* Featured Games */}
            {featuredGames.length > 0 && selectedCategory === '' && !searchTerm && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Flame className="w-8 h-8 text-orange-500" />
                    Jeux Populaires
                  </h2>
                  <div className="flex items-center gap-2 text-orange-400">
                    <Sparkles className="w-5 h-5" />
                    <span className="font-bold">Tendances</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {featuredGames.map((game) => (
                    <div
                      key={game.id}
                      onClick={() => handleGameClick(game.id)}
                      className="group relative bg-gradient-to-br from-purple-900 to-pink-900 rounded-3xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-2xl"
                    >
                      {/* Image */}
                      <div className="relative h-64 overflow-hidden">
                        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-4 py-2 rounded-full font-black text-sm flex items-center gap-2 shadow-xl animate-pulse">
                          <Sparkles className="w-5 h-5" />
                          POPULAIRE
                        </div>
                        <img
                          src={game.image_url || game.thumbnail_url || `https://via.placeholder.com/600x400?text=${encodeURIComponent(game.name)}`}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                        
                        {/* Overlay Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <h3 className="text-2xl font-black text-white mb-2">
                            {game.name}
                          </h3>
                          {game.short_description && (
                            <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                              {game.short_description}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-5 h-5 text-yellow-400 fill-current" />
                              <span className="text-yellow-400 font-bold">{game.points_per_hour} pts/h</span>
                            </div>
                            <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold">
                              {game.min_price || game.base_price} XOF
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Games */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Gamepad2 className="w-8 h-8 text-purple-500" />
                  {selectedCategory ? `Jeux ${categories.find(c => c.value === selectedCategory)?.label}` : 'Tous les Jeux'}
                </h2>
                <span className="text-gray-400">{(selectedCategory === '' && !searchTerm ? regularGames : filteredGames).length} jeu(x)</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(selectedCategory === '' && !searchTerm ? regularGames : filteredGames).map((game) => (
                  <div
                    key={game.id}
                    onClick={() => handleGameClick(game.id)}
                    className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-105 hover:shadow-2xl hover:bg-white/10"
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={game.image_url || game.thumbnail_url || `https://via.placeholder.com/400x300?text=${encodeURIComponent(game.name)}`}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white capitalize font-bold border border-white/20">
                          {game.category}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-purple-400 transition-colors">
                        {game.name}
                      </h3>
                      
                      {game.short_description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                          {game.short_description}
                        </p>
                      )}

                      {/* Meta Info */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-bold text-sm">{game.points_per_hour} pts/h</span>
                        </div>
                        {game.packages_count > 0 && (
                          <span className="text-xs text-gray-500">
                            {game.packages_count} offre{game.packages_count > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/50 rounded-xl py-3 px-4 text-center">
                        <span className="text-xs text-green-300 block mb-1">À partir de</span>
                        <div className="text-xl font-black text-green-400">
                          {game.min_price || game.base_price} <span className="text-sm">XOF</span>
                        </div>
                      </div>

                      {/* CTA */}
                      <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-xl font-bold text-sm transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
                        Voir les offres
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
