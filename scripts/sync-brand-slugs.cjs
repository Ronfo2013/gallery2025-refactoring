#!/usr/bin/env node

/**
 * Script di supporto: sincronizza il campo `slug` per tutti i brand
 * con il valore di `subdomain`, sanitizzandolo.
 * Utile per la nuova route `/brand/{slug}/`.
 */

const admin = require('firebase-admin');

admin.initializeApp({
  projectId: 'gallery-app-972f9',
});

const db = admin.firestore();

const normalizeSlug = (value) =>
  value
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || '';

async function main() {
  console.log('🔁 Sincronizzazione brand slug in corso...');

  const snapshot = await db.collection('brands').get();
  if (snapshot.empty) {
    console.log('⚠️ Nessun brand trovato.');
    process.exit(0);
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const currentSlug = data.slug?.toString().trim();
    const fallback = data.subdomain?.toString().split('.')[0] || '';
    const desiredSlug = normalizeSlug(currentSlug || fallback);

    if (!desiredSlug) {
      console.warn(`⚠️ Brand ${doc.id} non ha subdomain valido per creare slug, salto.`);
      return;
    }

    if (currentSlug !== desiredSlug) {
      console.log(`📝 Aggiornamento slug ${doc.id}: ${currentSlug} → ${desiredSlug}`);
      batch.update(doc.ref, { slug: desiredSlug });
    }
  });

  await batch.commit();
  console.log('✅ Sincronizzazione completata.');
}

main().catch((err) => {
  console.error('❌ Errore durante la sincronizzazione dei slug:', err);
  process.exit(1);
});
