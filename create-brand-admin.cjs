/**
 * Script per creare brand di test usando Firebase Admin SDK
 * 
 * NOTA: Richiede service account key da Firebase Console
 * 
 * Alternative più semplici:
 * 1. Crea manualmente da Firebase Console (più veloce)
 * 2. Usa Firestore Emulator per test locali
 */

const admin = require('firebase-admin');

// Inizializza Admin SDK con credenziali di default
// Usa GOOGLE_APPLICATION_CREDENTIALS env var oppure Firebase CLI login
try {
  admin.initializeApp({
    projectId: 'gallery-app-972f9',
  });
} catch (e) {
  // Se già inizializzato
}

const db = admin.firestore();

async function createTestBrand() {
  const brandId = 'test-brand-real';
  const domain = 'test.gallery.local';

  console.log(`🚀 Creazione brand per dominio: ${domain}...`);

  const brandData = {
    id: brandId,
    name: 'Real Test Gallery',
    subdomain: domain,
    ownerEmail: 'test@gallery.local',
    status: 'active',
    subscription: {
      status: 'active',
      stripeCustomerId: 'cus_test_123',
      currentPeriodEnd: admin.firestore.Timestamp.fromDate(
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      )
    },
    branding: {
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b',
      backgroundColor: '#ffffff',
      logo: 'https://placehold.co/200x200/10b981/ffffff?text=REAL'
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection('brands').doc(brandId).set(brandData);
    console.log('✅ Brand creato con successo!');
    console.log('-----------------------------------');
    console.log('Brand ID:', brandId);
    console.log('Domain:', domain);
    console.log('Color:', brandData.branding.primaryColor);
    console.log('-----------------------------------');
    console.log('');
    console.log('🧪 Prossimi step:');
    console.log('1. Aggiungi a /etc/hosts:');
    console.log('   sudo bash -c \'echo "127.0.0.1 test.gallery.local" >> /etc/hosts\'');
    console.log('');
    console.log('2. Apri nel browser:');
    console.log('   http://test.gallery.local:5173');
    process.exit(0);
  } catch (error) {
    console.error('❌ Errore:', error.message);
    console.log('');
    console.log('💡 Suggerimento:');
    console.log('Questo script richiede Firebase Admin SDK con permessi elevati.');
    console.log('');
    console.log('Opzioni:');
    console.log('1. Usa Firebase Console (più semplice): vedi CREATE_BRAND_MANUAL.md');
    console.log('2. Configura service account: firebase admin:serviceaccount');
    process.exit(1);
  }
}

createTestBrand();

