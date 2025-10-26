# Template pour Ajouter Auth aux Pages Admin

Pour chaque page admin (`rewards`, `points`, `bonuses`, `levels`, `sessions`, `active-sessions`, `invoice-scanner`), ajouter :

## 1. Imports en haut du fichier

```jsx
import { useNavigate } from 'react-router';
```

## 2. Dans le composant, après les autres useState

```jsx
const navigate = useNavigate();
const [isAuthenticated, setIsAuthenticated] = useState(false);
```

## 3. Ajouter useEffect d'auth AVANT le premier useEffect existant

```jsx
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
```

## 4. Modifier le useEffect de chargement des données

```jsx
useEffect(() => {
  if (!isAuthenticated) return; // <-- AJOUTER CETTE LIGNE
  fetchData(); // ou loadData(), etc.
}, [isAuthenticated]); // <-- AJOUTER isAuthenticated aux dépendances
```

## 5. Ajouter loader avant le return principal

```jsx
if (!isAuthenticated) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
        <p className="text-white text-xl">Vérification de l'authentification...</p>
      </div>
    </div>
  );
}
```

---

## Pages à Corriger

- [ ] rewards/page.jsx
- [ ] points/page.jsx  
- [ ] bonuses/page.jsx
- [ ] levels/page.jsx
- [ ] sessions/page.jsx
- [ ] active-sessions/page.jsx
- [ ] invoice-scanner/page.jsx
- [ ] test/page.jsx
- [ ] players/[id]/page.jsx (vérifier si déjà fait)

---

## Déjà Corrigé ✅

- [x] shop/page.jsx
- [x] content/page.jsx
- [x] dashboard/page.jsx
- [x] players/page.jsx
