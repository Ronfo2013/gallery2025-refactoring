# 🚀 START HERE - Gallery2025 Multi-Brand SaaS

**Aggiornato:** 19 Novembre 2025  
**Status:** 🟢 **SISTEMA 100% OPERATIVO**

---

## ⚡ Quick Start

### 1. Installa Dipendenze

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Configura Environment Variables

**Frontend (`.env.local`):**

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

**Functions (`functions/.env`):**

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...
STRIPE_PRODUCT_ID=prod_...
```

### 3. Avvia Dev Server

```bash
npm run dev
```

Apri: `http://localhost:5173/`

---

## 🎯 Cosa Puoi Fare

### Gallery Pubblica

```
http://localhost:5173/
```

- Visualizza album
- Naviga foto
- Lightbox interattivo

### Dashboard Superuser

```
http://localhost:5173/{brandSlug}/#/dashboard (sostituisci `{brandSlug}` con lo slug che vuoi testare, es. `test-demo`)
```

**Credenziali Test:**

- Email: `test@example.com`
- Password: `&G0HpsNt@p1&9dweA1!`

**Funzionalità:**

- Upload foto
- Gestione album
- Personalizzazione branding (logo, colori)
- Impostazioni brand

### SuperAdmin Panel

```
http://localhost:5173/#/superadmin
```

**Richiede:** Documento `superadmins` in Firestore

**Funzionalità:**

- Gestione globale sistema
- Configurazione SEO
- Impostazioni Stripe
- Analytics
- System health
- Activity logs

### Admin Panel (Legacy)

```
http://localhost:5173/#/admin
```

- Gestione album (legacy)
- Backup manager
- SEO settings

---

## 📋 Struttura Progetto

```
gallery2025-refactoring/
├── components/          # UI components
├── pages/               # Page components
│   ├── brand/           # Superuser dashboard
│   ├── public/          # Landing page
│   └── superadmin/      # SuperAdmin panel
├── services/            # Business logic
│   ├── brand/
│   ├── payment/
│   └── platform/
├── contexts/            # React contexts
│   ├── BrandContext.tsx
│   └── PlatformContext.tsx
├── functions/           # Cloud Functions
│   ├── index.js
│   └── stripe-functions.js
├── docs/                # Documentation
└── src/                 # New organized code
    ├── components/ui/   # UI library
    ├── styles/
    └── utils/
```

---

## 🔧 Scripts Utili

### Development

```bash
npm run dev              # Dev server
npm run build            # Production build
npm run preview          # Preview build
```

### Firebase

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
firebase emulators:start
```

### Utility

```bash
node create-superadmin.mjs  # Crea SuperAdmin
```

---

## 📚 Documentazione

### Core

- [README_REFACTORING.md](./README_REFACTORING.md) - Overview progetto
- [MVP_IMPLEMENTATION_STATUS.md](./MVP_IMPLEMENTATION_STATUS.md) - Status completo
- [REFACTORING_PLAN.md](./REFACTORING_PLAN.md) - Piano dettagliato

### Technical

- [docs/DATABASE_SCHEMA_MVP.md](./docs/DATABASE_SCHEMA_MVP.md) - Schema Firestore
- [docs/STRIPE_SETUP.md](./docs/STRIPE_SETUP.md) - Stripe integration
- [docs/SUPERADMIN_GUIDE.md](./docs/SUPERADMIN_GUIDE.md) - SuperAdmin guide

### Implementation

- [WEBHOOK_SUCCESS_COMPLETE.md](./WEBHOOK_SUCCESS_COMPLETE.md) - Webhook setup
- [DEPLOY_COMPLETE_SUCCESS.md](./DEPLOY_COMPLETE_SUCCESS.md) - Deploy guide
- [FIX_STORAGE_PERMISSIONS.md](./FIX_STORAGE_PERMISSIONS.md) - Storage permissions
- [PASSWORD_RESET_ADDED.md](./PASSWORD_RESET_ADDED.md) - Password reset
- [UI_REDESIGN_PROFESSIONAL.md](./UI_REDESIGN_PROFESSIONAL.md) - UI redesign plan

---

## 🎯 Feature Complete

### ✅ Sistema Multi-Brand

- Multi-tenancy Firestore
- Brand isolation (data + storage)
- Dynamic branding (CSS variables)
- Subdomain routing

### ✅ Stripe Integration

- Checkout automatico
- Webhook post-payment
- Brand activation
- User creation

### ✅ Dashboard Superuser

- Upload foto multi-brand
- Gestione album
- Branding personalizzato
- Settings management

### ✅ SuperAdmin Panel

- System overview
- SEO & AI Search config
- Company/Fiscal data
- Stripe configuration
- Analytics dashboard
- Brands management
- Activity logs

### ✅ Gallery Pubblica

- Album list responsive
- Photo gallery masonry
- WebP optimization automatica
- Lightbox interattivo

### ✅ Authentication

- Firebase Auth
- Password reset
- SuperAdmin permissions
- Multi-tenant security

---

## 🐛 Troubleshooting

### Port già in uso

```bash
# Trova processo su porta 5173
lsof -i :5173
# Killalo
kill -9 <PID>
```

### Firebase Functions Local

```bash
firebase emulators:start
```

### Clear Cache

```bash
rm -rf node_modules package-lock.json
npm install
```

### Service Worker Issues

Il Service Worker è stato **disabilitato**. Se hai problemi:

1. Apri DevTools → Application → Service Workers
2. Click "Unregister" su tutti i workers
3. Hard refresh (Cmd+Shift+R o Ctrl+Shift+R)

---

## 🎨 Prossimi Step

### UI/UX Redesign (In Arrivo)

- Design system professionale
- Gallery pubblica moderna
- Dashboard superuser elegante
- SuperAdmin panel enterprise
- Preloader animato
- Componenti UI library

**Timeline:** 14-18 ore  
**Documento:** [UI_REDESIGN_PROFESSIONAL.md](./UI_REDESIGN_PROFESSIONAL.md)

---

## 🔗 Links Utili

### Development

- Frontend: `http://localhost:5173/`
- Dashboard: `http://localhost:5173/{brandSlug}/#/dashboard` (brand slug)
- SuperAdmin: `http://localhost:5173/#/superadmin`
- Admin (Legacy): `http://localhost:5173/#/admin`

### Firebase Console

- Project: `gallery-app-972f9`
- Firestore: https://console.firebase.google.com/project/gallery-app-972f9/firestore
- Storage: https://console.firebase.google.com/project/gallery-app-972f9/storage
- Functions: https://console.firebase.google.com/project/gallery-app-972f9/functions
- Authentication: https://console.firebase.google.com/project/gallery-app-972f9/authentication

### Stripe Dashboard

- Test Mode: https://dashboard.stripe.com/test
- Products: https://dashboard.stripe.com/test/products
- Webhooks: https://dashboard.stripe.com/test/webhooks

---

## ✅ System Status

**Core System:** 🟢 100% Operativo  
**UI/UX:** 🟡 In Redesign  
**Cloud Functions:** 🟢 Deployate (4)  
**Database:** 🟢 Multi-tenant Setup  
**Stripe:** 🟢 Webhook Configured  
**Authentication:** 🟢 Password Reset Ready

---

## 💡 Tips

1. **Mock Brand su localhost:** Il sistema usa un mock brand automaticamente su localhost per testing
2. **SuperAdmin Creation:** Usa `node create-superadmin.mjs` per creare SuperAdmin
3. **Real Brand Testing:** Configura `/etc/hosts` con brand reale (vedi docs)
4. **WebP Optimization:** Automatica via Cloud Functions (~30s dopo upload)
5. **Password Reset:** Link "Password dimenticata?" nel form login

---

**Sistema Pronto!** 🚀

Per domande o problemi, consulta la documentazione completa in [MVP_IMPLEMENTATION_STATUS.md](./MVP_IMPLEMENTATION_STATUS.md)
