import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// --- Shared mocks -----------------------------------------------------------

// Mock react-hot-toast used in admin panels
vi.mock('react-hot-toast', () => {
  const toastImpl: any = Object.assign(() => {}, {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
    dismiss: vi.fn(),
  });

  const Toaster = () => null;

  return {
    __esModule: true,
    default: toastImpl,
    toast: toastImpl,
    Toaster,
  };
});

// --- Landing route (public homepage) ----------------------------------------

vi.mock('../contexts/LandingPageContext', () => ({
  useLandingPage: () => ({
    error: null,
    settings: {
      hero: {
        title: 'Landing Test Hero',
        subtitle: 'Subheading',
        ctaText: 'Call to Action',
        ctaUrl: '#',
      },
      features: {
        title: 'Features',
        subtitle: 'Why choose us',
        items: [],
      },
      gallery: null,
      pricing: {
        title: 'Pricing',
        subtitle: 'Choose your plan',
        plans: [],
      },
      testimonials: {
        enabled: false,
        title: '',
        items: [],
      },
      footer: {
        companyName: 'Test Company',
        tagline: 'Test Tagline',
        social: {},
        contact: { email: 'info@test.com' },
        links: [],
        copyright: '© Test',
      },
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
      },
      seo: {
        title: 'Landing SEO Title',
        description: 'SEO description',
        keywords: ['test'],
      },
    },
  }),
}));

import LandingPage from '../pages/public/LandingPage';

// --- Demo Gallery route -----------------------------------------------------

vi.mock('../contexts/AppContext', () => ({
  useAppContext: () => ({
    albums: [
      {
        id: 'demo-1',
        title: 'Demo Album Route Test',
        coverPhotoUrl: '',
        photos: [],
      },
    ],
    loading: false,
    siteSettings: {
      appName: 'Test App',
      logoUrl: null,
      navLinks: [],
      whatsappNumber: '',
    },
  }),
}));

vi.mock('../contexts/BrandContext', () => ({
  useBrand: () => ({
    brand: null,
    loading: false,
    error: null,
    refreshBrand: vi.fn(),
  }),
}));

import AlbumList from '../pages/AlbumList';

// --- Brand Admin route (/dashboard) ----------------------------------------

vi.mock('../hooks/useFirebaseAuth', () => ({
  useFirebaseAuth: () => ({
    user: { uid: 'user-1', email: 'owner@test.com' },
    isAuthenticated: true,
    isLoading: false,
    login: vi.fn(),
    logout: vi.fn(),
    resetPassword: vi.fn(),
  }),
}));

vi.mock('../contexts/MultiBrandContext', () => {
  const brand = {
    id: 'brand-1',
    name: 'Test Brand Admin',
    slug: 'test-brand-admin',
    subdomain: 'test-brand-admin',
    status: 'active',
    subscription: {
      stripeCustomerId: '',
      status: 'active',
      currentPeriodEnd: new Date(),
    },
    branding: {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
    },
    ownerEmail: 'owner@test.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    useMultiBrand: () => ({
      superUser: null,
      brands: [brand],
      currentBrand: brand,
      loading: false,
      error: null,
      switchBrand: vi.fn(),
      refreshBrands: vi.fn(),
    }),
    MultiBrandProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

import BrandDashboard from '../pages/brand/BrandDashboard';

// --- SuperAdmin route (/superadmin) ----------------------------------------

vi.mock('../services/platform/platformService', () => {
  const now = new Date();
  return {
    getPlatformSettings: vi.fn(async () => ({
      systemName: 'Test SaaS',
      systemVersion: '1.0.0',
      systemStatus: 'operational',
      seo: {
        metaTitle: 'Test SaaS',
        metaDescription: 'Test',
        metaKeywords: 'test',
        ogImage: undefined,
        structuredData: '{}',
        aiSearchOptimization: {
          enabled: false,
          summaryText: '',
          keyFeatures: [],
          targetAudience: '',
        },
      },
      company: {
        name: 'Test Co',
        email: 'admin@test.com',
      },
      stripe: {
        priceId: '',
        productId: '',
        webhookConfigured: false,
        testMode: true,
      },
      pricing: {
        monthlyPrice: 10,
        currency: 'EUR',
        trialDays: 0,
        features: [],
      },
      alerts: {
        criticalErrors: 0,
        emailNotifications: false,
        notificationEmail: '',
      },
      analytics: {
        totalBrands: 0,
        activeBrands: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
      },
      features: {
        allowSignup: true,
        allowCustomDomains: false,
        allowGoogleOAuth: false,
        maintenanceMode: false,
      },
      createdAt: now,
      updatedAt: now,
    })),
    getSystemHealth: vi.fn(async () => ({
      status: 'healthy',
      uptime: 99.9,
      responseTime: 100,
      errorRate: 0.1,
      activeUsers: 1,
      cloudRunStatus: 'running',
      firestoreStatus: 'operational',
      storageStatus: 'operational',
      functionsStatus: 'operational',
      lastCheck: now,
    })),
    getRecentActivityLogs: vi.fn(async () => []),
    updateAnalytics: vi.fn(async () => {}),
    updatePlatformSettings: vi.fn(async () => {}),
    isSuperAdmin: vi.fn(async () => true),
  };
});

vi.mock('../components/landing-editor/LandingPageEditor', () => ({
  LandingPageEditor: () => <div>Landing Editor Stub</div>,
}));

import SuperAdminPanel from '../pages/superadmin/SuperAdminPanel';

// --- Tests ------------------------------------------------------------------

describe('Main routes smoke tests', () => {
  it('renders Landing page content', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );
    expect(screen.getByText('Landing Test Hero')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
  });

  it('renders Demo Gallery albums list', () => {
    render(
      <MemoryRouter>
        <AlbumList />
      </MemoryRouter>
    );
    expect(screen.getByText('Demo Album Route Test')).toBeInTheDocument();
  });

  it('renders Brand Admin dashboard with brand name', () => {
    render(
      <MemoryRouter>
        <BrandDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Brand Admin')).toBeInTheDocument();
    expect(screen.getByText('Overview')).toBeInTheDocument();
  });

  it('renders SuperAdmin panel header', async () => {
    render(
      <MemoryRouter>
        <SuperAdminPanel />
      </MemoryRouter>
    );
    expect(screen.getByText(/SuperAdmin Panel/)).toBeInTheDocument();
  });
});
