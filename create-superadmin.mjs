#!/usr/bin/env node

/**
 * Script to create SuperAdmin document in Firestore
 * Usage: node create-superadmin.mjs
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '.env.local') });

// Initialize Firebase Admin SDK
// Uses Application Default Credentials (set via gcloud auth application-default login)
try {
  initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin SDK initialized\n');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error);
  process.exit(1);
}

const db = getFirestore();

/**
 * Create SuperAdmin document
 */
async function createSuperAdmin() {
  // SuperAdmin data
  const uid = 'IpffSxYEahbhuSXmciBCY1YDwjy2'; // UID of test@example.com
  const email = 'test@example.com';
  
  const superAdminData = {
    email: email,
    role: 'owner',
    permissions: {
      canManageBrands: true,
      canManageSettings: true,
      canViewAnalytics: true,
      canManageStripe: true,
    },
    createdAt: Timestamp.now(),
    lastLogin: Timestamp.now(),
  };

  console.log('📝 Creating SuperAdmin document...');
  console.log('-----------------------------------');
  console.log('UID:', uid);
  console.log('Email:', email);
  console.log('Role:', superAdminData.role);
  console.log('Permissions:', superAdminData.permissions);
  console.log('-----------------------------------\n');

  try {
    // Check if document already exists
    const docRef = db.collection('superadmins').doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.log('⚠️  SuperAdmin document already exists!');
      console.log('Current data:', docSnap.data());
      console.log('\nDo you want to update it? (y/n)');
      
      // For non-interactive script, just show info
      console.log('ℹ️  Run with --force to overwrite existing document\n');
      
      // Check if --force flag is present
      if (process.argv.includes('--force')) {
        console.log('🔄 Force flag detected, updating document...\n');
        await docRef.set(superAdminData, { merge: true });
        console.log('✅ SuperAdmin document updated successfully!\n');
      } else {
        console.log('❌ Aborted. Document already exists.\n');
        process.exit(0);
      }
    } else {
      // Create new document
      await docRef.set(superAdminData);
      console.log('✅ SuperAdmin document created successfully!\n');
    }

    // Verify creation
    const verifyDoc = await docRef.get();
    if (verifyDoc.exists) {
      console.log('✅ Verification successful!');
      console.log('Document data:', JSON.stringify(verifyDoc.data(), null, 2));
      console.log('\n-----------------------------------');
      console.log('🎉 Done! You can now upload logos and manage all brands.');
      console.log('-----------------------------------\n');
    } else {
      console.error('❌ Verification failed. Document not found.');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error creating SuperAdmin:', error);
    
    if (error.code === 'permission-denied') {
      console.log('\n💡 Suggerimento:');
      console.log('Assicurati di aver eseguito:');
      console.log('  gcloud auth application-default login');
      console.log('\nOppure usa un Service Account Key:');
      console.log('  export GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccountKey.json"');
    }
    
    process.exit(1);
  }
}

// Run the script
console.log('\n╔════════════════════════════════════════════════════════╗');
console.log('║                                                        ║');
console.log('║         🔧 CREATE SUPERADMIN DOCUMENT 🔧              ║');
console.log('║                                                        ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

createSuperAdmin()
  .then(() => {
    console.log('✅ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });


