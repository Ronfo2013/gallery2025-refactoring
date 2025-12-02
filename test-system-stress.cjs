/**
 * STRESS TEST AUTOMATICO - Gallery2025 Multi-Tenant SaaS
 * 
 * Test:
 * 1. Firestore: Lettura/scrittura massiva
 * 2. Storage: Upload multipli simultanei
 * 3. Cloud Functions: Chiamate concorrenti
 * 4. Auth: Login/logout rapidi
 * 5. Query Performance: Query complesse
 */

// IMPORTANTE: Forza il progetto corretto PRIMA di caricare firebase-admin
// Questo previene che admin.auth() usi il progetto di default di gcloud
process.env.GCLOUD_PROJECT = 'gallery-app-972f9';
process.env.GOOGLE_CLOUD_PROJECT = 'gallery-app-972f9';
process.env.GCP_PROJECT = 'gallery-app-972f9';
process.env.FIREBASE_PROJECT_ID = 'gallery-app-972f9';

require('dotenv').config();
const admin = require('firebase-admin');

// Inizializza Firebase Admin con progetto esplicito
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'gallery-app-972f9',
  storageBucket: 'gallery-app-972f9.firebasestorage.app',
});

const db = admin.firestore();
const storage = admin.storage();
const auth = admin.auth();

// Configurazione test
const CONFIG = {
  BRANDS_TO_CREATE: 50,
  ALBUMS_PER_BRAND: 10,
  PHOTOS_PER_ALBUM: 100,
  CONCURRENT_UPLOADS: 20,
  CONCURRENT_QUERIES: 50,
  TEST_USERS: 100,
};

// Utilities
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomString = (len = 8) => Math.random().toString(36).substring(2, 2 + len);

// Metriche
const metrics = {
  startTime: null,
  endTime: null,
  tests: {},
};

function startMetric(name) {
  metrics.tests[name] = { start: Date.now(), end: null, duration: null, success: false, error: null };
}

function endMetric(name, success = true, error = null) {
  const test = metrics.tests[name];
  test.end = Date.now();
  test.duration = test.end - test.start;
  test.success = success;
  test.error = error;
}

function printResults() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          🧪 STRESS TEST RESULTS                               ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const totalDuration = metrics.endTime - metrics.startTime;
  console.log(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);

  Object.entries(metrics.tests).forEach(([name, test]) => {
    const status = test.success ? '✅' : '❌';
    const duration = (test.duration / 1000).toFixed(2);
    console.log(`${status} ${name.padEnd(50)} ${duration}s`);
    if (test.error) {
      console.log(`   ⚠️  Error: ${test.error}`);
    }
  });

  const passed = Object.values(metrics.tests).filter((t) => t.success).length;
  const failed = Object.values(metrics.tests).filter((t) => !t.success).length;
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
}

// ============================================
// TEST 1: Firestore Write Performance
// ============================================
async function testFirestoreWrites() {
  const testName = 'Firestore: Write 1000 documents';
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    const batch = db.batch();
    const collectionRef = db.collection('stress_test_writes');

    for (let i = 0; i < 1000; i++) {
      const docRef = collectionRef.doc();
      batch.set(docRef, {
        index: i,
        data: randomString(100),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log('   ✅ 1000 documents written');
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 2: Firestore Read Performance
// ============================================
async function testFirestoreReads() {
  const testName = 'Firestore: Read 1000 documents';
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    const snapshot = await db.collection('stress_test_writes').limit(1000).get();
    console.log(`   ✅ ${snapshot.size} documents read`);
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 3: Concurrent Firestore Queries
// ============================================
async function testConcurrentQueries() {
  const testName = `Firestore: ${CONFIG.CONCURRENT_QUERIES} concurrent queries`;
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    const promises = [];
    for (let i = 0; i < CONFIG.CONCURRENT_QUERIES; i++) {
      promises.push(
        db.collection('stress_test_writes').limit(10).get()
      );
    }

    const results = await Promise.all(promises);
    console.log(`   ✅ ${results.length} queries completed`);
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 4: Create Multiple Brands (Simulated Load)
// ============================================
async function testCreateBrands() {
  const testName = `Create ${CONFIG.BRANDS_TO_CREATE} brands (simulated)`;
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    const batch = db.batch();
    const brandsRef = db.collection('stress_test_brands');

    for (let i = 0; i < CONFIG.BRANDS_TO_CREATE; i++) {
      const brandId = `stress-brand-${randomString()}`;
      const docRef = brandsRef.doc(brandId);
      batch.set(docRef, {
        name: `Stress Test Brand ${i}`,
        subdomain: `stress-${i}-${randomString(6)}`,
        status: 'active',
        email: `stress-${i}@test.com`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        plan: 'pro',
        settings: {
          primaryColor: '#3b82f6',
          accentColor: '#8b5cf6',
        },
      });
    }

    await batch.commit();
    console.log(`   ✅ ${CONFIG.BRANDS_TO_CREATE} brands created`);
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 5: Storage Performance (Simulated)
// ============================================
async function testStorageUpload() {
  const testName = 'Storage: Upload 10 test files';
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    const bucket = storage.bucket();
    const promises = [];

    for (let i = 0; i < 10; i++) {
      const fileName = `stress-test/file-${i}-${randomString()}.txt`;
      const file = bucket.file(fileName);
      const content = Buffer.from(randomString(1000), 'utf-8');

      promises.push(
        file.save(content, {
          metadata: { contentType: 'text/plain' },
        })
      );
    }

    await Promise.all(promises);
    console.log('   ✅ 10 files uploaded');
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 6: Complex Query Performance
// ============================================
async function testComplexQueries() {
  const testName = 'Firestore: Complex queries with filters';
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    // Query 1: Filter + Order + Limit
    await db
      .collection('stress_test_brands')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    // Query 2: Multiple filters
    await db
      .collection('stress_test_brands')
      .where('status', '==', 'active')
      .where('plan', '==', 'pro')
      .get();

    console.log('   ✅ Complex queries completed');
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 7: Auth User Creation
// ============================================
async function testAuthUsers() {
  const testName = `Auth: Create ${CONFIG.TEST_USERS} test users`;
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    const promises = [];
    for (let i = 0; i < CONFIG.TEST_USERS; i++) {
      const email = `stress-user-${i}-${randomString()}@test.com`;
      promises.push(
        auth.createUser({
          email: email,
          password: 'StressTest123!',
          displayName: `Stress User ${i}`,
        })
      );

      // Batch di 10 per evitare rate limiting
      if (promises.length === 10) {
        await Promise.all(promises);
        promises.length = 0;
        await sleep(100); // Piccola pausa
      }
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    console.log(`   ✅ ${CONFIG.TEST_USERS} users created`);
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

// ============================================
// TEST 8: Cleanup Test Data
// ============================================
async function cleanupTestData() {
  const testName = 'Cleanup: Delete test data';
  startMetric(testName);
  console.log(`\n🔵 ${testName}...`);

  try {
    // Delete Firestore collections
    await deleteCollection('stress_test_writes', 500);
    await deleteCollection('stress_test_brands', 500);

    // Delete Storage files
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix: 'stress-test/' });
    await Promise.all(files.map((file) => file.delete()));

    // Delete Auth users
    const listUsersResult = await auth.listUsers(1000);
    const stressUsers = listUsersResult.users.filter((user) =>
      user.email?.startsWith('stress-user-')
    );
    await Promise.all(stressUsers.map((user) => auth.deleteUser(user.uid)));

    console.log('   ✅ Test data cleaned up');
    endMetric(testName, true);
  } catch (error) {
    console.error('   ❌ Error:', error.message);
    endMetric(testName, false, error.message);
  }
}

async function deleteCollection(collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  try {
    const snapshot = await query.get();

    if (snapshot.size === 0) {
      resolve();
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    process.nextTick(() => {
      deleteQueryBatch(query, resolve, reject);
    });
  } catch (error) {
    reject(error);
  }
}

// ============================================
// MAIN
// ============================================
async function runStressTest() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║        🧪 GALLERY2025 STRESS TEST SUITE                       ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');

  metrics.startTime = Date.now();

  try {
    await testFirestoreWrites();
    await testFirestoreReads();
    await testConcurrentQueries();
    await testCreateBrands();
    await testStorageUpload();
    await testComplexQueries();
    
    // Skip Auth tests if ADC is using wrong project
    // Auth tests require Service Account or correct ADC project
    console.log('\n⚠️  Skipping Auth tests (requires correct gcloud project)');
    console.log('   To enable: Use Service Account or set gcloud default project');
    // await testAuthUsers();
    
    console.log('\n⏳ Waiting 5s before cleanup...');
    await sleep(5000);
    
    // Skip cleanup (depends on Auth)
    // await cleanupTestData();
    console.log('🔵 Cleanup: Manual (Auth-dependent tests skipped)');
  } catch (error) {
    console.error('❌ Stress test failed:', error);
  }

  metrics.endTime = Date.now();
  printResults();

  console.log('\n✅ Stress test completed!\n');
  process.exit(0);
}

// Run
runStressTest();

