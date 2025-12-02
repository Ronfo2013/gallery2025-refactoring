# 🚀 Migrazione a Cloud Function per Creazione Brand

## 📋 Panoramica

Questo documento spiega come migrare dalla creazione brand lato client a una **Cloud Function sicura e atomica**.

## ✅ Vantaggi Cloud Function

### 1. **Operazioni Atomiche**

- Crea Auth user + Firestore document in una transazione
- Se uno fallisce, rollback automatico
- **Zero utenti orfani**

### 2. **Sicurezza Migliorata**

- Usa Firebase Admin SDK (permessi completi)
- Validazione server-side
- Protezione contro manipolazione client

### 3. **Gestione Errori Migliore**

- Catch centralizzato
- Messaggi d'errore user-friendly
- Logging strutturato

### 4. **Manutenibilità**

- Logica business centralizzata
- Più facile da testare
- Modifiche senza re-deploy frontend

## 📁 File Creati

### 1. Cloud Function

```
functions/src/createBrand.ts
```

- Valida input
- Verifica subdomain disponibile
- Crea/riusa utente
- Crea brand con batch atomico
- Gestisce utenti orfani

### 2. Service Frontend

```
services/brand/brandCreationService.ts
```

- `createBrandViaCloudFunction()` - Chiama Cloud Function
- `validateBrandData()` - Validazione client-side
- Type-safe con TypeScript

### 3. Configurazione TypeScript

```
functions/tsconfig.json
functions/package.json (aggiornato)
```

## 🔧 Setup

### 1. Installa Dipendenze TypeScript (Functions)

```bash
cd functions
npm install
```

### 2. Compila TypeScript

```bash
cd functions
npm run build
```

Output: `functions/lib/createBrand.js`

### 3. Deploy Cloud Function

```bash
firebase deploy --only functions:createBrand
```

## 🔄 Migrazione BrandsManager

### Opzione A: Migrazione Completa (Raccomandato)

Sostituisci la logica in `BrandsManager.tsx`:

```typescript
import {
  createBrandViaCloudFunction,
  validateBrandData,
} from '../../../services/brand/brandCreationService';

const handleCreateBrand = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Validate client-side
  const errors = validateBrandData(formData);
  if (errors.length > 0) {
    toast.error(errors.join('\n'));
    return;
  }

  const loadingToast = toast.loading('Creazione brand e utente in corso...');

  try {
    // 2. Call Cloud Function
    const result = await createBrandViaCloudFunction({
      name: formData.name.trim(),
      subdomain: formData.subdomain.toLowerCase(),
      email: formData.email.trim(),
      phone: formData.phone?.trim(),
      address: formData.address?.trim(),
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      accentColor: formData.accentColor,
    });

    toast.dismiss(loadingToast);
    toast.success(result.message);

    // 3. Show credentials modal if new user
    if (result.isNewUser && result.password) {
      setCreatedBrand({
        brand: {
          id: result.brandId,
          name: formData.name,
          subdomain: formData.subdomain,
          ownerEmail: formData.email,
          // ... other fields
        } as Brand,
        password: result.password,
      });
    }

    // 4. Reset and reload
    setShowCreateModal(false);
    loadBrands();
  } catch (error: any) {
    toast.dismiss(loadingToast);
    toast.error(error.message);
  }
};
```

### Opzione B: Graduale (Feature Flag)

Aggiungi un toggle per scegliere il metodo:

```typescript
const USE_CLOUD_FUNCTION = true; // Flag di configurazione

const handleCreateBrand = async (e: React.FormEvent) => {
  if (USE_CLOUD_FUNCTION) {
    return handleCreateBrandViaCloudFunction(e);
  } else {
    return handleCreateBrandLegacy(e);
  }
};
```

## 🧪 Testing

### 1. Test Locale (Emulator)

```bash
# Terminal 1: Avvia emulators
firebase emulators:start

# Terminal 2: Punta frontend agli emulators
# In .env.local:
VITE_USE_EMULATORS=true
```

### 2. Test Production

```bash
# Deploy function
firebase deploy --only functions:createBrand

# Test dal SuperAdmin panel
```

### 3. Test Cases

- ✅ **Nuovo brand con email nuova** → Crea utente + brand
- ✅ **Nuovo brand con email esistente** → Riusa utente
- ✅ **Subdomain duplicato** → Error chiaro
- ✅ **Utente orfano** → Recupero automatico
- ✅ **Permessi** → Solo SuperAdmin può chiamare

## 📊 Confronto Metodi

| Feature            | Client-Side        | Cloud Function |
| ------------------ | ------------------ | -------------- |
| **Sicurezza**      | ⚠️ Media           | ✅ Alta        |
| **Atomicità**      | ❌ No              | ✅ Sì          |
| **Utenti Orfani**  | ⚠️ Possibili       | ✅ Zero        |
| **Validazione**    | ⚠️ Client          | ✅ Server      |
| **Permessi**       | ⚠️ Firestore Rules | ✅ Admin SDK   |
| **Testing**        | ❌ Difficile       | ✅ Facile      |
| **Manutenibilità** | ⚠️ Media           | ✅ Alta        |

## 🔐 Sicurezza

La Cloud Function verifica:

1. ✅ Utente autenticato
2. ✅ Utente è SuperAdmin
3. ✅ Input validato
4. ✅ Subdomain disponibile
5. ✅ Operazioni atomiche

## 📈 Monitoring

### Logs Cloud Function

```bash
# Real-time logs
firebase functions:log --only createBrand

# O via Console
https://console.firebase.google.com/project/gallery-app-972f9/functions/logs
```

### Metriche

- Invocazioni totali
- Errori
- Latenza
- Cold starts

## 🐛 Troubleshooting

### Errore: "Function not found"

```bash
# Verifica deploy
firebase functions:list | grep createBrand

# Re-deploy
firebase deploy --only functions:createBrand
```

### Errore: "Permission denied"

- Verifica che l'utente loggato sia in `/superadmins/{uid}`
- Controlla Firestore Rules

### Errore: "CORS"

La function ha già `cors: true` configurato. Se persiste:

```typescript
// In createBrand.ts
export const createBrand = onCall({
  region: 'europe-west1',
  cors: ['https://gallery-app-972f9.web.app', 'http://localhost:5173'],
}, ...);
```

## 🚀 Prossimi Passi

1. ✅ Deploy Cloud Function
2. ✅ Test in staging
3. ✅ Migra BrandsManager
4. ✅ Rimuovi logica client-side legacy
5. ✅ Monitor errori per 48h
6. ✅ Deploy production

## 📚 Risorse

- [Cloud Functions v2](https://firebase.google.com/docs/functions/get-started?gen=2nd)
- [HTTPS Callable Functions](https://firebase.google.com/docs/functions/callable)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Ultimo aggiornamento:** 24 Nov 2025  
**Status:** ✅ Pronto per deploy
