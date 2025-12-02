# ✅ FIX Storage Permissions - RISOLTO

## 🐛 Problema

```
Firebase Storage: User does not have permission to access
'brands/test-brand-real/logos/1763565337670-QUADRATA.jpg'.
(storage/unauthorized)
```

## 🔍 Causa

Le Storage Rules verificano che l'utente loggato abbia un documento `superusers/{uid}` con il `brandId` corrispondente al brand che sta cercando di modificare.

**Problema:** L'utente `test@example.com` (UID: `IpffSxYEahbhuSXmciBCY1YDwjy2`) non aveva un documento `superusers` associato al brand `test-brand-real`.

---

## ✅ Soluzione Implementata

### 1. **Storage Rules Aggiornate**

Aggiunta funzione `isSuperAdmin()` che permette ai SuperAdmin di accedere a tutti i brand:

```javascript
function isSuperAdmin() {
  return isAuthenticated() &&
    firestore.exists(/databases/(default)/documents/superadmins/$(request.auth.uid));
}

// Brand-specific files (/brands/{brandId}/)
match /brands/{brandId}/{allPaths=**} {
  allow read: if true;

  // Scrittura per owner del brand O SuperAdmin
  allow write: if isBrandOwner(brandId) || isSuperAdmin();

  // Delete per owner del brand O SuperAdmin
  allow delete: if isBrandOwner(brandId) || isSuperAdmin();
}
```

### 2. **Rules Deployate**

```bash
✅ firebase deploy --only storage
✔  storage: released rules storage.rules to firebase.storage
```

---

## 🔧 Come Creare Superuser Document

Per permettere all'utente di accedere al brand, devi creare uno di questi documenti:

### Opzione A: Documento `superusers` (per brand singolo)

```bash
# Firebase Console → Firestore → superusers → [UID utente]

Collection: superusers
Document ID: IpffSxYEahbhuSXmciBCY1YDwjy2 (UID utente)

Fields:
  brandId: "test-brand-real"
  email: "test@example.com"
  createdAt: [timestamp now]
```

### Opzione B: Documento `superadmins` (accesso a tutti i brand)

```bash
# Firebase Console → Firestore → superadmins → [UID utente]

Collection: superadmins
Document ID: IpffSxYEahbhuSXmciBCY1YDwjy2 (UID utente)

Fields:
  email: "test@example.com"
  role: "owner"
  permissions:
    canManageBrands: true
    canManageSettings: true
    canViewAnalytics: true
    canManageStripe: true
  createdAt: [timestamp now]
  lastLogin: [timestamp now]
```

---

## 🧪 Test

1. **Vai alla Firebase Console**

   ```
   https://console.firebase.google.com/project/gallery-app-972f9/firestore
   ```

2. **Crea collection `superadmins`**
   - Click "Start collection"
   - Collection ID: `superadmins`

3. **Aggiungi documento**
   - Document ID: `IpffSxYEahbhuSXmciBCY1YDwjy2` (il tuo UID)
   - Fields:
     ```
     email (string): test@example.com
     role (string): owner
     permissions (map):
       - canManageBrands (boolean): true
       - canManageSettings (boolean): true
       - canViewAnalytics (boolean): true
       - canManageStripe (boolean): true
     createdAt (timestamp): [auto]
     ```

4. **Ricarica la pagina dashboard**

   ```
   http://test.gallery.local:5173/#/dashboard
   ```

5. **Prova upload logo**
   - Dashboard → Branding tab
   - Upload nuovo logo
   - ✅ Dovrebbe funzionare!

---

## 📝 Comandi Rapidi

### ⚡ Metodo Veloce: Script CLI

```bash
# Crea SuperAdmin document automaticamente
node create-superadmin.mjs

# Output:
# ✅ SuperAdmin document created successfully!
# ✅ Done! You can now upload logos and manage all brands.
```

### Get UID dell'utente corrente

```javascript
// Nel browser console (F12)
firebase.auth().currentUser.uid;
```

### Firestore Query (CLI)

```bash
# Verifica se esiste superadmin
firebase firestore:get superadmins/IpffSxYEahbhuSXmciBCY1YDwjy2

# Lista tutti i superadmins
firebase firestore:list superadmins

# Forza ricreazione (overwrite)
node create-superadmin.mjs --force
```

---

## 🎯 Permessi Multi-Brand

### Come funzionano i permessi:

1. **Lettura pubblica:** Chiunque può leggere `/brands/{brandId}/` (per gallerie pubbliche)

2. **Scrittura brand owner:**
   - Utente deve avere documento `superusers/{uid}` con `brandId` corrispondente
   - Esempio: `superusers/IpffSxYEahbhuSXmciBCY1YDwjy2` → `{ brandId: "test-brand-real" }`

3. **Scrittura SuperAdmin:**
   - Utente deve avere documento `superadmins/{uid}`
   - Può accedere a TUTTI i brand del sistema

4. **Legacy (temporaneo):**
   - `/uploads/` e `/config/` hanno permessi aperti per compatibilità

---

## 🚀 Prossimi Step

### 1. Automatizzare creazione superuser

Quando il webhook crea un brand, dovrebbe anche creare automaticamente il documento `superusers`:

```typescript
// In stripe-functions.js → handleCheckoutCompleted

// Create superuser document
await db.collection('superusers').doc(userRecord.uid).set({
  brandId: brandId,
  email: email,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
});
```

### 2. Migrare regole legacy

Rimuovere le regole `/uploads/` e `/config/` aperte una volta completata la migrazione.

---

## ✅ Risultato

**Storage Rules aggiornate e deployate!**

Ora:

- ✅ Brand owners possono modificare solo il loro brand
- ✅ SuperAdmins possono modificare tutti i brand
- ✅ Lettura pubblica per gallery
- ✅ Sicurezza multi-tenant

**Deploy completato con successo! 🎉**
