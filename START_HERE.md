# 🚀 START HERE - ClubGallery

Sistema pronto per gestire le gallery foto di club e discoteche.

## 1. Installazione

```bash
npm install
cd functions && npm install && cd ..
```

## 2. Ambiente locale

Copiati da `env.local.example` a `.env.local` e compila le variabili Firebase/Stripe.

In sviluppo usiamo:
- Vite su `http://localhost:5173`
- Emulatori Firebase (opzionali) via Docker (`docker-compose.dev.yml`)

## 3. Avvio

```bash
npm run dev
```

URL utili in locale:
- Landing: `http://localhost:5173/`
- Demo brand: `http://localhost:5173/demo`
- Dashboard brand: `http://localhost:5173/dashboard`
- Superadmin: `http://localhost:5173/superadmin`

## 4. Modello URL in produzione

- Demo: `https://www.clubgallery.com/demo`
- Gallery brand: `https://www.clubgallery.com/{brandSlug}/{albumId}`
- Dashboard brand: `https://www.clubgallery.com/dashboard`
- Superadmin: `https://www.clubgallery.com/superadmin`

