import { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ErrorBoundary } from './components/ErrorBoundary';

// Import dynamique pour GameDetail (problème de path avec crochets)
const GameDetail = lazy(() => import('./app/player/shop/[gameId]/page'));

import HomePage from './app/page';
import PlayerDashboard from './app/player/dashboard/page';
import PlayerShop from './app/player/shop/page';
import PlayerRewards from './app/player/rewards/page';
import PlayerProfile from './app/player/profile/page';
import PlayerLeaderboard from './app/player/leaderboard/page';
import PlayerGamification from './app/player/gamification/page';
import PlayerGallery from './app/player/gallery/page';
import PlayerMyPurchases from './app/player/my-purchases/page';
import PlayerMyReservations from './app/player/my-reservations/page';
import PlayerMySession from './app/player/my-session/page';
import AdminDashboard from './app/admin/dashboard/page';
import AdminPlayers from './app/admin/players/page';
import AdminPlayerDetail from './app/admin/players/[id]/page';
import AdminRewards from './app/admin/rewards/page';
import AdminPoints from './app/admin/points/page';
import AdminShop from './app/admin/shop/page';
import AdminContent from './app/admin/content/page';
import AdminLevels from './app/admin/levels/page';
import AdminBonuses from './app/admin/bonuses/page';
import AdminSessions from './app/admin/sessions/page';
import AdminInvoiceScanner from './app/admin/invoice-scanner/page';
import LoginPage from './app/auth/login/page';
import RegisterPage from './app/auth/register/page';
import ForgotPasswordPage from './app/auth/forgot-password/page';
import ResetPasswordPage from './app/auth/reset-password/[token]/page';
import ResetWithRecoveryCodePage from './app/auth/reset-with-recovery-code/page';
import ResetHelpPage from './app/auth/reset-help/page';

// Import global styles
import './app/global.css';
import './styles/animations.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Page de fallback simple pour les routes manquantes
function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      color: 'white',
      textAlign: 'center',
      fontFamily: 'system-ui'
    }}>
      <div>
        <h1 style={{ fontSize: '5rem', margin: 0 }}>404</h1>
        <p style={{ fontSize: '1.5rem', marginTop: '20px' }}>Page non trouvée</p>
        <a href="/" style={{ 
          display: 'inline-block',
          marginTop: '30px',
          padding: '15px 30px',
          background: '#667eea',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

// Page temporaire pour les routes non implémentées
function ComingSoonPage({ title }: { title: string }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      textAlign: 'center',
      fontFamily: 'system-ui'
    }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚧 {title}</h1>
        <p style={{ fontSize: '1.3rem', marginBottom: '30px' }}>Cette page est en construction</p>
        <a href="/" style={{ 
          display: 'inline-block',
          padding: '15px 30px',
          background: 'white',
          color: '#764ba2',
          textDecoration: 'none',
          borderRadius: '8px',
          fontWeight: 'bold'
        }}>
          Retour à l'accueil
        </a>
      </div>
    </div>
  );
}

export default function FullApp() {
  console.log('✅ FullApp-NoLazy rendering...');
  
  const router = createBrowserRouter([
    {
      path: "/",
      element: (
        <ErrorBoundary componentName="HomePage">
          <HomePage />
        </ErrorBoundary>
      ),
    },
    // Player routes
    {
      path: "/player/dashboard",
      element: <PlayerDashboard />,
    },
    {
      path: "/player/shop",
      element: <PlayerShop />,
    },
    {
      path: "/player/shop/:gameId",
      element: (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#1a1a2e' }}>
          <div style={{ textAlign: 'center', color: 'white' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎮</div>
            <div>Chargement...</div>
          </div>
        </div>}>
          <GameDetail />
        </Suspense>
      ),
    },
    {
      path: "/player/rewards",
      element: <PlayerRewards />,
    },
    {
      path: "/player/profile",
      element: <PlayerProfile />,
    },
    {
      path: "/player/leaderboard",
      element: <PlayerLeaderboard />,
    },
    {
      path: "/player/gamification",
      element: <PlayerGamification />,
    },
    {
      path: "/player/gallery",
      element: <PlayerGallery />,
    },
    {
      path: "/player/my-purchases",
      element: <PlayerMyPurchases />,
    },
    {
      path: "/player/my-reservations",
      element: <PlayerMyReservations />,
    },
    {
      path: "/player/my-session",
      element: <PlayerMySession />,
    },
    // Admin routes
    {
      path: "/admin/dashboard",
      element: <AdminDashboard />,
    },
    {
      path: "/admin/players",
      element: <AdminPlayers />,
    },
    {
      path: "/admin/players/:id",
      element: <AdminPlayerDetail />,
    },
    {
      path: "/admin/rewards",
      element: <AdminRewards />,
    },
    {
      path: "/admin/points",
      element: <AdminPoints />,
    },
    {
      path: "/admin/shop",
      element: <AdminShop />,
    },
    {
      path: "/admin/content",
      element: <AdminContent />,
    },
    {
      path: "/admin/levels",
      element: <AdminLevels />,
    },
    {
      path: "/admin/bonuses",
      element: <AdminBonuses />,
    },
    {
      path: "/admin/sessions",
      element: <AdminSessions />,
    },
    {
      path: "/admin/invoice-scanner",
      element: <AdminInvoiceScanner />,
    },
    {
      path: "/auth/login",
      element: <LoginPage />,
    },
    {
      path: "/auth/register",
      element: <RegisterPage />,
    },
    {
      path: "/auth/forgot-password",
      element: <ForgotPasswordPage />,
    },
    {
      path: "/auth/reset-with-recovery-code",
      element: <ResetWithRecoveryCodePage />,
    },
    {
      path: "/auth/reset-help",
      element: <ResetHelpPage />,
    },
    {
      path: "/auth/reset-password/:token",
      element: <ResetPasswordPage />,
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
}
