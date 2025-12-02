#!/usr/bin/env node

/**
 * Inizializza il documento Landing Page in Firestore
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  projectId: 'gallery-app-972f9',
});

const db = admin.firestore();

async function main() {
  console.log('\n🚀 Inizializzazione Landing Page...\n');

  try {
    // Check if landing_page already exists
    const docRef = db.collection('platform_settings').doc('landing_page');
    const doc = await docRef.get();

    if (doc.exists) {
      console.log('⚠️  Landing page document already exists');
      console.log('✅ Skip initialization\n');
      return;
    }

    // Create default landing page settings
    const defaultSettings = {
      hero: {
        title: 'Gestisci la tua Gallery con Stile',
        subtitle: 'Piattaforma multi-tenant per creare e gestire gallerie fotografiche professionali',
        ctaText: 'Inizia Gratis',
        ctaUrl: '#pricing',
      },
      features: {
        title: 'Tutto ciò che serve per la tua Gallery',
        subtitle: 'Strumenti professionali per fotografi e creativi',
        items: [
          {
            id: '1',
            icon: '🎨',
            title: 'Branding Personalizzato',
            description: 'Logo, colori e dominio personalizzati per la tua gallery',
            order: 1,
          },
          {
            id: '2',
            icon: '⚡',
            title: 'Performance Ottimizzate',
            description: 'Thumbnails automatiche e formato WebP per caricamenti rapidi',
            order: 2,
          },
          {
            id: '3',
            icon: '📱',
            title: 'Responsive Design',
            description: 'La tua gallery perfetta su ogni dispositivo',
            order: 3,
          },
          {
            id: '4',
            icon: '🔒',
            title: 'Sicuro e Affidabile',
            description: 'Hosting su Firebase con backup automatici',
            order: 4,
          },
          {
            id: '5',
            icon: '📊',
            title: 'Analytics Integrati',
            description: 'Google Analytics e Meta Pixel per monitorare i visitatori',
            order: 5,
          },
          {
            id: '6',
            icon: '💳',
            title: 'Pagamenti Stripe',
            description: 'Sistema di pagamento integrato e sicuro',
            order: 6,
          },
        ],
      },
      pricing: {
        title: 'Scegli il Piano Perfetto',
        subtitle: 'Prezzi trasparenti, nessun costo nascosto',
        plans: [
          {
            id: '1',
            name: 'Starter',
            price: 99,
            currency: 'EUR',
            interval: 'one-time',
            features: [
              'Gallery personalizzata',
              'Subdomain incluso',
              '1000 foto',
              'Thumbnails automatiche',
              'Analytics base',
            ],
            highlighted: false,
            ctaText: 'Acquista Ora',
            stripeProductId: 'prod_TS1EaWokTNEIY1',
            stripePriceId: 'price_xxx',
            order: 1,
          },
          {
            id: '2',
            name: 'Professional',
            price: 199,
            currency: 'EUR',
            interval: 'one-time',
            features: [
              'Tutto da Starter',
              'Dominio personalizzato',
              '5000 foto',
              'Google Analytics',
              'Meta Pixel',
              'Supporto prioritario',
            ],
            highlighted: true,
            ctaText: 'Inizia Ora',
            stripeProductId: 'prod_TS1EaWokTNEIY1',
            stripePriceId: 'price_xxx',
            order: 2,
          },
          {
            id: '3',
            name: 'Enterprise',
            price: 499,
            currency: 'EUR',
            interval: 'one-time',
            features: [
              'Tutto da Professional',
              'Foto illimitate',
              'Multi-admin',
              'White label',
              'API access',
              'Supporto dedicato',
            ],
            highlighted: false,
            ctaText: 'Contattaci',
            stripeProductId: 'prod_TS1EaWokTNEIY1',
            stripePriceId: 'price_xxx',
            order: 3,
          },
        ],
      },
      testimonials: {
        enabled: false,
        title: 'Cosa dicono i nostri clienti',
        items: [],
      },
      footer: {
        companyName: 'Gallery Platform',
        tagline: 'La tua gallery, il tuo brand',
        social: {
          facebook: '',
          instagram: '',
          twitter: '',
          linkedin: '',
        },
        contact: {
          email: 'info@example.com',
          phone: '',
          address: '',
        },
        links: [
          {
            id: '1',
            label: 'Privacy Policy',
            url: '/privacy',
            order: 1,
          },
          {
            id: '2',
            label: 'Termini di Servizio',
            url: '/terms',
            order: 2,
          },
        ],
        copyright: '© 2025 Gallery Platform. All rights reserved.',
      },
      branding: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
      },
      seo: {
        title: 'Gallery Platform - Crea la tua Gallery Professionale',
        description:
          'Piattaforma multi-tenant per creare e gestire gallerie fotografiche professionali con branding personalizzato',
        keywords: ['gallery', 'fotografia', 'portfolio', 'multi-tenant', 'saas'],
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: 'system',
    };

    await docRef.set(defaultSettings);

    console.log('✅ Landing page document created successfully');
    console.log('\n📍 Document path: platform_settings/landing_page');
    console.log('🎨 Hero title:', defaultSettings.hero.title);
    console.log('📦 Features:', defaultSettings.features.items.length);
    console.log('💰 Pricing plans:', defaultSettings.pricing.plans.length);
    console.log('\n🎉 Initialization complete!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();


