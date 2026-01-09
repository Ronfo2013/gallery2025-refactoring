import React, { lazy, Suspense, useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CookieConsent from './components/CookieConsent';
import DynamicHead from './components/DynamicHead';
import Footer from './components/Footer';
import GtmScript from './components/GtmScript';
import Header from './components/Header';
import GlassDemoLayout from './components/layout/GlassDemoLayout';
import MetaInjector from './components/MetaInjector';
import PreloaderModern from './components/PreloaderModern';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { BrandProvider, useBrand } from './contexts/BrandContext';
import { LandingPageProvider } from './contexts/LandingPageContext';

// Lazy-loaded pages for better performance
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AlbumList = lazy(() => import('./pages/AlbumList'));
const AlbumView = lazy(() => import('./pages/AlbumView'));
const BrandDashboard = lazy(() => import('./pages/brand/BrandDashboard'));
const LandingPage = lazy(() => import('./pages/public/LandingPage'));
const SuperAdminPanel = lazy(() => import('./pages/superadmin/SuperAdminPanel'));

const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'));

// Loading fallback component
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="text-center animate-scale-in">
      <div
        className="spinner spinner-lg mb-4 mx-auto"
        style={{ borderTopColor: 'var(--brand-primary, #3b82f6)' }}
      ></div>
      <p className="text-slate-400">Caricamento...</p>
    </div>
  </div>
);

/**
 * Main App - Multi-Tenant Router
 *
 * Decides which UI to show based on brand detection:
 * - No brand detected → LandingPage (public homepage)
 * - Brand detected → Gallery with branding applied
 */
const MainApp: React.FC = () => {
  const { brand, loading: brandLoading, error } = useBrand();

  // Use BrowserRouter for clean, SEO-friendly URLs
  return (
    <BrowserRouter>
      {/* Show loading while detecting brand */}
      {brandLoading && (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center animate-scale-in">
            <div
              className="spinner spinner-lg mb-4 mx-auto"
              style={{ borderTopColor: 'var(--brand-primary, #3b82f6)' }}
            ></div>
            <p className="text-slate-400">Loading...</p>
          </div>
        </div>
      )}

      {/* Show error if brand detection failed */}
      {!brandLoading && error && (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">Error Loading Gallery</h1>
            <p className="text-slate-400">{error}</p>
          </div>
        </div>
      )}

      {/* Routes - only render when not loading and no error */}
      {!brandLoading && !error && (
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* No brand detected → Special routes + Landing/Demo */}
            {!brand && (
              <>
                <Route path="/login" element={<LoginPage />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requiredRole="cliente">
                      <BrandDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/superadmin"
                  element={
                    <ProtectedRoute requiredRole="superadmin">
                      <SuperAdminPanel />
                    </ProtectedRoute>
                  }
                />
                {/* Unbranded demo gallery: uses global albums, no brand needed */}
                <Route
                  path="/demo"
                  element={
                    <>
                      <MetaInjector />
                      <DynamicHead />
                      <GlassDemoLayout>
                        <AlbumList />
                      </GlassDemoLayout>
                    </>
                  }
                />
                {/* Unbranded album view for demo */}
                <Route
                  path="/album/:albumId"
                  element={
                    <>
                      <MetaInjector />
                      <DynamicHead />
                      <GlassDemoLayout>
                        <AlbumView />
                      </GlassDemoLayout>
                    </>
                  }
                />
                <Route path="*" element={<LandingPage />} />
              </>
            )}

            {/* Brand detected → Gallery with branding */}
            {brand && (
              <>
                {/* Brand gallery list: /{brandSlug} */}
                <Route
                  path="/*"
                  element={
                    <>
                      <MetaInjector />
                      <DynamicHead />
                      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200 text-slate-900 font-sans flex flex-col animate-fade-in">
                        <Header />
                        <main className="container-xl mx-auto px-4 md:px-6 py-10 flex-grow">
                          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/10 p-4 md:p-8">
                            <AlbumList />
                          </div>
                        </main>
                        <Footer />
                        <CookieConsent />
                        <GtmScript />
                      </div>
                    </>
                  }
                />
                {/* Album detail: /{brandSlug}/{albumId} */}
                <Route
                  path="/:brandSlug/:albumId"
                  element={
                    <>
                      <MetaInjector />
                      <DynamicHead />
                      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-200 text-slate-900 font-sans flex flex-col animate-fade-in">
                        <Header />
                        <main className="container-xl mx-auto px-4 md:px-6 py-10 flex-grow">
                          <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-xl shadow-slate-900/10 p-4 md:p-8">
                            <AlbumView />
                          </div>
                        </main>
                        <Footer />
                        <CookieConsent />
                        <GtmScript />
                      </div>
                    </>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <>
                      <MetaInjector />
                      <DynamicHead />
                      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col animate-fade-in">
                        <Header />
                        <main className="container-xl mx-auto px-6 py-8 flex-grow">
                          <AdminPanel />
                        </main>
                        <Footer />
                        <CookieConsent />
                        <GtmScript />
                      </div>
                    </>
                  }
                />
              </>
            )}
          </Routes>
        </Suspense>
      )}
    </BrowserRouter>
  );
};

const AppWithPreloader: React.FC = () => {
  const { loading } = useAppContext();
  const { brand } = useBrand();
  const [showPreloader, setShowPreloader] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Don't show preloader if no brand (Landing Page)
    if (!brand) {
      setShowPreloader(false);
      return;
    }

    // Simula progresso di caricamento
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    const minPreloadTime = 2000;
    const startTime = Date.now();

    const checkCanHidePreloader = () => {
      const elapsedTime = Date.now() - startTime;
      const hasMinTimePassed = elapsedTime >= minPreloadTime;
      const isDataLoaded = !loading && progress >= 100;

      if (hasMinTimePassed && isDataLoaded) {
        setShowPreloader(false);
      } else {
        setTimeout(checkCanHidePreloader, 100);
      }
    };

    checkCanHidePreloader();

    return () => clearInterval(progressInterval);
  }, [loading, progress, brand]);

  // Show modern preloader during loading ONLY for branded galleries
  if (showPreloader && brand) {
    return <PreloaderModern variant="linear" progress={progress} />;
  }

  return <MainApp />;
};

/**
 * Root App Component
 *
 * Wraps everything with BrandProvider for multi-tenant support
 * and AppProvider for gallery state management
 */
const App: React.FC = () => {
  return (
    <BrandProvider>
      <LandingPageProvider>
        <AppProvider>
          <AppWithPreloader />
        </AppProvider>
      </LandingPageProvider>
    </BrandProvider>
  );
};

export default App;
