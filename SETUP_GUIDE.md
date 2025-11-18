# 🚀 Setup Guide - Gallery2025 Refactoring

**Quick start guide per iniziare lo sviluppo**

---

## ✅ Prerequisiti

Prima di iniziare, assicurati di avere:

- [x] **Node.js** >= 20.x (consigliato 22.x)
- [x] **npm** >= 10.x
- [x] **Git** >= 2.40
- [x] **Google Cloud SDK** (gcloud CLI)
- [x] **Firebase CLI** >= 13.x
- [x] **Docker** (opzionale, per test locali)

### Verifica Installazioni:

```bash
node --version    # Should be >= 20.x
npm --version     # Should be >= 10.x
git --version
gcloud --version
firebase --version
```

---

## 📦 Installazione

### 1. Dipendenze Root

```bash
cd /Users/angelo-mac/gallery2025-refactoring

# Installa dipendenze frontend
npm install

# Installa dipendenze ESLint e Prettier (se non già presenti)
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y \
  prettier eslint-config-prettier
```

### 2. Dipendenze Server

```bash
cd server
npm install
cd ..
```

### 3. Dipendenze Firebase Functions

```bash
cd functions
npm install
cd ..
```

---

## ⚙️ Configurazione

### 1. Environment Variables

```bash
# Copia il file di esempio
cp .env.local.example .env.local

# Modifica con le tue credenziali
nano .env.local
```

**Variabili richieste in `.env.local`:**

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API (opzionale)
VITE_GEMINI_API_KEY=your_gemini_key
```

### 2. Firebase Setup

```bash
# Login Firebase (se necessario)
firebase login

# Seleziona progetto
firebase use gen-lang-client-0873479092

# Verifica configurazione
firebase projects:list
```

### 3. Google Cloud Setup

```bash
# Login Google Cloud (se necessario)
gcloud auth login

# Imposta progetto
gcloud config set project gen-lang-client-0873479092

# Verifica
gcloud config list
```

---

## 🏃 Avvio Sviluppo

### Opzione 1: Frontend + Server Insieme

```bash
npm run dev
```

Questo avvierà:
- Frontend su `http://localhost:5173`
- Server su `http://localhost:3000`

### Opzione 2: Solo Frontend

```bash
npm run dev:frontend
```

### Opzione 3: Solo Server

```bash
cd server
npm run dev
```

### Opzione 4: Firebase Functions (Locale)

```bash
# Avvia emulatori Firebase
firebase emulators:start

# In un altro terminale, avvia frontend
npm run dev
```

---

## 🧪 Testing

### Setup Testing (Da fare)

```bash
# Installa Vitest e dipendenze
npm install -D vitest @vitest/ui @testing-library/react \
  @testing-library/jest-dom @testing-library/user-event \
  jsdom happy-dom
```

### Run Tests

```bash
# Unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI
npm run test:ui
```

---

## 🔍 Linting e Formatting

### ESLint

```bash
# Check errori
npm run lint

# Fix automatico
npm run lint:fix
```

### Prettier

```bash
# Check formatting
npm run format:check

# Format automatico
npm run format
```

### Pre-commit Hook (Da configurare)

```bash
# Installa Husky
npm install -D husky lint-staged

# Setup hooks
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

---

## 🏗️ Build

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build
```

### Preview Build Locale

```bash
npm run preview
```

### Analisi Bundle

```bash
npm run build:analyze
```

---

## 🐳 Docker (Opzionale)

### Build Immagine

```bash
# Build con Dockerfile.optimized
docker build -f Dockerfile.optimized -t gallery2025-refactoring .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  gallery2025-refactoring
```

### Docker Compose (Dev)

```bash
docker-compose -f docker-compose.dev.yml up
```

---

## 🌐 Deploy

### Pre-Deploy Check

```bash
# Esegui validazione
./pre-deploy-check.sh

# Se passa, procedi con il deploy
```

### Deploy su Cloud Run

```bash
# Deploy completo via Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# Verifica deployment
gcloud run services list
curl -I https://ai-photo-gallery-595991638389.us-west1.run.app/
```

### Deploy Firebase Functions

```bash
cd functions
firebase deploy --only functions
```

---

## 🛠️ Tool Consigliati

### VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",
    "eamodio.gitlens"
  ]
}
```

### Chrome Extensions

- React Developer Tools
- Redux DevTools (se usi Redux)
- Lighthouse

---

## 🐛 Troubleshooting

### Problema: `npm install` fallisce

**Soluzione:**
```bash
# Pulisci cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Problema: Port 5173 già in uso

**Soluzione:**
```bash
# Trova processo
lsof -ti:5173

# Killa processo
kill -9 $(lsof -ti:5173)

# Oppure usa porta diversa
npm run dev -- --port 5174
```

### Problema: Firebase auth non funziona

**Soluzione:**
```bash
# Verifica configurazione
firebase projects:list
firebase use gen-lang-client-0873479092

# Re-login se necessario
firebase login --reauth
```

### Problema: TypeScript errors dopo installazione

**Soluzione:**
```bash
# Rigenera types
npm run build

# Riavvia TypeScript server in VS Code
# Cmd+Shift+P > "TypeScript: Restart TS Server"
```

---

## 📚 Prossimi Passi

Dopo il setup, segui il [REFACTORING_PLAN.md](./REFACTORING_PLAN.md):

1. [ ] Crea branch `develop`
2. [ ] Setup testing framework (Vitest)
3. [ ] Configura Husky per pre-commit hooks
4. [ ] Inizia refactoring componenti base
5. [ ] Implementa service layer

---

## 🔗 Link Utili

- **Progetto Originale:** `/Users/angelo-mac/gallery2025-project`
- **Firebase Console:** https://console.firebase.google.com/project/gen-lang-client-0873479092
- **Google Cloud Console:** https://console.cloud.google.com/run?project=gen-lang-client-0873479092
- **Deployed App:** https://ai-photo-gallery-595991638389.us-west1.run.app

---

## 📞 Supporto

### Comandi Utili

```bash
# Status progetto
git status
npm run lint
npm run type-check

# Logs Cloud Run
gcloud logging tail "resource.type=cloud_run_revision"

# Firebase logs
firebase functions:log

# Pulisci tutto
npm run clean  # (da creare)
rm -rf node_modules server/node_modules functions/node_modules
rm -rf dist .firebase .cache
```

---

**Creato:** 18/11/2025  
**Aggiornato:** 18/11/2025  
**Status:** ✅ READY FOR DEVELOPMENT

