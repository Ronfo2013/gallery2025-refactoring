import React, { useEffect, useState } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import CookieConsent from './components/CookieConsent';
import DynamicHead from './components/DynamicHead';
import Footer from './components/Footer';
import GtmScript from './components/GtmScript';
import Header from './components/Header';
import MetaInjector from './components/MetaInjector';
import PreloaderModern from './components/PreloaderModern';
import { AppProvider, useAppContext } from './context/AppContext';
import { BrandProvider, useBrand } from './contexts/BrandContext';
import { LandingPageProvider } from './contexts/LandingPageContext';
import AdminPanel from './pages/AdminPanel';
import AlbumList from './pages/AlbumListNew';
import AlbumView from './pages/AlbumViewNew';
import BrandDashboard from './pages/brand/BrandDashboardNew';
import LandingPageNew from './pages/public/LandingPageNew';
import SuperAdminPanel from './pages/superadmin/SuperAdminPanel';

/**
 * Main App - Multi-Tenant Router
 *
 * Decides which UI to show based on brand detection:
 * - No brand detected → LandingPage (public homepage)
 * - Brand detected → Gallery with branding applied
 */
const MainApp: React.FC = () => {
  const { brand, loading: brandLoading, error } = useBrand();

  // Always use HashRouter to preserve the hash during loading
  return (
    <HashRouter>
      {/* Show loading while detecting brand */}
      {brandLoading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center animate-scale-in">
            <div
              className="spinner spinner-lg mb-4 mx-auto"
              style={{ borderTopColor: 'var(--primary-500)' }}
            ></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )}

      {/* Show error if brand detection failed */}
      {!brandLoading && error && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Gallery</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      )}

      {/* Routes - only render when not loading and no error */}
      {!brandLoading && !error && (
        <Routes>
          {/* No brand detected → Special routes + Landing Page */}
          {!brand && (
            <>
              <Route path="/dashboard" element={<BrandDashboard />} />
              <Route path="/superadmin" element={<SuperAdminPanel />} />
              <Route path="*" element={<LandingPageNew />} />
            </>
          )}

          {/* Brand detected → Gallery with branding */}
          {brand && (
            <>
              {/* Main gallery route - also handles /demo when demo brand is loaded */}
              <Route
                path="/"
                element={
                  <>
                    <MetaInjector />
                    <DynamicHead />
                    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col animate-fade-in">
                      <Header />
                      <main className="container-xl mx-auto px-6 py-8 flex-grow">
                        <AlbumList />
                      </main>
                      <Footer />
                      <CookieConsent />
                      <GtmScript />
                    </div>
                  </>
                }
              />
              <Route
                path="/album/:albumId"
                element={
                  <>
                    <MetaInjector />
                    <DynamicHead />
                    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col animate-fade-in">
                      <Header />
                      <main className="container-xl mx-auto px-6 py-8 flex-grow">
                        <AlbumView />
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
              <Route
                path="/dashboard"
                element={
                  <>
                    <MetaInjector />
                    <DynamicHead />
                    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col animate-fade-in">
                      <Header />
                      <main className="container-xl mx-auto px-6 py-8 flex-grow">
                        <BrandDashboard />
                      </main>
                      <Footer />
                      <CookieConsent />
                      <GtmScript />
                    </div>
                  </>
                }
              />
              <Route
                path="/superadmin"
                element={
                  <>
                    <MetaInjector />
                    <DynamicHead />
                    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col animate-fade-in">
                      <Header />
                      <main className="container-xl mx-auto px-6 py-8 flex-grow">
                        <SuperAdminPanel />
                      </main>
                      <Footer />
                      <CookieConsent />
                      <GtmScript />
                    </div>
                  </>
                }
              />
              {/* Catch-all route for /demo and other paths - render AlbumList */}
              <Route
                path="*"
                element={
                  <>
                    <MetaInjector />
                    <DynamicHead />
                    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col animate-fade-in">
                      <Header />
                      <main className="container-xl mx-auto px-6 py-8 flex-grow">
                        <AlbumList />
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
      )}
    </HashRouter>
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
