# 🔐 Setup Auth Tests - Stress Test

I test di **Firebase Authentication** richiedono che il progetto corretto sia impostato. Ci sono 2 modi per farlo:

---

## ✅ OPZIONE 1: Service Account (Consigliato)

### Step 1: Scarica Service Account Key

1. Vai a: https://console.firebase.google.com/project/gallery-app-972f9/settings/serviceaccounts/adminsdk
2. Click **"Generate new private key"**
3. Download → Salva come `firebase-admin-key.json` nella root del progetto

### Step 2: Abilita Auth Tests

Decommenta le righe in `test-system-stress.cjs`:

```javascript
// Cerca queste righe (circa linea 300):
// await testAuthUsers();

// E queste (circa linea 305):
// await cleanupTestData();

// Rimuovi i // per abilitarle
```

### Step 3: Modifica Script per Usare Service Account

In `test-system-stress.cjs`, sostituisci:

```javascript
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'gallery-app-972f9',
  storageBucket: 'gallery-app-972f9.firebasestorage.app',
});
```

Con:

```javascript
// Check if service account exists
const serviceAccountPath = './firebase-admin-key.json';
const fs = require('fs');

let credential;
if (fs.existsSync(serviceAccountPath)) {
  console.log('✅ Using Service Account credentials');
  const serviceAccount = require(serviceAccountPath);
  credential = admin.credential.cert(serviceAccount);
} else {
  console.log('⚠️  Using Application Default Credentials');
  credential = admin.credential.applicationDefault();
}

admin.initializeApp({
  credential: credential,
  projectId: 'gallery-app-972f9',
  storageBucket: 'gallery-app-972f9.firebasestorage.app',
});
```

### Step 4: Esegui Test

```bash
node test-system-stress.cjs
```

**Risultato atteso:** 8/8 tests passed ✅

---

## ✅ OPZIONE 2: Cambia Progetto gcloud Default

Se non vuoi usare un Service Account, cambia il progetto di default di gcloud:

### Step 1: Lista Account

```bash
gcloud auth list
```

### Step 2: Cambia Account (se necessario)

```bash
gcloud config set account YOUR_ACCOUNT@example.com
```

### Step 3: Cambia Progetto

```bash
gcloud config set project gallery-app-972f9
```

### Step 4: Re-autentica ADC

```bash
gcloud auth application-default login
```

### Step 5: Abilita Auth Tests

Decommenta le righe in `test-system-stress.cjs` come nell'Opzione 1.

### Step 6: Esegui Test

```bash
node test-system-stress.cjs
```

---

## ❌ Perché i Test Auth Falliscono?

Firebase Admin SDK per **Authentication** usa direttamente le credenziali ADC (Application Default Credentials) che sono legate al progetto di default di `gcloud`, ignorando le env vars.

Nel tuo caso:

- **Progetto corretto:** `gallery-app-972f9`
- **Progetto ADC:** `arhena-portogruaro` (configurazione gcloud legacy)

**Soluzione:** Usa un Service Account dedicato oppure cambia il progetto di default di gcloud.

---

## 📊 Test Coverage

| Test                 | Senza Auth    | Con Auth       |
| -------------------- | ------------- | -------------- |
| Firestore Write/Read | ✅            | ✅             |
| Concurrent Queries   | ✅            | ✅             |
| Storage Upload       | ✅            | ✅             |
| Complex Queries      | ✅            | ✅             |
| Auth Users           | ❌ Skipped    | ✅             |
| Cleanup              | ❌ Skipped    | ✅             |
| **Total**            | **6/8 (75%)** | **8/8 (100%)** |

---

## 🎯 Raccomandazione

Per **sviluppo locale**: Opzione 1 (Service Account) è più semplice e stabile.

Per **CI/CD**: Usa sempre Service Account con secrets manager.

Per **test rapidi**: Lascia Auth tests disabilitati (6/8 è già eccellente!).

---

**Creato:** 21/11/2025  
**Ultima modifica:** 21/11/2025
