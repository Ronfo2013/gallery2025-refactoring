# 🧪 STRESS TEST GUIDE - Gallery2025

Guida completa per testare il sistema sotto carico e identificare bottleneck.

---

## 📋 INDICE

1. [Test Automatici (CLI)](#1-test-automatici-cli)
2. [Test Manuali (Browser)](#2-test-manuali-browser)
3. [Load Testing (Artillery)](#3-load-testing-artillery)
4. [Monitoring & Metriche](#4-monitoring--metriche)
5. [Scenari di Stress](#5-scenari-di-stress)

---

## 1️⃣ TEST AUTOMATICI (CLI)

### Setup

```bash
# Installa dipendenze
npm install firebase-admin dotenv

# Autentica gcloud (se necessario)
gcloud auth application-default login
```

### Test Suite Completo

```bash
# Stress test completo (8 test automatici)
node test-system-stress.cjs
```

**Test Eseguiti:**

- ✅ Firestore Write (1000 docs)
- ✅ Firestore Read (1000 docs)
- ✅ Concurrent Queries (50 simultanee)
- ✅ Create Brands (50 brands simulati)
- ✅ Storage Upload (10 files)
- ✅ Complex Queries (filters + order)
- ✅ Auth Users (100 users)
- ✅ Cleanup (auto-cleanup test data)

**Target Performance:**
| Test | Target | Good | Excellent |
|------|--------|------|-----------|
| Firestore Write | < 5s | < 3s | < 1s |
| Firestore Read | < 3s | < 2s | < 0.5s |
| Concurrent Queries | < 10s | < 5s | < 2s |
| Storage Upload | < 8s | < 5s | < 3s |

### Load Test Realistico

```bash
# Test di carico (5 minuti)
node test-load-realistic.cjs
```

**Configurazione:**

- 100 utenti concorrenti
- 50 requests/secondo
- 5 minuti di durata
- Mix realistico: 40% landing, 30% albums, 15% uploads, 10% analytics, 5% admin

**Target Metriche:**

- Success Rate: > 99%
- Avg Response Time: < 200ms
- P95 Response Time: < 500ms
- Requests/Second: > 40

---

## 2️⃣ TEST MANUALI (BROWSER)

### Scenario 1: Landing Page Stress

**Obiettivo:** Testare caricamento landing page sotto carico

```bash
# Step 1: Apri DevTools (F12)
# Step 2: Network tab → Throttling: Fast 3G
# Step 3: Apri 10 tab con landing page
for i in {1..10}; do
  open -na "Google Chrome" --args "https://gallery-app-972f9.web.app/"
done

# Step 4: Verifica metriche
# - Time to First Byte (TTFB): < 500ms
# - First Contentful Paint (FCP): < 1.5s
# - Largest Contentful Paint (LCP): < 2.5s
# - Cumulative Layout Shift (CLS): < 0.1
```

### Scenario 2: Dashboard Heavy Load

**Obiettivo:** Testare dashboard con tanti album e foto

```bash
# Step 1: Login come superuser
# https://gallery-app-972f9.web.app/#/dashboard
# Email: test-demo@example.com
# Password: TestDemo2025!

# Step 2: Crea 50 album (script di creazione)
# Step 3: Carica 20 foto per album (1000 foto totali)
# Step 4: Verifica:
#   - Rendering time < 3s
#   - Scroll smooth (60fps)
#   - Memory usage < 500MB
```

**Chrome DevTools:**

```
1. Performance Tab → Record
2. Naviga dashboard, apri album, scroll
3. Stop recording
4. Analizza:
   - FPS: > 60
   - Heap size: < 500MB
   - Long tasks: < 50ms
```

### Scenario 3: Upload Simultanei

**Obiettivo:** Testare upload multipli concorrenti

```bash
# Step 1: Apri album
# Step 2: Seleziona 50 foto (shift+click)
# Step 3: Upload all
# Step 4: Verifica:
#   - Progress bar smooth
#   - No memory leak
#   - Thumbnails generati correttamente
```

### Scenario 4: Multi-Tab Stress

**Obiettivo:** Testare comportamento con molte tab aperte

```bash
# Apri 20 tab diverse:
# - 10x Landing page
# - 5x Album view
# - 3x Dashboard
# - 2x SuperAdmin

# Verifica:
# - No crash
# - Memory < 1GB total
# - Firestore listeners non duplicati
```

---

## 3️⃣ LOAD TESTING (ARTILLERY)

### Setup Artillery

```bash
npm install -g artillery
```

### Test HTTP Load

Crea `artillery-config.yml`:

```yaml
config:
  target: 'https://gallery-app-972f9.web.app'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 300
      arrivalRate: 50
      name: 'Sustained load'
    - duration: 60
      arrivalRate: 100
      name: 'Peak load'
  plugins:
    expect: {}
  processor: './artillery-functions.js'

scenarios:
  - name: 'Landing Page Load'
    weight: 40
    flow:
      - get:
          url: '/'
          expect:
            - statusCode: 200
            - contentType: text/html

  - name: 'Album View'
    weight: 30
    flow:
      - get:
          url: '/#/album/test-album'
          expect:
            - statusCode: 200

  - name: 'SuperAdmin'
    weight: 5
    flow:
      - get:
          url: '/#/superadmin'
          expect:
            - statusCode: 200
```

### Esegui Test

```bash
# Test load
artillery run artillery-config.yml

# Test con report
artillery run --output report.json artillery-config.yml
artillery report report.json
```

**Target Metriche Artillery:**

- HTTP 200: > 99%
- Median response time: < 200ms
- P95 response time: < 500ms
- P99 response time: < 1000ms
- Errors: < 0.1%

---

## 4️⃣ MONITORING & METRICHE

### Firebase Console

```
https://console.firebase.google.com/project/gallery-app-972f9
```

**Metriche da monitorare:**

#### Firestore

- Reads/sec: < 10,000/sec (quota)
- Writes/sec: < 10,000/sec (quota)
- Delete/sec: < 10,000/sec (quota)
- Document reads: costo €0.036 per 100K
- Document writes: costo €0.108 per 100K

#### Storage

- Bandwidth: < 1GB/day (free tier)
- Storage used: < 5GB (free tier)
- Operations: < 50K/day (free tier)

#### Cloud Functions

- Invocations: < 2M/month (free tier)
- GB-seconds: < 400K/month
- CPU-seconds: < 200K/month
- Outbound networking: < 5GB/month

#### Authentication

- Daily active users (DAU): monitor
- Monthly active users (MAU): monitor
- Sign-ins/day: < 10K (stima)

### Google Cloud Console

```
https://console.cloud.google.com/monitoring?project=gallery-app-972f9
```

**Dashboard Custom:**

```bash
# Crea dashboard personalizzato con:
# - Cloud Functions latency
# - Firestore read/write rate
# - Storage bandwidth
# - Error rate
# - CPU/Memory usage
```

### Firebase Performance Monitoring

```typescript
// Già integrato in firebaseConfig.ts
import { getPerformance } from 'firebase/performance';

const perf = getPerformance(app);

// Metriche automatiche:
// - Page load time
// - Network requests
// - Custom traces
```

**Visualizza:**

```
https://console.firebase.google.com/project/gallery-app-972f9/performance
```

---

## 5️⃣ SCENARI DI STRESS

### Scenario A: "Black Friday" (Traffic Spike)

**Obiettivo:** 1000 utenti simultanei, 500 req/sec

```bash
# Artillery config (spike)
config:
  target: "https://gallery-app-972f9.web.app"
  phases:
    - duration: 10
      arrivalRate: 10
    - duration: 60
      arrivalRate: 500  # SPIKE!
    - duration: 10
      arrivalRate: 10
```

**Aspettative:**

- ✅ No downtime
- ✅ Latency < 1s anche sotto spike
- ✅ Auto-scaling Cloud Functions
- ⚠️ Possibile rate limiting Firestore

### Scenario B: "Database Bomb" (Heavy Queries)

**Obiettivo:** Query complesse simultanee

```javascript
// Esegui 100 query complesse contemporaneamente
const queries = [];
for (let i = 0; i < 100; i++) {
  queries.push(
    db
      .collection('brands')
      .where('status', '==', 'active')
      .where('plan', '==', 'pro')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
  );
}

await Promise.all(queries);
// Target: < 5s totale
```

### Scenario C: "Storage Tsunami" (Mass Upload)

**Obiettivo:** 100 upload simultanei (100MB ciascuno)

```bash
# Simula con curl
for i in {1..100}; do
  curl -X POST \
    -H "Authorization: Bearer $TOKEN" \
    -F "file=@test-photo-100mb.jpg" \
    "https://storage.googleapis.com/upload/storage/v1/b/gallery-app-972f9.firebasestorage.app/o?uploadType=media&name=stress-test%2Fphoto-$i.jpg" &
done
wait

# Aspettative:
# - Tutti completati entro 5 minuti
# - Thumbnails generati automaticamente
# - No crash Cloud Functions
```

### Scenario D: "Memory Leak Hunt" (Long Session)

**Obiettivo:** Sessione browser di 2 ore

```bash
# Step 1: Apri Chrome DevTools → Memory
# Step 2: Take heap snapshot (baseline)
# Step 3: Usa app per 2 ore (navigazione continua)
# Step 4: Take heap snapshot (final)
# Step 5: Compare snapshots

# Aspettative:
# - Memory growth < 50MB
# - No detached DOM nodes
# - Listeners cleaned up correctly
```

---

## 📊 CHECKLIST COMPLETO

### Pre-Deploy Stress Test

- [ ] Test automatici (CLI) passed
- [ ] Load test realistico passed
- [ ] Landing page < 2s load time
- [ ] Dashboard rendering < 3s
- [ ] Upload 50 foto < 5min
- [ ] Multi-tab (20 tab) no crash
- [ ] Artillery load test passed
- [ ] Memory leak check passed
- [ ] Firestore quota check < 50%
- [ ] Storage quota check < 50%
- [ ] Cloud Functions quota check < 50%
- [ ] Error rate < 0.1%
- [ ] P95 response time < 500ms

### Monitoring Post-Deploy

- [ ] Firebase Performance attivo
- [ ] Google Cloud Monitoring configurato
- [ ] Alerts per errori critici
- [ ] Budget alerts Firebase/GCP
- [ ] Error tracking (Sentry/Bugsnag)
- [ ] Analytics dashboard creato
- [ ] Uptime monitoring (UptimeRobot)

---

## 🚨 TROUBLESHOOTING

### Problema: Firestore "quota exceeded"

**Soluzione:**

```bash
# 1. Controlla quota usage
gcloud alpha firestore operations list --project=gallery-app-972f9

# 2. Abilita billing se necessario
# 3. Ottimizza query (usa indexes)
# 4. Implementa caching client-side
```

### Problema: Cloud Functions timeout

**Soluzione:**

```typescript
// Aumenta timeout in firebase.json
{
  "functions": {
    "timeoutSeconds": 540,  // Max per Gen2
    "memory": "2GB"
  }
}
```

### Problema: Storage bandwidth exceeded

**Soluzione:**

```bash
# 1. Abilita CDN
gsutil cors set cors.json gs://gallery-app-972f9.firebasestorage.app

# 2. Usa Cloud CDN
gcloud compute backend-buckets create gallery-backend \
  --gcs-bucket-name=gallery-app-972f9.firebasestorage.app \
  --enable-cdn

# 3. Ottimizza immagini (WebP, thumbnails)
```

---

## 🎯 TARGET FINALE

### Performance Targets

| Metric            | Target   | Critical |
| ----------------- | -------- | -------- |
| Success Rate      | > 99%    | > 95%    |
| Avg Response Time | < 200ms  | < 500ms  |
| P95 Response Time | < 500ms  | < 1000ms |
| P99 Response Time | < 1000ms | < 2000ms |
| Error Rate        | < 0.1%   | < 1%     |
| Uptime            | > 99.9%  | > 99%    |

### Scalability Targets

| Resource         | Free Tier | Production |
| ---------------- | --------- | ---------- |
| Concurrent Users | 100       | 1,000      |
| Requests/Second  | 50        | 500        |
| Storage          | 5GB       | 50GB       |
| Bandwidth        | 1GB/day   | 10GB/day   |
| Firestore Reads  | 50K/day   | 500K/day   |
| Firestore Writes | 20K/day   | 200K/day   |

---

## 📚 RISORSE

- [Firebase Performance Best Practices](https://firebase.google.com/docs/perf-mon/get-started-web)
- [Firestore Query Optimization](https://firebase.google.com/docs/firestore/query-data/queries)
- [Cloud Functions Performance](https://cloud.google.com/functions/docs/bestpractices/tips)
- [Artillery Load Testing](https://www.artillery.io/docs/guides/overview/welcome)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

---

**Creato:** 21/11/2025  
**Ultima modifica:** 21/11/2025  
**Versione:** 1.0
