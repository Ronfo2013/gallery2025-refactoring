/**
 * Script per creare SuperAdmin REALE in produzione
 * Email: info@benhanced.it
 * Password: camilla2020_
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Initializing Firebase Admin...');

// Initialize Firebase Admin with Application Default Credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'gallery-app-972f9',
});

const auth = admin.auth();
const db = admin.firestore();

async function createRealSuperAdmin() {
  const email = 'info@benhanced.it';
  const password = 'SuperAdmin2025!'; // Semplificata per evitare problemi con caratteri speciali
  const displayName = 'SuperAdmin';

  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 CREAZIONE SUPERADMIN REALE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email: ${email}`);
    console.log(`👤 Display Name: ${displayName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Create Firebase Auth user
    console.log('1️⃣  Creating Firebase Auth user...');
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true, // Auto-verify email for SuperAdmin
      });
      console.log(`✅ Firebase Auth user created: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log('⚠️  User already exists in Firebase Auth');
        const existingUser = await auth.getUserByEmail(email);
        userRecord = existingUser;
        console.log(`✅ Using existing user: ${userRecord.uid}`);
        
        // Update password
        console.log('🔑 Updating password...');
        await auth.updateUser(userRecord.uid, {
          password,
        });
        console.log('✅ Password updated');
      } else {
        throw error;
      }
    }

    // 2. Add to superadmins collection
    console.log('\n2️⃣  Adding to superadmins collection...');
    const superAdminData = {
      email,
      displayName,
      role: 'superadmin',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        manageBrands: true,
        manageUsers: true,
        viewAnalytics: true,
        manageSettings: true,
        viewLogs: true,
      },
    };

    await db.collection('superadmins').doc(userRecord.uid).set(superAdminData);
    console.log('✅ Added to superadmins collection');

    // 3. Verify
    console.log('\n3️⃣  Verifying...');
    const superAdminDoc = await db.collection('superadmins').doc(userRecord.uid).get();
    if (superAdminDoc.exists) {
      console.log('✅ SuperAdmin document verified in Firestore');
    } else {
      throw new Error('SuperAdmin document not found in Firestore');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 SUPERADMIN CREATO CON SUCCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📝 CREDENZIALI:');
    console.log(`   Email:    ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   UID:      ${userRecord.uid}\n`);
    console.log('🌐 LOGIN URL:');
    console.log('   https://gallery-app-972f9.web.app/#/superadmin\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.code) {
      console.error(`   Code: ${error.code}`);
    }
    process.exit(1);
  }
}

// Run
createRealSuperAdmin();

