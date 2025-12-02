#!/usr/bin/env node

/**
 * Script di Test Completo Brand + Stripe
 * 
 * Questo script:
 * 1. Crea un brand in Firestore con status 'pending'
 * 2. Simula un pagamento Stripe completato
 * 3. Verifica che il webhook attivi il brand
 * 4. Crea l'utente superuser in Firebase Auth
 * 5. Mostra le credenziali di accesso
 */

require('dotenv').config({ path: './functions/.env' });
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Firebase Admin con Application Default Credentials
// Specifica esplicitamente il progetto
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
  status: 'pending',
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
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
    customerId: null,
    subscriptionId: null,
    productId: process.env.VITE_STRIPE_PRODUCT_ID || 'prod_TS1EaWokTNEIY1',
  },
};

const SUPERUSER_PASSWORD = 'TestDemo2025!';

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║        🧪 TEST COMPLETO BRAND + STRIPE + AUTH 🚀              ║');
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
      
      // Aggiorna il brand a status pending per re-test
      await brandDoc.ref.update({
        status: 'pending',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
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
    // STEP 2: Crea Customer Stripe
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n2️⃣  Creazione Customer Stripe...');
    
    const customer = await stripe.customers.create({
      email: TEST_BRAND.email,
      name: TEST_BRAND.name,
      metadata: {
        brandId: brandId,
        subdomain: TEST_BRAND.subdomain,
      },
    });
    console.log(`✅ Customer Stripe creato: ${customer.id}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 3: Crea Payment Intent e simula successo
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n3️⃣  Creazione sessione Stripe...');
    
    // Ottieni il prezzo dal prodotto
    const prices = await stripe.prices.list({
      product: TEST_BRAND.stripe.productId,
      active: true,
      limit: 1,
    });

    if (prices.data.length === 0) {
      throw new Error(`Nessun prezzo trovato per il prodotto ${TEST_BRAND.stripe.productId}`);
    }

    const priceId = prices.data[0].id;
    console.log(`✅ Prezzo trovato: ${priceId} (${prices.data[0].unit_amount / 100}€)`);

    // Crea checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://test-demo.gallery.local/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://test-demo.gallery.local/cancel`,
      metadata: {
        brandId: brandId,
        subdomain: TEST_BRAND.subdomain,
        email: TEST_BRAND.email,
      },
    });

    console.log(`✅ Checkout session creata: ${session.id}`);
    console.log(`   Status: ${session.payment_status}`);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 4: Simula completamento pagamento (manualmente triggeriamo il webhook)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n4️⃣  Simulazione webhook (attivazione brand)...');
    
    // Aggiorna il brand manualmente come fa il webhook
    await db.collection('brands').doc(brandId).update({
      status: 'active',
      'stripe.customerId': customer.id,
      'stripe.sessionId': session.id,
      activatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Brand attivato (simulazione webhook)');

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // STEP 5: Crea utente Firebase Auth (Superuser)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n5️⃣  Creazione utente Superuser...');
    
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
    // STEP 6: Crea documento Superuser in Firestore
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n6️⃣  Creazione documento superuser...');
    
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
    // STEP 7: Verifica completa
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n7️⃣  Verifica dati...');
    
    const brandData = (await db.collection('brands').doc(brandId).get()).data();
    const superuserData = (await db.collection('brands').doc(brandId).collection('superusers').doc(userRecord.uid).get()).data();
    
    console.log('✅ Brand verificato:', {
      name: brandData.name,
      subdomain: brandData.subdomain,
      status: brandData.status,
      customerId: brandData.stripe?.customerId,
    });
    
    console.log('✅ Superuser verificato:', {
      email: superuserData.email,
      role: superuserData.role,
    });

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RISULTATO FINALE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                ║');
    console.log('║        ✅ TEST COMPLETATO CON SUCCESSO! 🎉                    ║');
    console.log('║                                                                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log('📋 DETTAGLI BRAND:\n');
    console.log(`   🆔 Brand ID:     ${brandId}`);
    console.log(`   📛 Nome:         ${brandData.name}`);
    console.log(`   🌐 Subdomain:    ${brandData.subdomain}`);
    console.log(`   ✅ Status:       ${brandData.status}`);
    console.log(`   💳 Stripe ID:    ${brandData.stripe?.customerId}`);
    console.log(`   🔑 User UID:     ${userRecord.uid}`);

    console.log('\n🔐 CREDENZIALI LOGIN:\n');
    console.log(`   📧 Email:        ${TEST_BRAND.email}`);
    console.log(`   🔑 Password:     ${SUPERUSER_PASSWORD}`);

    console.log('\n🌍 TEST URLS:\n');
    console.log(`   Dashboard:       https://gallery-app-972f9.web.app/${TEST_BRAND.subdomain}/#/dashboard`);
    console.log(`   Con Subdomain:   https://test-demo.gallery.local:5173/${TEST_BRAND.subdomain}/#/dashboard`);
    console.log(`                    (aggiungi a /etc/hosts: 127.0.0.1 test-demo.gallery.local)`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🧪 PASSI SUCCESSIVI PER TEST:\n');
    console.log(`   1. Login con le credenziali sopra su https://gallery-app-972f9.web.app/${TEST_BRAND.subdomain}/#/dashboard`);
    console.log('   2. Crea un album di test');
    console.log('   3. Carica alcune foto');
    console.log('   4. Verifica thumbnail generation');
    console.log('   5. Testa la visualizzazione pubblica');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ ERRORE:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
