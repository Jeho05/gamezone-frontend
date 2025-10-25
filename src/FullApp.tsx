import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';

// Import direct de la page d'accueil MINIMALE (sans composants complexes)
import HomePage from './app/page-minimal';

// Lazy load des autres pages pour éviter les erreurs de chargement initial
const LoginPage = lazy(() => import('./app/auth/login/page'));
const RegisterPage = lazy(() => import('./app/auth/register/page'));

const PlayerDashboard = lazy(() => import('./app/player/dashboard/page'));
const PlayerProfile = lazy(() => import('./app/player/profile/page'));
const PlayerShop = lazy(() => import('./app/player/shop/page'));
const PlayerRewards = lazy(() => import('./app/player/rewards/page'));
const PlayerLeaderboard = lazy(() => import('./app/player/leaderboard/page'));
const PlayerProgression = lazy(() => import('./app/player/progression/page'));
const PlayerGallery = lazy(() => import('./app/player/gallery/page'));
const PlayerMySession = lazy(() => import('./app/player/my-session/page'));
const PlayerMyReservations = lazy(() => import('./app/player/my-reservations/page'));
const PlayerMyInvoices = lazy(() => import('./app/player/my-invoices/page'));
const PlayerMyPurchases = lazy(() => import('./app/player/my-purchases/page'));
const PlayerGamification = lazy(() => import('./app/player/gamification/page'));
const PlayerConvertPoints = lazy(() => import('./app/player/convert-points/page'));

const AdminDashboard = lazy(() => import('./app/admin/dashboard/page'));
const AdminPlayers = lazy(() => import('./app/admin/players/page'));
const AdminSessions = lazy(() => import('./app/admin/sessions/page'));
const AdminActiveSessions = lazy(() => import('./app/admin/active-sessions/page'));
const AdminRewards = lazy(() => import('./app/admin/rewards/page'));
const AdminShop = lazy(() => import('./app/admin/shop/page'));
const AdminContent = lazy(() => import('./app/admin/content/page'));
const AdminBonuses = lazy(() => import('./app/admin/bonuses/page'));
const AdminLevels = lazy(() => import('./app/admin/levels/page'));
const AdminPoints = lazy(() => import('./app/admin/points/page'));
const AdminInvoiceScanner = lazy(() => import('./app/admin/invoice-scanner/page'));

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

// Composant de chargement
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
      <p style={{ fontSize: '1.5rem' }}>Chargement...</p>
    </div>
  </div>
);

export default function FullApp() {
  return (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter basename="/">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />

              {/* Player routes */}
              <Route path="/player/dashboard" element={<PlayerDashboard />} />
              <Route path="/player/profile" element={<PlayerProfile />} />
              <Route path="/player/shop" element={<PlayerShop />} />
              <Route path="/player/rewards" element={<PlayerRewards />} />
              <Route path="/player/leaderboard" element={<PlayerLeaderboard />} />
              <Route path="/player/progression" element={<PlayerProgression />} />
              <Route path="/player/gallery" element={<PlayerGallery />} />
              <Route path="/player/my-session" element={<PlayerMySession />} />
              <Route path="/player/my-reservations" element={<PlayerMyReservations />} />
              <Route path="/player/my-invoices" element={<PlayerMyInvoices />} />
              <Route path="/player/my-purchases" element={<PlayerMyPurchases />} />
              <Route path="/player/gamification" element={<PlayerGamification />} />
              <Route path="/player/convert-points" element={<PlayerConvertPoints />} />
                <Route path="/player/shop" element={<PlayerShop />} />
                <Route path="/player/rewards" element={<PlayerRewards />} />
                <Route path="/player/leaderboard" element={<PlayerLeaderboard />} />
                <Route path="/player/progression" element={<PlayerProgression />} />
                <Route path="/player/gallery" element={<PlayerGallery />} />
                <Route path="/player/my-session" element={<PlayerMySession />} />
                <Route path="/player/my-reservations" element={<PlayerMyReservations />} />
                <Route path="/player/my-invoices" element={<PlayerMyInvoices />} />
                <Route path="/player/my-purchases" element={<PlayerMyPurchases />} />
                <Route path="/player/gamification" element={<PlayerGamification />} />
                <Route path="/player/convert-points" element={<PlayerConvertPoints />} />

                {/* Admin routes */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/players" element={<AdminPlayers />} />
                <Route path="/admin/sessions" element={<AdminSessions />} />
                <Route path="/admin/active-sessions" element={<AdminActiveSessions />} />
                <Route path="/admin/rewards" element={<AdminRewards />} />
                <Route path="/admin/shop" element={<AdminShop />} />
                <Route path="/admin/content" element={<AdminContent />} />
                <Route path="/admin/bonuses" element={<AdminBonuses />} />
                <Route path="/admin/levels" element={<AdminLevels />} />
                <Route path="/admin/points" element={<AdminPoints />} />
                <Route path="/admin/invoice-scanner" element={<AdminInvoiceScanner />} />

                {/* 404 redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
        </BrowserRouter>
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
