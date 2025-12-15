# 🗺️ Gallery2025 - Guida Routing Completa

**Data:** 05 Dicembre 2025
**Versione:** 2.0.0 - Path-Based Routing

---

## 📋 Panoramica

Il sistema usa **BrowserRouter** per URL puliti e SEO-friendly. Le special routes vengono riconosciute sia dal PATH che dall'HASH (per backward compatibility).

---

## 🎯 Route Principali

### 1. Dashboard Brand (Gestione)

**URL:**
```
http://localhost:5173/dashboard
```

**Cosa fa:**
- Mostra form di login per brand owners
- Dopo il login, carica automaticamente il brand associato all'utente
- Permette di gestire album, foto, branding e impostazioni

**Credenziali Test:**
```
Email: test-demo@example.com
Password: TestDemo2025!
```

**Funzionalità:**
- ✅ Upload foto
- ✅ Gestione album
- ✅ Personalizzazione branding (logo, colori)
- ✅ Impostazioni brand
- ✅ Visualizzare statistiche

---

### 2. SuperAdmin Panel (Amministrazione Piattaforma)

**URL:**
```
http://localhost:5173/superadmin
```

**Cosa fa:**
- Pannello di amministrazione globale della piattaforma
- Gestione brands, configurazione SEO, Stripe, Analytics
- Solo utenti SuperAdmin possono accedere

**Credenziali:**
```
Opzione 1:
Email: info@benhanced.it
Password: SuperAdmin2025!

Opzione 2:
Email: test@example.com
Password: &G0HpsNt@p1&9dweA1!
```

**Funzionalità:**
- ✅ Gestione brands (crea, visualizza, elimina)
- ✅ Configurazione piattaforma
- ✅ SEO e meta tags
- ✅ Stripe configuration
- ✅ Analytics globali
- ✅ Activity logs

---

### 3. Gallery Pubblica Brand

**URL:**
```
http://localhost:5173/test-demo/
```

**Cosa fa:**
- Mostra la gallery pubblica del brand "test-demo"
- Nessuna autenticazione richiesta
- Visualizzazione album e foto pubbliche

**Funzionalità:**
- ✅ Visualizzare album pubblici
- ✅ Navigare foto
- ✅ Lightbox interattivo
- ❌ Nessuna modifica (read-only)

---

### 4. Landing Page

**URL:**
```
http://localhost:5173/
```

**Cosa fa:**
- Landing page principale del servizio
- Form di signup per nuovi clienti
- Informazioni sul servizio

---

## 🔄 Backward Compatibility

Per compatibilità con link esistenti, le seguenti URL con hash funzionano ancora:

```
http://localhost:5173/#/dashboard   → Riconosciuto come special route
http://localhost:5173/#/superadmin  → Riconosciuto come special route
http://localhost:5173/#/signup      → Riconosciuto come special route
```

**Nota:** BrowserRouter ignora gli hash per il routing, ma il BrandContext li riconosce per non tentare di caricare un brand.

---

## 🚫 URL che NON Funzionano

### ❌ Brand Slug + Dashboard

```
http://localhost:5173/test-demo/dashboard
```

**Perché non funziona:**
- Il sistema non supporta nested routes per dashboard all'interno di un brand slug
- Usa `/dashboard` senza brand slug nel path

### ❌ Hash dentro Brand Slug

```
http://localhost:5173/test-demo/#/dashboard
```

**Perché non funziona:**
- BrowserRouter ignora gli hash
- Il BrandContext carica il brand "test-demo" e mostra la gallery
- L'hash `#/dashboard` viene ignorato

---

## 🏗️ Architettura Routing

### BrandContext Logic

Il BrandContext determina quale UI mostrare:

```typescript
// Special routes riconosciute dal PATH
const specialRoutes = ['dashboard', 'superadmin', 'signup'];

// Special routes riconosciute dall'HASH (backward compatibility)
const specialHashes = ['#/dashboard', '#/superadmin', '#/signup'];

// Check path
const isSpecialPathRoute = firstPathSegment && specialRoutes.includes(firstPathSegment);

// Check hash
const isSpecialHashRoute = !firstPathSegment && specialHashes.some(...)

// Se è special route → non caricare brand
if (isSpecialPathRoute || isSpecialHashRoute) {
  setBrand(null);
  return;
}

// Altrimenti prova a caricare brand dal path slug
if (slugFromPath) {
  const brand = await getBrandBySlug(slugFromPath);
  // ...
}
```

### App.tsx Routes

```typescript
<Routes>
  {!brand && (
    <>
      <Route path="/dashboard" element={<BrandDashboard />} />
      <Route path="/superadmin" element={<SuperAdminPanel />} />
      <Route path="*" element={<LandingPage />} />
    </>
  )}

  {brand && (
    <>
      <Route path="/" element={<AlbumList />} />
      <Route path="/album/:albumId" element={<AlbumView />} />
      <Route path="/admin" element={<AdminPanel />} />
      {/* ... */}
    </>
  )}
</Routes>
```

**Logica:**
- Se NO brand → mostra special routes o landing page
- Se SI brand → mostra gallery brandizzata

---

## 🧪 Testing Checklist

### Dashboard Brand

- [ ] `/dashboard` mostra form di login
- [ ] Login con credenziali corrette carica dashboard
- [ ] Dopo login, URL rimane `/dashboard` (senza hash)
- [ ] Dashboard mostra brand dell'utente
- [ ] Logout funziona correttamente

### SuperAdmin Panel

- [ ] `/superadmin` mostra form di login
- [ ] Login con credenziali SuperAdmin carica panel
- [ ] Tutte le tabs sono accessibili
- [ ] Logout funziona correttamente

### Gallery Brand

- [ ] `/test-demo/` mostra gallery pubblica
- [ ] Album sono visibili
- [ ] Click su album mostra foto
- [ ] Lightbox funziona

### Landing Page

- [ ] `/` mostra landing page
- [ ] Form signup funziona
- [ ] Link navigano correttamente

---

## 📝 Note per Sviluppatori

### Aggiungere una Nuova Special Route

1. Aggiungi la route in `BrandContext.tsx`:
   ```typescript
   const specialRoutes = ['dashboard', 'superadmin', 'signup', 'nuova-route'];
   const specialHashes = ['#/dashboard', '#/superadmin', '#/signup', '#/nuova-route'];
   ```

2. Aggiungi la route in `App.tsx`:
   ```typescript
   {!brand && (
     <>
       {/* ... altre routes */}
       <Route path="/nuova-route" element={<NuovaPage />} />
     </>
   )}
   ```

### Aggiungere una Nuova Route Brand

```typescript
{brand && (
  <>
    {/* ... altre routes */}
    <Route path="/nuova-route-brand" element={<NuovaPageBrand />} />
  </>
)}
```

**Nota:** Le routes brand sono relative al path del brand. Esempio: `/test-demo/nuova-route-brand`

---

## 🐛 Troubleshooting

### Problema: "Brand not found" quando accedo a /dashboard

**Soluzione:** Assicurati che il BrandContext riconosca "dashboard" come special route. Verifica che il codice in `contexts/BrandContext.tsx` includa "dashboard" nell'array `specialRoutes`.

### Problema: Dopo login l'URL diventa /dashboard#/admin

**Soluzione:** Questo bug è stato fixato. Assicurati di avere l'ultima versione del codice dove BrandDashboard mostra direttamente AdminLogin invece di un pulsante che cambia l'hash.

### Problema: /test-demo/dashboard mostra la gallery invece del dashboard

**Soluzione:** Questo è il comportamento corretto. Il dashboard NON supporta nested routes con brand slug. Usa `/dashboard` senza brand slug.

---

**Ultimo Aggiornamento:** 05 Dicembre 2025
**Autore:** Claude Code Assistant
