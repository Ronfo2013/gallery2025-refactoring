# 🔄 Migration Guide - Refactoring Updates

Guida per adottare le nuove utilities e pattern nel codice esistente.

---

## 📋 Table of Contents

1. [Logger Migration](#logger-migration)
2. [Error Handling Migration](#error-handling-migration)
3. [Context Imports Update](#context-imports-update)
4. [Code Splitting Adoption](#code-splitting-adoption)

---

## 1. Logger Migration

### ❌ Before (Old Pattern)
```typescript
console.log('User logged in', userId);
console.info('Loading albums...');
console.warn('Deprecated API');
console.error('Upload failed', error);
```

### ✅ After (New Pattern)
```typescript
import { logger } from '@/utils/logger';

logger.debug('User logged in', userId);
logger.info('Loading albums...');
logger.warn('Deprecated API');
logger.error('Upload failed', error);
```

### 🔧 Migration Steps

**Step 1**: Install ESLint (già fatto)
```bash
# ESLint rule attivata: no-console: error
```

**Step 2**: Find & Replace (automatico)
```bash
# Trova tutte le occorrenze
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# Replace con regex (VS Code)
# Find: console\.(log|info|warn|error)
# Replace con mapping manuale:
# console.log → logger.debug
# console.info → logger.info
# console.warn → logger.warn
# console.error → logger.error
```

**Step 3**: Add import
```typescript
import { logger } from '@/utils/logger';
```

**Step 4**: Run linter
```bash
npm run lint
```

### 📝 Examples per File Type

**Services**:
```typescript
// services/brandService.ts
import { logger } from '@/utils/logger';

export async function getBrand(id: string) {
  logger.debug('Fetching brand', { id });

  try {
    const brand = await fetchBrand(id);
    logger.info('Brand loaded successfully', { brandId: id });
    return brand;
  } catch (error) {
    logger.error('Failed to load brand', error, { brandId: id });
    throw error;
  }
}
```

**Components**:
```typescript
// components/AlbumCard.tsx
import { logger } from '@/utils/logger';

export function AlbumCard({ album }: Props) {
  const handleClick = () => {
    logger.debug('Album clicked', { albumId: album.id });
    navigate(`/album/${album.id}`);
  };

  return <div onClick={handleClick}>...</div>;
}
```

---

## 2. Error Handling Migration

### ❌ Before (Inconsistent Patterns)
```typescript
// Pattern 1: Return null
async function getAlbum(id: string) {
  try {
    return await fetchAlbum(id);
  } catch (error) {
    console.error(error);
    toast.error('Errore');
    return null;
  }
}

// Pattern 2: Throw
async function deletePhoto(id: string) {
  try {
    await deletePhotoApi(id);
  } catch (error) {
    throw error;
  }
}

// Pattern 3: No handling
async function uploadPhoto(file: File) {
  return await uploadApi(file); // Crashes on error
}
```

### ✅ After (Unified Pattern)
```typescript
import { handleError, withErrorHandling, createError } from '@/utils/errorHandler';

// Pattern 1: Wrapper (recommended per UI)
async function getAlbum(id: string) {
  return await withErrorHandling(
    () => fetchAlbum(id),
    {
      errorMessage: 'Impossibile caricare l\'album',
      context: 'getAlbum'
    }
  );
  // Returns null on error, shows toast automatically
}

// Pattern 2: Try-catch with handleError
async function deletePhoto(id: string) {
  try {
    await deletePhotoApi(id);
    toast.success('Foto eliminata');
  } catch (error) {
    handleError(error, {
      toastMessage: 'Impossibile eliminare la foto',
      context: 'deletePhoto'
    });
  }
}

// Pattern 3: Custom errors
async function uploadPhoto(file: File) {
  if (!file.type.startsWith('image/')) {
    throw createError.validation('file', 'Deve essere un\'immagine');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw createError.uploadFailed('File troppo grande (max 10MB)');
  }

  return await uploadApi(file);
}
```

### 🔧 Migration Steps

**Step 1**: Identify error handling patterns
```bash
# Find try-catch blocks
grep -r "try {" src/ --include="*.ts" --include="*.tsx"

# Find error toasts
grep -r "toast.error" src/ --include="*.ts" --include="*.tsx"
```

**Step 2**: Replace service methods

**Before**:
```typescript
export const brandService = {
  async getBrand(id: string) {
    try {
      const doc = await getDoc(doc(db, 'brands', id));
      if (!doc.exists()) {
        toast.error('Brand non trovato');
        return null;
      }
      return doc.data();
    } catch (error) {
      console.error('Error loading brand:', error);
      toast.error('Errore caricamento brand');
      return null;
    }
  }
};
```

**After**:
```typescript
import { withErrorHandling, createError } from '@/utils/errorHandler';

export const brandService = {
  async getBrand(id: string) {
    return await withErrorHandling(
      async () => {
        const doc = await getDoc(doc(db, 'brands', id));
        if (!doc.exists()) {
          throw createError.notFound('Brand');
        }
        return doc.data();
      },
      {
        errorMessage: 'Impossibile caricare il brand',
        context: 'brandService.getBrand'
      }
    );
  }
};
```

**Step 3**: Update component error handling

**Before**:
```typescript
const handleDelete = async () => {
  try {
    await deleteAlbum(albumId);
    toast.success('Album eliminato');
    navigate('/');
  } catch (error) {
    console.error(error);
    toast.error('Errore eliminazione album');
  }
};
```

**After**:
```typescript
import { handleError } from '@/utils/errorHandler';

const handleDelete = async () => {
  try {
    await deleteAlbum(albumId);
    toast.success('Album eliminato');
    navigate('/');
  } catch (error) {
    handleError(error, {
      toastMessage: 'Impossibile eliminare l\'album',
      context: 'AlbumView.handleDelete'
    });
  }
};
```

---

## 3. Context Imports Update

### ❌ Before
```typescript
import { AppProvider, useAppContext } from './context/AppContext';
```

### ✅ After
```typescript
import { AppProvider, useAppContext } from './contexts/AppContext';
```

### 🔧 Migration Steps

**Step 1**: Find & Replace
```bash
# VS Code: Find & Replace in Files
# Find: from './context/
# Replace: from './contexts/

# Or bash:
find src -name "*.tsx" -o -name "*.ts" | xargs sed -i '' 's|from '\''./context/|from '\''./contexts/|g'
```

**Step 2**: Verify
```bash
npm run build
# Should compile without errors
```

---

## 4. Code Splitting Adoption

### ❌ Before (Eager Loading)
```typescript
import AlbumList from './pages/AlbumList';
import AlbumView from './pages/AlbumView';
import BrandDashboard from './pages/brand/BrandDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AlbumList />} />
      <Route path="/album/:id" element={<AlbumView />} />
      <Route path="/dashboard" element={<BrandDashboard />} />
    </Routes>
  );
}
```

### ✅ After (Lazy Loading)
```typescript
import { lazy, Suspense } from 'react';

const AlbumList = lazy(() => import('./pages/AlbumList'));
const AlbumView = lazy(() => import('./pages/AlbumView'));
const BrandDashboard = lazy(() => import('./pages/brand/BrandDashboard'));

const PageLoader = () => (
  <div className="loading-spinner">Loading...</div>
);

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<AlbumList />} />
        <Route path="/album/:id" element={<AlbumView />} />
        <Route path="/dashboard" element={<BrandDashboard />} />
      </Routes>
    </Suspense>
  );
}
```

### 🔧 Migration Steps

**Step 1**: Identify route components
```bash
# Find Route elements
grep -r "<Route" src/App.tsx
```

**Step 2**: Convert to lazy imports
```typescript
// Before
import ComponentName from './path/to/Component';

// After
const ComponentName = lazy(() => import('./path/to/Component'));
```

**Step 3**: Add Suspense boundary
```typescript
<Suspense fallback={<LoadingFallback />}>
  <Routes>
    {/* Your routes */}
  </Routes>
</Suspense>
```

**Step 4**: Create loading component
```typescript
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="spinner"></div>
  </div>
);
```

**Step 5**: Test bundle size
```bash
npm run build
# Check dist/ folder size before/after
```

---

## 📊 Migration Checklist

### Phase 1: Logger
- [ ] Add `import { logger } from '@/utils/logger'` to all files using console
- [ ] Replace all `console.log` with `logger.debug`
- [ ] Replace all `console.info` with `logger.info`
- [ ] Replace all `console.warn` with `logger.warn`
- [ ] Replace all `console.error` with `logger.error`
- [ ] Run `npm run lint` and fix errors

### Phase 2: Error Handler
- [ ] Add `import { handleError, withErrorHandling } from '@/utils/errorHandler'`
- [ ] Wrap service methods with `withErrorHandling()`
- [ ] Replace try-catch blocks with `handleError()`
- [ ] Use `createError.*` for custom errors
- [ ] Remove redundant `toast.error()` calls

### Phase 3: Context Imports
- [ ] Find & replace `'./context/'` with `'./contexts/'`
- [ ] Verify build succeeds
- [ ] Test all context-dependent features

### Phase 4: Code Splitting
- [ ] Convert route components to lazy imports
- [ ] Add Suspense boundaries
- [ ] Create loading fallback components
- [ ] Test all routes
- [ ] Measure bundle size improvement

---

## 🧪 Testing After Migration

### Manual Tests
1. **Logger**:
   - Check browser console in dev mode (should see logs)
   - Build production: `npm run build` (no logs in console)

2. **Error Handling**:
   - Trigger an error (e.g., offline, invalid input)
   - Verify toast notification appears
   - Check error logged correctly

3. **Context**:
   - Test all features using contexts
   - Verify no runtime errors

4. **Code Splitting**:
   - Open DevTools > Network tab
   - Navigate between routes
   - Verify chunks load on demand

### Automated Tests
```bash
# Lint
npm run lint

# Type check
npm run type-check

# Build
npm run build

# Test (if available)
npm test
```

---

## 🆘 Rollback Plan

Se qualcosa va storto:

### Git Rollback
```bash
# Rollback all changes
git reset --hard HEAD

# Rollback specific file
git checkout HEAD -- path/to/file.ts
```

### Individual Feature Rollback

**Logger**:
```bash
# Revert ESLint rule
# eslint.config.js: 'no-console': 'off'
```

**Error Handler**:
```bash
# Remove imports, revert to old patterns
# No breaking changes if not adopted
```

**Context**:
```bash
# Restore old path
mv src/contexts src/context
# Update imports back
```

---

## 📞 Support

Se incontri problemi durante la migrazione:

1. Check documentazione:
   - `src/utils/README.md`
   - `docs/ENVIRONMENT_VARIABLES.md`

2. Esempi di codice:
   - Guarda `App.tsx` per lazy loading
   - Guarda services per error handling

3. Run diagnostics:
```bash
npm run lint
npm run build
npm run type-check
```

---

Last Updated: 2025-12-03
