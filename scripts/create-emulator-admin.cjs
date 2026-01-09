/**
 * Script per creare il SuperAdmin nell'EMULATORE locale
 * Uso: node scripts/create-emulator-admin.js
 */

const admin = require('firebase-admin');

// 💡 FORZA l'uso dell'emulatore
process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9109';
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8090';

const PROJECT_ID = 'gallery-app-972f9';

admin.initializeApp({
  projectId: PROJECT_ID,
});

const auth = admin.auth();
const db = admin.firestore();

async function createEmulatorAdmin() {
  const email = 'info@benhanced.it';
  const password = 'SuperAdmin2025!';
  const uid = 'superadmin-local-id';

  console.log(`🚀 Creazione utente ${email} nell'emulatore (Auth: localhost:9109)...`);

  try {
    // 1. Crea utente in Auth Emulator
    let user;
    try {
      user = await auth.createUser({
        uid,
        email,
        password,
        displayName: 'SuperAdmin Locale',
      });
      console.log('✅ Utente creato in Auth Emulator');
    } catch (e) {
      if (e.code === 'auth/uid-already-exists' || e.code === 'auth/email-already-exists') {
        console.log("⚠️  L'utente esiste già in Auth, procedo con Firestore...");
      } else {
        throw e;
      }
    }

    // 2. Crea documento in Firestore Emulator
    await db
      .collection('superadmins')
      .doc(uid)
      .set({
        email,
        role: 'superadmin',
        permissions: {
          manageBrands: true,
          manageUsers: true,
          viewAnalytics: true,
          manageSettings: true,
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    console.log('✅ Documento SuperAdmin creato in Firestore Emulator');
    console.log('\n🎉 ORA PUOI LOGGARTI CON:');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

createEmulatorAdmin();
