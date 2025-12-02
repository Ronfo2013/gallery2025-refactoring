/**
 * Script per creare un brand di test per localhost
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.VITE_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function createLocalhostBrand() {
  try {
    console.log('🔧 Creating localhost test brand...');
    
    const brandData = {
      name: 'Localhost Test Gallery',
      slug: 'localhost-test',
      subdomain: '127.0.0.1',
      customDomain: 'localhost',
      status: 'active',
      ownerEmail: 'test@localhost.com',
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
      },
      subscription: {
        stripeCustomerId: 'test-customer',
        status: 'active',
        currentPeriodEnd: admin.firestore.Timestamp.fromDate(
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year from now
        ),
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('brands').doc('localhost-test-brand').set(brandData);
    
    console.log('✅ Localhost brand created successfully!');
    console.log('📝 Brand ID: localhost-test-brand');
    console.log('🌐 Subdomain: 127.0.0.1');
    console.log('🌐 Custom Domain: localhost');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating localhost brand:', error);
    process.exit(1);
  }
}

createLocalhostBrand();

