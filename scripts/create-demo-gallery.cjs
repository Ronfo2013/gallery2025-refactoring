/**
 * Create Demo Gallery - Gallery2025
 * 
 * Crea un brand demo con album e foto per permettere
 * ai visitatori di esplorare il prodotto
 */

// Forza progetto corretto
process.env.GCLOUD_PROJECT = 'gallery-app-972f9';
process.env.GOOGLE_CLOUD_PROJECT = 'gallery-app-972f9';
process.env.GCP_PROJECT = 'gallery-app-972f9';

require('dotenv').config();
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'gallery-app-972f9',
  storageBucket: 'gallery-app-972f9.firebasestorage.app',
});

const db = admin.firestore();

// Demo Brand Data
const demoBrand = {
  name: 'Demo Gallery - Photo Showcase',
  subdomain: 'demo',
  customDomain: null,
  status: 'active',
  plan: 'pro',
  email: 'demo@gallery.local',
  settings: {
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    secondaryColor: '#10b981',
    logo: null,
    googleAnalyticsId: '',
    metaPixelId: '',
    seo: {
      metaTitle: 'Demo Gallery - Explore Our Photo Gallery Platform',
      metaDescription: 'Interactive demo showcasing our professional photo gallery platform. Explore albums, view photos, and experience all features before creating your own gallery.',
      metaKeywords: 'photo gallery demo, portfolio demo, photography showcase',
    },
  },
  isDemo: true,
  createdAt: admin.firestore.FieldValue.serverTimestamp(),
  updatedAt: admin.firestore.FieldValue.serverTimestamp(),
};

// Demo Albums with Unsplash photos
const demoAlbums = [
  {
    id: 'wedding-photography',
    name: '💒 Wedding Photography',
    description: 'Beautiful moments captured forever - A collection of romantic wedding photos',
    visibility: 'public',
    order: 1,
    photos: [
      { url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop', title: 'Bride & Groom Outdoor' },
      { url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=1200&auto=format&fit=crop', title: 'Wedding Ceremony' },
      { url: 'https://images.unsplash.com/photo-1525258170-0ae3a0259e4f?w=1200&auto=format&fit=crop', title: 'Wedding Rings' },
      { url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1200&auto=format&fit=crop', title: 'Bride Portrait' },
      { url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1200&auto=format&fit=crop', title: 'Wedding Venue' },
      { url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1200&auto=format&fit=crop', title: 'First Dance' },
      { url: 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=1200&auto=format&fit=crop', title: 'Wedding Reception' },
      { url: 'https://images.unsplash.com/photo-1529636798458-92182e662485?w=1200&auto=format&fit=crop', title: 'Bride Getting Ready' },
    ],
  },
  {
    id: 'urban-landscapes',
    name: '🌆 Urban Landscapes',
    description: 'City lights and modern architecture - Stunning urban photography',
    visibility: 'public',
    order: 2,
    photos: [
      { url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&auto=format&fit=crop', title: 'City Skyline Night' },
      { url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&auto=format&fit=crop', title: 'Modern Architecture' },
      { url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&auto=format&fit=crop', title: 'City Lights' },
      { url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=1200&auto=format&fit=crop', title: 'Urban Street' },
      { url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=1200&auto=format&fit=crop', title: 'Skyscrapers' },
      { url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&auto=format&fit=crop', title: 'Building Facade' },
      { url: 'https://images.unsplash.com/photo-1478860409698-8707f313ee8b?w=1200&auto=format&fit=crop', title: 'City from Above' },
    ],
  },
  {
    id: 'nature-wildlife',
    name: '🏔️ Nature & Wildlife',
    description: 'Natural beauty and wildlife moments - Breathtaking nature photography',
    visibility: 'public',
    order: 3,
    photos: [
      { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&auto=format&fit=crop', title: 'Mountain Landscape' },
      { url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=1200&auto=format&fit=crop', title: 'Forest Wildlife' },
      { url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&auto=format&fit=crop', title: 'Forest Path' },
      { url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop', title: 'Lake Reflection' },
      { url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=1200&auto=format&fit=crop', title: 'Mountain Peak' },
      { url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&auto=format&fit=crop', title: 'Sunset Landscape' },
    ],
  },
  {
    id: 'creative-portraits',
    name: '🎨 Creative Portraits',
    description: 'Artistic portrait photography - Stunning people photography',
    visibility: 'public',
    order: 4,
    photos: [
      { url: 'https://images.unsplash.com/photo-1502982899975-c0eecd3f3f71?w=1200&auto=format&fit=crop', title: 'Fashion Portrait' },
      { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&auto=format&fit=crop', title: 'Male Portrait' },
      { url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1200&auto=format&fit=crop', title: 'Female Portrait' },
      { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200&auto=format&fit=crop', title: 'Studio Portrait' },
      { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&auto=format&fit=crop', title: 'Creative Portrait' },
      { url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200&auto=format&fit=crop', title: 'Outdoor Portrait' },
    ],
  },
  {
    id: 'food-photography',
    name: '🍽️ Food Photography',
    description: 'Delicious food styling - Professional food photography',
    visibility: 'public',
    order: 5,
    photos: [
      { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&auto=format&fit=crop', title: 'Gourmet Dish' },
      { url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=1200&auto=format&fit=crop', title: 'Pizza' },
      { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop', title: 'Salad Bowl' },
      { url: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&auto=format&fit=crop', title: 'Breakfast' },
      { url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200&auto=format&fit=crop', title: 'Pasta Dish' },
    ],
  },
  {
    id: 'corporate-events',
    name: '👔 Corporate Events',
    description: 'Professional event coverage - Business events and conferences',
    visibility: 'public',
    order: 6,
    photos: [
      { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop', title: 'Conference Hall' },
      { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop', title: 'Business Meeting' },
      { url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=1200&auto=format&fit=crop', title: 'Networking Event' },
      { url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1200&auto=format&fit=crop', title: 'Speaker on Stage' },
      { url: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=1200&auto=format&fit=crop', title: 'Team Photo' },
    ],
  },
];

async function createDemoGallery() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                ║');
  console.log('║        🎨 CREATE DEMO GALLERY                                 ║');
  console.log('║                                                                ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // 1. Create Demo Brand
    console.log('1️⃣  Creating demo brand...');
    const brandRef = await db.collection('brands').add(demoBrand);
    const brandId = brandRef.id;
    console.log(`✅ Demo brand created: ${brandId}\n`);

    // 2. Create Albums with Photos
    console.log('2️⃣  Creating albums and photos...');
    let totalPhotos = 0;

    for (const album of demoAlbums) {
      const albumData = {
        name: album.name,
        description: album.description,
        visibility: album.visibility,
        order: album.order,
        photoCount: album.photos.length,
        coverImage: album.photos[0].url,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const albumRef = await db
        .collection('brands')
        .doc(brandId)
        .collection('albums')
        .doc(album.id);

      await albumRef.set(albumData);

      // Add photos to album
      for (let i = 0; i < album.photos.length; i++) {
        const photo = album.photos[i];
        const photoData = {
          title: photo.title,
          url: photo.url,
          thumbnailUrl: photo.url.replace('w=1200', 'w=400'),
          order: i + 1,
          uploadedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await albumRef.collection('photos').add(photoData);
        totalPhotos++;
      }

      console.log(`   ✅ ${album.name}: ${album.photos.length} photos`);
    }

    console.log(`\n✅ Total: ${demoAlbums.length} albums, ${totalPhotos} photos\n`);

    // 3. Summary
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║          ✅ DEMO GALLERY CREATED SUCCESSFULLY!                ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');
    console.log(`📦 Brand ID: ${brandId}`);
    console.log(`🌐 Subdomain: demo`);
    console.log(`📸 Albums: ${demoAlbums.length}`);
    console.log(`🖼️  Photos: ${totalPhotos}`);
    console.log(`\n🔗 Demo URL: https://gallery-app-972f9.web.app/#/demo`);
    console.log(`\n💡 Next steps:`);
    console.log(`   1. Add "Explore Demo" CTA to landing page`);
    console.log(`   2. Create DemoBadge component`);
    console.log(`   3. Update routing for /demo path`);
    console.log(`   4. Deploy and test!\n`);

  } catch (error) {
    console.error('❌ Error creating demo gallery:', error);
    process.exit(1);
  }
}

createDemoGallery();


