import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { lazy, Suspense } from 'react';
import MainLayout from '@/components/layouts/MainLayout';
import AuthLayout from '@/components/layouts/AuthLayout';
import { LoginPage, VerifyOtpPage, PartnerSignupPage } from '@/pages/AuthPages';

// Lazy load pages for code splitting
const HomePage = lazy(() => import('@/pages/HomePage'));
const ExplorePage = lazy(() => import('@/pages/ExplorePage'));
const BookingsPage = lazy(() => import('@/pages/BookingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const PartnerPage = lazy(() => import('@/pages/PartnerPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors expand={false} duration={3000} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/login/verify" element={<VerifyOtpPage />} />
            <Route path="/partner-signup" element={<PartnerSignupPage />} />
          </Route>

          {/* Main App Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/partner/:id" element={<PartnerPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
