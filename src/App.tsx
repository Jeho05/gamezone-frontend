import { StrictMode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import RootLayout from './app/layout';

// Import pages
import HomePage from './app/page';

// Import auth pages
import LoginPage from './app/auth/login/page';
import RegisterPage from './app/auth/register/page';
import ForgotPasswordPage from './app/auth/forgot-password/page';
import ResetPasswordPage from './app/auth/reset-password/[token]/page';

// Import player pages
import PlayerDashboard from './app/player/dashboard/page';
import PlayerProfile from './app/player/profile/page';
import PlayerShop from './app/player/shop/page';
import PlayerRewards from './app/player/rewards/page';
import PlayerLeaderboard from './app/player/leaderboard/page';
import PlayerProgression from './app/player/progression/page';
import PlayerGallery from './app/player/gallery/page';
import PlayerMySession from './app/player/my-session/page';
import PlayerMyReservations from './app/player/my-reservations/page';
import PlayerMyInvoices from './app/player/my-invoices/page';
import PlayerMyPurchases from './app/player/my-purchases/page';
import PlayerGamification from './app/player/gamification/page';
import PlayerConvertPoints from './app/player/convert-points/page';

// Import admin pages
import AdminDashboard from './app/admin/dashboard/page';
import AdminPlayers from './app/admin/players/page';
import AdminSessions from './app/admin/sessions/page';
import AdminActiveSessions from './app/admin/active-sessions/page';
import AdminRewards from './app/admin/rewards/page';
import AdminShop from './app/admin/shop/page';
import AdminContent from './app/admin/content/page';
import AdminBonuses from './app/admin/bonuses/page';
import AdminLevels from './app/admin/levels/page';
import AdminPoints from './app/admin/points/page';
import AdminInvoiceScanner from './app/admin/invoice-scanner/page';

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

export default function App() {
  return (
    <StrictMode>
      <ChakraProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <RootLayout>
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/auth/reset-password/:token" element={<ResetPasswordPage />} />

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
            </RootLayout>
          </BrowserRouter>
          <Toaster position="top-right" />
        </QueryClientProvider>
      </ChakraProvider>
    </StrictMode>
  );
}
