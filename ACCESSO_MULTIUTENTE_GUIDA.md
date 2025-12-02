# 🔐 Guida Completa Accesso Multi-Utente

**Data:** 24 Novembre 2025  
**Status:** ✅ Sistema Multi-Tenant Operativo

---

## 📊 Panoramica Sistema

Il sistema ha **3 tipi di utenti** con accessi diversi:

| Tipo Utente                 | Ruolo                      | Accesso                     | Password                             |
| --------------------------- | -------------------------- | --------------------------- | ------------------------------------ |
| **SuperAdmin**              | Amministratore piattaforma | `/#/superadmin`             | Creata manualmente                   |
| **Superuser (Brand Owner)** | Proprietario brand         | `/brand/{slug}/#/dashboard` | Generata automaticamente o esistente |
| **End User (Guest)**        | Visitatore pubblico        | `/brand/{slug}/`            | Nessuna (pubblico)                   |

---

## 🏢 1. SUPERUSER (Brand Owner)

### Chi è?

Il proprietario di un brand che gestisce le proprie foto e album.

### Come accede?

#### URL di accesso (path-based)

```
https://gallery-app-972f9.web.app/{brandSlug}/#/dashboard
http://localhost:5173/{brandSlug}/#/dashboard
```

⚠️ **IMPORTANTE**: L’accesso Superuser usa sempre `#/dashboard` ma è preceduto dal path `/{brandSlug}/`; non serve più un subdomain dedicato per la dashboard.

### Credenziali

#### Se brand creato dal SuperAdmin:

- **Email**: Quella inserita nel form di creazione brand
- **Password**:
  - Se **nuovo utente** → Mostrata nel modal post-creazione (salvarla!)
  - Se **utente esistente** → Usa la password che già conosci

#### Esempio (dal tuo test):

```
Email: angelo.bernardini@gmail.com
Password: (quella generata quando hai creato il primo brand)
```

### Cosa può fare?

- ✅ Upload foto
- ✅ Gestione album
- ✅ Personalizzazione branding (logo, colori)
- ✅ Impostazioni brand
- ✅ Visualizzare statistiche

### Problema: "Non vedo i dati"

Possibili cause:

#### A) Brand non associato al tuo utente

Verifica in Firestore:

```
/superusers/{userId}
  - email: "angelo.bernardini@gmail.com"
  - brandId: "38yRtryobh0GMHg2XOOd" (deve esistere!)
```

Se `brandId` è sbagliato o manca, aggiornalo manualmente.

#### B) Multi-brand con stesso utente

Se hai creato più brand con la stessa email, il sistema carica il **primo brand** trovato nel documento `superusers`.

**Soluzione attuale:**

- Il documento `superusers` ha un solo `brandId`
- Se l'utente ha più brand, vede solo il primo

**Soluzione futura (da implementare):**

- Cambiare `brandId` in `brandIds: []` (array)
- Aggiungere un **brand selector** nel dashboard

#### C) Logout e ri-login

Se hai cambiato qualcosa:

1. Logout dal dashboard
2. Clear cache browser (Cmd+Shift+R)
3. Re-login

---

## 👑 2. SUPERADMIN (Amministratore Piattaforma)

### Chi è?

L'amministratore che gestisce **tutta la piattaforma** (brands, configurazione, Stripe, SEO).

### Come accede?

#### URL di accesso:

```
https://gallery-app-972f9.web.app/#/superadmin
O
http://localhost:5173/#/superadmin
```

### Credenziali

#### Attualmente configurate:

```
Email: info@benhanced.it
Password: SuperAdmin2025!
UID: zSpeNfvdUMS5UThmLsXNei2hMJi2
```

### Dove sono salvate?

#### Firebase Authentication:

```
Email/Password user
UID: zSpeNfvdUMS5UThmLsXNei2hMJi2
```

#### Firestore:

```
/superadmins/{zSpeNfvdUMS5UThmLsXNei2hMJi2}
  - email: "info@benhanced.it"
  - role: "owner"
  - permissions: { ... }
  - createdAt: ...
```

### Cosa può fare?

- ✅ Gestione brands (crea, elimina, visualizza)
- ✅ Configurazione piattaforma
- ✅ SEO e meta tags
- ✅ Stripe configuration
- ✅ Analytics globali
- ✅ Activity logs
- ✅ Landing page customization

---

## 🌐 3. END USER (Visitatore Pubblico)

### Chi è?

Chiunque visiti la gallery pubblica di un brand.

### Come accede?

#### Produzione (con subdomain reale):

```
https://brand-slug.yourdomain.com
```

#### Locale (con mock brand):

```
http://localhost:5173/
```

### Cosa può fare?

- ✅ Visualizzare album pubblici
- ✅ Navigare foto
- ✅ Lightbox interattivo
- ❌ Nessuna modifica (read-only)

---

## 🔀 Routing Multi-Tenant: Come Funziona

### Il BrandContext Decide:

```typescript
const hash = window.location.hash;
const pathSegments = window.location.pathname.split('/').filter(Boolean);
const slug = pathSegments[0]?.toLowerCase();
const specialHashes = ['#/dashboard', '#/superadmin', '#/signup'];

// Se il path contiene uno slug, proviamo prima a caricare il brand per slug
if (slug) {
  const slugBrand = await getBrandBySlug(slug);
  if (slugBrand) {
    setBrand(slugBrand);
    return;
  }

  console.warn('Slug non trovato, fallback al dominio');
}

// Se non siamo in un path slug e siamo su route speciali, skip brand loading
if (!slug && specialHashes.some((route) => hash === route || hash.startsWith(`${route}/`))) {
  return;
}

// Fallback: cerchiamo il brand dal hostname (es. subdomain)
const hostname = window.location.hostname;
const brand = await getBrandByDomain(hostname);

if (brand) {
  // Mostra gallery brandizzata
} else {
  // Mostra landing page
}
```

### Quindi:

| URL                        | BrandContext             | Cosa Mostra                                      |
| -------------------------- | ------------------------ | ------------------------------------------------ |
| `/#/superadmin`            | SKIP                     | SuperAdmin Panel (dopo login)                    |
| `/{brandSlug}/#/dashboard` | SKIP                     | Superuser Dashboard (hash dentro path)           |
| `/#/signup`                | SKIP                     | Landing Page + Signup Form                       |
| `/{brandSlug}/`            | Carica brand dal path    | Gallery brandizzata (alias di subdomain per ora) |
| `/` (no brand)             | Nessun brand             | Landing Page                                     |
| `test-brand.com`           | Carica brand da hostname | Gallery brandizzata                              |

> Nota: `/#/signup` è stato aggiunto alle rotte speciali per forzare il caricamento della landing page anche se il dominio risulta associato a un brand ( utile per il banner “Create Your Own Gallery” sulla demo ).

---

## ❓ FAQ: Domande Comuni

### Q1: "Il superuser deve accedere da `subdomain.com/dashboard`?"

**A:** ❌ **NO!** Ora il superuser accede da:

```
tuodominio.com/{brandSlug}/#/dashboard
```

Il subdomain (`test-brand.com`) rimane invece l’alias pubblico della gallery e non serve per accedere al dashboard.

### Q2: "Quale password usa il superuser?"

**A:** Dipende:

- **Primo brand creato** → Password mostrata nel modal (salvala!)
- **Brand successivo con stessa email** → Stessa password di prima
- **Password dimenticata** → Usa il link "Password dimenticata?" nel login

### Q3: "Ho creato 2 brand con stessa email, ma vedo solo il primo"

**A:** Questo è il comportamento attuale. Il documento `superusers` ha un solo `brandId`.

**Soluzione temporanea:**

- Cambia `brandId` in Firestore manualmente per switchare brand

**Soluzione permanente (da implementare):**

- Multi-brand selector nel dashboard
- Array `brandIds` invece di singolo `brandId`

### Q4: "Come creo un nuovo SuperAdmin?"

**A:** Via script:

```bash
node create-real-superadmin.cjs
```

O manualmente in Firebase Console:

1. Authentication → Crea utente email/password
2. Firestore → `superadmins/{UID}` → Aggiungi documento

### Q5: "Il dashboard è vuoto / non vedo i miei album"

**A:** Verifica:

1. ✅ Sei loggato con l'email giusta?
2. ✅ Il documento `superusers/{yourUID}` ha il `brandId` corretto?
3. ✅ Hai creato album in quel brand?
4. ✅ Il brand è `status: "active"`?

Debugging:

```javascript
// Console browser
console.log('User UID:', auth.currentUser.uid);

// Firestore
/superusers/{UID} → Copia brandId
/brands/{brandId}/albums → Ci sono album?
```

---

## 🧪 Test Completo: Passo-Passo

### Test 1: SuperAdmin

1. Apri: `http://localhost:5173/#/superadmin`
2. Login: `info@benhanced.it` / `SuperAdmin2025!`
3. ✅ Dovresti vedere il SuperAdmin Panel
4. Tab "Brands" → Vedi la lista brand

### Test 2: Crea Brand

1. Nel SuperAdmin, click "Nuovo Brand"
2. Compila:
   - Nome: "Test Photo Studio"
   - Subdomain: "test-photo"
   - Email: "owner@test.com"
3. Click "Crea Brand"
4. ✅ Se email nuova → **Modal con password** (SALVA!)
5. ✅ Se email esistente → Toast "Utente riutilizzato"
6. ✅ Nella tab “Brands” il card mostra la password temporanea e il link `/{brandSlug}/#/dashboard`. Puoi copiarli subito (fai anche “Show password” se rimane coperta).

### Test 3: Login Superuser

1. Apri: `http://localhost:5173/{brandSlug}/#/dashboard` (sostituisci `{brandSlug}` con lo slug del brand appena creato, ad es. `test-photo`)
2. Login: `owner@test.com` / `[password dal modal]`
3. ✅ Dovresti vedere il dashboard del brand "Test Photo Studio"
4. Verifica:
   - Nome brand visibile in alto
   - Subdomain stampato nei badge e link aperto con `https://{brand.subdomain}`
   - Tab: Settings, Albums, Analytics
   - Colori brandizzati

### Test 4: Upload Foto

1. Nel dashboard, vai su "Albums"
2. Click "Crea Album"
3. Nome: "Album Test"
4. Salva
5. Apri album
6. Click "Upload Foto"
7. Seleziona 2-3 foto
8. ✅ Dovrebbero caricarsi e generare thumbnails

### Test 5: Gallery Pubblica

1. Apri: `http://localhost:5173/` (no hash, no subdomain)
2. ✅ Dovresti vedere la Landing Page (no brand)
3. Apri: `http://localhost:5173/#/demo`
4. ✅ Dovresti vedere la demo gallery (se configurata)

---

## 🗺️ Roadmap futura per `/nomeapp/nomebrand/dashboard`

L’attuale percorso Superuser (`#/dashboard`) rimane attivo finché abbiamo pochi clienti. Quando vorrai offrire un URL “pulito” tipo `https://nomeapp/nomebrand/dashboard`, questa è la mappa per il prossimo sprint:

1. **Route path-based** – `App.tsx` deve supportare un `/:brandSlug/dashboard` (o simile) in aggiunta agli hash attuali.
2. **BrandContext consapevole del slug** – estrarre `brandSlug` da `window.location.pathname`, cercare il brand per slug/subdomain (es. `getBrandBySlug` o `getBrandByDomain` esteso), e trattare quel path come “special route” analogamente a `#/dashboard` (attualmente vedi `contexts/BrandContext.tsx:44-96`).
3. **Prevent double load** – quando entri da `/:brandSlug/dashboard`, salta la ricerca brand standard (hash checking già accetta `#/dashboard`, quindi aggiungi la path list `specialHashes`).
4. **Fallback e redirect** – se lo slug non esiste, reindirizza a `/#/dashboard` o mostra un messaggio “Brand non trovato”.
5. **Doc e onboarding** – aggiorna questa guida, i `CHANGELOG` e il materiale QA per spiegare il nuovo URL e l’aggiornamento DNS, lasciando comunque attivi gli hash per retrocompatibilità.

La logica corrente resta funzionante e sarà utile per il rollout graduale; applica questa mappa quando avremo più brand/clienti.

## 🛠️ Piano SuperAdmin: gestione brand completa

Questa guida ora copre l’accesso, ma manca ancora la **gestione operativa** che vuoi mettere nella UI:

1. **Cancellazione “pulita”** – il pulsante “Elimina brand” deve attivare una funzione backend (Cloud Function o servizio) che:
   - elimina i documenti Firestore (`brands/{brandId}`, `superusers/{uid}`, `albums/{...}`, `photos/{...}`, eventuali `activity_logs` collegati);
   - svuota il bucket Storage `brands/{brandId}/...`;
   - aggiorna Stripe (cancella la subscription o i metadata) e notifica l’admin.
2. **Brand card ricca di dati** – mostra negli elenchi:
   - `superuserId` + `ownerEmail` (username/email),
   - `temporaryPassword` (solo per nuovi utenti; toggle mostratore e copy),
   - `subscription.currentPeriodEnd` (data di scadenza) e lo status Stripe se disponibile.
3. **UI feedback e script helper** – lancia `scripts/ensure-superuser-doc.cjs`/`scripts/fix-brand.sh` quando manca il superuser doc, e copia il link `https://gallery-app-972f9.web.app/{brandSlug}/#/dashboard`.

Quando questi punti saranno live, il SuperAdmin avrà pieno controllo: il delete farà sparire tutte le tracce dal progetto, le credenziali rimarranno visibili per copiarle e le scadenze saranno sincronizzate con i servizi esterni. Usa questa sezione come checklist durante lo sviluppo.

## 🔧 Troubleshooting

### Problema: "Loading brand data..." infinito

**Causa:** BrandContext non riesce a caricare il brand.

**Soluzione:**

1. Apri Console browser (F12)
2. Cerca errori Firestore
3. Verifica che il brand esista in `/brands/{brandId}`
4. Verifica che `status === "active"`

### Problema: "Email già in uso ma non trovata"

**Causa:** Utente orfano (esiste in Auth ma non in Firestore).

**Soluzione:**

```bash
node scripts/fix-orphan-user.cjs angelo.bernardini@gmail.com
```

### Problema: "Permission denied" su Firestore

**Causa:** Firestore Rules bloccano l'accesso.

**Soluzione:**

1. Verifica di essere autenticato
2. Verifica che `superadmins/{yourUID}` esista
3. Re-deploy rules: `firebase deploy --only firestore:rules`

### Problema: "Permission denied" su Storage

**Sintomo:** WARNING `storage/unauthorized` quando carichi asset in `platform/landing/...`.

**Soluzione:**

1. Applica lo snippet `match /platform/landing/{allPaths=**}` nelle `storage.rules` (permette write solo a SuperAdmin).
2. Deploia le regole Storage aggiornate:
   ```
   firebase deploy --only storage --project gallery-app-972f9
   ```
3. Svota cache/usa incognito per riprendere la build con i permessi nuovi.

---

## ✅ Checklist Deploy SuperAdmin brand-management

1. **Rules Storage**: aggiorna `storage.rules` col match `/platform/landing/{allPaths=**}` e deploya con `firebase deploy --only storage --project gallery-app-972f9`.
2. **Rules Firestore**: se aggiungi nuove security policy (es. per `superusers` o `activity_logs`), fai `firebase deploy --only firestore:rules`.
3. **Cloud Function deleteBrand** (quando è pronta):
   - Deploy `(functions)` con `firebase deploy --only functions --project gallery-app-972f9`.
   - Verifica che la funzione possa cancellare `brands/`, `superusers/`, `albums/`, `photos/` e svuotare storage & Stripe.
4. **Bundle Frontend**: `npm run build` + `firebase deploy --only hosting --project gallery-app-972f9`.
5. **Smoke test**: apri `https://gallery-app-972f9.web.app/{brandSlug}/#/dashboard` e `.../{brandSlug}/` per un brand di test; assicurati che la card mostri password e expiration.

Mantieni questa checklist aggiornata quando aggiungi nuove regole o workflow superadmin.

### Script deploy completo

Hai anche uno script che lancia tutti i deploy in sequenza:

```
./scripts/deploy-all.sh
```

Assicurati che `scripts/deploy-all.sh` sia eseguibile (`chmod +x`) e che `GOOGLE_APPLICATION_CREDENTIALS` sia settato se la funzione `deleteBrand` richiede service-account.

## 📚 Risorse

### Sincronizza slug brand

Se i documenti `brands` esistenti non hanno il campo `slug`, esegui lo script:

```
node scripts/sync-brand-slugs.cjs
```

Lo script usa il valore `subdomain` come base per `slug` (sanitizzato) e aggiorna tutti i brand in batch. Dopo averlo eseguito, `https://gallery-app-972f9.web.app/{brandSlug}/` funzionerà per ogni brand.

> **Nota operativa:** per lo script è stato creata la service account `gallery-admin@gallery-app-972f9.iam.gserviceaccount.com`. La key JSON è salvata temporaneamente su `~/gallery-admin-key.json` (usata via `GOOGLE_APPLICATION_CREDENTIALS`). Appena hai finito, ricordati di:
>
> 1. cancellare la variabile d’ambiente: `unset GOOGLE_APPLICATION_CREDENTIALS`
> 2. rimuovere il file: `rm ~/gallery-admin-key.json`
> 3. revocare la chiave: `gcloud iam service-accounts keys delete ed51b26ade434021a83dc9fc5f301c0784ec2ead --iam-account=gallery-admin@gallery-app-972f9.iam.gserviceaccount.com`
>
> In questo modo la credenziale resta disponibile solo per il tempo strettamente necessario.

- [START_HERE.md](./START_HERE.md) - Quick start
- [CLOUD_FUNCTION_MIGRATION.md](./CLOUD_FUNCTION_MIGRATION.md) - Cloud Function per brand creation
- [TEST_BRAND_CREDENTIALS.md](./TEST_BRAND_CREDENTIALS.md) - Credenziali di test

### Se manca il documento Superuser

Se dopo la creazione del brand l’errore in console è ancora `SuperUser document not found`, puoi ricreare rapidamente il doc con lo script inline:

```
export GOOGLE_APPLICATION_CREDENTIALS=~/gallery-admin-key.json
node scripts/ensure-superuser-doc.cjs <uid> <brandId> <email>
```

Il comando crea/aggiorna `superusers/{uid}` con `brandId`, l’array `brandIds` (per supportare multi-brand) e i timestamp. Dopo averlo eseguito, ricarica `https://gallery-app-972f9.web.app/{brandSlug}/#/dashboard` per vedere la dashboard del brand.

> **Fast fix**: ora c’è anche lo script helper `scripts/fix-brand.sh` che accetta il document ID del brand e fa tutto in fila:
>
> ```
> export GOOGLE_APPLICATION_CREDENTIALS=~/gallery-admin-key.json
> scripts/fix-brand.sh UW1raiOFYqYBrDN7RMYP
> ```
>
> Lo script recupera slug/uid/email dal documento, chiama `ensure-superuser-doc` e stampa i link corretti (gallery + dashboard con slug).

---

**Ultimo aggiornamento:** 24 Nov 2025  
**Status:** ✅ Sistema Multi-Tenant Operativo

### Problema: "Ho perso la password temporanea"

Se hai bisogno di recuperare la password del superuser (viene generata solo la prima volta) puoi:

1. Usare lo script `scripts/fix-brand.sh <brandDocId>` (documentato sopra) che aggiorna il documento e ti stampa l’URL e la password salvata in `temporaryPassword`.
2. Andare nella tab “Brands”: il card mostra la “Password temporanea” con pulsanti `Show/Hide` e `Copy`.
3. Se la password non esiste perché l’utente era già attivo, usa il link “Password dimenticata?” del login per inviare un reset, oppure imposta un nuovo valore via Firebase Console.
