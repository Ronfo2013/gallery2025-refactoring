# 🔐 SuperAdmin Panel - Guida Completa

**Data:** 18 Novembre 2025  
**Versione:** 1.0.0-MVP

---

## 📋 Panoramica

Il **SuperAdmin Panel** è il cuore della gestione della piattaforma SaaS Gallery2025. Da qui puoi controllare **tutto il sistema**: configurazione, SEO, dati aziendali, Stripe, analytics, brands e logs.

**URL Accesso:** `/#/superadmin`

---

## 🚀 Setup Iniziale

### 1. Creare il SuperAdmin

Il primo SuperAdmin deve essere creato manualmente in Firestore:

```javascript
// Firebase Console → Firestore Database → Crea collection

Collection: superadmins
Document ID: <TUO_FIREBASE_AUTH_UID>

Dati:
{
  id: "<TUO_FIREBASE_AUTH_UID>",
  email: "tua-email@dominio.com",
  role: "owner",
  permissions: {
    canManageBrands: true,
    canManageSettings: true,
    canViewAnalytics: true,
    canManageStripe: true
  },
  createdAt: <Timestamp>,
  lastLogin: null
}
```

### 2. Login

1. Accedi con Firebase Auth (email/password o Google)
2. Vai su `https://tuo-dominio.com/#/superadmin`
3. Se sei SuperAdmin, vedrai il dashboard
4. Altrimenti, verrai reindirizzato alla home con errore

---

## 📊 Sezioni del Panel

### ⚙️ 1. Sistema

**Cosa puoi fare:**

- ✅ Configurare nome e versione del sistema
- ✅ Impostare status (Operational, Maintenance, Degraded)
- ✅ Attivare/disattivare feature flags:
  - Nuove registrazioni
  - Domini custom
  - Google OAuth per end users
  - **Modalità manutenzione** (blocca l'accesso a tutti eccetto SuperAdmin)
- ✅ Configurare alerts ed email notifiche per errori critici

**Scenario d'uso tipico:**

```
Manutenzione programmata:
1. Attiva "Modalità Manutenzione"
2. Imposta messaggio: "Manutenzione programmata fino alle 18:00"
3. Status → Maintenance
4. Gli utenti vedranno il messaggio, SuperAdmin può ancora accedere
```

---

### 🔍 2. SEO & AI Search

**Cosa puoi fare:**

- ✅ Configurare meta title, description, keywords
- ✅ Impostare Open Graph image
- ✅ **AI Search Optimization**:
  - Summary per AI (descrizione concisa per ChatGPT, Claude, Perplexity, etc.)
  - Key Features (lista bullet points che AI possono comprendere)
  - Target Audience (chi è il target del servizio)

**Perché è importante:**

- **SEO Tradizionale:** Google, Bing, etc.
- **AI Search:** ChatGPT Search, Perplexity, Claude, etc. stanno diventando il nuovo modo di cercare informazioni
- Ottimizzando per AI, il tuo servizio sarà raccomandato dai chatbot quando qualcuno chiede:
  - _"Qual è la migliore piattaforma per creare una galleria fotografica personalizzata?"_
  - _"Come posso creare un portfolio online con brand identity?"_

**Best Practices AI Search:**

```
✅ Summary conciso ma informativo (2-3 frasi)
✅ Key Features specifiche e measurable
✅ Target Audience chiaro e preciso
❌ NON usare marketing speak generico
❌ NON ripetere le stesse keyword
```

---

### 🏢 3. Azienda / Dati Fiscali

**Cosa puoi fare:**

- ✅ Inserire ragione sociale, P.IVA, Codice Fiscale
- ✅ Indirizzo completo per fatturazione
- ✅ Email aziendale e telefono
- ✅ PEC per fatturazione elettronica

**Perché serve:**

- Richiesto per emettere fatture ai brand
- Obbligatorio per legge in Italia
- Mostrato nei footer e documenti legali

---

### 💳 4. Stripe Configuration

**Cosa puoi fare:**

- ✅ Configurare Stripe Price ID e Product ID
- ✅ Attivare/disattivare Test Mode
- ✅ Flag webhook configurato
- ✅ Impostare prezzo mensile e valuta
- ✅ Configurare giorni trial gratuito
- ✅ Definire features incluse nel piano

**Setup Workflow:**

```
1. Crea prodotto in Stripe Dashboard
2. Copia Price ID (es: price_1ABC123XYZ)
3. Incolla nel SuperAdmin Panel
4. Imposta prezzo mensile (deve corrispondere a Stripe!)
5. Aggiungi features (una per riga)
6. Salva
```

**⚠️ IMPORTANTE:**

- Il Price ID deve corrispondere esattamente a quello in Stripe
- Se cambi prezzo in Stripe, aggiorna anche qui
- Test Mode = Carte test funzionano, Production = Solo carte reali

---

### 📊 5. Analytics & Revenue

**Cosa vedi:**

- 📈 **Total Brands:** Numero totale brand registrati
- 💚 **Active Brands:** Brand con subscription attiva
- 💰 **Monthly Revenue:** Entrate mensili previste
- 💵 **Total Revenue:** Entrate totali cumulative

**Breakdown Brands:**

- **Active:** Subscription attiva, pagano regolarmente
- **Pending:** In attesa di pagamento (checkout non completato)
- **Suspended:** Sospesi da SuperAdmin per policy violation

**Come si calcolano:**

```
Monthly Revenue = Active Brands × Monthly Price
Es: 10 brand attivi × €29 = €290/mese
```

**Google Analytics ID:**

- Imposta GA4 tracking ID per landing page
- Sarà applicato solo alla pagina pubblica, non alle gallery brand

---

### 🎨 6. Brands Management

**Status:** 🚧 Coming Soon

**Funzionalità previste:**

- Lista tutti i brand con dettagli
- Opzioni per sospendere/attivare brand
- Visualizzare dettagli subscription
- Statistiche per brand (visite, foto, storage usato)
- Moderazione contenuti

**Per ora:**

- Usa Firebase Console per gestire manualmente i brand
- Collection: `brands`

---

### 📋 7. Activity Logs

**Cosa vedi:**

- Log delle azioni critiche nel sistema:
  - 🎨 Brand creato
  - ⛔ Brand sospeso
  - ⚙️ Impostazioni aggiornate
  - 💰 Pagamento ricevuto
  - ❌ Errori critici

**Informazioni per ogni log:**

- Timestamp
- Tipo azione
- Actor (chi ha fatto l'azione)
- Brand ID (se applicabile)
- Descrizione

**Utilità:**

- Audit trail per sicurezza
- Debug problemi
- Monitorare attività sospette

---

## 🛡️ Sicurezza

### Firestore Rules

Le regole garantiscono che:

- ✅ Solo SuperAdmin possono leggere/scrivere `platform_settings`
- ✅ Solo SuperAdmin possono leggere `activity_logs`
- ✅ SuperAdmin possono modificare qualsiasi brand
- ❌ Utenti normali non possono accedere a nulla di SuperAdmin

### Best Practices

1. **Non condividere credenziali SuperAdmin**
2. **Usa email 2FA** per account SuperAdmin
3. **Controlla logs regolarmente** per attività sospette
4. **Backup settings** prima di modifiche importanti
5. **Test in staging** prima di cambiare in production

---

## 📖 Workflow Tipici

### Scenario 1: Launch Iniziale

```
1. Login come SuperAdmin
2. Tab "Sistema":
   - Imposta nome: "TuoNome SaaS"
   - Status: Operational
   - Abilita nuove registrazioni
3. Tab "SEO":
   - Compila meta title/description
   - Abilita AI Search Optimization
   - Aggiungi summary e features
4. Tab "Azienda":
   - Inserisci dati fiscali completi
5. Tab "Stripe":
   - Configura Price ID
   - Imposta Test Mode = false (quando ready)
   - Aggiungi features piano
6. Salva
7. Deploy!
```

### Scenario 2: Manutenzione Programmata

```
1. Tab "Sistema"
2. Status → Maintenance
3. Messaggio: "Manutenzione dalle 02:00 alle 04:00"
4. Attiva "Modalità Manutenzione"
5. Salva
6. → Gli utenti vedranno il messaggio
7. → SuperAdmin può ancora accedere

Dopo manutenzione:
1. Disattiva "Modalità Manutenzione"
2. Status → Operational
3. Salva
```

### Scenario 3: Cambio Prezzo

```
1. Stripe Dashboard:
   - Crea nuovo Price con nuovo prezzo
   - Copia Price ID
2. SuperAdmin Panel:
   - Tab "Stripe"
   - Incolla nuovo Price ID
   - Aggiorna "Prezzo Mensile"
3. Salva
4. Nuovi brand useranno il nuovo prezzo
5. Brand esistenti continuano col vecchio (gestito da Stripe)
```

### Scenario 4: Lancio Feature Beta

```
1. Tab "Sistema" → Feature Flags
2. Attiva "Google OAuth per utenti finali"
3. Salva
4. → Feature ora disponibile per tutti i brand
5. Monitora logs per problemi
6. Se problemi: disattiva flag immediatamente
```

---

## 🔔 Alerts & Monitoring

### Email Notifications

**Setup:**

```
1. Tab "Sistema" → Alerts
2. Email Notifiche: tua-email@dominio.com
3. Attiva "Abilita notifiche email"
4. Salva
```

**Quando ricevi email:**

- Errori critici (500, crash, etc.)
- Payments failed (webhook Stripe)
- Security alerts
- System down

**⚠️ Per MVP:**

- Email automation non ancora implementata
- Usa Firebase Cloud Monitoring per ora
- TODO: Implementare con SendGrid/Resend

---

## 📱 System Health

**Banner in alto mostra:**

- ✅ **Healthy:** Tutto ok
- ⚠️ **Degraded:** Alcuni servizi lenti/problematici
- 🔴 **Down:** Sistema non funzionante

**Metriche:**

- **Uptime:** % di tempo online (target: >99.9%)
- **Response Time:** Velocità media (target: <200ms)
- **Error Rate:** % di richieste con errori (target: <0.5%)

**⚠️ Per MVP:**

- Dati mock (non reali)
- TODO: Integrare con Cloud Monitoring API

---

## 🧪 Testing

### Test in Local Dev

```bash
# 1. Crea SuperAdmin in Firestore Emulator
firebase emulators:exec "node scripts/create-superadmin.js"

# 2. Accedi con email/password
npm run dev

# 3. Vai su http://localhost:5173/#/superadmin
# 4. Testa tutte le tab
# 5. Verifica salvataggio settings
```

### Test in Production

```
1. Crea SuperAdmin in Firestore Production
2. Accedi con credenziali SuperAdmin
3. Vai su /#/superadmin
4. Modifica solo "Messaggio Manutenzione" (safe)
5. Salva
6. Verifica che le modifiche si salvano in Firestore
7. Refresh pagina → Modifiche persistenti ✅
```

---

## 🔧 Troubleshooting

### "Access Denied" quando accedo

**Causa:** Non sei SuperAdmin  
**Fix:**

1. Verifica il tuo UID: Firebase Console → Authentication
2. Verifica Firestore: Collection `superadmins` → Il tuo UID esiste?
3. Se no, crea manualmente (vedi Setup Iniziale)

### Modifiche non si salvano

**Causa:** Firestore rules o permessi  
**Fix:**

1. Controlla console browser per errori
2. Verifica Firestore Rules: `isSuperAdmin()` funziona?
3. Deploy regole: `firebase deploy --only firestore:rules`

### Analytics a zero nonostante brand attivi

**Causa:** Analytics non aggiornati  
**Fix:**

1. Click su "🔄 Refresh" in alto
2. Oppure: chiama `updateAnalytics()` da console

```javascript
import { updateAnalytics } from './services/platform/platformService';
await updateAnalytics();
```

---

## 📚 API Reference

### platformService.ts

```typescript
// Get settings
const settings = await getPlatformSettings();

// Update settings
await updatePlatformSettings({
  systemName: 'Nuovo Nome',
});

// Check if user is SuperAdmin
const isSA = await isSuperAdmin(uid);

// Get system health
const health = await getSystemHealth();

// Log activity
await logActivity({
  type: 'brand_suspended',
  actor: 'superadmin@example.com',
  brandId: 'brand-123',
  description: 'Brand sospeso per violazione TOS',
});

// Get recent logs
const logs = await getRecentActivityLogs(50);

// Update analytics
await updateAnalytics();
```

---

## 🎯 Roadmap Future Features

### v1.1 (Post-MVP)

- [ ] Brands Management Tab completo
- [ ] Real-time system health da Cloud Monitoring
- [ ] Email notifications automation
- [ ] Export analytics (CSV, PDF)
- [ ] Advanced search in activity logs

### v1.2

- [ ] Multi-SuperAdmin con ruoli granulari
- [ ] Audit log con rollback
- [ ] A/B testing pricing
- [ ] Revenue forecasting
- [ ] Custom dashboards

---

## 📞 Support

**Per assistenza:**

- Email: admin@gallery2025.com
- Docs: `/docs/SUPERADMIN_GUIDE.md`
- Code: `/services/platform/platformService.ts`

---

**Creato da:** AI Assistant  
**Ultima modifica:** 18 Novembre 2025, 19:00 CET
