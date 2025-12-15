# 🛠️ Utilities Documentation

Questa directory contiene utilities riutilizzabili per l'applicazione.

---

## 📂 File Overview

### `logger.ts` - Production-Ready Logging

Sistema di logging centralizzato con supporto environment-aware.

**Livelli di log**:
- `logger.debug()` - Solo development, verbose debugging
- `logger.info()` - Solo development, informazioni generali
- `logger.warn()` - Sempre attivo, warnings
- `logger.error()` - Sempre attivo, errori (integrato con Sentry in future)

**Usage**:
```typescript
import { logger } from '@/utils/logger';

// Debug (solo development)
logger.debug('User data loaded', userData);

// Info (solo development)
logger.info('Payment process started', { userId, amount });

// Warning (sempre)
logger.warn('Deprecated API endpoint used');

// Error (sempre + Sentry in production)
logger.error('Failed to upload photo', error);

// Grouping (solo development)
logger.group('User Actions');
logger.debug('Action 1');
logger.debug('Action 2');
logger.groupEnd();

// Performance timing (solo development)
logger.time('dataFetch');
await fetchData();
logger.timeEnd('dataFetch'); // Output: dataFetch: 234ms
```

**Features**:
- Auto-disable debug/info in production
- Preparato per Sentry integration
- Helper methods: `group`, `time`, `table`

---

### `errorHandler.ts` - Centralized Error Handling

Sistema unificato per gestione errori con toast notifications.

**Error Codes**:
```typescript
import { ErrorCodes } from '@/utils/errorHandler';

// Network
ErrorCodes.NETWORK_ERROR
ErrorCodes.TIMEOUT

// Auth
ErrorCodes.UNAUTHORIZED
ErrorCodes.FORBIDDEN
ErrorCodes.SESSION_EXPIRED

// Resources
ErrorCodes.NOT_FOUND
ErrorCodes.ALREADY_EXISTS

// Validation
ErrorCodes.VALIDATION_ERROR
ErrorCodes.INVALID_INPUT

// Storage
ErrorCodes.UPLOAD_FAILED
ErrorCodes.STORAGE_QUOTA_EXCEEDED

// Payment
ErrorCodes.PAYMENT_FAILED
ErrorCodes.PAYMENT_REQUIRED
```

**Usage Examples**:

```typescript
import { handleError, withErrorHandling, createError } from '@/utils/errorHandler';

// 1. Handle any error with toast
try {
  await uploadPhoto(file);
} catch (error) {
  handleError(error, {
    context: 'PhotoUpload',
    toastMessage: 'Impossibile caricare la foto'
  });
}

// 2. Async wrapper (auto error handling)
const result = await withErrorHandling(
  () => fetchAlbums(brandId),
  {
    errorMessage: 'Errore caricamento album',
    context: 'AlbumList'
  }
);

if (result) {
  // Success
  setAlbums(result);
}

// 3. Create specific errors
throw createError.notFound('Album');
throw createError.unauthorized();
throw createError.validation('email', 'formato non valido');
throw createError.uploadFailed('photo.jpg');

// 4. Suppress toast (silent error)
handleError(error, { showToast: false });
```

**AppError Class**:
```typescript
class AppError extends Error {
  code: string;
  statusCode: number;
  isOperational: boolean;
}

// Example
const error = new AppError(
  'Album non trovato',
  ErrorCodes.NOT_FOUND,
  404,
  true
);
```

**Features**:
- User-friendly messages in italiano
- Automatic toast notifications
- Custom error codes
- Prepared for Sentry integration
- Type-safe error creation

---

## 🚀 Best Practices

### Logger

**DO**:
```typescript
✅ logger.debug('Fetching user data', { userId, timestamp });
✅ logger.error('Upload failed', error, { filename, size });
✅ logger.warn('Using deprecated method', { method: 'oldApi' });
```

**DON'T**:
```typescript
❌ console.log('Debug info'); // Use logger.debug() instead
❌ logger.debug(sensitiveData); // Don't log passwords, tokens
❌ logger.error('Error'); // Provide context and error object
```

### Error Handler

**DO**:
```typescript
✅ handleError(error, { context: 'ComponentName' });
✅ throw createError.notFound('Resource');
✅ await withErrorHandling(() => apiCall(), { errorMessage: 'Custom message' });
```

**DON'T**:
```typescript
❌ toast.error('Error'); // Use handleError() for consistency
❌ throw new Error('Generic error'); // Use AppError or createError
❌ catch (e) { } // Always handle errors, don't swallow
```

---

## 🔗 Related Documentation

- **Environment Variables**: `/docs/ENVIRONMENT_VARIABLES.md`
- **Changelog**: `/docs/CHANGELOG.md`
- **Main README**: `/README.md`
- **Piano Miglioramenti**: `/PIANO_MIGLIORAMENTI.md`

---

## 🆘 Troubleshooting

### "Module not found: @/utils/logger"
- Verifica che `tsconfig.json` abbia il path alias `@/*`
- Restart TypeScript server: CMD+Shift+P > "TypeScript: Restart TS Server"

### "Logger not logging in development"
- Verifica `import.meta.env.DEV` sia `true`
- Check vite config per env variables

### "Toast not showing"
- Verifica `<Toaster />` component sia montato in `App.tsx`
- Import corretto: `import toast from 'react-hot-toast'`

---

## 📊 Integration Status

| Utility | Status | Integration |
|---------|--------|-------------|
| Logger | ✅ Ready | ESLint enforced |
| Error Handler | ✅ Ready | Services can adopt |
| Toast (future) | 📋 Planned | FASE 4.5.2 |

---

Last Updated: 2025-12-03
