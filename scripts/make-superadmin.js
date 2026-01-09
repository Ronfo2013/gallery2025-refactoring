const admin = require('firebase-admin');

// Initialize Firebase Admin for Emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp({
  projectId: 'demo-project',
});

const db = admin.firestore();

async function makeSuperAdmin(uid) {
  if (!uid) {
    console.error('Usage: node scripts/make-superadmin.js <USER_UID>');
    process.exit(1);
  }

  try {
    const adminRef = db.collection('superadmins').doc(uid);
    await adminRef.set({
      uid: uid,
      role: 'superadmin',
      email: 'admin@clubgallery.com', // Optional, will be updated on login
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`✅ User ${uid} is now a SuperAdmin in the emulator!`);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

const uid = process.argv[2];
makeSuperAdmin(uid);
