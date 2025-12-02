#!/usr/bin/env node

/**
 * Script per creare un Brand di Test SEMPLICE
 * (senza Stripe, solo Firebase)
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'gallery-app-972f9',
});

const db = admin.firestore();
const auth = admin.auth();

// Configurazione Brand di Test
const TEST_BRAND = {
  name: 'Test Brand Demo',
  subdomain: 'test-demo',
  customDomain: null,
  email: 'test-demo@example.com',
  status: 'active', // ← Attiviamo direttamente
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  activatedAt: admin.firestore.FieldValue.serverTimestamp(),
  branding: {
    logo: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
  },
  integrations: {
    googleAnalytics: '',
    metaPixel: '',
  },
  stripe: {
    customerId: 'cus_test_demo',
    subscriptionId: null,
    productId: 'prod_TS1EaWokTNEIY1',
  },
};

const SUPERUSER_PASSWORD = 'TestDemo2025!';

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║        🧪 CREAZIONE BRAND DI TEST (SEMPLICE) 🚀               ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 1: Verifica se il brand esiste già
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('1️⃣  Verifica brand esistente...');
    
    const existingBrandQuery = await db
      .collection('brands')
      .where('subdomain', '==', TEST_BRAND.subdomain)
      .limit(1)
      .get();

    let brandId;
    let brandDoc;

    if (!existingBrandQuery.empty) {
      console.log('⚠️  Brand già esistente! Riutilizzo...');
      brandDoc = existingBrandQuery.docs[0];
      brandId = brandDoc.id;
      
      // Aggiorna il brand
      await brandDoc.ref.update({
        status: 'active',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        activatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`✅ Brand aggiornato: ${brandId}`);
    } else {
      // Crea nuovo brand
      console.log('✨ Creazione nuovo brand...');
      brandDoc = await db.collection('brands').add(TEST_BRAND);
      brandId = brandDoc.id;
      console.log(`✅ Brand creato: ${brandId}`);
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 2: Crea utente Firebase Auth (Superuser)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n2️⃣  Creazione utente Superuser...');
    
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(TEST_BRAND.email);
      console.log('⚠️  Utente già esistente, aggiorno password...');
      await auth.updateUser(userRecord.uid, {
        password: SUPERUSER_PASSWORD,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email: TEST_BRAND.email,
          password: SUPERUSER_PASSWORD,
          displayName: TEST_BRAND.name,
        });
        console.log(`✅ Utente creato: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: Crea documento Superuser in Firestore
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n3️⃣  Creazione documento superuser...');
    
    await db.collection('brands').doc(brandId).collection('superusers').doc(userRecord.uid).set({
      email: TEST_BRAND.email,
      displayName: TEST_BRAND.name,
      role: 'owner',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      permissions: {
        manageAlbums: true,
        managePhotos: true,
        manageSettings: true,
        viewAnalytics: true,
      },
    }, { merge: true });
    console.log('✅ Documento superuser creato');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 4: Verifica completa
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n4️⃣  Verifica dati...');
    
    const brandData = (await db.collection('brands').doc(brandId).get()).data();
    const superuserData = (await db.collection('brands').doc(brandId).collection('superusers').doc(userRecord.uid).get()).data();
    
    console.log('✅ Brand verificato:', {
      name: brandData.name,
      subdomain: brandData.subdomain,
      status: brandData.status,
    });
    
    console.log('✅ Superuser verificato:', {
      email: superuserData.email,
      role: superuserData.role,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: Crea Storage folders
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n5️⃣  Creazione cartelle Storage...');
    
    const bucket = admin.storage().bucket('gallery-app-972f9.firebasestorage.app');
    
    // Crea placeholder files per inizializzare le cartelle
    await bucket.file(`brands/${brandId}/logos/.placeholder`).save('');
    await bucket.file(`brands/${brandId}/uploads/.placeholder`).save('');
    await bucket.file(`brands/${brandId}/thumbnails/.placeholder`).save('');
    
    console.log('✅ Cartelle Storage create');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RISULTATO FINALE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║        ✅ BRAND DI TEST CREATO CON SUCCESSO! 🎉              ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📋 DETTAGLI BRAND:\n');
    console.log(`   🆔 Brand ID:     ${brandId}`);
    console.log(`   📛 Nome:         ${brandData.name}`);
    console.log(`   🌐 Subdomain:    ${brandData.subdomain}`);
    console.log(`   ✅ Status:       ${brandData.status}`);
    console.log(`   🔑 User UID:     ${userRecord.uid}`);

    console.log('\n🔐 CREDENZIALI LOGIN:\n');
    console.log(`   📧 Email:        ${TEST_BRAND.email}`);
    console.log(`   🔑 Password:     ${SUPERUSER_PASSWORD}`);

    console.log('\n🌍 TEST URLS:\n');
    console.log(`   Produzione:      https://gallery-app-972f9.web.app/${TEST_BRAND.subdomain}/#/dashboard`);
    console.log(`   Locale:          http://test-demo.gallery.local:5173/${TEST_BRAND.subdomain}/#/dashboard`);
    console.log(`                    (aggiungi a /etc/hosts: 127.0.0.1 test-demo.gallery.local)`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🧪 TEST MANUALE:\n');
    console.log(`   1. Fai login su: https://gallery-app-972f9.web.app/${TEST_BRAND.subdomain}/#/dashboard`);
    console.log('   2. Email: test-demo@example.com');
    console.log('   3. Password: TestDemo2025!');
    console.log('   4. Crea un album di test');
    console.log('   5. Carica alcune foto');
    console.log('   6. Verifica thumbnail generation');
    console.log('   7. Testa la visualizzazione pubblica\n');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

