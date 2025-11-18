# Database Schema MVP - Firestore

## Struttura Collezioni

```
/brands/{brandId}
  ├── /albums/{albumId}
  └── /settings/{settingsId}

/superusers/{userId}
```

---

## Collezione: `/brands/{brandId}`

**Documento principale del brand**

```typescript
{
  id: string;                    // Auto-generated
  name: string;                  // "Foto Matrimoni Roma"
  slug: string;                  // "foto-matrimoni-roma" (unique, per subdomain)
  subdomain: string;             // "foto-matrimoni-roma.yourdomain.com"
  status: 'pending' | 'active' | 'suspended';
  
  subscription: {
    stripeCustomerId: string;    // "cus_123abc..."
    status: 'active' | 'canceled';
    currentPeriodEnd: timestamp; // Firestore Timestamp
  };
  
  branding: {
    logo?: string;               // URL logo (Storage)
    logoPath?: string;           // Path Storage per delete
    primaryColor: string;        // "#3b82f6"
    secondaryColor: string;      // "#8b5cf6"
    backgroundColor: string;     // "#ffffff"
  };
  
  ownerEmail: string;            // "owner@example.com"
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Esempio documento:

```json
{
  "id": "brand-1234567890",
  "name": "Foto Matrimoni Roma",
  "slug": "foto-matrimoni-roma",
  "subdomain": "foto-matrimoni-roma.mygallery.com",
  "status": "active",
  "subscription": {
    "stripeCustomerId": "cus_abc123def456",
    "status": "active",
    "currentPeriodEnd": "2025-02-18T10:00:00Z"
  },
  "branding": {
    "logo": "https://storage.googleapis.com/.../logo.png",
    "logoPath": "brands/brand-1234567890/logos/logo.png",
    "primaryColor": "#e91e63",
    "secondaryColor": "#9c27b0",
    "backgroundColor": "#ffffff"
  },
  "ownerEmail": "mario@fotomatrimoni.it",
  "createdAt": "2025-01-18T10:00:00Z",
  "updatedAt": "2025-01-18T10:00:00Z"
}
```

---

## Sotto-collezione: `/brands/{brandId}/albums/{albumId}`

**Albums del brand (struttura nested)**

```typescript
{
  id: string;
  title: string;
  coverPhotoUrl: string;
  photos: Photo[];              // Array di Photo objects
  createdAt: timestamp;
  updatedAt: timestamp;
}
```

### Photo Object (dentro array):

```typescript
{
  id: string;
  url: string;                  // Original
  optimizedUrl?: string;        // WebP optimized
  thumbUrl?: string;            // 200x200 thumbnail
  mediumUrl?: string;           // 800x800 thumbnail
  title: string;
  description: string;
  path?: string;                // Storage path
  needsWebPRetry?: boolean;
}
```

### Esempio documento album:

```json
{
  "id": "album-001",
  "title": "Matrimonio Sara & Luca - 15 Gennaio 2025",
  "coverPhotoUrl": "https://storage.googleapis.com/.../photo1_thumb_800.webp",
  "photos": [
    {
      "id": "photo-001",
      "url": "https://storage.googleapis.com/.../photo1.jpg",
      "optimizedUrl": "https://storage.googleapis.com/.../photo1_optimized.webp",
      "thumbUrl": "https://storage.googleapis.com/.../photo1_thumb_200.webp",
      "mediumUrl": "https://storage.googleapis.com/.../photo1_thumb_800.webp",
      "title": "Cerimonia Chiesa",
      "description": "",
      "path": "brands/brand-1234567890/uploads/photo1.jpg"
    }
  ],
  "createdAt": "2025-01-18T10:00:00Z",
  "updatedAt": "2025-01-18T11:30:00Z"
}
```

---

## Sotto-collezione: `/brands/{brandId}/settings/{settingsId}`

**Settings del sito (siteSettings)**

Document ID: `site`

```typescript
{
  appName: string;              // Nome brand (duplicato per comodità)
  logoUrl: string | null;
  logoPath?: string;
  footerText: string;
  navLinks: NavLink[];
}
```

### NavLink Object:

```typescript
{
  id: string;
  text: string;
  to: string;
}
```

### Esempio documento:

```json
{
  "appName": "Foto Matrimoni Roma",
  "logoUrl": "https://storage.googleapis.com/.../logo.png",
  "logoPath": "brands/brand-1234567890/logos/logo.png",
  "footerText": "© 2025 Foto Matrimoni Roma - P.IVA 12345678901",
  "navLinks": [
    {
      "id": "nav-1",
      "text": "Gallery",
      "to": "/"
    },
    {
      "id": "nav-2",
      "text": "Contatti",
      "to": "/contact"
    }
  ]
}
```

---

## Collezione: `/superusers/{userId}`

**Mapping User Auth → Brand**

```typescript
{
  id: string;                   // = Firebase Auth UID
  email: string;
  brandId: string;              // Reference al brand
  createdAt: timestamp;
}
```

### Esempio documento:

```json
{
  "id": "authUID123abc456def",
  "email": "mario@fotomatrimoni.it",
  "brandId": "brand-1234567890",
  "createdAt": "2025-01-18T10:00:00Z"
}
```

---

## Storage Structure

```
/brands/{brandId}/
  ├── /uploads/
  │   ├── photo1.jpg
  │   ├── photo1_optimized.webp
  │   ├── photo1_thumb_200.webp
  │   ├── photo1_thumb_800.webp
  │   └── photo2.jpg
  │
  └── /logos/
      └── logo.png
```

---

## Query Patterns

### 1. Trova brand da subdomain

```javascript
const brandsRef = collection(db, 'brands');
const q = query(
  brandsRef, 
  where('subdomain', '==', 'foto-matrimoni-roma.mygallery.com'),
  where('status', '==', 'active')
);
const snapshot = await getDocs(q);
```

### 2. Trova brand di un superuser

```javascript
const superuserDoc = await getDoc(doc(db, 'superusers', userId));
const brandId = superuserDoc.data().brandId;
const brandDoc = await getDoc(doc(db, 'brands', brandId));
```

### 3. Lista albums di un brand

```javascript
const albumsRef = collection(db, 'brands', brandId, 'albums');
const snapshot = await getDocs(albumsRef);
```

### 4. Update branding

```javascript
const brandRef = doc(db, 'brands', brandId);
await updateDoc(brandRef, {
  'branding.primaryColor': '#ff0000',
  updatedAt: serverTimestamp()
});
```

---

## Indici Necessari (Firestore Indexes)

```json
{
  "indexes": [
    {
      "collectionGroup": "brands",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "subdomain", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "brands",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "slug", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Firestore creerà automaticamente questi indici al primo utilizzo.

---

## Migrazione da Sistema Attuale

Il sistema attuale usa:
- `/gallery/{documentId}` - contiene array di albums

Migrazione:
1. Leggi `/gallery/albums-config`
2. Per ogni album, crea documento in `/brands/brand-default/albums/{albumId}`
3. Sposta files Storage da `/uploads/` a `/brands/brand-default/uploads/`

Script migrazione: vedi `scripts/migrate-to-multibrand.ts`

