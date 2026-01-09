/**
 * Migration Script: Convert SuperUser brandId to brandIds[]
 * 
 * This script migrates existing superuser documents from:
 *   { email, brandId, createdAt }
 * To:
 *   { email, brandIds: [brandId], brandId (legacy), createdAt, updatedAt }
 * 
 * This enables multi-brand support while maintaining backward compatibility.
 */

const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
}

const db = admin.firestore();

async function migrateSuperusers() {
  try {
    console.log('\n🚀 Starting SuperUser Migration to Multi-Brand Support\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 1. Get all superusers
    const superusersSnapshot = await db.collection('superusers').get();

    if (superusersSnapshot.empty) {
      console.log('✅ No superusers found - nothing to migrate\n');
      return;
    }

    console.log(`📊 Found ${superusersSnapshot.size} superuser(s) to migrate\n`);

    let migratedCount = 0;
    let alreadyMigratedCount = 0;
    let errorCount = 0;

    // 2. Process each superuser
    for (const doc of superusersSnapshot.docs) {
      const userId = doc.id;
      const data = doc.data();

      console.log(`\n👤 Processing user: ${data.email} (${userId})`);

      // Check if already migrated
      if (data.brandIds && Array.isArray(data.brandIds)) {
        console.log(`   ✓ Already migrated (has brandIds array)`);
        alreadyMigratedCount++;
        continue;
      }

      // Check if has legacy brandId
      if (!data.brandId) {
        console.log(`   ⚠️  WARNING: No brandId found - skipping`);
        errorCount++;
        continue;
      }

      try {
        // Migrate: convert brandId to brandIds array
        const updateData = {
          brandIds: [data.brandId], // New format: array
          // Keep brandId for backward compatibility
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await doc.ref.update(updateData);

        console.log(`   ✅ Migrated:`);
        console.log(`      - brandId: "${data.brandId}"`);
        console.log(`      - brandIds: ["${data.brandId}"]`);

        migratedCount++;
      } catch (error) {
        console.error(`   ❌ Error migrating user ${userId}:`, error.message);
        errorCount++;
      }
    }

    // 3. Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 MIGRATION SUMMARY:\n');
    console.log(`   ✅ Successfully migrated: ${migratedCount}`);
    console.log(`   ℹ️  Already migrated:     ${alreadyMigratedCount}`);
    console.log(`   ❌ Errors:                ${errorCount}`);
    console.log(`   📊 Total processed:       ${superusersSnapshot.size}\n`);

    if (errorCount === 0 && migratedCount > 0) {
      console.log('🎉 Migration completed successfully!\n');
      console.log('💡 Next steps:');
      console.log('   1. Users can now access multi-brand selector in dashboard');
      console.log('   2. Creating new brands with existing emails will add to brandIds[]');
      console.log('   3. Legacy brandId is kept for backward compatibility\n');
    } else if (alreadyMigratedCount === superusersSnapshot.size) {
      console.log('✅ All superusers already migrated - no action needed\n');
    } else if (errorCount > 0) {
      console.log('⚠️  Migration completed with errors - please review above\n');
    }

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run migration
migrateSuperusers()
  .then(() => {
    console.log('✅ Migration script finished\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration script failed:', error);
    process.exit(1);
  });






