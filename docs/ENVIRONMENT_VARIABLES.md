# 🔐 Environment Variables Documentation

Questa applicazione utilizza environment variables per configurare servizi esterni e comportamenti dell'applicazione.

## 📋 Setup Iniziale

1. Copia `.env.example` in `.env`:
```bash
cp .env.example .env
```

2. Compila i valori richiesti (vedi sezioni sotto)

3. **IMPORTANTE**: Non committare mai il file `.env` (già in `.gitignore`)

---

## 🔥 Firebase Configuration (REQUIRED)

Queste variabili sono **obbligatorie** per il funzionamento dell'app.

### Come ottenerle:
1. Vai su [Firebase Console](https://console.firebase.google.com/)
2. Seleziona il tuo progetto
3. Settings (⚙️) > Project Settings
4. Scorri a "Your apps" > Web app
5. Copia i valori dal config object

### Variabili:
```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

**Nota**: `VITE_FIREBASE_API_KEY` è sicuro per il client-side (viene validato via Firestore Rules).

---

## 🧪 Firebase Emulators (DEVELOPMENT ONLY)

Usa gli emulatori Firebase per sviluppo locale senza toccare dati production.

### Setup:
```bash
npm run firebase:emulators
```

### Variabili:
```env
# Abilita emulators
VITE_FIREBASE_USE_EMULATOR=true

# Hosts (valori di default)
VITE_FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080
VITE_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
VITE_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
VITE_FIREBASE_FUNCTIONS_EMULATOR_HOST=localhost:5001
```

**Quando usarli**:
- ✅ Sviluppo locale
- ✅ Testing senza costi
- ✅ Debugging functions

**Quando NON usarli**:
- ❌ Production
- ❌ Staging
- ❌ Demo pubbliche

---

## 🌍 Application URLs

### VITE_APP_URL
Base URL dell'applicazione.

**Development**:
```env
VITE_APP_URL=http://localhost:5173
```

**Production**:
```env
VITE_APP_URL=https://your-domain.com
```

**Usato per**:
- Redirect dopo payment
- Email links
- SEO metadata

### VITE_CUSTOM_DOMAIN (Optional)
Per configurazione multi-tenant custom domains.

```env
VITE_CUSTOM_DOMAIN=custom-brand.com
```

---

## 💳 Stripe Configuration (OPTIONAL)

Richiesto solo se usi Stripe per pagamenti.

### Frontend (.env):
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Test mode
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... # Production
```

### Backend (Cloud Functions):
Configura via Firebase CLI:

```bash
# Test mode
firebase functions:secrets:set STRIPE_SECRET_KEY
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
firebase functions:secrets:set STRIPE_PRICE_ID

# Production (quando pronto)
# Usa le chiavi live di Stripe
```

### Come ottenere le chiavi:
1. [Stripe Dashboard](https://dashboard.stripe.com/)
2. Developers > API Keys
3. Copia "Publishable key" e "Secret key"
4. Per webhook secret: Developers > Webhooks > Add endpoint
5. Endpoint: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/handleStripeWebhook`
6. Eventi: `checkout.session.completed`, `payment_intent.succeeded`

**IMPORTANTE**:
- Non committare mai `STRIPE_SECRET_KEY`
- Usa test keys in development
- Switch a live keys solo in production dopo testing completo

---

## 🤖 Google Gemini AI (OPTIONAL)

Per generazione automatica descrizioni album con AI.

```env
VITE_GEMINI_API_KEY=AIza...
```

### Come ottenerla:
1. [Google AI Studio](https://makersuite.google.com/)
2. Get API Key
3. Copia la chiave

**Nota**: Gemini API ha un free tier generoso (60 richieste/minuto).

---

## 📊 Analytics & Monitoring (OPTIONAL)

### Sentry (Error Tracking)
```env
VITE_SENTRY_DSN=https://...@sentry.io/...
```

**Setup**:
1. Crea progetto su [Sentry.io](https://sentry.io)
2. Installa SDK: `npm install @sentry/react @sentry/vite-plugin`
3. Configura in `src/main.tsx` (vedi PIANO_MIGLIORAMENTI.md Task 5.1)

**Quando attivarla**: Solo in production (check `import.meta.env.PROD`)

### Google Analytics
```env
VITE_GA_MEASUREMENT_ID=G-...
```

**Setup**:
1. [Google Analytics](https://analytics.google.com/)
2. Create property
3. Copia Measurement ID

---

## 🔍 Verifica Security

### Audit checklist:

✅ **File .env non committato**:
```bash
git status | grep ".env"
# Dovrebbe essere vuoto
```

✅ **Nessun secret hardcoded**:
```bash
grep -r "AIza" src/
grep -r "sk_live" src/
grep -r "sk_test" src/
# Dovrebbero essere vuoti
```

✅ **.gitignore corretto**:
```bash
cat .gitignore | grep .env
# Dovrebbe mostrare .env, .env.*, etc.
```

✅ **Cloud Functions secrets**:
```bash
firebase functions:secrets:access STRIPE_SECRET_KEY
# Dovrebbe mostrare il valore (se configurato)
```

---

## 🚀 Deployment

### Development
```bash
npm run dev
# Usa .env
```

### Production Build
```bash
npm run build
# Vite injecta VITE_* variables al build time
```

### Cloud Functions
```bash
firebase deploy --only functions
# Usa secrets configurati via Firebase CLI
```

### Docker
```bash
# Build con env vars
docker build --build-arg VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY ...

# O mount .env file
docker run --env-file .env ...
```

---

## 🆘 Troubleshooting

### "Firebase: Error (auth/invalid-api-key)"
- ✅ Verifica `VITE_FIREBASE_API_KEY` in `.env`
- ✅ Verifica API key sia abilitata in Firebase Console > Settings > API Keys

### "Stripe: No API key provided"
- ✅ Verifica `VITE_STRIPE_PUBLISHABLE_KEY` in `.env`
- ✅ Verifica backend secrets: `firebase functions:secrets:list`

### "Cannot read property 'env' of undefined"
- ✅ Variabile deve iniziare con `VITE_` per Vite
- ✅ Restart dev server dopo modifiche a `.env`

### Environment variables non si aggiornano
```bash
# Restart dev server
npm run dev

# O forza rebuild
rm -rf node_modules/.vite
npm run dev
```

---

## 📚 Risorse

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Config](https://firebase.google.com/docs/web/setup)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Google Gemini API](https://ai.google.dev/docs)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
