# 🔨 Gallery2025 - Progetto Refactoring

> **Copia del progetto originale per refactoring e implementazioni sicure**

---

## 🎯 Perché Questo Progetto?

Questo è un **fork dedicato al refactoring** del progetto `gallery2025-project`. L'obiettivo è:

- ✅ Mantenere il progetto originale stabile e funzionante
- 🔨 Sperimentare refactoring senza rischi
- 🚀 Implementare nuove funzionalità in modo sicuro
- 📚 Documentare tutte le modifiche

---

## 📁 Struttura

```
gallery2025-refactoring/
├── components/        # Componenti React da refactorare
├── context/          # Context API (da valutare Zustand)
├── functions/        # Cloud Functions
├── hooks/            # Custom hooks
├── pages/            # Pagine principali
├── server/           # Express server ottimizzato
├── services/         # Servizi Firebase
├── utils/            # Utility functions
└── REFACTORING_PLAN.md  # Piano dettagliato
```

---

## 🚀 Quick Start

### 1. Installa Dipendenze

```bash
# Root dependencies
npm install

# Server dependencies
cd server && npm install && cd ..

# Firebase Functions dependencies
cd functions && npm install && cd ..
```

### 2. Configura Ambiente

```bash
# Copia file di esempio
cp .env.local.example .env.local

# Modifica con le tue credenziali Firebase
nano .env.local
```

### 3. Avvia Sviluppo

```bash
# Frontend + Server
npm run dev

# Solo frontend
npm run dev:frontend

# Solo server
npm run dev:server
```

---

## 📋 Piano Refactoring

Vedi [`REFACTORING_PLAN.md`](./REFACTORING_PLAN.md) per il piano dettagliato.

### Fasi Principali:

1. **Setup** - Ambiente, linting, testing
2. **Architettura** - Ristrutturazione cartelle, state management
3. **Componenti** - Refactoring componenti React
4. **Servizi** - Astrazione layer Firebase
5. **Performance** - Ottimizzazioni
6. **Testing** - Unit + Integration tests
7. **Nuove Feature** - PWA, cache, etc.

---

## 🔧 Stack Tecnologico

### Attuale:
- React 19
- TypeScript
- Vite
- Firebase (Auth, Firestore, Storage)
- Tailwind CSS
- Express (server proxy)

### Da Aggiungere:
- ESLint + Prettier
- Vitest + React Testing Library
- Zustand (state management)
- React Query (server state)
- Storybook (component library)

---

## 📊 Stato Attuale

- ✅ Progetto copiato da `gallery2025-project`
- ✅ Repository Git inizializzato
- ✅ Commit iniziale fatto
- ✅ Piano refactoring documentato
- ⏳ Setup ambiente in corso...

---

## 🤝 Workflow

### Branch Strategy:
```
main                 # Stable, deployable
├── develop          # Integration branch
│   ├── feature/xxx  # Nuove features
│   ├── refactor/xxx # Refactoring
│   └── fix/xxx      # Bug fixes
```

### Commit Convention:
```
<type>(<scope>): <subject>

Examples:
feat(photos): add lazy loading
refactor(services): extract firebase logic
test(album): add unit tests
docs: update README
```

---

## 📚 Documentazione

- [`REFACTORING_PLAN.md`](./REFACTORING_PLAN.md) - Piano completo
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Architettura (da creare)
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) - Guida contributi (da creare)
- Progetto originale: `/Users/angelo-mac/gallery2025-project`

---

## ⚠️ Note Importanti

1. **Progetto Originale Intatto**
   - Il progetto originale in `gallery2025-project` rimane INTATTO
   - Tutti i cambiamenti avvengono SOLO in questo fork

2. **No Node Modules Copiati**
   - Esegui `npm install` prima di iniziare
   - Questo riduce la dimensione del progetto

3. **Git Separato**
   - Repository Git nuovo, separato dall'originale
   - Puoi pushare su un nuovo remote se vuoi

4. **Ambiente Firebase**
   - Usa lo stesso progetto Firebase (per ora)
   - Valuta creazione environment staging separato

---

## 🎯 Prossimi Step

1. [ ] Setup ESLint + Prettier
2. [ ] Configurare TypeScript strict mode
3. [ ] Installare Vitest
4. [ ] Creare branch `develop`
5. [ ] Iniziare refactoring componenti base

---

## 🔗 Link Utili

- **Progetto Originale:** `/Users/angelo-mac/gallery2025-project`
- **Cloud Run:** https://ai-photo-gallery-595991638389.us-west1.run.app
- **Firebase Console:** https://console.firebase.google.com/project/gen-lang-client-0873479092

---

**Creato il:** 18 Novembre 2025  
**Status:** 🟢 ACTIVE - READY FOR REFACTORING

