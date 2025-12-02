/**
 * Fix Orphan User - Create Missing Firestore Document
 * 
 * This script creates a superuser document in Firestore for a user
 * that exists in Firebase Auth but is missing from Firestore.
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin with Application Default Credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * Fix orphan user by creating Firestore document
 */
async function fixOrphanUser(email) {
  try {
    console.log(`\n🔍 Searching for user with email: ${email}`);
    
    // 1. Get user from Firebase Auth
    const userRecord = await auth.getUserByEmail(email);
    console.log(`✅ User found in Firebase Auth:`);
    console.log(`   - UID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Created: ${userRecord.metadata.creationTime}`);
    
    // 2. Check if document exists in Firestore
    const superuserRef = db.collection('superusers').doc(userRecord.uid);
    const superuserDoc = await superuserRef.get();
    
    if (superuserDoc.exists) {
      console.log(`\n✅ Superuser document already exists in Firestore`);
      console.log(`   Data:`, superuserDoc.data());
      return;
    }
    
    console.log(`\n⚠️  Superuser document NOT found in Firestore (orphan user)`);
    console.log(`\n📝 Creating superuser document...`);
    
    // 3. Find any brand associated with this email
    const brandsSnapshot = await db.collection('brands')
      .where('ownerEmail', '==', email)
      .limit(1)
      .get();
    
    let brandId = null;
    if (!brandsSnapshot.empty) {
      brandId = brandsSnapshot.docs[0].id;
      console.log(`   - Found associated brand: ${brandId}`);
    } else {
      console.log(`   - No brand found, using placeholder`);
      brandId = 'placeholder'; // Will be updated when brand is created
    }
    
    // 4. Create superuser document
    await superuserRef.set({
      email: userRecord.email,
      brandId: brandId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      fixedOrphan: true, // Flag to indicate this was fixed
      fixedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`\n✅ Superuser document created successfully!`);
    console.log(`   - Document ID: ${userRecord.uid}`);
    console.log(`   - Email: ${userRecord.email}`);
    console.log(`   - Brand ID: ${brandId}`);
    
    console.log(`\n🎉 Orphan user fixed! You can now create brands with this email.`);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`\n❌ User not found in Firebase Auth: ${email}`);
      console.log(`\n💡 This email doesn't exist yet. You can create a new brand with it.`);
    } else {
      console.error(`\n❌ Error fixing orphan user:`, error);
    }
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2];

if (!email) {
  console.error(`
❌ Usage: node scripts/fix-orphan-user.cjs <email>

Example:
  node scripts/fix-orphan-user.cjs user@example.com
`);
  process.exit(1);
}

// Run the fix
fixOrphanUser(email)
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });




