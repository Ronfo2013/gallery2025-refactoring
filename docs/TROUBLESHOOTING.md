# 🔧 Troubleshooting Guide

Soluzioni ai problemi comuni durante setup e sviluppo.

---

## ⚠️ npm WARN EBADENGINE (Node.js Version)

### Problema
```
npm WARN EBADENGINE Unsupported engine {
npm WARN EBADENGINE   package: 'vite@6.4.1',
npm WARN EBADENGINE   required: { node: '^18.0.0 || ^20.0.0 || >=22.0.0' },
npm WARN EBADENGINE   current: { node: 'v21.4.0', npm: '10.4.0' }
npm WARN EBADENGINE }
```

### Causa
Hai Node.js v21.4.0, ma il progetto richiede v20 o v22.

### ✅ Soluzione 1: Aggiorna a Node.js v22 (RACCOMANDATO)

**Con nvm (Node Version Manager):**
```bash
# Installa nvm se non ce l'hai
# https://github.com/nvm-sh/nvm

# Installa Node.js v22
nvm install 22

# Usa Node.js v22
nvm use 22

# Imposta v22 come default
nvm alias default 22

# Verifica
node -v  # Dovrebbe mostrare v22.x.x
```

**Senza nvm (Download manuale):**
1. Scarica Node.js v22 LTS da [nodejs.org](https://nodejs.org/)
2. Installa il package
3. Riavvia il terminale
4. Verifica: `node -v`

**Dopo l'aggiornamento:**
```bash
# Reinstalla dipendenze con Node v22
rm -rf node_modules package-lock.json
npm install
```

### ✅ Soluzione 2: Ignora i Warning (funziona lo stesso)

I warning `EBADENGINE` **non bloccano l'applicazione**. Puoi continuare a usare Node v21 se:
- L'app si builda correttamente (`npm run build`)
- I test passano (`npm test`)
- L'app funziona in development (`npm run dev`)

**Verifica che funzioni:**
```bash
npm run build
# Se passa senza errori, sei a posto!
```

---

## ❌ ERESOLVE - react-joyride con React 19

### Problema
```
npm ERR! ERESOLVE could not resolve
npm ERR! peer react@"15 - 18" from react-joyride@2.9.3
npm ERR! Found: react@19.2.0
```

### Causa
`react-joyride` non supporta React 19.

### ✅ Soluzione: Usa Intro.js invece

```bash
# 1. Rimuovi react-joyride
npm uninstall react-joyride react-floater

# 2. Installa Intro.js (compatibile React 19)
npm install intro.js intro.js-react --legacy-peer-deps

# 3. Verifica
npm list intro.js intro.js-react
```

Il componente `OnboardingTour.tsx` è già configurato per Intro.js!

---

## 📦 Dipendenze Mancanti

### Problema
```
Module not found: Can't resolve 'browser-image-compression'
```

### Soluzione
```bash
npm install browser-image-compression intro.js intro.js-react --legacy-peer-deps
```

---

## 🔨 Build Errors

### Problema 1: "no-console" ESLint Error
```
error  Unexpected console statement  no-console
```

### Soluzione
Usa il logger invece di console:
```typescript
// ❌ Before
console.log('Debug info');

// ✅ After
import { logger } from '@/utils/logger';
logger.debug('Debug info');
```

### Problema 2: Import Path Errors
```
Module not found: Error: Can't resolve './context/AppContext'
```

### Soluzione
Aggiorna gli import path:
```typescript
// ❌ Before
import { useAppContext } from './context/AppContext';

// ✅ After
import { useAppContext } from './contexts/AppContext';
```

### Problema 3: TypeScript Errors dopo Refactoring
```bash
# Riavvia TypeScript server
# VS Code: CMD+Shift+P > "TypeScript: Restart TS Server"

# O pulisci la cache
rm -rf node_modules/.vite
npm run dev
```

---

## 🔥 Firebase Errors

### Problema: "permission-denied" in Development
```
FirebaseError: Missing or insufficient permissions
```

### Causa
Firestore rules hardenate (chiuso write pubblico).

### Soluzione 1: Usa Firebase Emulators
```bash
# .env
VITE_FIREBASE_USE_EMULATOR=true

# Avvia emulatori
npm run firebase:emulators
```

### Soluzione 2: Autentica come SuperAdmin
```typescript
// Login con account SuperAdmin configurato
await signInWithEmailAndPassword(auth, 'admin@example.com', 'password');
```

### Problema: "storage/unauthorized" su immagini pubbliche
```
Error: User does not have permission to access storage
```

### Soluzione
Verifica `storage.rules`:
```
// storage.rules
match /brands/{brandId}/uploads/{allPaths=**} {
  allow read: if true;  // Lettura pubblica
  allow write: if request.auth != null;
}
```

---

## 🚀 Runtime Errors

### Problema: App crash con "lazy loading failed"
```
Error: Loading chunk failed
```

### Causa
Bundle chunks non trovati dopo deploy.

### Soluzione
```bash
# Rebuild completo
rm -rf dist node_modules/.vite
npm run build

# Deploy
firebase deploy --only hosting
```

### Problema: "Cannot find module" in Production
```
Module not found after build
```

### Soluzione
Verifica `vite.config.ts`:
```typescript
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

---

## 🧪 Testing Errors

### Problema: Tests fail con "ReferenceError: window is not defined"
```bash
# Installa jsdom
npm install --save-dev jsdom

# Verifica vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
```

---

## 💾 Git Issues

### Problema: Accidentalmente committato .env
```bash
# Rimuovi dal repo
git rm --cached .env

# Aggiungi a .gitignore se non presente
echo ".env" >> .gitignore

# Commit
git add .gitignore
git commit -m "chore: remove .env from repo"
```

### Problema: Merge conflicts dopo refactoring
```bash
# Usa la strategia "ours" per mantenere le modifiche correnti
git merge --strategy-option ours origin/main

# O risolvi manualmente
git mergetool
```

---

## 🔍 Debug Checklist

Quando qualcosa non funziona, prova in ordine:

### 1. Verifica Node version
```bash
node -v  # Deve essere v20 o v22
npm -v
```

### 2. Pulisci cache
```bash
rm -rf node_modules package-lock.json
rm -rf .vite dist
npm install
```

### 3. Verifica environment variables
```bash
# Controlla .env esiste
ls -la .env

# Verifica valori (senza mostrare secrets)
echo $VITE_FIREBASE_PROJECT_ID
```

### 4. Check linter
```bash
npm run lint
# Fix automatico
npm run lint -- --fix
```

### 5. Test build
```bash
npm run build
# Se fallisce, leggi errori attentamente
```

### 6. Test in development
```bash
npm run dev
# Apri http://localhost:5173
# Check console browser per errori
```

---

## 📞 Ulteriore Supporto

Se nessuna soluzione funziona:

1. **Check logs completi**:
```bash
# npm logs
cat ~/.npm/_logs/[latest-log].txt

# Vite logs
npm run dev --debug
```

2. **Crea issue report** con:
   - Node version (`node -v`)
   - npm version (`npm -v`)
   - OS (`uname -a` o `ver`)
   - Error completo (full stack trace)
   - Comandi eseguiti

3. **Consulta documentazione**:
   - `/docs/ENVIRONMENT_VARIABLES.md`
   - `/docs/MIGRATION_GUIDE.md`
   - `/docs/CHANGELOG.md`

---

## ✅ Quick Fixes

### Reset Completo
```bash
# Pulisci tutto
rm -rf node_modules package-lock.json dist .vite

# Reinstalla
npm install

# Build
npm run build

# Test
npm run dev
```

### Verifica Salute Progetto
```bash
# Check dependencies
npm list --depth=0

# Check outdated
npm outdated

# Check vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

---

Last Updated: 2025-12-03
