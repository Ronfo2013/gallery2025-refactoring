# ✅ Sistema di Prevenzione Errori Storage - QUICK START

## 🎯 **Soluzione Pratica: Type-Safe Paths**

La soluzione più semplice ed efficace per prevenire errori nei path Storage.

---

## 🚀 **Setup (1 minuto)**

### **1. Usa sempre `storagePaths.ts`**

```typescript
// ❌ PRIMA (unsafe - rischio typo)
const path = `brands/uploads/${filename}`;
const ref = storageRef(storage, path);

// ✅ DOPO (type-safe - zero errori)
import { storagePaths } from '@/lib/storagePaths';
const path = storagePaths.brandUpload(filename);
const ref = storageRef(storage, path);
```

---

## 📋 **Path Disponibili**

```typescript
import { storagePaths } from '@/lib/storagePaths';

// Upload generico brands
storagePaths.brandUpload('photo.jpg');
// → 'brands/uploads/photo.jpg'

// Upload specifico per brand
storagePaths.brandSpecific('brand123', 'logo.png');
// → 'brands/brand123/logo.png'

// Album photo
storagePaths.albumPhoto('brand123', 'album456', 'pic.jpg');
// → 'brands/brand123/albums/album456/pic.jpg'

// Brand logo
storagePaths.brandLogo('brand123', 'logo.svg');
// → 'brands/brand123/logo/logo.svg'

// Landing page asset
storagePaths.landingAsset('hero.jpg');
// → 'platform/landing/hero.jpg'

// Legacy upload
storagePaths.legacyUpload('old-file.jpg');
// → 'uploads/old-file.jpg'
```

---

## 🔧 **Utility Functions**

```typescript
import {
  generateUniqueFilename,
  isValidStoragePath,
  extractBrandIdFromPath,
} from '@/lib/storagePaths';

// Genera filename univoco
const uniqueName = generateUniqueFilename('photo.jpg');
// → '1736445123456-abc123xy-photo.jpg'

// Valida path
isValidStoragePath('brands/uploads/test.jpg'); // true
isValidStoragePath('invalid/path'); // false

// Estrai brandId
extractBrandIdFromPath('brands/brand123/photo.jpg'); // 'brand123'
extractBrandIdFromPath('brands/uploads/photo.jpg'); // null
```

---

## 💡 **Esempio Completo**

```typescript
import { ref, uploadBytes } from 'firebase/storage';
import { storage } from '@/firebaseConfig';
import { storagePaths, generateUniqueFilename } from '@/lib/storagePaths';

async function uploadBrandPhoto(brandId: string, file: File) {
  // 1. Genera filename univoco
  const filename = generateUniqueFilename(file.name);

  // 2. Usa path type-safe
  const path = storagePaths.brandSpecific(brandId, filename);

  // 3. Upload
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);

  return path;
}
```

---

## ⚠️ **Regole Storage Corrispondenti**

I path in `storagePaths.ts` corrispondono alle regole in `storage.rules`:

| Path Function     | Storage Rule          | Permessi                           |
| ----------------- | --------------------- | ---------------------------------- |
| `brandUpload()`   | `brands/uploads/**`   | Read: public, Write: authenticated |
| `brandSpecific()` | `brands/{brandId}/**` | Read: public, Write: owner/admin   |
| `albumPhoto()`    | `brands/{brandId}/**` | Read: public, Write: owner/admin   |
| `landingAsset()`  | `platform/landing/**` | Read: public, Write: superadmin    |
| `legacyUpload()`  | `uploads/**`          | Read: public, Write: authenticated |

---

## ✅ **Checklist**

Quando lavori con Storage:

- [ ] ✅ Importa `storagePaths` invece di hardcodare path
- [ ] ✅ Usa `generateUniqueFilename()` per evitare conflitti
- [ ] ✅ Verifica che il path corrisponda alle Storage Rules
- [ ] ✅ Testa upload in locale prima del deploy

---

## 🐛 **Troubleshooting**

### **Errore 403 Forbidden**

```typescript
// ❌ Path sbagliato
const path = `brand/upload/${file.name}`; // Typo: "brand" invece di "brands"

// ✅ Path corretto
const path = storagePaths.brandUpload(file.name);
```

### **File non trovato**

```typescript
// Verifica che il path sia valido
import { isValidStoragePath } from '@/lib/storagePaths';

if (!isValidStoragePath(myPath)) {
  console.error('Path non valido:', myPath);
}
```

---

## 📚 **Documentazione Completa**

Per approfondimenti:

- `docs/STORAGE_PATHS_GUIDE.md` - Guida completa
- `src/lib/storagePaths.ts` - Codice sorgente
- `storage.rules` - Regole Firebase Storage

---

**Ricorda**: Usa sempre `storagePaths.ts` - zero typo, zero errori! 🛡️
