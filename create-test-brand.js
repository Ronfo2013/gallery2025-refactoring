import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createTestBrand() {
  const brandId = 'test-brand-real';
  const domain = 'test.gallery.local';

  console.log(`Creating test brand for domain: ${domain}...`);

  const brandData = {
    id: brandId,
    name: 'Real Test Gallery',
    subdomain: domain, // Match the hosts entry
    ownerEmail: 'test@gallery.local',
    status: 'active',
    subscription: {
      status: 'active',
      stripeCustomerId: 'cus_test_123',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
    branding: {
      primaryColor: '#10b981', // Emerald green to distinguish from mock
      secondaryColor: '#f59e0b', // Amber
      backgroundColor: '#ffffff',
      logo: 'https://placehold.co/200x200/10b981/ffffff?text=REAL',
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(doc(db, 'brands', brandId), brandData);
    console.log('✅ Test brand created successfully!');
    console.log('-----------------------------------');
    console.log('Brand ID:', brandId);
    console.log('Domain:', domain);
    console.log('Color:', brandData.branding.primaryColor);
    console.log('-----------------------------------');
    console.log('Now you can access: http://test.gallery.local:5173');
  } catch (error) {
    console.error('❌ Error creating brand:', error);
  }
}

createTestBrand();
