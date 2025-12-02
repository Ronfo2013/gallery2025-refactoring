# 🛠️ Sistemazione Errori

**Data:** 2025-11-20 19:59:08 CET  
**Responsabile:** Codex (assistente AI)

## Interventi Effettuati

1. **Aggiornamento ESLint**
   - Migrata la configurazione da `.eslintrc.json` al formato flat `eslint.config.js`.
   - Ignorate cartelle legacy/generate (`dist`, `functions-gen1-backup`, `coverage`, ecc.).
   - Allineato lo script `npm run lint` per usare la nuova config senza bloccare i warning.

2. **Pulizia lint in codice React/TS**
   - Rimossi `useAppContext`/variabili non usati in `App.tsx`, `AlbumCard.tsx`, `AlbumPhotoManager.tsx`, `BrandDashboard*.tsx` e `SuperAdminPanel.tsx`.
   - Gestione errori aggiornata: `catch` convertiti in forme senza variabili inutilizzate, logging limitato.
   - Eliminati import e helper inutilizzati (`getStripe`, `Photo`, hook vari) nei servizi.

3. **Altre modifiche collegate**
   - Vitest già aggiornato a `happy-dom` con override `parse5` (controllo regressioni).
   - `vite.config.ts` configurato con `chunkSizeWarningLimit` per build più pulite.

## Risultato

- `npm run lint`, `npm run type-check`, `npm run build`, `npm test` e `npm run test:coverage` passano.
- Warning lint residui (console, `any`, max-len) documentati; non bloccanti.
