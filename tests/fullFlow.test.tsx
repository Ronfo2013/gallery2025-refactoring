import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// --- Firebase & external module mocks --------------------------------------

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => {
  const createUserWithEmailAndPassword = vi.fn(
    async (_auth: any, email: string, _password: string) => ({
      user: { uid: `user-${email}` },
    })
  );

  return {
    getAuth: vi.fn(() => ({})),
    connectAuthEmulator: vi.fn(),
    createUserWithEmailAndPassword,
  };
});

vi.mock('firebase/firestore', () => {
  const collections: Record<string, Map<string, any>> = {};

  const ensureCollection = (name: string): Map<string, any> => {
    if (!collections[name]) {
      collections[name] = new Map();
    }
    return collections[name];
  };

  const collection = (_db: any, name?: string) => ({
    __type: 'collection',
    name,
  });

  const doc = (arg1: any, arg2?: string, arg3?: string) => {
    // Called as doc(db, 'col', 'id')
    if (typeof arg2 === 'string' && typeof arg3 === 'string') {
      return { __type: 'doc', col: arg2, id: arg3 };
    }

    // Called as doc(collectionRef) to auto-generate id
    if (arg1 && arg1.__type === 'collection') {
      const colName = arg1.name as string;
      const id = `auto-${Math.random().toString(36).slice(2)}`;
      return { __type: 'doc', col: colName, id };
    }

    // Fallback
    return { __type: 'doc', col: 'unknown', id: 'unknown' };
  };

  const setDoc = async (ref: any, data: any) => {
    const store = ensureCollection(ref.col);
    store.set(ref.id, { ...data });
  };

  const addDoc = async (colRef: any, data: any) => {
    const store = ensureCollection(colRef.name as string);
    const id = `doc-${store.size + 1}`;
    store.set(id, { ...data });
    return { id };
  };

  const updateDoc = async (ref: any, updates: any) => {
    const store = ensureCollection(ref.col);
    const existing = store.get(ref.id) || {};
    store.set(ref.id, { ...existing, ...updates });
  };

  const where = (field: string, _op: any, value: any) => ({
    __type: 'where',
    field,
    value,
  });

  const query = (colRef: any, whereClause?: any) => ({
    __type: 'query',
    col: colRef.name,
    where: whereClause,
  });

  const getDocs = async (arg: any) => {
    // Collection reference
    if (arg && arg.__type === 'collection') {
      const store = ensureCollection(arg.name as string);
      const docsArray = Array.from(store.entries()).map(([id, data]) => ({
        id,
        data: () => data,
      }));

      return {
        empty: docsArray.length === 0,
        size: docsArray.length,
        docs: docsArray,
        forEach: (fn: (d: any) => void) => docsArray.forEach(fn),
      };
    }

    // Query with where
    if (arg && arg.__type === 'query') {
      const store = ensureCollection(arg.col as string);
      const docsArray = Array.from(store.entries())
        .filter(([_, data]) => {
          if (!arg.where) {
            return true;
          }
          return data[arg.where.field] === arg.where.value;
        })
        .map(([id, data]) => ({
          id,
          data: () => data,
        }));

      return {
        empty: docsArray.length === 0,
        size: docsArray.length,
        docs: docsArray,
        forEach: (fn: (d: any) => void) => docsArray.forEach(fn),
      };
    }

    // Fallback: empty result
    return {
      empty: true,
      size: 0,
      docs: [] as any[],
      forEach: (_fn: (d: any) => void) => {},
    };
  };

  const getDoc = async (ref: any) => {
    const store = ensureCollection(ref.col);
    const data = store.get(ref.id);
    return {
      exists: () => !!data,
      data: () => data,
      id: ref.id,
    };
  };

  const deleteDoc = async (ref: any) => {
    const store = ensureCollection(ref.col);
    store.delete(ref.id);
  };

  const serverTimestamp = () => new Date();

  class Timestamp {
    private date: Date;
    constructor(date: Date) {
      this.date = date;
    }
    toDate() {
      return this.date;
    }
    static fromDate(date: Date) {
      return new Timestamp(date);
    }
  }

  const orderBy = (..._args: any[]) => ({});
  const limitFn = (_n: number) => ({});

  return {
    collection,
    doc,
    setDoc,
    addDoc,
    deleteDoc,
    updateDoc,
    getDoc,
    getDocs,
    query,
    where,
    serverTimestamp,
    Timestamp,
    orderBy,
    limit: limitFn,
    // Expose collections for assertions
    __collections: collections,
  };
});

vi.mock('firebase/storage', () => ({
  getStorage: vi.fn(() => ({})),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  deleteObject: vi.fn(),
  connectStorageEmulator: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  getFunctions: vi.fn(() => ({})),
  connectFunctionsEmulator: vi.fn(),
  httpsCallable: vi.fn(() => vi.fn(async () => ({ data: {} }))),
}));

// Mock firebaseConfig exports used by services
vi.mock('../firebaseConfig', () => ({
  auth: {},
  db: {},
  storage: {},
  functions: {},
  default: {},
}));

// Mock BrandContext so AppContext sees a brand id
vi.mock('../contexts/BrandContext', () => ({
  useBrand: () => ({
    brand: {
      id: 'test-brand-id',
      name: 'Test Brand',
      slug: 'test-brand',
      subdomain: 'test-brand',
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
      ownerEmail: 'owner@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }),
}));

// Mock bucketService used by AppContext
vi.mock('../services/bucketService', () => {
  const initialConfig = {
    albums: [],
    siteSettings: {
      appName: 'AI Photo Gallery',
      logoUrl: null,
      footerText: '',
      navLinks: [],
      gtmId: '',
      siteUrl: '',
      whatsappNumber: '',
      seo: {
        metaTitle: 'AI Photo Gallery',
        metaDescription: 'Test config',
        metaKeywords: 'test',
        structuredData: '',
      },
      aiEnabled: false,
      geminiApiKey: '',
      preloader: {
        enabled: true,
        style: 'glassmorphism',
        backgroundColor: '#0f172a',
        primaryColor: '#14b8a6',
        secondaryColor: '#8b5cf6',
        showLogo: true,
        showProgress: true,
        customText: 'Loading...',
        animationSpeed: 'normal',
      },
    },
  };

  const getConfig = vi.fn(async () => initialConfig);

  const uploadFile = vi.fn(async () => ({
    path: 'brands/test-brand-id/uploads/file.jpg',
    url: 'https://example.com/file.jpg',
    optimizedUrl: undefined,
    thumbUrl: undefined,
    mediumUrl: undefined,
  }));

  const deleteFile = vi.fn(async () => {});

  const saveConfig = vi.fn(async (_config: any) => {});

  return {
    getConfig,
    saveConfig,
    uploadFile,
    deleteFile,
  };
});

// Mock geminiService used by AppContext
vi.mock('../services/geminiService', () => ({
  generatePhotoDescription: vi.fn(async () => 'Test description'),
  generateSeoSuggestions: vi.fn(async () => ({
    metaTitle: 'Test',
    metaDescription: 'Test',
    metaKeywords: 'test',
    structuredData: '',
  })),
  searchPhotosInAlbum: vi.fn(async () => []),
}));

// react-hot-toast is used both as default and named export
vi.mock('react-hot-toast', () => {
  const toastImpl: any = Object.assign((..._args: any[]) => {}, {
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

// --- Imports of app code under test (after mocks) ---------------------------

import * as firestoreModule from 'firebase/firestore';
import { AppProvider } from '../contexts/AppContext';
import AlbumsManager from '../pages/brand/tabs/AlbumsManager';
import BrandsManager from '../pages/superadmin/tabs/BrandsManager';
import { saveConfig as mockSaveConfigOriginal } from '../services/bucketService';

const firestoreCollections = (firestoreModule as any).__collections;
const mockSaveConfig = mockSaveConfigOriginal as any;

describe('Full platform flow', () => {
  beforeEach(() => {
    // Reset in-memory Firestore between tests
    Object.keys(firestoreCollections).forEach((key) => {
      firestoreCollections[key].clear();
    });
    mockSaveConfig.mockClear();
    cleanup();
  });

  it('allows SuperAdmin to create a brand and its admin to create an album', async () => {
    // 1) SuperAdmin creates a new brand + superuser via BrandsManager UI
    const { unmount } = render(<BrandsManager />);

    // Wait until initial loading finishes and header is visible
    await waitFor(() => expect(screen.getByText('Gestione Brand')).toBeInTheDocument());

    // Open create brand modal
    fireEvent.click(screen.getByText('Nuovo Brand'));

    // Fill form fields using placeholders (labels are not linked via htmlFor)
    fireEvent.change(screen.getByPlaceholderText('Es: Acme Photography'), {
      target: { value: 'Acme Photography' },
    });

    fireEvent.change(screen.getByPlaceholderText('acme-photo'), {
      target: { value: 'acme-photo' },
    });

    fireEvent.change(screen.getByPlaceholderText('owner@example.com'), {
      target: { value: 'owner@acme.test' },
    });

    // Submit form (second "Crea Brand" button is inside the modal form)
    const createButtons = screen.getAllByRole('button', { name: 'Crea Brand' });
    fireEvent.click(createButtons[1]);

    // Wait for brand list to show 1 item
    await waitFor(() => expect(screen.getByText(/1 brand totali/)).toBeInTheDocument());

    // Assert Firestore has one brand and one superuser linked
    const brandsStore = firestoreCollections['brands'];
    expect(brandsStore.size).toBe(1);
    const [brandId, brandData] = brandsStore.entries().next().value as [string, any];
    expect(brandData.name).toBe('Acme Photography');
    expect(brandData.ownerEmail).toBe('owner@acme.test');

    const superusersStore = firestoreCollections['superusers'];
    expect(superusersStore.size).toBe(1);
    const [_userId, userData] = superusersStore.entries().next().value as [string, any];
    expect(userData.email).toBe('owner@acme.test');
    expect(userData.brandIds).toContain(brandId);

    // Unmount SuperAdmin UI before mounting Brand dashboard
    unmount();

    // 2) Brand admin (tenant) uses AlbumsManager to create a gallery album
    const BrandAlbumsWrapper: React.FC = () => (
      <AppProvider>
        <AlbumsManager brandId={brandId} />
      </AppProvider>
    );

    render(<BrandAlbumsWrapper />);

    // Wait for Albums header
    await waitFor(() => expect(screen.getByText('Albums')).toBeInTheDocument());

    // Initially no albums in mocked config
    expect(screen.getByText('No Albums Yet')).toBeInTheDocument();

    // Create new album
    const input = screen.getByPlaceholderText(/Enter album name/i);
    fireEvent.change(input, { target: { value: 'Opening Night' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create Album' }));

    // Wait for album to appear in list
    await waitFor(() => expect(screen.getByText('Opening Night')).toBeInTheDocument());

    // Ensure configuration save was triggered at least once
    expect(mockSaveConfig).toHaveBeenCalled();
  });

  it('reuses existing superuser when creating another brand with same email', async () => {
    render(<BrandsManager />);

    // Initial header
    await waitFor(() => expect(screen.getByText('Gestione Brand')).toBeInTheDocument());

    const createBrand = async (name: string, slug: string, email: string) => {
      // Open create brand modal
      fireEvent.click(screen.getByText('Nuovo Brand'));

      // Fill form fields
      fireEvent.change(screen.getByPlaceholderText('Es: Acme Photography'), {
        target: { value: name },
      });

      fireEvent.change(screen.getByPlaceholderText('acme-photo'), {
        target: { value: slug },
      });

      fireEvent.change(screen.getByPlaceholderText('owner@example.com'), {
        target: { value: email },
      });

      // Submit form using the submit button inside the create brand form
      const submitButton = screen.getAllByRole('button', { name: 'Crea Brand' }).pop();
      if (submitButton) {
        fireEvent.click(submitButton);
      }
    };

    // 1) Create first brand for this email
    await createBrand('Brand One', 'brand-one', 'owner@acme.test');
    await waitFor(() => expect(screen.getByText(/1 brand totali/)).toBeInTheDocument());

    // 2) Create second brand with the same email
    await createBrand('Brand Two', 'brand-two', 'owner@acme.test');
    await waitFor(() => expect(screen.getByText(/2 brands totali/)).toBeInTheDocument());

    // Firestore expectations
    const brandsStore = firestoreCollections['brands'];
    expect(brandsStore.size).toBe(2);

    const superusersStore = firestoreCollections['superusers'];
    expect(superusersStore.size).toBe(1);

    const [_userId, userData] = superusersStore.entries().next().value as [string, any];
    expect(userData.email).toBe('owner@acme.test');
    expect(Array.isArray(userData.brandIds)).toBe(true);
    expect(userData.brandIds.length).toBe(2);
  });
});
