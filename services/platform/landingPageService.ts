/**
 * Landing Page Service
 *
 * Gestisce la configurazione della Landing Page principale del sistema.
 * Permette al SuperAdmin di personalizzare tutti gli elementi della landing.
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { LandingPageSettings } from '../../types';

const LANDING_PAGE_DOC = 'platform_settings/landing_page';

/**
 * Ottiene le impostazioni della Landing Page
 */
export async function getLandingPageSettings(): Promise<LandingPageSettings | null> {
  try {
    const docRef = doc(db, LANDING_PAGE_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as LandingPageSettings;
    }

    // Se non esiste, restituisci null (verrà usato il fallback statico)
    console.log('ℹ️  No landing page settings found, using default');
    return null;
  } catch (error) {
    console.error('❌ Error fetching landing page settings:', error);
    throw error;
  }
}

/**
 * Aggiorna le impostazioni della Landing Page
 */
export async function updateLandingPageSettings(
  settings: Partial<LandingPageSettings>,
  userId: string
): Promise<void> {
  try {
    const docRef = doc(db, LANDING_PAGE_DOC);

    await setDoc(
      docRef,
      {
        ...settings,
        updatedAt: serverTimestamp(),
        updatedBy: userId,
      },
      { merge: true }
    );

    console.log('✅ Landing page settings updated');
  } catch (error) {
    console.error('❌ Error updating landing page settings:', error);
    throw error;
  }
}

/**
 * Carica un'immagine per la Landing Page
 */
export async function uploadLandingImage(
  file: File,
  path: string
): Promise<{ url: string; path: string }> {
  try {
    const storageRef = ref(storage, `platform/landing/${path}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    console.log('✅ Landing image uploaded:', path);
    return { url, path: `platform/landing/${path}` };
  } catch (error) {
    console.error('❌ Error uploading landing image:', error);
    throw error;
  }
}

/**
 * Elimina un'immagine della Landing Page
 */
export async function deleteLandingImage(path: string): Promise<void> {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log('✅ Landing image deleted:', path);
  } catch (error) {
    console.error('❌ Error deleting landing image:', error);
    throw error;
  }
}

/**
 * Restituisce le impostazioni di default della Landing Page
 */
export function getDefaultLandingPageSettings(): LandingPageSettings {
  return {
    hero: {
      title: 'Gestisci la tua Gallery con Stile',
      subtitle: 'Piattaforma multi-tenant per creare e gestire gallerie fotografiche professionali',
      ctaText: 'Inizia Gratis',
      ctaUrl: '#pricing',
    },
    gallery: {
      enabled: true,
      title: 'Guarda Come Funziona',
      subtitle: 'Una gallery professionale pronta in pochi minuti',
      style: 'live-demo',
      demoImages: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop',
          title: 'Wedding Photography',
          order: 1,
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop',
          title: 'Portrait Session',
          order: 2,
        },
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop',
          title: 'Event Coverage',
          order: 3,
        },
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1502982899975-c0eecd3f3f71?w=800&auto=format&fit=crop',
          title: 'Fashion Shoot',
          order: 4,
        },
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop',
          title: 'Landscape Photography',
          order: 5,
        },
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop',
          title: 'Urban Architecture',
          order: 6,
        },
        {
          id: '7',
          url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
          title: 'Product Photography',
          order: 7,
        },
        {
          id: '8',
          url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop',
          title: 'Nature Macro',
          order: 8,
        },
      ],
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
  };
}

/**
 * Inizializza le impostazioni di default se non esistono
 */
export async function initializeDefaultLandingPage(userId: string): Promise<void> {
  try {
    const existing = await getLandingPageSettings();
    if (!existing) {
      const defaults = getDefaultLandingPageSettings();
      await updateLandingPageSettings(defaults, userId);
      console.log('✅ Default landing page settings initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing default landing page:', error);
    throw error;
  }
}
