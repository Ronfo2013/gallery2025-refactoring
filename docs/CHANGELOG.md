# 📝 Changelog - Gallery2025 Refactoring

Tutte le modifiche notevoli al progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🔒 Security
- **Firestore Rules Hardening**: Chiuso write pubblico su collection `/brands/` e `/gallery/`
  - Implementate regole multi-tenant con `isBrandOwner()` e `isSuperAdmin()`
  - Gallery legacy impostata a read-only (write solo SuperAdmin)
  - Prevenzione accessi non autorizzati
- **Environment Variables**: Creato `.env.example` e documentazione completa
  - Nessun secret hardcoded nel codice
  - Audit completo con check automatizzati

### 🆕 Added
- **Logger Production-Ready** (`src/utils/logger.ts`)
  - Sistema di logging centralizzato con livelli (debug/info/warn/error)
  - Disabilitazione automatica debug/info in production
  - Preparato per integrazione Sentry
  - ESLint rule `no-console: error` abilitata

- **Error Handling Centralizzato** (`src/utils/errorHandler.ts`)
  - `AppError` class con error codes standardizzati
  - User-friendly error messages in italiano
  - Toast notifications integrate
  - Wrapper `withErrorHandling()` per async functions

- **Environment Variables Documentation**
  - `docs/ENVIRONMENT_VARIABLES.md`: Guida completa setup
  - `.env.example`: Template con tutte le variabili
  - Sezioni per Firebase, Stripe, Gemini AI, Analytics
  - Troubleshooting e comandi di verifica

- **Code Splitting & Lazy Loading**
  - Tutte le pages con `React.lazy()`
  - `<Suspense>` wrapper con fallback loader
  - Bundle ottimizzato per performance

### 🔄 Changed
- **Code Deduplication**: Rimossi file duplicati
  - `AlbumListNew.tsx` → `AlbumList.tsx`
  - `AlbumViewNew.tsx` → `AlbumView.tsx`
  - `BrandDashboardNew.tsx` → `BrandDashboard.tsx`
  - `LandingPageNew.tsx` → `LandingPage.tsx`

- **Context Directory Consolidation**
  - Spostato `context/AppContext.tsx` → `contexts/AppContext.tsx`
  - Rimossa directory duplicata `context/`
  - Imports aggiornati in `App.tsx`

- **App.tsx**: Refactoring completo
  - Lazy loading per tutte le route
  - Imports consolidati
  - Suspense boundaries implementati

### 🗑️ Removed
- File duplicati `*New.tsx.old`
- Directory `context/` (consolidata in `contexts/`)
- Console.log statements dal codice sorgente

### 📚 Documentation
- `docs/ENVIRONMENT_VARIABLES.md`: Guida completa environment variables
- `docs/CHANGELOG.md`: Questo file
- `.env.example`: Template environment variables
- JSDoc completo su `logger.ts` e `errorHandler.ts`
- Commenti aggiornati in `firestore.rules`

---

## [1.0.0] - 2025-12-03

### Initial Release
- MVP completo Gallery2025 Multi-Brand SaaS
- Sistema multi-tenant con brand isolation
- Firebase integration (Firestore, Storage, Auth, Functions)
- Stripe payment integration
- Dynamic branding con CSS variables
- Image optimization (WebP + thumbnails)
- SuperAdmin panel
- Landing page pubblica con signup

---

## Prossimi Passi (Roadmap)

### Sprint Corrente - Performance & UX
- [ ] Task 3.2: Image compression client-side
- [ ] Task 3.3: Loading skeleton integration
- [ ] Task 3.4: Browser Router migration

### Sprint 8-11 - Testing & QA
- [ ] Task 4.1: Testing coverage 60%+
- [ ] Task 4.2: Accessibility WCAG 2.1 AA
- [ ] Task 4.3: Performance optimization (Lighthouse 90+)

### Sprint 11-13 - UX Enhancements
- [ ] Task 4.5.1: Enhanced loading states
- [ ] Task 4.5.2: Toast notification system
- [ ] Task 4.5.3: Empty states
- [ ] Task 4.5.4: Error boundaries
- [ ] Task 4.5.5: Onboarding tour

### Sprint 14+ - Advanced Features
- [ ] Task 5.1: Monitoring & alerts (Sentry)
- [ ] Task 5.2: Analytics dashboard
- [ ] Task 5.3: Custom domains support
- [ ] Task 5.4: Email service integration

---

## Breaking Changes

### [Unreleased]
- **Firestore Rules**: Write access ora richiede autenticazione
  - Impatto: Client non autenticati non possono più scrivere su `/brands/`
  - Migrazione: Assicurarsi che tutti i client siano autenticati prima di write operations

- **Console.log → Logger**: ESLint ora blocca `console.log`
  - Impatto: Build fallisce se presente `console.log` nel codice
  - Migrazione: Usare `logger.debug()` / `logger.info()` / `logger.warn()` / `logger.error()`

- **Context Directory**: Path cambiato da `./context/` a `./contexts/`
  - Impatto: Imports rotti se non aggiornati
  - Migrazione: Aggiornare imports: `from './context/AppContext'` → `from './contexts/AppContext'`

---

## Contributors

- **Angelo** - Initial work & Refactoring
- **Claude (Anthropic)** - Code analysis, documentation, implementation support

---

## License

Proprietary - All rights reserved
