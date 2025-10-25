# Frontend Gamification - Guide d'Intégration

## 📋 Vue d'ensemble

Le frontend de gamification est maintenant complètement intégré dans votre application React. Voici ce qui a été créé :

## 🗂️ Structure des fichiers

```
src/
├── utils/
│   ├── gamification-api.js          # API client et helpers
│   └── useGamification.js            # Hooks React personnalisés
├── components/
│   ├── BadgeCard.jsx                 # Affichage des badges
│   ├── LevelProgress.jsx             # Progression de niveau
│   ├── StatsCard.jsx                 # Cartes de statistiques
│   ├── RewardsShop.jsx               # Boutique de récompenses
│   └── Navigation.jsx                # Navigation (modifiée)
├── app/
│   └── player/
│       └── gamification/
│           └── page.jsx              # Page principale
└── __create/
    └── AuthContext.jsx               # Contexte d'authentification
```

## 🎨 Composants créés

### 1. **BadgeCard** & **BadgeGrid**
Affichage des badges avec progression et raretés

```jsx
import { BadgeCard, BadgeGrid } from '@/components/BadgeCard';

// Badge individuel
<BadgeCard badge={badge} size="md" showProgress={true} />

// Grille de badges
<BadgeGrid badges={badgesArray} showProgress={true} />
```

**Props:**
- `badge`: Objet badge avec {id, name, icon, rarity, progress, earned, etc.}
- `size`: 'sm' | 'md' | 'lg'
- `showProgress`: Afficher la barre de progression

### 2. **LevelProgress** & **AllLevelsDisplay**
Progression de niveau avec barre et visualisation

```jsx
import { LevelProgress, AllLevelsDisplay } from '@/components/LevelProgress';

// Progression compacte ou complète
<LevelProgress levelData={levelData} compact={false} />

// Liste de tous les niveaux
<AllLevelsDisplay allLevels={levels} userPoints={points} />
```

### 3. **StatsCard**, **StatsGrid**, **StreakCard**
Affichage des statistiques

```jsx
import { StatsCard, StatsGrid, StreakCard, RecentAchievements } from '@/components/StatsCard';

// Carte individuelle
<StatsCard 
  icon="🎮" 
  label="Parties jouées" 
  value={45} 
  color="cyan" 
/>

// Grille complète
<StatsGrid stats={statsData} />

// Série de connexion
<StreakCard streak={streakData} />

// Achievements récents
<RecentAchievements achievements={recentBadges} />
```

### 4. **RewardsShop**
Boutique de récompenses avec filtres

```jsx
import { RewardsShop } from '@/components/RewardsShop';

<RewardsShop 
  userPoints={userPoints} 
  onPointsUpdate={refreshData} 
/>
```

## 🪝 Hooks personnalisés

### `useGamificationStats(userId)`
Récupère les statistiques complètes d'un utilisateur

```jsx
import { useGamificationStats } from '@/utils/useGamification';

const { stats, loading, error, refetch } = useGamificationStats(userId);

// stats.user: { id, username, points, level }
// stats.statistics: { games_played, points_earned, badges_earned, ... }
// stats.streak: { current, longest, last_login }
// stats.level_progression: { current, next }
// stats.recent_achievements: [...]
```

### `useUserBadges(userId)`
Récupère les badges avec progression

```jsx
import { useUserBadges } from '@/utils/useGamification';

const { badges, loading, error, refetch } = useUserBadges(userId);

// badges.badges: Array de badges avec progress
// badges.total_earned: Nombre de badges obtenus
// badges.total_available: Nombre total de badges
```

### `useLevelProgress(userId)`
Récupère la progression de niveau

```jsx
import { useLevelProgress } from '@/utils/useGamification';

const { levelData, loading, error, refetch } = useLevelProgress(userId);

// levelData.user.current_level: Niveau actuel
// levelData.user.next_level: Niveau suivant
// levelData.user.progress_percentage: % de progression
// levelData.all_levels: Tous les niveaux
```

### `useAwardPoints()`
Attribuer des points avec notifications automatiques

```jsx
import { useAwardPoints } from '@/utils/useGamification';

const { awardPoints, isAwarding } = useAwardPoints();

// Attribuer des points
const handleGamePlayed = async () => {
  const result = await awardPoints('game_played');
  // Notifications automatiques affichées via toast
  // result contient: points_awarded, new_total, leveled_up, badges_earned
};
```

**Actions disponibles:**
- `game_played` (10 pts)
- `event_attended` (50 pts)
- `tournament_participate` (100 pts)
- `tournament_win` (500 pts)
- `friend_referred` (200 pts)
- `profile_complete` (100 pts)
- `first_purchase` (150 pts)
- `review_written` (30 pts)
- `share_social` (20 pts)

### `useDailyLogin()`
Gérer la connexion quotidienne et les streaks

```jsx
import { useDailyLogin } from '@/utils/useGamification';

const { recordLogin, hasLoggedInToday, streakData } = useDailyLogin();

// Appeler au login
useEffect(() => {
  if (user && !hasLoggedInToday) {
    recordLogin();
  }
}, [user]);
```

### `useRewards()`
Gérer la boutique de récompenses

```jsx
import { useRewards } from '@/utils/useGamification';

const { rewards, loading, redeeming, redeemReward, refetch } = useRewards();

// Échanger une récompense
await redeemReward(rewardId);
```

### `useActiveMultipliers(userId)`
Récupérer les multiplicateurs actifs

```jsx
import { useActiveMultipliers } from '@/utils/useGamification';

const { multipliers, loading, refetch } = useActiveMultipliers(userId);

// multipliers: Array de {id, multiplier, reason, expires_at}
```

## 🔌 Intégration dans votre app

### 1. Ajouter AuthContext (si nécessaire)

Wrappez votre app avec le AuthProvider :

```jsx
import { AuthProvider } from '@/__create/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Votre app */}
    </AuthProvider>
  );
}
```

### 2. Navigation

La navigation a déjà été mise à jour avec le lien "Progression" :

```jsx
// Dans Navigation.jsx
{ id: 'gamification', label: 'Progression', icon: Sparkles, href: '/player/gamification' }
```

### 3. Page principale

La page `/player/gamification` est déjà créée avec :
- 3 onglets (Vue d'ensemble, Badges, Boutique)
- Connexion quotidienne automatique
- Actualisation des données
- Notifications via toast

## 🎯 Exemples d'utilisation

### Exemple 1: Attribuer des points après une action

```jsx
import { useAwardPoints } from '@/utils/useGamification';

function GameCard() {
  const { awardPoints, isAwarding } = useAwardPoints();
  
  const handlePlayGame = async () => {
    // Logique du jeu...
    
    // Attribuer des points
    try {
      const result = await awardPoints('game_played');
      console.log('Points gagnés:', result.points_awarded);
      
      // Les notifications de level-up et badges sont automatiques
    } catch (err) {
      console.error('Erreur:', err);
    }
  };
  
  return (
    <button onClick={handlePlayGame} disabled={isAwarding}>
      {isAwarding ? 'Chargement...' : 'Jouer'}
    </button>
  );
}
```

### Exemple 2: Afficher la progression dans le header

```jsx
import { useLevelProgress } from '@/utils/useGamification';

function UserHeader({ userId }) {
  const { levelData, loading } = useLevelProgress(userId);
  
  if (loading) return <div>Chargement...</div>;
  
  const { user } = levelData;
  
  return (
    <div className="flex items-center gap-4">
      <div>
        <p className="font-bold">{user.current_level.name}</p>
        <p className="text-sm">{user.points} points</p>
      </div>
      <div className="w-32 h-2 bg-gray-700 rounded-full">
        <div 
          className="h-full bg-cyan-500 rounded-full" 
          style={{ width: `${user.progress_percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### Exemple 3: Mini widget de badges

```jsx
import { useUserBadges } from '@/utils/useGamification';
import { BadgeCard } from '@/components/BadgeCard';

function BadgesWidget({ userId }) {
  const { badges } = useUserBadges(userId);
  
  const recentBadges = badges?.badges
    ?.filter(b => b.earned)
    ?.slice(0, 3);
  
  return (
    <div>
      <h3>Derniers badges</h3>
      <div className="flex gap-2">
        {recentBadges?.map(badge => (
          <BadgeCard key={badge.id} badge={badge} size="sm" showProgress={false} />
        ))}
      </div>
    </div>
  );
}
```

### Exemple 4: Call-to-action personnalisé

```jsx
import { useUserBadges, useAwardPoints } from '@/utils/useGamification';

function ShareButton() {
  const { awardPoints } = useAwardPoints();
  const { badges, refetch } = useUserBadges();
  
  const handleShare = async () => {
    // Logique de partage...
    await shareToSocial();
    
    // Attribuer des points
    await awardPoints('share_social');
    
    // Refresh badges (au cas où un nouveau badge est débloqué)
    refetch();
  };
  
  return (
    <button onClick={handleShare}>
      Partager (+20 pts)
    </button>
  );
}
```

## 🎨 Personnalisation des styles

Tous les composants utilisent Tailwind CSS. Les couleurs principales sont :

```css
/* Niveaux et progression */
.level-gradient { @apply bg-gradient-to-r from-cyan-500 to-blue-500; }

/* Badges raretés */
.rarity-common { @apply text-gray-400; }
.rarity-rare { @apply text-blue-400; }
.rarity-epic { @apply text-purple-400; }
.rarity-legendary { @apply text-yellow-400; }

/* Stats */
.stat-positive { @apply text-green-400; }
.stat-negative { @apply text-red-400; }
```

## 🔔 Notifications

Les notifications utilisent `sonner` (déjà inclus dans votre projet via le Toaster dans root.tsx).

Les notifications sont automatiques pour :
- Attribution de points
- Level-up
- Nouveaux badges
- Streaks de connexion
- Erreurs

## 🧪 Tests

### Test local

1. Démarrez votre serveur de dev :
```bash
npm run dev
```

2. Accédez à `/player/gamification`

3. Testez les fonctionnalités :
   - Affichage des badges et progression
   - Changement d'onglets
   - Échange de récompenses
   - Statistiques

### Test d'attribution de points

Ouvrez la console du navigateur et testez :

```javascript
// Dans la page gamification
import { GamificationAPI } from '@/utils/gamification-api';

// Attribuer des points
await GamificationAPI.awardPoints('game_played');

// Enregistrer connexion
await GamificationAPI.recordLogin();

// Vérifier badges
await GamificationAPI.checkBadges();
```

## 🚀 Déploiement

### Prérequis
- API backend opérationnelle (déjà fait ✅)
- Base de données avec tables de gamification (déjà fait ✅)
- CORS configuré correctement

### Build production

```bash
npm run build
```

### Variables d'environnement

Si vous changez d'environnement, mettez à jour l'URL de l'API dans `gamification-api.js`:

```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/projet%20ismo/api';
```

## 📱 Responsive

Tous les composants sont responsives :
- Mobile-first design
- Grilles adaptatives
- Navigation mobile avec menu hamburger
- Tooltips et overlays optimisés

## ♿ Accessibilité

- Tous les boutons ont des états focus
- Contraste des couleurs WCAG AA
- Labels appropriés
- Navigation au clavier supportée

## 🐛 Dépannage

### Les points ne s'attribuent pas

Vérifiez:
1. Session utilisateur valide (cookies)
2. CORS configuré dans le backend
3. Console navigateur pour les erreurs

### Les notifications ne s'affichent pas

Vérifiez que le Toaster est monté dans root.tsx :
```jsx
<Toaster position="top-right" />
```

### Les badges ne se mettent pas à jour

Utilisez `refetch()` après chaque action importante ou ajoutez un polling :

```jsx
useEffect(() => {
  const interval = setInterval(() => {
    refetchBadges();
  }, 30000); // Toutes les 30s
  
  return () => clearInterval(interval);
}, []);
```

## 📚 Ressources

- **Documentation Backend**: `/SYSTEME_GAMIFICATION.md`
- **Installation Backend**: `/INSTALLATION_REUSSIE.md`
- **API Endpoints**: `/api/gamification/`

## ✅ Checklist de vérification

- [x] Tous les composants créés
- [x] Hooks personnalisés fonctionnels
- [x] API client configuré
- [x] Navigation mise à jour
- [x] Page principale créée
- [x] Notifications intégrées
- [x] Styles responsive
- [x] Documentation complète

---

**Système créé le**: 14 octobre 2025  
**Version**: 1.0.0  
**Statut**: ✅ Prêt pour utilisation
