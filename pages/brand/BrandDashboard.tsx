/**
 * Brand Dashboard - Professional Multi-Brand SaaS Dashboard
 *
 * Complete redesign with:
 * - Modern design system
 * - Toast notifications
 * - Loading states
 * - Professional UX
 *
 * @author Gallery2025 Team
 * @version 2.0.0
 */

import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useMultiBrand, MultiBrandProvider } from '../../contexts/MultiBrandContext';
import { Toaster, toast } from 'react-hot-toast';
import {
  LogOutIcon,
  ExternalLinkIcon,
  LayoutDashboardIcon,
  FolderIcon,
  PaletteIcon,
  SettingsIcon,
} from 'lucide-react';
import { LoadingOverlay, Button, Badge } from '../../src/components/ui';
import { BrandSelector } from '../../components/brand/BrandSelector';
import AdminLogin from '../../components/AdminLogin';
import DashboardOverview from './DashboardOverview';
import AlbumsManager from './tabs/AlbumsManager';
import BrandingTab from './tabs/BrandingTab';
import SettingsTab from './tabs/SettingsTab';

type TabType = 'overview' | 'albums' | 'branding' | 'settings';

interface BrandDashboardContentProps {
  isAuthenticated: boolean;
  authLoading: boolean;
  logout: () => Promise<void>;
}

// Inner component that uses MultiBrandContext
const BrandDashboardContent: React.FC<BrandDashboardContentProps> = ({
  isAuthenticated,
  authLoading,
  logout,
}) => {
  const { currentBrand: brand, brands, loading: brandLoading, switchBrand } = useMultiBrand();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const handleBrandChange = async (brandId: string) => {
    try {
      await switchBrand(brandId);
      toast.success('Brand switched successfully!');
      // Optionally reload the page to refresh all data
      // window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch brand');
    }
  };

  // Listen for tab switch events from QuickActions
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      setActiveTab(e.detail as TabType);
    };
    window.addEventListener('switchTab', handleSwitchTab);
    return () => window.removeEventListener('switchTab', handleSwitchTab);
  }, []);

  // Loading state
  if (authLoading || brandLoading) {
    return <LoadingOverlay message="Loading dashboard..." />;
  }

  // Not authenticated - this should not happen as authentication is checked in parent
  // But keeping as fallback
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center slide-up">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="heading-md text-gray-900 mb-2">Session Expired</h2>
          <p className="text-muted mb-6">Your session has expired. Please refresh the page.</p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  // Brand not loaded (even after mock) - should not happen on localhost
  if (!brand) {
    // Only show loading if we're not on localhost (where we have a mock)
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return <LoadingOverlay message="Loading brand data..." />;
    }
    // On localhost, if still no brand, something went wrong
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="heading-md text-gray-900 mb-2">Brand Not Found</h2>
          <p className="text-muted mb-6">Unable to load brand data for this domain.</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      window.location.href = '/';
    } catch {
      toast.error('Error logging out');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboardIcon className="w-4 h-4" /> },
    { id: 'albums', label: 'Albums', icon: <FolderIcon className="w-4 h-4" /> },
    { id: 'branding', label: 'Branding', icon: <PaletteIcon className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1f2937',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            borderRadius: '0.5rem',
            padding: '1rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Brand Info & Selector */}
            <div className="flex items-center gap-4">
              {brand.branding?.logo && (
                <img
                  src={brand.branding?.logo}
                  alt={brand.name}
                  className="h-10 w-10 rounded-lg object-cover shadow-sm"
                />
              )}

              {/* Brand Selector (shows only if multiple brands) */}
              <BrandSelector
                currentBrandId={brand.id}
                userBrandIds={brands.map((b) => b.id)}
                onBrandChange={handleBrandChange}
              />

              {/* If only one brand, show name directly */}
              {brands.length === 1 && (
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
                  <p className="text-sm text-gray-500">{brand.subdomain}</p>
                </div>
              )}

              <Badge variant={brand.subscription.status === 'active' ? 'success' : 'error'}>
                {brand.subscription.status}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                icon={<ExternalLinkIcon className="w-4 h-4" />}
                onClick={() => window.open(`https://${brand.subdomain}`, '_blank')}
              >
                View Gallery
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<LogOutIcon className="w-4 h-4" />}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container-xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`
                  px-6 py-3 font-medium transition-all duration-200 flex items-center gap-2
                  ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container-xl mx-auto px-6 py-8">
        {activeTab === 'overview' && <DashboardOverview brand={brand} />}
        {activeTab === 'albums' && <AlbumsManager brandId={brand.id} />}
        {activeTab === 'branding' && <BrandingTab brand={brand} />}
        {activeTab === 'settings' && <SettingsTab brand={brand} />}
      </main>
    </div>
  );
};

// Main component that wraps with MultiBrandProvider
const BrandDashboardNew: React.FC = () => {
  const { user, isAuthenticated, login, logout, resetPassword, isLoading: authLoading } = useFirebaseAuth();

  // Loading state
  if (authLoading) {
    return <LoadingOverlay message="Authenticating..." />;
  }

  // Not authenticated - show login form
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="heading-md text-gray-900 mb-2">Brand Dashboard</h2>
            <p className="text-muted">Login to manage your gallery</p>
          </div>
          <AdminLogin onLogin={login} onResetPassword={resetPassword} />
        </div>
      </div>
    );
  }

  // Authenticated - wrap with MultiBrandProvider
  return (
    <MultiBrandProvider userId={user.uid}>
      <BrandDashboardContent
        isAuthenticated={isAuthenticated}
        authLoading={authLoading}
        logout={logout}
      />
    </MultiBrandProvider>
  );
};

export default BrandDashboardNew;
