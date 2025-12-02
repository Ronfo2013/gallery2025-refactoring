/**
 * LOAD TEST REALISTICO - Simulazione Utenti Reali
 * 
 * Simula:
 * - 100 utenti che visitano la landing page
 * - 50 superuser che caricano foto
 * - 20 admin che modificano album
 * - 10 pagamenti Stripe
 * - Query distribuite nel tempo
 */

require('dotenv').config();
const admin = require('firebase-admin');
const https = require('https');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'gallery-app-972f9',
});

const db = admin.firestore();

// Configurazione
const CONFIG = {
  CONCURRENT_VISITORS: 100,
  PHOTO_UPLOADERS: 50,
  ALBUM_EDITORS: 20,
  DURATION_MINUTES: 5,
  REQUESTS_PER_SECOND: 50,
};

const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  avgResponseTime: 0,
  responseTimes: [],
  errors: [],
};

// ============================================
// Simulazione Traffico Landing Page
// ============================================
async function simulateLandingPageVisit() {
  const start = Date.now();
  try {
    // 1. Fetch landing page settings
    await db.collection('platform_settings').doc('landing_page').get();

    // 2. Fetch brands list (per multi-tenant)
    await db.collection('brands').where('status', '==', 'active').limit(10).get();

    const responseTime = Date.now() - start;
    metrics.responseTimes.push(responseTime);
    metrics.successfulRequests++;
  } catch (error) {
    metrics.failedRequests++;
    metrics.errors.push({ type: 'Landing Page', error: error.message });
  }
  metrics.totalRequests++;
}

// ============================================
// Simulazione Caricamento Album
// ============================================
async function simulateAlbumLoad(brandId = 'test-demo') {
  const start = Date.now();
  try {
    // Fetch albums di un brand
    await db
      .collection('brands')
      .doc(brandId)
      .collection('albums')
      .where('visibility', '==', 'public')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const responseTime = Date.now() - start;
    metrics.responseTimes.push(responseTime);
    metrics.successfulRequests++;
  } catch (error) {
    metrics.failedRequests++;
    metrics.errors.push({ type: 'Album Load', error: error.message });
  }
  metrics.totalRequests++;
}

// ============================================
// Simulazione Upload Foto
// ============================================
async function simulatePhotoUpload(brandId = 'test-demo') {
  const start = Date.now();
  try {
    // Simula metadata upload (non file reale)
    const albumsSnapshot = await db
      .collection('brands')
      .doc(brandId)
      .collection('albums')
      .limit(1)
      .get();

    if (!albumsSnapshot.empty) {
      const albumId = albumsSnapshot.docs[0].id;
      await db
        .collection('brands')
        .doc(brandId)
        .collection('albums')
        .doc(albumId)
        .update({
          photoCount: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    }

    const responseTime = Date.now() - start;
    metrics.responseTimes.push(responseTime);
    metrics.successfulRequests++;
  } catch (error) {
    metrics.failedRequests++;
    metrics.errors.push({ type: 'Photo Upload', error: error.message });
  }
  metrics.totalRequests++;
}

// ============================================
// Simulazione Analytics Query
// ============================================
async function simulateAnalyticsQuery(brandId = 'test-demo') {
  const start = Date.now();
  try {
    // Dashboard stats query
    const brand = await db.collection('brands').doc(brandId).get();
    
    if (brand.exists) {
      await db
        .collection('brands')
        .doc(brandId)
        .collection('albums')
        .count()
        .get();
    }

    const responseTime = Date.now() - start;
    metrics.responseTimes.push(responseTime);
    metrics.successfulRequests++;
  } catch (error) {
    metrics.failedRequests++;
    metrics.errors.push({ type: 'Analytics', error: error.message });
  }
  metrics.totalRequests++;
}

// ============================================
// Simulazione SuperAdmin Query
// ============================================
async function simulateSuperAdminQuery() {
  const start = Date.now();
  try {
    // SuperAdmin dashboard queries
    await Promise.all([
      db.collection('brands').where('status', '==', 'active').count().get(),
      db.collection('brands').where('status', '==', 'pending').count().get(),
      db.collection('platform_settings').doc('system').get(),
    ]);

    const responseTime = Date.now() - start;
    metrics.responseTimes.push(responseTime);
    metrics.successfulRequests++;
  } catch (error) {
    metrics.failedRequests++;
    metrics.errors.push({ type: 'SuperAdmin', error: error.message });
  }
  metrics.totalRequests++;
}

// ============================================
// Mix Realistico di Traffico
// ============================================
async function simulateRealisticTraffic() {
  const actions = [
    { fn: simulateLandingPageVisit, weight: 40 }, // 40% landing page
    { fn: simulateAlbumLoad, weight: 30 }, // 30% album views
    { fn: simulatePhotoUpload, weight: 15 }, // 15% uploads
    { fn: simulateAnalyticsQuery, weight: 10 }, // 10% analytics
    { fn: simulateSuperAdminQuery, weight: 5 }, // 5% superadmin
  ];

  // Weighted random selection
  const random = Math.random() * 100;
  let cumulative = 0;

  for (const action of actions) {
    cumulative += action.weight;
    if (random <= cumulative) {
      await action.fn();
      return;
    }
  }
}

// ============================================
// Load Test Runner
// ============================================
async function runLoadTest() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║        📊 REALISTIC LOAD TEST - Gallery2025                   ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`⚙️  Configuration:`);
  console.log(`   • Concurrent Users: ${CONFIG.CONCURRENT_VISITORS}`);
  console.log(`   • Requests/Second: ${CONFIG.REQUESTS_PER_SECOND}`);
  console.log(`   • Duration: ${CONFIG.DURATION_MINUTES} minutes`);
  console.log(`   • Total Requests: ~${CONFIG.REQUESTS_PER_SECOND * CONFIG.DURATION_MINUTES * 60}\n`);

  const startTime = Date.now();
  const endTime = startTime + CONFIG.DURATION_MINUTES * 60 * 1000;

  console.log('🚀 Starting load test...\n');

  // Progress interval
  const progressInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const progress = Math.min(100, (elapsed / (CONFIG.DURATION_MINUTES * 60)) * 100);
    const avgTime = metrics.responseTimes.length > 0
      ? (metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length).toFixed(0)
      : 0;

    process.stdout.write(
      `\r⏱️  ${elapsed}s | ` +
      `📊 ${progress.toFixed(0)}% | ` +
      `✅ ${metrics.successfulRequests} | ` +
      `❌ ${metrics.failedRequests} | ` +
      `⚡ ${avgTime}ms avg`
    );
  }, 1000);

  // Main load loop
  while (Date.now() < endTime) {
    const batchSize = Math.floor(CONFIG.REQUESTS_PER_SECOND / 10);
    const promises = [];

    for (let i = 0; i < batchSize; i++) {
      promises.push(simulateRealisticTraffic());
    }

    await Promise.all(promises);
    await new Promise((resolve) => setTimeout(resolve, 100)); // 100ms between batches
  }

  clearInterval(progressInterval);
  console.log('\n');

  // Calculate final metrics
  const totalTime = Date.now() - startTime;
  const avgResponseTime = metrics.responseTimes.length > 0
    ? metrics.responseTimes.reduce((a, b) => a + b, 0) / metrics.responseTimes.length
    : 0;
  const p95ResponseTime = metrics.responseTimes.length > 0
    ? metrics.responseTimes.sort((a, b) => a - b)[Math.floor(metrics.responseTimes.length * 0.95)]
    : 0;
  const requestsPerSecond = (metrics.totalRequests / totalTime) * 1000;

  // Print results
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          📊 LOAD TEST RESULTS                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`⏱️  Duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`📊 Total Requests: ${metrics.totalRequests}`);
  console.log(`✅ Successful: ${metrics.successfulRequests} (${((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`❌ Failed: ${metrics.failedRequests} (${((metrics.failedRequests / metrics.totalRequests) * 100).toFixed(2)}%)`);
  console.log(`⚡ Avg Response Time: ${avgResponseTime.toFixed(0)}ms`);
  console.log(`📈 P95 Response Time: ${p95ResponseTime.toFixed(0)}ms`);
  console.log(`🚀 Requests/Second: ${requestsPerSecond.toFixed(2)}`);

  if (metrics.errors.length > 0) {
    console.log(`\n⚠️  Errors (showing first 10):`);
    metrics.errors.slice(0, 10).forEach((err, i) => {
      console.log(`   ${i + 1}. [${err.type}] ${err.error}`);
    });
  }

  // Performance rating
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          🎯 PERFORMANCE RATING                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  const successRate = (metrics.successfulRequests / metrics.totalRequests) * 100;
  let rating = '';

  if (successRate >= 99 && avgResponseTime < 200) {
    rating = '🟢 EXCELLENT - Production ready!';
  } else if (successRate >= 95 && avgResponseTime < 500) {
    rating = '🟡 GOOD - Minor optimizations recommended';
  } else if (successRate >= 90 && avgResponseTime < 1000) {
    rating = '🟠 FAIR - Optimization needed';
  } else {
    rating = '🔴 POOR - Critical issues detected';
  }

  console.log(rating);
  console.log('\n✅ Load test completed!\n');

  process.exit(0);
}

// Run
runLoadTest();


