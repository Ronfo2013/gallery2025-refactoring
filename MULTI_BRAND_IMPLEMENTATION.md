# 🏢 Multi-Brand Selector - Implementazione Completa

**Data:** 24 Novembre 2025  
**Status:** ✅ Implementato e Pronto

---

## 📋 Panoramica

Sistema completo per permettere ai superuser di gestire **più brand** con un unico account.

### Features Implementate

- ✅ **BrandSelector Component** - Dropdown elegante per switchare tra brand
- ✅ **MultiBrandContext** - Context dedicato per multi-brand management
- ✅ **Schema Aggiornato** - `SuperUser.brandIds[]` invece di singolo `brandId`
- ✅ **Backward Compatibility** - Mantiene `brandId` per compatibilità legacy
- ✅ **Auto-Update** - Aggiunta automatica brand a utenti esistenti
- ✅ **LocalStorage Caching** - Ricorda brand selezionato
- ✅ **Script Migrazione** - Migra dati esistenti automaticamente

---

## 🎨 UI/UX

### BrandSelector Component

```tsx
// Mostra solo se l'utente ha più di 1 brand
<BrandSelector
  currentBrandId={brand.id}
  userBrandIds={brands.map((b) => b.id)}
  onBrandChange={handleBrandChange}
/>
```

**Caratteristiche:**

- Dropdown moderno con backdrop
- Icona circolare con colore brand
- Check mark sul brand attivo
- Info status (active/suspended)
- Footer con conteggio brand

### Screenshot Flow

```
┌─────────────────────────────────────┐
│  [Logo] Brand Name ▼                │  <- Click per aprire
│         brand-slug.com               │
│                                      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  ● Acme Photography         [✓]     │  <- Brand attivo
│    acme.com                          │
│                                      │
│  ● Studio XYZ                        │
│    studio-xyz.com                    │
│                                      │
│  ● Event Gallery           [pending]│
│    events.com                        │
│                                      │
│  ─────────────────────────────────  │
│  Managing 3 brands                   │
└─────────────────────────────────────┘
```

---

## 🔧 Architettura

### 1. Types (`types.ts`)

```typescript
export interface SuperUser {
  id: string; // Firebase Auth UID
  email: string;
  brandId?: string; // Legacy: backward compatibility
  brandIds: string[]; // NEW: array of brand IDs
  activeBrandId?: string; // Currently selected (cached)
  createdAt: Date;
  updatedAt?: Date;
}
```

### 2. MultiBrandContext (`contexts/MultiBrandContext.tsx`)

**Provider:**

```tsx
<MultiBrandProvider userId={user.uid}>
  <BrandDashboardContent />
</MultiBrandProvider>
```

**Hook:**

```typescript
const {
  superUser, // SuperUser data
  brands, // Array of Brand objects
  currentBrand, // Currently selected brand
  loading, // Loading state
  error, // Error message
  switchBrand, // Function to switch brand
  refreshBrands, // Function to reload brands
} = useMultiBrand();
```

**Logica:**

1. Carica documento `superusers/{userId}`
2. Estrae `brandIds[]` (o migra da legacy `brandId`)
3. Carica tutti i brand associati
4. Determina brand attivo (da localStorage o primo della lista)
5. Permette switch con `switchBrand(brandId)`

### 3. BrandSelector (`components/brand/BrandSelector.tsx`)

**Props:**

```typescript
interface BrandSelectorProps {
  currentBrandId: string | null;
  userBrandIds: string[];
  onBrandChange: (brandId: string) => void;
}
```

**Comportamento:**

- Se `userBrandIds.length <= 1` → Non mostra selector (inutile)
- Click brand → Chiama `onBrandChange(brandId)`
- Chiusura automatica dopo selezione
- Toast di conferma: "Switched to [Brand Name]"

### 4. Service Update (`services/platform/platformService.ts`)

**`createBrandSuperuser()` Aggiornato:**

```typescript
// Prima (single brand):
await setDoc(doc(db, 'superusers', userId), {
  email,
  brandId, // Single string
  createdAt: new Date(),
});

// Dopo (multi-brand):
await setDoc(doc(db, 'superusers', userId), {
  email,
  brandIds: [brandId], // Array!
  brandId, // Legacy (per compatibilità)
  createdAt: new Date(),
  updatedAt: new Date(),
});
```

**Gestione Utente Esistente:**

```typescript
if (existingUser) {
  let brandIds = existingUser.brandIds || [existingUser.brandId];

  if (!brandIds.includes(newBrandId)) {
    brandIds.push(newBrandId);

    await updateDoc(userRef, {
      brandIds,
      updatedAt: new Date(),
    });
  }
}
```

---

## 🔄 Migrazione Dati

### Script: `scripts/migrate-superusers-to-multi-brand.cjs`

**Cosa fa:**

1. Legge tutti i documenti `/superusers/*`
2. Per ogni superuser:
   - Se ha già `brandIds[]` → Skip (già migrato)
   - Se ha solo `brandId` → Converte in `brandIds: [brandId]`
   - Mantiene `brandId` legacy per compatibilità
3. Stampa summary con conteggi

**Esecuzione:**

```bash
node scripts/migrate-superusers-to-multi-brand.cjs
```

**Output Esempio:**

```
🚀 Starting SuperUser Migration to Multi-Brand Support

📊 Found 5 superuser(s) to migrate

👤 Processing user: user1@example.com (uid123)
   ✅ Migrated:
      - brandId: "brand-a"
      - brandIds: ["brand-a"]

👤 Processing user: user2@example.com (uid456)
   ✓ Already migrated (has brandIds array)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 MIGRATION SUMMARY:

   ✅ Successfully migrated: 3
   ℹ️  Already migrated:     2
   ❌ Errors:                0
   📊 Total processed:       5

---

## 🔧 Prossimi passaggi per la gestione brand da SuperAdmin

1. **Cascade delete** – quando elimini un brand, chiama una Cloud Function/servizio backend che elimina `brands/{brandId}`, `superusers/{uid}`, tutte le sotto-collection di album/foto, svuota il bucket `brands/{brandId}/…` e aggiorna Stripe. Questo evita dati orfani.
2. **UI completa** – mostra username/email, `subscription.currentPeriodEnd` (expiration) e `temporaryPassword` nel card/modal del brand (con toggle `Show/Hide`). Aggiungi anche un bottone “Stripe metadata / scadenza” se servono ulteriori info.
3. **Password & link** – mantieni `temporaryPassword` in Firestore (come già fa `createBrandSuperuser`) e copia direttamente il link `https://gallery-app-972f9.web.app/{brandSlug}/#/dashboard` dal modal; fornisci un helper (`scripts/fix-brand.sh`/`ensure-superuser-doc.cjs`) per ricreare i documenti se qualcosa manca.
4. **Documentazione e deploy** – aggiorna `ACCESSO_MULTIUTENTE_GUIDA.md` e i changelog con queste UX, e prevedi un deploy delle nuove funzioni (Storage/Firestore/Functions) prima di aprire i user story a produzione.

🎉 Migration completed successfully!
```

---

## 🧪 Testing

### Test 1: Singolo Brand (No Selector)

```bash
# 1. Crea brand per nuovo utente
Email: test-single@example.com

# 2. Login dashboard
http://localhost:5173/#/dashboard

# 3. Verifica
✅ Nessun BrandSelector visibile (ha solo 1 brand)
✅ Vede nome brand direttamente nell'header
```

### Test 2: Multi-Brand (Con Selector)

```bash
# 1. Crea primo brand
Email: test-multi@example.com
Brand: "Photography Studio"

# 2. Crea secondo brand (stessa email)
Email: test-multi@example.com
Brand: "Event Gallery"

# 3. Login dashboard
http://localhost:5173/#/dashboard

# 4. Verifica
✅ BrandSelector visibile nell'header
✅ Click selector → Mostra entrambi i brand
✅ Click "Event Gallery" → Switch + Toast
✅ Reload pagina → Mantiene brand selezionato (localStorage)
```

### Test 3: Migrazione Dati

```bash
# 1. Crea brand legacy (senza brandIds)
# Vai in Firestore e crea manualmente:
/superusers/{uid}
  - email: "legacy@example.com"
  - brandId: "old-brand-id"

# 2. Esegui script migrazione
node scripts/migrate-superusers-to-multi-brand.cjs

# 3. Verifica in Firestore
/superusers/{uid}
  - email: "legacy@example.com"
  - brandId: "old-brand-id"     (mantenuto)
  - brandIds: ["old-brand-id"]  (NUOVO!)
  - updatedAt: <timestamp>

# 4. Login dashboard
✅ Utente legacy funziona normalmente
✅ Può aggiungere nuovi brand
```

---

## 📊 Firestore Structure

### Before (Legacy)

```
/superusers/{userId}
  - email: "user@example.com"
  - brandId: "brand-abc123"
  - createdAt: Timestamp
```

### After (Multi-Brand)

```
/superusers/{userId}
  - email: "user@example.com"
  - brandId: "brand-abc123"           # Legacy (primo brand)
  - brandIds: [                       # NEW: Array
      "brand-abc123",
      "brand-xyz456",
      "brand-def789"
    ]
  - activeBrandId: "brand-xyz456"     # Optional: ultimo selezionato
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

---

## 🔀 Flusso Completo

### 1. SuperAdmin Crea Brand

```typescript
// SuperAdmin Panel → Nuovo Brand
{
  name: "Acme Photography",
  email: "owner@acme.com"
}

↓

// createBrandSuperuser()
// - Check if user exists (query by email)
// - If exists: Add brand to brandIds[]
// - If new: Create user with brandIds: [brandId]

↓

// Firestore /superusers/{userId}
{
  email: "owner@acme.com",
  brandIds: ["brand-1", "brand-2"],  // Aggiornato!
  brandId: "brand-1",                 // Legacy
  updatedAt: now
}
```

### 2. Superuser Login

```typescript
// 1. Login con email/password
// 2. Get userId from Firebase Auth

↓

// 3. MultiBrandProvider carica dati
const superuser = await getDoc(doc(db, 'superusers', userId));
const brandIds = superuser.brandIds || [superuser.brandId];

↓

// 4. Carica tutti i brand
const brands = await Promise.all(
  brandIds.map(id => getBrandById(id))
);

↓

// 5. Determina brand attivo
const storedBrandId = localStorage.getItem('gallery_active_brand_id');
const currentBrand = brands.find(b => b.id === storedBrandId) || brands[0];

↓

// 6. Dashboard caricata con brand attivo
```

### 3. Switch Brand

```typescript
// 1. User click su altro brand nel selector
handleBrandChange("brand-xyz456")

↓

// 2. switchBrand() nel context
await switchBrand(brandId);

// - Trova brand nell'array brands
// - Aggiorna currentBrand state
// - Salva in localStorage

↓

// 3. Dashboard si aggiorna automaticamente
// (tutti i componenti figli usano currentBrand)
```

---

## ⚠️ Note Importanti

### Backward Compatibility

✅ **Mantiene `brandId` legacy** per garantire che:

- Codice vecchio continua a funzionare
- Rollback possibile se necessario
- Migrazione graduale senza breaking changes

### Performance

✅ **Ottimizzazioni implementate:**

- Load brands una volta all'inizio
- Cache in localStorage (ultimo brand selezionato)
- No re-fetch su switch (usa dati già caricati)
- Lazy loading selector (solo se multiple brands)

### Security

✅ **Firestore Rules aggiornate:**

```javascript
match /superusers/{userId} {
  // User può leggere solo il proprio documento
  allow read: if request.auth.uid == userId || isSuperAdmin();

  // Solo SuperAdmin può creare/aggiornare
  allow create: if isSuperAdmin();
  allow update, delete: if false;
}
```

---

## 🚀 Deploy

### 1. Build & Test Locale

```bash
# Build frontend
npm run build

# Test localmente
npm run dev

# Vai su /#/dashboard e testa selector
```

### 2. Migrazione Produzione

```bash
# Esegui script migrazione
node scripts/migrate-superusers-to-multi-brand.cjs

# Verifica output (nessun errore)

# Deploy
npm run build
firebase deploy --only hosting
```

### 3. Verifica Post-Deploy

```bash
# 1. Login con utente esistente
https://gallery-app-972f9.web.app/#/dashboard

# 2. Se ha più brand:
✅ Selector visibile
✅ Click selector → Vede lista brand
✅ Switch funziona

# 3. Crea nuovo brand con email esistente
✅ Brand aggiunto a brandIds[]
✅ Selector aggiornato automaticamente
```

---

## 📚 Risorse

- **Codice:**
  - `types.ts` - SuperUser interface
  - `contexts/MultiBrandContext.tsx` - Multi-brand logic
  - `components/brand/BrandSelector.tsx` - UI component
  - `services/platform/platformService.ts` - createBrandSuperuser()
  - `pages/brand/BrandDashboardNew.tsx` - Integration

- **Scripts:**
  - `scripts/migrate-superusers-to-multi-brand.cjs` - Migration

- **Docs:**
  - [ACCESSO_MULTIUTENTE_GUIDA.md](./ACCESSO_MULTIUTENTE_GUIDA.md) - User guide
  - [CHANGELOG.md](./CHANGELOG.md) - Change log

---

## 🎉 Conclusione

Il sistema multi-brand è **completamente implementato e testato**!

**Cosa cambia per gli utenti:**

- ✅ Possono gestire più brand con un unico account
- ✅ Switch rapido tra brand dal dashboard
- ✅ Nessuna password aggiuntiva necessaria
- ✅ Esperienza seamless

**Cosa cambia per il SuperAdmin:**

- ✅ Crea brand per email esistenti → Aggiunge automaticamente
- ✅ Nessuna gestione manuale necessaria
- ✅ Sistema intelligente gestisce tutto

**Prossimi Step (Opzionali):**

- [ ] Multi-brand permission system (ruoli diversi per brand diversi)
- [ ] Brand invitation system (invita altri user a gestire un brand)
- [ ] Brand transfer (trasferisci ownership)

---

**Ultimo aggiornamento:** 24 Nov 2025  
**Status:** ✅ Pronto per Produzione
