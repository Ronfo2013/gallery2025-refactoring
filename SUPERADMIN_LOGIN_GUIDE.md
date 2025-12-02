# 🔐 Guida SuperAdmin Login

## Come Accedere al Pannello SuperAdmin

### Metodo 1: Da Landing Page

1. Vai alla landing page principale (`http://localhost:5173` o dominio principale)
2. Scrolla fino al footer
3. Clicca sul link discreto **"Admin"** (in basso a destra)
4. Vedrai il form di login standard di Firebase Auth
5. Inserisci le credenziali SuperAdmin
6. Clicca su **"Access Admin Panel"**

### Metodo 2: Accesso Diretto (Consigliato)

1. Vai direttamente a `http://localhost:5173/#/superadmin`
2. Vedrai il form di login Firebase Authentication
3. Inserisci le credenziali SuperAdmin
4. Clicca su **"Access Admin Panel"**
5. **Password dimenticata?** Usa il link per reset via email

## Credenziali

Le credenziali SuperAdmin sono quelle create con lo script:

```bash
node create-superadmin.mjs
```

**Esempio:**

- Email: `superadmin@example.com`
- Password: quella che hai impostato durante la creazione

## Comportamento del Sistema

### ✅ Quando l'utente NON è autenticato

- Viene mostrato il **form di login** elegante
- L'utente può inserire email e password
- Dopo il login, viene verificato se è SuperAdmin
- Se autorizzato → carica il pannello
- Se non autorizzato → redirect alla home con messaggio

### ✅ Quando l'utente è già autenticato

- Verifica immediata se è SuperAdmin
- Se autorizzato → carica direttamente il pannello
- Se non autorizzato → redirect alla home con messaggio

### ✅ Protezione

- Solo utenti presenti nella collection `superusers` possono accedere
- La verifica avviene su Firestore (server-side)
- Nessun bypass possibile lato client

## Troubleshooting

### "Accesso negato. Solo SuperAdmin possono accedere"

**Causa:** L'utente ha fatto login ma non è nella collection `superusers`

**Soluzione:**

1. Verifica che l'utente sia stato creato correttamente:

```bash
node create-superadmin.mjs
```

2. Controlla su Firebase Console:
   - Vai su Firestore
   - Collection: `superusers`
   - Documento con ID = UID dell'utente
   - Campo: `role: 'superadmin'`

### "Email o password non corretti"

**Causa:** Credenziali errate o utente non esistente

**Soluzione:**

1. Verifica le credenziali
2. Se hai dimenticato la password, puoi resettarla:
   - Aggiungi un link "Password dimenticata?" nel form
   - Oppure ricrea l'utente con `create-superadmin.mjs`

### Non vedo il link "Admin" nel footer

**Causa:** Il link è volutamente discreto (opacity ridotta)

**Soluzione:**

- Il link è presente, cerca nell'ultima riga del footer
- Ha `opacity-30` di default
- Diventa visibile al hover (`opacity-100`)

## Sicurezza

### 🔒 Best Practices Implementate

1. **Autenticazione Firebase:** Login sicuro con email/password
2. **Verifica Server-Side:** Controllo su Firestore collection `superusers`
3. **No Credentials in Code:** Nessuna password hardcoded
4. **Session Management:** Gestito da Firebase Auth
5. **Auto-Logout:** Firebase gestisce la scadenza della sessione

### 🚫 NON Fare

- ❌ Non condividere le credenziali SuperAdmin
- ❌ Non committare file con password
- ❌ Non disabilitare la verifica `isSuperAdmin()`
- ❌ Non aggiungere backdoor per bypassare l'autenticazione

## Flusso Tecnico

```
User accede a /#/superadmin
         ↓
  SuperAdminPanel.tsx
         ↓
    È autenticato?
         ↓
    NO → Mostra LoginForm
         ↓
    User inserisce credenziali
         ↓
    signInWithEmailAndPassword()
         ↓
    onAuthStateChanged() → carica dati
         ↓
    SI → isSuperAdmin(uid)?
         ↓
    SI → Carica pannello
    NO → Redirect a / con alert
```

## Modifiche Apportate

### File Modificati

1. **`pages/superadmin/SuperAdminPanel.tsx`**
   - Integrato hook `useFirebaseAuth` per gestione autenticazione
   - Riutilizzato componente esistente `AdminLogin` invece di creare form custom
   - Il pannello mostra `AdminLogin` quando l'utente non è autenticato
   - Verifica `isSuperAdmin()` dopo autenticazione riuscita
   - Gestione completa del ciclo di vita auth (login, logout, reset password)

2. **`pages/public/LandingPage.tsx`**
   - Aggiunto link "Admin" nel footer per accesso rapido
   - Styling: discreto (opacity-30) ma accessibile al hover

3. **`components/AdminLogin.tsx`** _(già esistente - riutilizzato)_
   - Form di login professionale con Firebase Auth
   - Supporto password reset integrato
   - Gestione errori user-friendly in italiano
   - Spinner e stati di loading

4. **`hooks/useFirebaseAuth.ts`** _(già esistente - riutilizzato)_
   - Hook custom per Firebase Authentication
   - Gestisce login, logout, reset password
   - Observable auth state changes
   - Error handling con messaggi localizzati

---

**Creato:** 2025-11-20  
**Autore:** Codex AI Assistant  
**Status:** ✅ Implementato e Testato
