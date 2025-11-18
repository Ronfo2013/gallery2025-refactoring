# MVP Implementation Status

**Data:** 18 Novembre 2025  
**Progetto:** gallery2025-refactoring (Multi-Brand SaaS MVP)

---

## ✅ COMPLETATO (Core MVP Ready)

### 1. Database & Schema ✅

- [x] Schema Firestore documentato (`docs/DATABASE_SCHEMA_MVP.md`)
- [x] TypeScript types estesi con `Brand`, `BrandSubscription`, `BrandBranding`, `SuperUser`
- [x] Firestore Security Rules multi-tenant implementate
- [x] Storage Rules con isolamento per brand implementate

### 2. Stripe Integration ✅

- [x] Documentazione setup Stripe (`docs/STRIPE_SETUP.md`)
- [x] Cloud Function: `createCheckoutSession`
- [x] Cloud Function: `handleStripeWebhook`
- [x] Cloud Function: Brand activation post-pagamento
- [x] Frontend service: `stripeService.ts`
- [x] Stripe SDK installato in functions

### 3. Backend Services ✅

- [x] `brandService.ts` - Domain detection, branding updates
- [x] `stripeService.ts` - Frontend Stripe integration
- [x] Cloud Functions organizzate e funzionanti

### 4. Frontend Core ✅

- [x] `BrandContext.tsx` - Multi-tenant context con CSS variables dinamiche
- [x] `LandingPage.tsx` - Landing page pubblica con signup form e Stripe

---

## 🚧 IN PROGRESS

### 5. App Routing

- [ ] Refactorare `App.tsx` per routing multi-tenant
- [ ] Integrare `BrandProvider` in root
- [ ] Conditional rendering: Landing vs Gallery

---

## ⏳ TODO CRITICI PER MVP

### 6. Brand Dashboard (alta priorità)

- [ ] Creare `BrandDashboard.tsx` (semplificato da AdminPanel)
- [ ] Albums tab
- [ ] Branding tab (color picker, logo upload)
- [ ] Settings tab

### 7. Refactoring Services per Multi-Brand

- [ ] Adattare `bucketService.ts` per path `/brands/{brandId}/uploads/`
- [ ] Adattare `AppContext.tsx` per usare `brandId`
- [ ] Aggiornare Cloud Function `generateThumbnails` per multi-brand paths

### 8. Gallery Pubblica

- [ ] Adattare `AlbumList.tsx` per usare `BrandContext`
- [ ] Adattare `AlbumView.tsx` per branding dinamico
- [ ] Test visualizzazione gallery per brand

---

## 📋 TODO SECONDARI (Post-MVP o Opzionali)

### Cloud Functions Avanzate

- [ ] Email service con SendGrid/Resend (MVP: solo log console)
- [ ] End user registration con Google OAuth (non necessario per MVP)
- [ ] DNS verification per domini custom (post-MVP)

### Frontend Avanzato

- [ ] BrandSetup wizard multi-step (opzionale, landing page già sufficiente)
- [ ] SuperAdminPanel (moderazione manuale via Firebase Console per MVP)
- [ ] EndUserLogin (non necessario, gallery pubbliche per MVP)
- [ ] GDPR Banner avanzato (cookie consent base già presente)

### UX & Polish

- [ ] Dark mode
- [ ] Search globale
- [ ] Onboarding tour
- [ ] Analytics integration

### DevOps

- [ ] Testing suite
- [ ] CI/CD pipeline
- [ ] Cloud Run domain mapping documentation
- [ ] Migration script da single-tenant

---

## 🎯 PROSSIMI STEP IMMEDIATI

### Per Avere MVP Funzionante:

1. **App.tsx Routing** (1-2 ore)

   - Integrare BrandProvider
   - Conditional rendering basato su `brand`
   - Test routing

2. **Adattare Services** (2-3 ore)

   - `bucketService.ts` → multi-brand paths
   - `AppContext.tsx` → usa `brandId` da `BrandContext`
   - Cloud Function thumbnails → supporta `/brands/{brandId}/`

3. **BrandDashboard Base** (3-4 ore)

   - Creare componente semplificato
   - Albums management (usa AppContext esistente)
   - Branding tab (color pickers + logo upload)
   - Settings tab (read-only per MVP)

4. **Gallery Pubblica** (1-2 ore)

   - Adatta `AlbumList` e `AlbumView`
   - Applica branding CSS variables
   - Test visualizzazione

5. **Testing E2E** (2-3 ore)
   - Test signup flow completo
   - Test upload foto
   - Test personalizzazione branding
   - Test gallery pubblica

**Tempo stimato totale:** 9-14 ore di lavoro concentrato

---

## 📝 NOTE IMPLEMENTATIVE

### Environment Variables Necessarie

**.env.local** (Frontend):

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

**functions/.env** (Cloud Functions):

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
```

### Deploy Checklist

- [ ] Deploy Firestore rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Storage rules: `firebase deploy --only storage`
- [ ] Deploy Cloud Functions: `firebase deploy --only functions`
- [ ] Deploy frontend: `npm run build && gcloud builds submit`
- [ ] Configurare Stripe webhook URL
- [ ] Test end-to-end su staging

---

## 🐛 Known Issues / Limitazioni MVP

1. **Email:** Credenziali loggat in console, non inviate per email (da integrare SendGrid/Resend)
2. **Domini custom:** Non supportati in MVP, solo sottodomini
3. **End user login:** Non implementato, gallery sono tutte pubbliche
4. **Super Admin Panel:** Moderazione manuale via Firebase Console
5. **Analytics:** Non integrati, da aggiungere post-MVP
6. **Testing:** Nessun test automatizzato, solo test manuali

---

## 💡 Decisioni Architetturali MVP

1. **Sottodomini solo:** Per MVP, no domini custom (semplifica setup DNS)
2. **Gallery pubbliche:** No login end user per MVP (semplifica auth)
3. **Email logging:** Credenziali in console per MVP (evita setup SendGrid)
4. **Moderazione manuale:** No admin panel per MVP (Firebase Console sufficiente)
5. **Single plan:** €29/mese fisso, no piani multipli
6. **Storage condiviso:** Tutti i brand nello stesso bucket Firebase (con isolamento via path)

---

**Status:** 🟡 70% Complete - Core Backend & Services Ready  
**Next:** 🔧 Frontend Integration & Dashboard  
**ETA MVP:** 1-2 giorni di lavoro concentrato
