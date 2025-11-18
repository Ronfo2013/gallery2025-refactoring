import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { BrandProvider, useBrand } from './contexts/BrandContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AlbumList from './pages/AlbumList';
import AlbumView from './pages/AlbumView';
import AdminPanel from './pages/AdminPanel';
import BrandDashboard from './pages/brand/BrandDashboard';
import Preloader from './components/Preloader';
import GlassmorphismPreloader from './components/GlassmorphismPreloader';
import MetaInjector from './components/MetaInjector';
import DynamicHead from './components/DynamicHead';
import CookieConsent from './components/CookieConsent';
import GtmScript from './components/GtmScript';
import LandingPage from './pages/public/LandingPage';

/**
 * Main App - Multi-Tenant Router
 * 
 * Decides which UI to show based on brand detection:
 * - No brand detected → LandingPage (public homepage)
 * - Brand detected → Gallery with branding applied
 */
const MainApp: React.FC = () => {
  const { brand, loading: brandLoading, error } = useBrand();

  // Show loading while detecting brand
  if (brandLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if brand detection failed
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Error Loading Gallery</h1>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  // No brand detected → Show Landing Page
  if (!brand) {
    return <LandingPage />;
  }

  // Brand detected → Show Gallery with branding
  return (
    <HashRouter>
      <MetaInjector />
      <DynamicHead />
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col animate-fade-in">
        <Header />
        <main className="container mx-auto p-4 md:p-6 flex-grow">
          <Routes>
            <Route path="/" element={<AlbumList />} />
            <Route path="/album/:albumId" element={<AlbumView />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<BrandDashboard />} />
          </Routes>
        </main>
        <Footer />
        <CookieConsent />
        <GtmScript />
      </div>
    </HashRouter>
  );
};

const AppWithPreloader: React.FC = () => {
  const { loading, siteSettings } = useAppContext();
  const [showPreloader, setShowPreloader] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula progresso di caricamento
    const progressInterval = setInterval(() => {
      setProgress(prev => {
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
  }, [loading, progress]);

  if (showPreloader && siteSettings.preloader?.enabled && siteSettings.preloader) {
    return (
      <GlassmorphismPreloader 
        appName={siteSettings.appName} 
        logoUrl={siteSettings.logoUrl}
        progress={progress}
        settings={siteSettings.preloader}
      />
    );
  }

  // Fallback to simple preloader if disabled
  if (showPreloader) {
    return (
      <Preloader 
        appName={siteSettings.appName} 
        logoUrl={siteSettings.logoUrl} 
      />
    );
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
      <AppProvider>
        <AppWithPreloader />
      </AppProvider>
    </BrandProvider>
  );
};

export default App;