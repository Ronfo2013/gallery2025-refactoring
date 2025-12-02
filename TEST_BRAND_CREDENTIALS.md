# 🧪 Brand di Test - Credenziali e Istruzioni

**Data creazione:** 20 Novembre 2025

---

## 📋 Credenziali Brand di Test

### Brand Information

- **Brand ID:** `ltl3C2wWIhCRSFuSvhcB`
- **Nome:** Test Brand Demo
- **Subdomain:** `test-demo`
- **Email:** `test-demo@example.com`
- **Status:** `active`

### Superuser Account

- **UID:** `7hwu0wex9GTjIdPLkL7EUjdV2uw1`
- **Email:** `test-demo@example.com`
- **Password:** `TestDemo2025!`
- **Role:** `owner`

### SuperAdmin Account (Sistema)

- **Email:** `info@benhanced.it`
- **Password:** `SuperAdmin2025!`
- **UID:** `zSpeNfvdUMS5UThmLsXNei2hMJi2`

---

## 🌍 URL di Test

### Produzione

- **Dashboard Superuser:** https://gallery-app-972f9.web.app/test-demo/#/dashboard
- **SuperAdmin Panel:** https://gallery-app-972f9.web.app/#/superadmin
- **Landing Page:** https://gallery-app-972f9.web.app/

### Locale (con subdomain)

Per testare il multi-tenancy con subdomain:

1. Aggiungi a `/etc/hosts`:

   ```
   127.0.0.1 test-demo.gallery.local
   ```

2. Avvia dev server:

   ```bash
   npm run dev
   ```

3. Apri: `http://test-demo.gallery.local:5173` (per la gallery pubblica)
4. Per accedere al dashboard usa: `http://test-demo.gallery.local:5173/test-demo/#/dashboard`

---

## 🧪 Test Passo-Passo

### 1. Login Dashboard

1. Vai su: https://gallery-app-972f9.web.app/test-demo/#/dashboard
2. Email: `test-demo@example.com`
3. Password: `TestDemo2025!`
4. Clicca "Login"

### 2. Verifica Dashboard

- ✅ Dovresti vedere il dashboard del brand "Test Brand Demo"
- ✅ Tabs disponibili: Settings, Albums, Analytics
- ✅ Branding: colori blu (#3b82f6) e viola (#8b5cf6)

### 3. Crea Album di Test

1. Clicca su "Crea Album" (o tab Albums)
2. Nome: "Album di Test"
3. Descrizione: "Primo album per testare il sistema"
4. Privacy: Pubblico
5. Salva

### 4. Carica Foto

1. Apri l'album appena creato
2. Clicca "Carica Foto"
3. Seleziona 2-3 foto di test
4. Attendi caricamento
5. Verifica che appaiano nell'album

### 5. Verifica Cloud Functions

- ✅ Thumbnails generate automaticamente (Cloud Function `generateThumbnails`)
- ✅ Formato WebP attivato
- ✅ Dimensioni: small (400px), medium (800px), large (1200px)
- ✅ Check in Firebase Storage: `brands/ltl3C2wWIhCRSFuSvhcB/thumbnails/`

### 6. Test Visualizzazione Pubblica

1. Logout dal dashboard
2. Vai alla gallery pubblica (route principale)
3. Verifica che l'album sia visibile
4. Clicca sull'album
5. Verifica che le foto siano visibili
6. Test lightbox/viewer (clicca su una foto)

### 7. Test SuperAdmin Panel

1. Vai su: https://gallery-app-972f9.web.app/#/superadmin
2. Email: `info@benhanced.it`
3. Password: `SuperAdmin2025!`
4. Verifica 7 tabs: Sistema, SEO & AI, Azienda, Stripe, Analytics, Brands, Logs
5. Tab "Brands" → dovresti vedere "Test Brand Demo"

---

## 🗂️ Struttura Firestore

### Collection: `brands`

Document ID: `ltl3C2wWIhCRSFuSvhcB`

```json
{
  "name": "Test Brand Demo",
  "subdomain": "test-demo",
  "customDomain": null,
  "email": "test-demo@example.com",
  "status": "active",
  "branding": {
    "logo": "",
    "primaryColor": "#3b82f6",
    "secondaryColor": "#8b5cf6"
  },
  "integrations": {
    "googleAnalytics": "",
    "metaPixel": ""
  },
  "stripe": {
    "customerId": "cus_test_demo",
    "subscriptionId": null,
    "productId": "prod_TS1EaWokTNEIY1"
  }
}
```

### Sub-collection: `brands/{brandId}/superusers`

Document ID: `7hwu0wex9GTjIdPLkL7EUjdV2uw1`

```json
{
  "email": "test-demo@example.com",
  "displayName": "Test Brand Demo",
  "role": "owner",
  "permissions": {
    "manageAlbums": true,
    "managePhotos": true,
    "manageSettings": true,
    "viewAnalytics": true
  }
}
```

---

## 📦 Storage Structure

```
brands/
└── ltl3C2wWIhCRSFuSvhcB/
    ├── logos/           # Logo del brand
    ├── uploads/         # Foto originali caricate
    └── thumbnails/      # Thumbnails generate (small, medium, large, webp)
```

---

## 🔧 Script Utilizzati

### Creazione Brand

```bash
node create-test-brand-simple.cjs
```

Questo script:

1. Crea/aggiorna il brand in Firestore
2. Crea l'utente in Firebase Auth
3. Crea il documento superuser
4. Inizializza le cartelle Storage

---

## ✅ Checklist Test Completo

- [ ] Login dashboard funzionante
- [ ] Dashboard carica correttamente
- [ ] Creazione album funzionante
- [ ] Upload foto funzionante
- [ ] Cloud Function thumbnails attiva
- [ ] Thumbnails generate correttamente
- [ ] WebP generation attiva
- [ ] Visualizzazione pubblica funzionante
- [ ] Lightbox/viewer funzionante
- [ ] SuperAdmin panel accessibile
- [ ] Brand visibile nel SuperAdmin panel
- [ ] Branding personalizzato applicato (colori)
- [ ] Storage folders create correttamente
- [ ] Firestore security rules funzionanti

---

## 🚨 Troubleshooting

### Login non funziona

- Verifica che l'API key in `.env.production` sia corretta
- Controlla che l'utente esista in Firebase Auth
- Verifica che il documento superuser esista in Firestore

### Dashboard non carica

- Verifica che il brand esista in Firestore
- Controlla che lo status sia `active`
- Verifica che il documento superuser abbia i permessi corretti

### Upload foto non funziona

- Verifica le Storage Rules
- Controlla che le cartelle Storage esistano
- Verifica i permessi dell'utente

### Thumbnails non generate

- Verifica che la Cloud Function `generateThumbnails` sia deployata
- Controlla i logs in Firebase Console → Functions
- Verifica che la funzione sia in `europe-west1`

---

## 📚 Riferimenti

- **Firebase Console:** https://console.firebase.google.com/project/gallery-app-972f9
- **Stripe Dashboard:** https://dashboard.stripe.com/test/dashboard
- **Hosting URL:** https://gallery-app-972f9.web.app
- **Cloud Functions Region:** `europe-west1`

---

**Aggiornato:** 20 Novembre 2025
