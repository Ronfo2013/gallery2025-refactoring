# 🛡️ Prevenzione Errori Storage Paths

Questo documento spiega come prevenire errori nei path di Firebase Storage.

---

## 🎯 **Il Problema**

Quando usi path hardcoded come `brands/uploads/photo.jpg`, rischi:

- ❌ Typo nei path
- ❌ Path non corrispondenti alle Storage Rules
- ❌ Errori 403 Forbidden in produzione
- ❌ Difficoltà nel refactoring

---

## ✅ **Le Soluzioni**

### **1. Usa `storagePaths.ts` (Type-Safe Paths)**

**Prima** (unsafe):

```typescript
const path = `brands/uploads/${filename}`; // ❌ Typo possibile
```

**Dopo** (type-safe):

```typescript
import { storagePaths } from '@/lib/storagePaths';
const path = storagePaths.brandUpload(filename); // ✅ Type-safe
```

**Vantaggi**:

- ✅ Autocomplete IDE
- ✅ Type checking
- ✅ Refactoring sicuro
- ✅ Centralizzato

---

### **2. Test Automatici Storage Rules**

Testa le regole **prima** del deploy:

```bash
# Avvia Firebase Emulator
npm run firebase:start

# In un altro terminale, esegui i test
npm run test:storage-rules
```

**Cosa testa**:

- ✅ Lettura pubblica funziona
- ✅ Upload autenticati funzionano
- ✅ Upload non autenticati vengono bloccati
- ✅ Permessi brand owner corretti

---

### **3. Validazione Pre-Deploy**

Aggiungi al tuo workflow:

```bash
# Valida che tutti i path nel codice matchino le Storage Rules
node scripts/validate-storage-paths.js
```

Questo script:

1. Legge `storage.rules`
2. Scansiona tutto il codice
3. Trova tutti gli usi di `.ref('...')`
4. Verifica che matchino le regole
5. Segnala errori

---

### **4. CI/CD Integration**

Aggiungi al `.github/workflows/ci.yml`:

```yaml
- name: 🔍 Validate Storage Paths
  run: node scripts/validate-storage-paths.js

- name: 🧪 Test Storage Rules
  run: |
    npm run firebase:start &
    sleep 5
    npm run test:storage-rules
```

---

## 📋 **Checklist Pre-Deploy**

Prima di fare deploy di modifiche a Storage:

- [ ] ✅ Path definiti in `storagePaths.ts`
- [ ] ✅ Test Storage Rules passano
- [ ] ✅ Validazione path completata
- [ ] ✅ Build locale OK
- [ ] ✅ Test manuale su emulator

---

## 🚀 **Workflow Consigliato**

### **Quando aggiungi un nuovo path**:

1. **Aggiungi a `storagePaths.ts`**:

   ```typescript
   export const storagePaths = {
     // ... existing paths
     newFeature: (id: string) => `brands/${id}/new-feature`,
   };
   ```

2. **Aggiungi regola in `storage.rules`**:

   ```javascript
   match /brands/{brandId}/new-feature/{allPaths=**} {
     allow read: if true;
     allow write: if isAuthenticated();
   }
   ```

3. **Aggiungi test**:

   ```typescript
   it('✅ permette upload new-feature', async () => {
     const path = storagePaths.newFeature('brand123');
     await assertSucceeds(storage.ref(path).put(data));
   });
   ```

4. **Valida**:

   ```bash
   npm run test:storage-rules
   node scripts/validate-storage-paths.js
   ```

5. **Deploy**:
   ```bash
   firebase deploy --only storage
   ```

---

## 🔧 **Comandi Utili**

```bash
# Test Storage Rules localmente
npm run test:storage-rules

# Valida path nel codice
node scripts/validate-storage-paths.js

# Avvia emulator per test manuali
npm run firebase:start

# Deploy solo Storage Rules
firebase deploy --only storage --project gallery-app-972f9

# Deploy preview per testare
firebase hosting:channel:deploy test-storage --project gallery-app-972f9
```

---

## 📊 **Esempio Completo**

### **Scenario**: Aggiungere upload per brand thumbnails

**1. Definisci path**:

```typescript
// src/lib/storagePaths.ts
brandThumbnail: (brandId: string, filename: string) =>
  `brands/${brandId}/thumbnails/${filename}`,
```

**2. Aggiungi regola**:

```javascript
// storage.rules
match /brands/{brandId}/thumbnails/{filename} {
  allow read: if true;
  allow write: if isBrandOwner(brandId) || isSuperAdmin();
}
```

**3. Usa nel codice**:

```typescript
import { storagePaths } from '@/lib/storagePaths';

const uploadThumbnail = async (brandId: string, file: File) => {
  const path = storagePaths.brandThumbnail(brandId, file.name);
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
};
```

**4. Testa**:

```typescript
it('✅ brand owner può uploadare thumbnail', async () => {
  const path = storagePaths.brandThumbnail('brand123', 'thumb.jpg');
  await assertSucceeds(ownerStorage.ref(path).put(data));
});
```

---

## 🎯 **Best Practices**

1. **✅ SEMPRE usa `storagePaths.ts`** - mai path hardcoded
2. **✅ Testa localmente** con emulator prima del deploy
3. **✅ Aggiungi test** per ogni nuovo path
4. **✅ Valida** prima del deploy in produzione
5. **✅ Usa preview channels** per testare in ambiente reale

---

## 🆘 **Troubleshooting**

### **Errore 403 Forbidden**

1. Verifica che il path sia in `storage.rules`
2. Controlla che l'utente sia autenticato
3. Verifica i permessi (owner/superadmin)
4. Testa con emulator locale

### **Path non trovato**

1. Verifica typo nel path
2. Usa `storagePaths.ts` invece di hardcoded
3. Esegui validazione: `node scripts/validate-storage-paths.js`

### **Test falliscono**

1. Assicurati che emulator sia avviato
2. Verifica che `storage.rules` sia aggiornato
3. Controlla mock Firestore data nei test

---

**Ricorda**: La prevenzione è meglio della cura! 🛡️
