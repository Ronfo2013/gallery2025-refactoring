# ClubGallery - Photo Gallery per Club e Discoteche

ClubGallery è una piattaforma per gestire e mostrare le foto delle serate di club e discoteche.

## URL Principali (Produzione)

- Landing: `https://www.clubgallery.com/`
- Demo: `https://www.clubgallery.com/demo`
- Gallery cliente: `https://www.clubgallery.com/{brandSlug}/{albumId}`
- Dashboard brand: `https://www.clubgallery.com/dashboard`
- Superadmin: `https://www.clubgallery.com/superadmin`

## Avvio in locale (sviluppo rapido)

```bash
npm install
cd functions && npm install && cd ..

npm run dev
```

Poi apri: `http://localhost:5173/`

## Note

- Ogni brand è identificato da uno **slug** (es. `midisco`) usato nel path.
- Niente subdomini: tutte le URL passano da `www.clubgallery.com`.

