#!/usr/bin/env node

/**
 * Popola il documento `superusers/{uid}` senza dover ricreare
 * tutto il brand. Può servire per riparare i brand creati manualmente
 * oppure per allineare i dati dopo aver lanciato lo slug-sync.
 *
 * Uso:
 *   node scripts/ensure-superuser-doc.cjs <uid> <brandId> <email>
 *
 * Esempio:
 *   node scripts/ensure-superuser-doc.cjs jDGcoOCrmhPvn2OXJEAU brandId123 angelo.bernardini@gmail.com
 */

const admin = require('firebase-admin');

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('❌ Setta GOOGLE_APPLICATION_CREDENTIALS prima di eseguire lo script.');
  process.exit(1);
}

admin.initializeApp({
  projectId: 'gallery-app-972f9',
});

const db = admin.firestore();

const [uid, brandId, email] = process.argv.slice(2);

if (!uid || !brandId || !email) {
  console.error('❌ Sintassi: node scripts/ensure-superuser-doc.cjs <uid> <brandId> <email>');
  process.exit(1);
}

async function main() {
  const superuserRef = db.collection('superusers').doc(uid);
  const now = admin.firestore.FieldValue.serverTimestamp();

  console.log('🔁 Aggiorno documento superuser per', uid);

  await superuserRef.set(
    {
      email: email.trim(),
      brandId,
      brandIds: admin.firestore.FieldValue.arrayUnion(brandId),
      updatedAt: now,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  console.log('✅ Documento superuser pronto');
}

main().catch((err) => {
  console.error('❌ Errore:', err);
  process.exit(1);
});
