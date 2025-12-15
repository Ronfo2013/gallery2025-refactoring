# 📋 Piano di Miglioramento Gallery2025

> **Data Analisi**: 2025-12-03
> **Status Progetto**: MVP 95% Completo
> **Versione**: 1.0.0

---

## 📊 Executive Summary

Gallery2025 è un SaaS multi-brand maturo e ben architettato con sistema end-to-end funzionante. Il progetto ha raggiunto il 95% di completamento MVP ed è pronto per production dopo fix di sicurezza critici (stimati 4-6 ore).

### Metriche Codebase
- **Linee di codice**: ~9,106 (TypeScript/JavaScript)
- **Componenti React**: 27+
- **Services**: 10+
- **Cloud Functions**: 4
- **Dipendenze**: 53 production, 24 dev
- **Documentazione**: 35 file Markdown
- **TypeScript Coverage**: ~90%

---

## ✅ Punti di Forza

### Architettura
- ✅ Multi-tenancy ben implementato (brand isolation, storage segregato)
- ✅ Service Layer Pattern con separazione business logic/UI
- ✅ Context API usage appropriato
- ✅ Dynamic branding innovativo (CSS variables)
- ✅ Cloud Functions ottimizzate (WebP, thumbnails automatici)

### Stack Tecnologico
- ✅ React 19 + TypeScript 5.8 (ultime versioni)
- ✅ Firebase completo (Firestore, Storage, Auth, Functions)
- ✅ Stripe integration robusta con webhook
- ✅ Docker multi-stage build ottimizzato
- ✅ CI/CD ready (cloudbuild.yaml)

### DevOps & Quality
- ✅ ESLint + Prettier configurati
- ✅ Git hooks (Husky + Commitlint)
- ✅ Testing framework setup (Vitest)
- ✅ Environment variables ben gestite
- ✅ Documentazione eccellente

---

## 🚨 Problemi Identificati

### Critici (Security) - 3 issues
1. Firestore Rules troppo permissive
2. Legacy Gallery Collection aperta
3. 189 Console.log in production

### Alti (Architecture) - 3 issues
4. Codice duplicato (file *New.tsx)
5. Gestione errori inconsistente
6. Context directory duplicato

### Medi (Performance & UX) - 9 issues
7. No code splitting
8. Image optimization solo backend-side
9. No loading skeleton
10. Hash routing workaround
11. Loading states incompleti (signup/pagamento)
12. Notifiche Toast inconsistenti
13. Empty states non amichevoli
14. Gestione errori UI migliorabile
15. Tour onboarding mancante

### Bassi (Code Quality) - 5 issues
16. TypeScript strictness incompleto
17. Testing coverage basso
18. Accessibility issues
19. Magic numbers & strings
20. Documentazione API incompleta

---

## 🎯 Piano di Intervento

### ⚡ FASE 1: Security Hardening (PRIORITÀ MASSIMA)
**Tempo Stimato**: 4-6 ore
**Obiettivo**: Rendere l'app production-ready dal punto di vista sicurezza

#### Task 1.1: Firestore Rules Hardening
**File**: `firestore.rules`
**Linee**: 76-77, 93-99

**Problema**:
```javascript
match /brands/{brandId} {
  allow read, write: if true;  // PERICOLOSO
}

match /gallery/{document=**} {
  allow write: if true;  // PERICOLOSO
}
```

**Soluzione**:
```javascript
match /brands/{brandId} {
  allow read: if resource.data.isPublic == true || isBrandOwner(brandId) || isSuperAdmin();
  allow write: if isBrandOwner(brandId) || isSuperAdmin();

  match /albums/{albumId} {
    allow read: if isAlbumPublic(brandId, albumId) || isBrandOwner(brandId) || isSuperAdmin();
    allow write: if isBrandOwner(brandId) || isSuperAdmin();
  }
}

match /gallery/{document=**} {
  allow read: if true;
  allow write: if isSuperAdmin();  // Solo SuperAdmin
}
```

**Impatto**: CRITICO - Previene modifiche non autorizzate ai brand
**Rischio**: Alto se non fixato
**Test**: Verificare accesso con utenti non autenticati, brand owner, superadmin

---

#### Task 1.2: Logger Production-Ready
**File**: Creare `src/utils/logger.ts`

**Problema**: 189 occorrenze di `console.log/warn/error` nel codebase

**Soluzione**:
```typescript
// src/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isDevelopment = import.meta.env.DEV;

  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  error(message: string, error?: Error, ...args: any[]) {
    console.error(`[ERROR] ${message}`, error, ...args);
    // TODO: Inviare a Sentry in production
  }
}

export const logger = new Logger();
```

**Azioni**:
1. Creare `src/utils/logger.ts`
2. Cercare e sostituire:
   - `console.log` → `logger.debug`
   - `console.info` → `logger.info`
   - `console.warn` → `logger.warn`
   - `console.error` → `logger.error`
3. Configurare ESLint rule: `no-console: error`

**Impatto**: ALTO - Previene leak di informazioni sensibili
**Test**: Verificare nessun console.log in production build

---

#### Task 1.3: Environment Variables Audit
**Files**: `.env`, `.env.example`, codice sorgente

**Azioni**:
1. ✅ Verificare `.gitignore` include `.env`
2. ✅ Audit grep per API keys hardcoded: `grep -r "AIza" --include="*.ts" --include="*.tsx"`
3. ✅ Verificare secrets in Cloud Functions env
4. ✅ Validare `.env.example` è aggiornato
5. ✅ Documentare tutte le env vars richieste

**Comando Audit**:
```bash
# Cercare potenziali secrets
grep -rE "(api[_-]?key|secret|password|token)" --include="*.ts" --include="*.tsx" src/
```

**Impatto**: CRITICO
**Test**: Build production non deve contenere secrets

---

### 📋 FASE 2: Code Quality & Deduplication (1-2 settimane)
**Tempo Stimato**: 20-30 ore
**Obiettivo**: Eliminare debito tecnico e migliorare manutenibilità

#### Task 2.1: Code Deduplication
**File duplicati da risolvere**:
- `src/pages/AlbumList.tsx` vs `AlbumListNew.tsx`
- `src/pages/AlbumView.tsx` vs `AlbumViewNew.tsx`
- `src/pages/brand/BrandDashboard.tsx` vs `BrandDashboardNew.tsx`
- `src/pages/public/LandingPage.tsx` vs `LandingPageNew.tsx`

**Processo**:
1. Comparare differenze tra versioni (file vs file_New)
2. Decidere versione definitiva (preferire `*New.tsx` se più aggiornate)
3. Migrare eventuali fix dalla vecchia alla nuova
4. Aggiornare imports in `App.tsx` e altri componenti
5. Eliminare file vecchi
6. Test funzionale completo

**Impatto**: ALTO - Riduce confusione e manutenzione
**Rischio**: Medio - Possibili breaking changes
**Rollback Plan**: Git branch dedicato

---

#### Task 2.2: Error Handling Standardization
**File**: Creare `src/utils/errorHandler.ts`

**Problema**: Pattern inconsistenti (alcuni servizi ritornano null, altri throw)

**Soluzione**:
```typescript
// src/utils/errorHandler.ts
import { logger } from './logger';
import toast from 'react-hot-toast';

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown, showToast: boolean = true): AppError {
  let appError: AppError;

  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    appError = new AppError(error.message, 'UNKNOWN_ERROR');
  } else {
    appError = new AppError('Si è verificato un errore', 'UNKNOWN_ERROR');
  }

  logger.error(appError.message, appError);

  if (showToast) {
    toast.error(appError.message);
  }

  return appError;
}

// Wrapper per async functions
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    handleError(error);
    return null;
  }
}
```

**Azioni**:
1. Creare `errorHandler.ts`
2. Standardizzare tutti i services per usare `AppError`
3. Aggiungere toast notifications consistenti
4. Documentare error codes

**Impatto**: ALTO - UX migliore e debugging più facile

---

#### Task 2.3: Context Directory Consolidation
**Problema**: `/context/` e `/contexts/` coesistono

**Azioni**:
1. Spostare `src/context/AppContext.tsx` → `src/contexts/AppContext.tsx`
2. Aggiornare tutti gli imports
3. Eliminare directory `src/context/`
4. Verificare nessun import rotto

**Impatto**: BASSO - Organizzazione
**Tempo**: 30 minuti

---

### ⚡ FASE 3: Performance Optimization (1 mese)
**Tempo Stimato**: 40-50 ore
**Obiettivo**: Lighthouse score 90+, migliorare UX percepita

#### Task 3.1: Code Splitting & Lazy Loading
**File**: `src/App.tsx`

**Problema**: Bundle unico, primo caricamento lento

**Soluzione**:
```typescript
import { lazy, Suspense } from 'react';

// Lazy load pages
const AlbumList = lazy(() => import('./pages/AlbumListNew'));
const AlbumView = lazy(() => import('./pages/AlbumViewNew'));
const BrandDashboard = lazy(() => import('./pages/brand/BrandDashboardNew'));
const SuperAdminPanel = lazy(() => import('./pages/superadmin/SuperAdminPanel'));

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<AlbumList />} />
        {/* ... */}
      </Routes>
    </Suspense>
  );
}
```

**Azioni**:
1. Implementare `React.lazy()` per tutte le pages
2. Creare `PageLoader` component
3. Analizzare bundle size con `npm run build -- --analyze`
4. Target: ridurre bundle iniziale del 40%+

**Impatto**: ALTO - FCP e TTI migliorati
**Test**: Lighthouse, WebPageTest

---

#### Task 3.2: Image Compression Client-Side
**File**: `src/services/bucketService.ts`

**Problema**: Upload di immagini full-size senza compressione client

**Soluzione**:
```typescript
import imageCompression from 'browser-image-compression';

async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp'
  };

  return await imageCompression(file, options);
}

// In uploadPhoto
const compressedFile = await compressImage(originalFile);
// Upload compressedFile invece di originalFile
```

**Azioni**:
1. Installare `npm install browser-image-compression`
2. Implementare compression in `bucketService.uploadPhoto`
3. Aggiungere progress indicator durante compression
4. Mantenere Cloud Function per ottimizzazioni aggiuntive

**Impatto**: MEDIO - Upload più veloci, storage costs ridotti
**Beneficio**: ~60-80% riduzione dimensione file

---

#### Task 3.3: Loading Skeleton Implementation
**File**: Componenti esistenti già creati, da integrare

**Azioni**:
1. Verificare skeleton esistenti:
   - `src/components/AlbumCardSkeleton.tsx`
   - `src/components/PhotoCardSkeleton.tsx`
2. Integrare in:
   - `AlbumListNew.tsx` (mostrare skeleton durante fetch)
   - `AlbumViewNew.tsx` (skeleton per gallery)
   - `BrandDashboard.tsx` (skeleton per dashboard cards)
3. Sostituire `<Spinner />` con skeleton appropriati

**Impatto**: MEDIO - UX percepita migliorata
**Tempo**: 4-6 ore

---

#### Task 3.4: Browser Router Migration
**File**: `src/App.tsx`

**Problema**: `<HashRouter>` usato (URL con `#/`, non SEO-friendly)

**Soluzione**:
```typescript
import { BrowserRouter } from 'react-router-dom';

// App.tsx
<BrowserRouter>
  <Routes>
    {/* ... */}
  </Routes>
</BrowserRouter>
```

**Azioni**:
1. Sostituire `HashRouter` con `BrowserRouter`
2. Configurare Firebase Hosting rewrites:
```json
// firebase.json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```
3. Aggiornare Cloud Run nginx/server config
4. Test completo routing

**Impatto**: MEDIO - SEO, URL puliti
**Rischio**: MEDIO - Possibili routing issues
**Test**: Verificare tutte le route, back button, deep linking

---

### 🔨 FASE 4: Testing & Quality Assurance (1 mese)
**Tempo Stimato**: 40-60 ore
**Obiettivo**: Coverage 60%+, WCAG 2.1 AA compliance

#### Task 4.1: Testing Coverage
**Target Coverage**: 60%+ su services, 40%+ su components

**Priorità Test**:
1. **Services (CRITICO)**:
   - `brandService.ts` (CRUD operations)
   - `stripeService.ts` (payment flow)
   - `bucketService.ts` (upload/delete)
   - `authService.ts` (authentication)

2. **Components (ALTO)**:
   - `AlbumCard.tsx`
   - `PhotoCard.tsx`
   - `Header.tsx`
   - Form components

3. **Cloud Functions (CRITICO)**:
   - `generateThumbnails` (mock Storage)
   - `createCheckoutSession` (mock Stripe)
   - `handleStripeWebhook` (mock webhook events)

**Template Test**:
```typescript
// __tests__/services/brandService.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { brandService } from '../../services/brand/brandService';

describe('brandService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getBrandById', () => {
    it('should return brand when found', async () => {
      // Arrange
      const mockBrand = { id: '123', name: 'Test Brand' };

      // Act
      const result = await brandService.getBrandById('123');

      // Assert
      expect(result).toEqual(mockBrand);
    });

    it('should return null when not found', async () => {
      const result = await brandService.getBrandById('nonexistent');
      expect(result).toBeNull();
    });
  });
});
```

**Azioni**:
1. Setup mocks per Firebase (già configurato `vitest.setup.ts`)
2. Scrivere test per tutti i services
3. Configurare coverage report: `npm run test:coverage`
4. CI/CD: bloccare merge se coverage < 60%

**Comando**:
```bash
npm run test:coverage
```

**Impatto**: ALTO - Confidence nel refactoring
**Tempo**: 30-40 ore

---

#### Task 4.2: Accessibility Audit
**Target**: WCAG 2.1 Level AA compliance

**Azioni**:
1. **Install Tools**:
```bash
npm install -D eslint-plugin-jsx-a11y @axe-core/react
```

2. **ESLint Config**:
```javascript
// eslint.config.js
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
  {
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.configs.recommended.rules
    }
  }
];
```

3. **Audit Checklist**:
   - ✅ Tutte le immagini hanno `alt` text
   - ✅ Form inputs hanno `<label>` associati
   - ✅ Bottoni hanno text descrittivo
   - ✅ Color contrast ratio >= 4.5:1
   - ✅ Focus indicators visibili
   - ✅ Keyboard navigation funzionante
   - ✅ ARIA labels su interactive elements

4. **Tools di Test**:
   - Lighthouse (Chrome DevTools)
   - axe DevTools (browser extension)
   - WAVE (browser extension)
   - Keyboard-only navigation test

**Impatto**: MEDIO - Inclusività, compliance legale
**Tempo**: 10-15 ore

---

#### Task 4.3: Performance Optimization
**Target**: Lighthouse Performance Score 90+

**Audit Areas**:
1. **Images**:
   - Lazy loading: `<img loading="lazy" />`
   - Responsive images: `srcset` + `sizes`
   - WebP format (già implementato)

2. **CSS**:
   - Rimuovere CSS inutilizzato
   - Critical CSS inline
   - Font loading strategy

3. **JavaScript**:
   - Code splitting (vedi Task 3.1)
   - Tree shaking
   - Bundle analysis

4. **Caching**:
   - Service Worker (PWA)
   - Cache headers appropriati
   - CDN per assets statici

**Comandi**:
```bash
# Bundle analysis
npm run build
npx vite-bundle-visualizer

# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:5173
```

**Impatto**: ALTO - SEO, UX, retention
**Tempo**: 15-20 ore

---

### 🎨 FASE 4.5: UX Enhancements (2-3 settimane)
**Tempo Stimato**: 25-35 ore
**Obiettivo**: Migliorare feedback visivo e user experience

#### Task 4.5.1: Enhanced Loading States
**File**: Componenti signup, pagamento, dashboard

**Problema**: Loading states basici durante operazioni critiche (signup, pagamento)

**Soluzione**:
```typescript
// src/components/LoadingButton.tsx
interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function LoadingButton({
  isLoading,
  loadingText = 'Caricamento...',
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`btn ${isLoading ? 'btn-loading' : ''}`}
    >
      {isLoading ? (
        <>
          <Spinner size="sm" />
          <span className="ml-2">{loadingText}</span>
        </>
      ) : children}
    </button>
  );
}
```

**Stati da implementare**:
1. **Signup Flow**:
   - Validazione email in corso
   - Creazione account (con progress: verifica email → crea utente → reindirizza)
   - Password reset in corso

2. **Payment Flow**:
   - Caricamento piano selezionato
   - Creazione sessione Stripe (3 step: connessione → creazione → reindirizzamento)
   - Verifica pagamento post-redirect
   - Attivazione account

3. **Dashboard Operations**:
   - Upload foto (con progress bar)
   - Eliminazione album/foto
   - Salvataggio impostazioni
   - Generazione backup

**Components da creare**:
```typescript
// src/components/ProgressSteps.tsx
interface Step {
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
}

export function ProgressSteps({ steps }: { steps: Step[] }) {
  return (
    <div className="progress-steps">
      {steps.map((step, index) => (
        <div key={index} className={`step step-${step.status}`}>
          <div className="step-icon">
            {step.status === 'completed' && <CheckIcon />}
            {step.status === 'in-progress' && <Spinner />}
            {step.status === 'error' && <XIcon />}
          </div>
          <span className="step-label">{step.label}</span>
        </div>
      ))}
    </div>
  );
}
```

**Impatto**: ALTO - Rassicura utente durante operazioni lunghe
**Tempo**: 8-10 ore

---

#### Task 4.5.2: Toast Notification System
**File**: Creare `src/utils/toast.ts` (wrapper react-hot-toast)

**Problema**: Notifiche toast inconsistenti, non sempre presenti

**Soluzione**:
```typescript
// src/utils/toast.ts
import toast, { Toaster } from 'react-hot-toast';

// Success variants
export const toastSuccess = {
  default: (message: string) => toast.success(message),

  created: (entityName: string) =>
    toast.success(`${entityName} creato con successo`),

  updated: (entityName: string) =>
    toast.success(`${entityName} aggiornato con successo`),

  deleted: (entityName: string) =>
    toast.success(`${entityName} eliminato con successo`),

  uploaded: (count: number) =>
    toast.success(`${count} ${count === 1 ? 'foto caricata' : 'foto caricate'}`),
};

// Error variants
export const toastError = {
  default: (message: string) => toast.error(message),

  network: () =>
    toast.error('Errore di connessione. Verifica la tua rete.'),

  unauthorized: () =>
    toast.error('Non sei autorizzato ad eseguire questa operazione'),

  notFound: (entityName: string) =>
    toast.error(`${entityName} non trovato`),

  validation: (field: string) =>
    toast.error(`Il campo ${field} non è valido`),

  uploadFailed: (filename: string) =>
    toast.error(`Errore caricamento ${filename}`),
};

// Info variants
export const toastInfo = {
  default: (message: string) => toast(message),

  processing: (message: string) =>
    toast.loading(message, { duration: 2000 }),

  copied: () =>
    toast.success('Copiato negli appunti'),
};

// Promise-based (auto loading/success/error)
export const toastPromise = {
  wrap: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: Error) => string);
    }
  ) => toast.promise(promise, messages),
};

// Custom toaster configuration
export function AppToaster() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'var(--color-surface)',
          color: 'var(--color-text)',
          border: '1px solid var(--color-border)',
        },
        success: {
          iconTheme: {
            primary: 'var(--color-success)',
            secondary: 'white',
          },
        },
        error: {
          duration: 6000,
          iconTheme: {
            primary: 'var(--color-error)',
            secondary: 'white',
          },
        },
      }}
    />
  );
}
```

**Usage examples**:
```typescript
// In services
import { toastSuccess, toastError, toastPromise } from '@/utils/toast';

// Simple
await createAlbum(data);
toastSuccess.created('Album');

// Promise-based (auto handles loading/success/error)
await toastPromise.wrap(
  uploadPhoto(file),
  {
    loading: 'Caricamento foto...',
    success: 'Foto caricata con successo',
    error: (err) => `Errore: ${err.message}`
  }
);
```

**Standardizzazione**:
1. Audit tutti i toast esistenti
2. Sostituire con funzioni centralizzate
3. Aggiungere toast mancanti (es. copy link, download backup)
4. Consistent duration (4s success, 6s error)

**Impatto**: MEDIO - Feedback utente consistente
**Tempo**: 4-5 ore

---

#### Task 4.5.3: Empty States
**File**: Creare `src/components/EmptyState.tsx`

**Problema**: Schermate vuote poco amichevoli (lista album vuota, nessuna foto)

**Soluzione**:
```typescript
// src/components/EmptyState.tsx
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'albums' | 'photos' | 'search' | 'error';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      {illustration && <EmptyStateIllustration type={illustration} />}

      <div className="empty-state-icon">
        <Icon size={48} strokeWidth={1.5} />
      </div>

      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>

      {action && (
        <button onClick={action.onClick} className="btn btn-primary">
          {action.label}
        </button>
      )}
    </div>
  );
}
```

**Empty states da implementare**:

1. **Album List (pubblico)**:
```typescript
<EmptyState
  icon={ImageIcon}
  title="Nessun album disponibile"
  description="Il fotografo non ha ancora pubblicato album in questa galleria"
  illustration="albums"
/>
```

2. **Album View (nessuna foto)**:
```typescript
<EmptyState
  icon={ImageIcon}
  title="Album vuoto"
  description="Questo album non contiene ancora foto"
  illustration="photos"
/>
```

3. **Dashboard - Album List (brand owner)**:
```typescript
<EmptyState
  icon={FolderPlusIcon}
  title="Crea il tuo primo album"
  description="Inizia creando un album per organizzare le tue foto"
  action={{
    label: 'Crea Album',
    onClick: () => setShowCreateModal(true)
  }}
  illustration="albums"
/>
```

4. **Search Results (nessun risultato)**:
```typescript
<EmptyState
  icon={SearchIcon}
  title="Nessun risultato"
  description={`Nessun album trovato per "${searchQuery}"`}
  illustration="search"
/>
```

5. **Upload Failed**:
```typescript
<EmptyState
  icon={AlertCircleIcon}
  title="Caricamento fallito"
  description="Si è verificato un errore durante il caricamento delle foto"
  action={{
    label: 'Riprova',
    onClick: () => retryUpload()
  }}
  illustration="error"
/>
```

**Illustrations**:
- Usare SVG custom o libreria come [undraw.co](https://undraw.co/illustrations)
- Tematizzabili con brand colors (CSS variables)

**Impatto**: MEDIO - UX più amichevole, riduce frustrazione
**Tempo**: 6-8 ore

---

#### Task 4.5.4: Error Boundaries & Error UI
**File**: Creare `src/components/ErrorBoundary.tsx`

**Problema**: Errori React crashano tutta l'app, nessun fallback UI

**Soluzione**:
```typescript
// src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { logger } from '@/utils/logger';
import { AlertTriangleIcon } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught error', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary">
          <AlertTriangleIcon size={64} />
          <h2>Qualcosa è andato storto</h2>
          <p>Si è verificato un errore imprevisto. Ricarica la pagina per continuare.</p>
          <details>
            <summary>Dettagli tecnici</summary>
            <pre>{this.state.error?.stack}</pre>
          </details>
          <button onClick={() => window.location.reload()}>
            Ricarica Pagina
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**Usage**:
```typescript
// App.tsx - Global error boundary
<ErrorBoundary>
  <BrowserRouter>
    <Routes>
      {/* ... */}
    </Routes>
  </BrowserRouter>
</ErrorBoundary>

// Per sezioni specifiche
<ErrorBoundary fallback={<AlbumListError />}>
  <AlbumList />
</ErrorBoundary>
```

**Error UI Components**:
```typescript
// src/components/errors/NetworkError.tsx
export function NetworkError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="error-card">
      <WifiOffIcon />
      <h3>Connessione persa</h3>
      <p>Verifica la tua connessione internet e riprova</p>
      <button onClick={onRetry}>Riprova</button>
    </div>
  );
}

// src/components/errors/NotFoundError.tsx
export function NotFoundError({ entityName }: { entityName: string }) {
  return (
    <div className="error-card">
      <FileQuestionIcon />
      <h3>{entityName} non trovato</h3>
      <p>La risorsa richiesta potrebbe essere stata eliminata o spostata</p>
      <Link to="/">Torna alla home</Link>
    </div>
  );
}

// src/components/errors/PermissionError.tsx
export function PermissionError() {
  return (
    <div className="error-card">
      <LockIcon />
      <h3>Accesso negato</h3>
      <p>Non hai i permessi per visualizzare questa risorsa</p>
      <Link to="/">Torna alla home</Link>
    </div>
  );
}
```

**Impatto**: ALTO - Previene crash completi, UX professionale
**Tempo**: 5-6 ore

---

#### Task 4.5.5: Onboarding Tour
**File**: Implementare tour interattivo per nuovi brand owners

**Problema**: Nessun onboarding per nuovi utenti, curva di apprendimento alta

**Soluzione**: Usare libreria come `react-joyride` o implementazione custom

```bash
npm install react-joyride
```

```typescript
// src/components/OnboardingTour.tsx
import Joyride, { Step, CallBackProps } from 'react-joyride';
import { useState, useEffect } from 'react';

const TOUR_STEPS: Step[] = [
  {
    target: '#create-album-btn',
    content: 'Inizia creando il tuo primo album per organizzare le tue foto',
    disableBeacon: true,
  },
  {
    target: '#branding-tab',
    content: 'Personalizza i colori e il logo della tua galleria qui',
  },
  {
    target: '#settings-tab',
    content: 'Configura il nome della galleria e altre impostazioni',
  },
  {
    target: '#backup-section',
    content: 'Crea backup regolari dei tuoi album per sicurezza',
  },
  {
    target: '#copy-link-btn',
    content: 'Copia il link della galleria per condividerla con i tuoi clienti',
  },
];

export function OnboardingTour() {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    // Check se utente ha già visto il tour
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      // Delay di 1s per permettere render completo
      setTimeout(() => setRunTour(true), 1000);
    }
  }, []);

  const handleTourCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      localStorage.setItem('hasSeenOnboardingTour', 'true');
      setRunTour(false);
    }
  };

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={runTour}
      continuous
      showSkipButton
      showProgress
      callback={handleTourCallback}
      styles={{
        options: {
          primaryColor: 'var(--color-primary)',
          textColor: 'var(--color-text)',
          backgroundColor: 'var(--color-surface)',
        },
      }}
      locale={{
        back: 'Indietro',
        close: 'Chiudi',
        last: 'Fine',
        next: 'Avanti',
        skip: 'Salta',
      }}
    />
  );
}
```

**Integration**:
```typescript
// BrandDashboard.tsx
import { OnboardingTour } from '@/components/OnboardingTour';

export function BrandDashboard() {
  return (
    <>
      <OnboardingTour />
      {/* Rest of dashboard */}
    </>
  );
}
```

**Features aggiuntive**:
1. **Pulsante "Rivedi Tutorial"** in settings
2. **Progressive disclosure**: Tour multi-step per feature complesse
3. **Contextual help**: Tooltips su elementi complessi
4. **Video tutorials**: Link a video YouTube in tour steps

**Alternative**: Tour custom con `framer-motion` per animazioni fluide

**Impatto**: ALTO - Riduce learning curve, migliora adoption
**Tempo**: 6-8 ore

---

### 🚀 FASE 5: Advanced Features (3+ mesi)
**Tempo Stimato**: 80-100 ore
**Obiettivo**: Feature production-grade avanzate

#### Task 5.1: Monitoring & Alerts
**Tools**: Sentry + Google Cloud Monitoring

**Sentry Setup**:
```bash
npm install @sentry/react @sentry/vite-plugin
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
});
```

**Cloud Monitoring**:
- Error reporting per Cloud Functions
- Custom metrics (signup rate, upload success rate)
- Alerts per errori critici
- Uptime checks

**Impatto**: ALTO - Visibility production
**Tempo**: 8-10 ore

---

#### Task 5.2: Analytics Dashboard
**Feature**: Real-time analytics per SuperAdmin

**Metriche**:
- Active brands
- Total users
- Storage usage per brand
- Revenue (Stripe data)
- Upload activity
- Most visited albums

**Implementation**:
```typescript
// Firestore aggregation queries
const analytics = {
  totalBrands: await getBrandCount(),
  totalPhotos: await getPhotoCount(),
  storageUsed: await getTotalStorageUsage(),
  revenue: await getStripeRevenue()
};
```

**UI**: Dashboard SuperAdmin tab aggiuntivo

**Impatto**: MEDIO - Business insights
**Tempo**: 20-25 ore

---

#### Task 5.3: Custom Domains
**Feature**: Wildcard DNS per custom brand domains

**Architecture**:
```
brand1.gallery2025.com → Brand 1
brand2.gallery2025.com → Brand 2
custom-domain.com     → Brand 3 (custom)
```

**Implementation**:
1. DNS wildcard: `*.gallery2025.com → Cloud Run IP`
2. Domain detection in `brandService.detectBrandFromDomain()`
3. SSL certificates automatici (Cloud Run)
4. Custom domain mapping in Firestore:
```typescript
interface Brand {
  customDomain?: string; // "custom-domain.com"
}
```

**Impatto**: ALTO - White label capability
**Tempo**: 15-20 ore

---

#### Task 5.4: Email Service
**Feature**: Email notifications (signups, password reset, album sharing)

**Provider**: SendGrid o Resend

**Email Templates**:
1. Welcome email (post-signup)
2. Password reset
3. Album shared notification
4. Payment confirmation
5. Storage limit warning

**Implementation**:
```typescript
// Cloud Function
import sgMail from '@sendgrid/mail';

export const sendEmail = functions.https.onCall(async (data, context) => {
  const msg = {
    to: data.to,
    from: 'noreply@gallery2025.com',
    templateId: data.templateId,
    dynamicTemplateData: data.data
  };

  await sgMail.send(msg);
});
```

**Impatto**: MEDIO - Professional UX
**Tempo**: 12-15 ore

---

## 📅 Timeline Proposta

### Sprint 1: Security (Week 1)
- ✅ Task 1.1: Firestore Rules (2h)
- ✅ Task 1.2: Logger (3h)
- ✅ Task 1.3: Env Audit (1h)
- **Deploy Production**: ✅

### Sprint 2-3: Code Quality (Week 2-3)
- Task 2.1: Deduplication (8h)
- Task 2.2: Error Handling (6h)
- Task 2.3: Context Consolidation (1h)

### Sprint 4-7: Performance (Week 4-7)
- Task 3.1: Code Splitting (8h)
- Task 3.2: Image Compression (6h)
- Task 3.3: Loading Skeleton (5h)
- Task 3.4: Browser Router (4h)

### Sprint 8-11: Testing & QA (Week 8-11)
- Task 4.1: Testing Coverage (35h)
- Task 4.2: Accessibility (12h)
- Task 4.3: Performance (18h)

### Sprint 11-13: UX Enhancements (Week 11-13)
- Task 4.5.1: Enhanced Loading States (10h)
- Task 4.5.2: Toast Notification System (5h)
- Task 4.5.3: Empty States (8h)
- Task 4.5.4: Error Boundaries & Error UI (6h)
- Task 4.5.5: Onboarding Tour (8h)

### Sprint 14+: Advanced Features (Week 14+)
- Task 5.1: Monitoring (10h)
- Task 5.2: Analytics (25h)
- Task 5.3: Custom Domains (18h)
- Task 5.4: Email Service (15h)

---

## 📊 Tracking Progress

### Metriche di Successo

**Security**:
- ✅ Zero Firestore rules aperte pubblicamente
- ✅ Zero console.log in production
- ✅ Zero secrets committati

**Code Quality**:
- ✅ Zero file duplicati
- ✅ Error handling standardizzato al 100%
- ✅ ESLint warnings < 10

**Performance**:
- ✅ Lighthouse Performance Score >= 90
- ✅ First Contentful Paint < 1.5s
- ✅ Time to Interactive < 3.0s
- ✅ Bundle size < 500KB (gzipped)

**Testing**:
- ✅ Test coverage >= 60% (services)
- ✅ Test coverage >= 40% (components)
- ✅ Cloud Functions coverage >= 70%

**Accessibility**:
- ✅ WCAG 2.1 Level AA compliance
- ✅ Lighthouse Accessibility Score >= 95
- ✅ Zero automatic eslint-plugin-jsx-a11y errors

**UX Enhancements**:
- ✅ Loading states su tutte le operazioni critiche
- ✅ Toast notifications consistenti (100% coverage)
- ✅ Empty states su tutte le liste/collezioni vuote
- ✅ Error boundaries implementati globalmente
- ✅ Onboarding tour completato (>=5 steps)

---

## 🔄 Processo di Review

### Before Each Phase:
1. Create feature branch: `git checkout -b phase-N-description`
2. Review task checklist
3. Estimate time

### During Implementation:
1. Commit frequently (conventional commits)
2. Run tests: `npm test`
3. Run linters: `npm run lint`

### After Each Phase:
1. Run full test suite: `npm run test:coverage`
2. Run production build: `npm run build`
3. Manual testing checklist
4. Create PR to main
5. Code review
6. Merge + deploy

---

## 📝 Note di Implementazione

### Priorità Assoluta
**FARE SUBITO** (prima di qualsiasi altro lavoro):
- Task 1.1: Firestore Rules
- Task 1.2: Logger
- Task 1.3: Env Audit

**Motivo**: Security vulnerabilities attive in production

### Approccio Incrementale
- Non bloccare feature development per testing
- Implementare test durante fix/refactoring
- Target coverage incrementale: 20% → 40% → 60%

### Breaking Changes
Fasi che richiedono attenzione extra:
- Task 2.1 (Deduplication): High risk
- Task 3.4 (Browser Router): Medium risk
- Task 5.3 (Custom Domains): Architecture change

### Rollback Strategy
- Ogni fase in branch separato
- Tag Git prima di deploy: `git tag v1.1.0-pre-phase-N`
- Cloud Run: mantenere 2 revisioni precedenti
- Firestore: backup giornalieri

---

## 📞 Support & Resources

### Documentation
- `/docs/` - Project documentation
- `/STATUS.md` - Current project status
- `START_HERE.md` - Onboarding guide

### External Resources
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Performance](https://react.dev/learn/render-and-commit)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Lighthouse Scoring](https://developer.chrome.com/docs/lighthouse/performance/performance-scoring)

---

## ✅ Checklist Quick Start

### Prima di iniziare:
- [ ] Backup completo database e storage
- [ ] Branch protetto: `main` richiede PR review
- [ ] Environment variables documentate
- [ ] Team allineato su priorità

### Fase 1 (IMMEDIATE):
- [ ] Task 1.1: Firestore Rules hardening
- [ ] Task 1.2: Logger implementation
- [ ] Task 1.3: Environment audit
- [ ] Deploy production
- [ ] Security test completo

---

**Prossimo Step**: Iniziare con Fase 1 - Security Hardening

**Estimated Time to Production-Ready**: 4-6 ore (Fase 1)

**Estimated Time to Full Optimization**: 4-5 mesi (tutte le fasi)
