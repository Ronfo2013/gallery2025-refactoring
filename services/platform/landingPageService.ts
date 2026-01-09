/**
 * Landing Page Service
 *
 * Gestisce la configurazione della Landing Page principale del sistema.
 * Permette al SuperAdmin di personalizzare tutti gli elementi della landing.
 */

import { logger } from '@/utils/logger';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '../../firebaseConfig';
import { storagePaths } from '../../src/lib/storagePaths';
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
    logger.info('ℹ️  No landing page settings found, using default');
    return null;
  } catch (error) {
    logger.error('❌ Error fetching landing page settings:', error);
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

    logger.info('✅ Landing page settings updated');
  } catch (error) {
    logger.error('❌ Error updating landing page settings:', error);
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
    const storageRef = ref(storage, storagePaths.landingAsset(path));
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    logger.info('✅ Landing image uploaded:', path);
    return { url, path: storagePaths.landingAsset(path) };
  } catch (error) {
    logger.error('❌ Error uploading landing image:', error);
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
    logger.info('✅ Landing image deleted:', path);
  } catch (error) {
    logger.error('❌ Error deleting landing image:', error);
    throw error;
  }
}

/**
 * Restituisce le impostazioni di default della Landing Page
 */
export function getDefaultLandingPageSettings(): LandingPageSettings {
  return {
    hero: {
      title: 'ClubGallery: La Piattaforma definitiva per le tue Foto',
      subtitle:
        'Crea gallerie fotografiche professionali per i tuoi locali o eventi in pochi secondi. Branding unico, velocità estrema e gestione semplificata.',
      ctaText: 'Provalo Gratis',
      ctaUrl: '#pricing',
    },
    gallery: {
      enabled: true,
      title: 'Gallerie che emozionano',
      subtitle: "Il tuo lavoro merita una presentazione all'altezza della tua professionalità.",
      style: 'live-demo',
      demoImages: [
        {
          id: '1',
          url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&auto=format&fit=crop',
          title: 'Nightclub Photography',
          order: 1,
        },
        {
          id: '2',
          url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&auto=format&fit=crop',
          title: 'Disco Music Live',
          order: 2,
        },
        {
          id: '3',
          url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop',
          title: 'VIP Lounge Events',
          order: 3,
        },
        {
          id: '4',
          url: 'https://images.unsplash.com/photo-1502982899975-c0eecd3f3f71?w=800&auto=format&fit=crop',
          title: 'Fashion Show Night',
          order: 4,
        },
        {
          id: '5',
          url: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&auto=format&fit=crop',
          title: 'Beach Club Party',
          order: 5,
        },
        {
          id: '6',
          url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&auto=format&fit=crop',
          title: 'Corporate Events',
          order: 6,
        },
        {
          id: '7',
          url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop',
          title: 'Concert Stage',
          order: 7,
        },
        {
          id: '8',
          url: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800&auto=format&fit=crop',
          title: 'Festival Moments',
          order: 8,
        },
      ],
    },
    features: {
      title: 'Tutto il necessario per il tuo Club',
      subtitle: 'Strumenti avanzati pensati per chi vive di eventi e spettacolo.',
      items: [
        {
          id: '1',
          icon: '🎨',
          title: 'Branding 100% Personalizzabile',
          description: 'Inserisci il logo e i colori del tuo locale in ogni galleria.',
          order: 1,
        },
        {
          id: '2',
          icon: '⚡',
          title: 'Caricamenti Ultra-Rapidi',
          description:
            "Ottimizzazione automatica WebP per un'esperienza fluida su ogni connessione.",
          order: 2,
        },
        {
          id: '3',
          icon: '📱',
          title: 'Mobile First',
          description:
            'I tuoi clienti potranno scaricare le foto direttamente dal loro smartphone.',
          order: 3,
        },
        {
          id: '4',
          icon: '🔒',
          title: 'Archivio Sicuro',
          description:
            'Tutte le tue foto salvate in cloud con la massima sicurezza e affidabilità.',
          order: 4,
        },
        {
          id: '5',
          icon: '📊',
          title: 'Statistiche Avanzate',
          description: 'Scopri quante persone visualizzano e scaricano le tue foto.',
          order: 5,
        },
        {
          id: '6',
          icon: '💳',
          title: 'Sistema Multi-Tenant',
          description: 'Gestisci più locali o eventi con un unico account SuperAdmin.',
          order: 6,
        },
      ],
    },
    pricing: {
      title: 'Piani su misura per ogni esigenza',
      subtitle: 'Trasparenza totale, nessun costo di attivazione.',
      plans: [
        {
          id: '1',
          name: 'Classic',
          price: 49,
          currency: 'EUR',
          interval: 'monthly',
          features: [
            '1 Locale / Brand',
            'Gallery Illimitate',
            'Sottodominio dedicato',
            '5000 Foto incluse',
            'Assistenza via Email',
          ],
          highlighted: false,
          ctaText: 'Attiva Classic',
          stripeProductId: 'prod_classic',
          stripePriceId: 'price_classic',
          order: 1,
        },
        {
          id: '2',
          name: 'Pro',
          price: 99,
          currency: 'EUR',
          interval: 'monthly',
          features: [
            'Fino a 3 Locali / Brand',
            'Dominio Personalizzato',
            '20.000 Foto incluse',
            'Report Mensili via Email',
            'Assistenza Prioritaria',
          ],
          highlighted: true,
          ctaText: 'Scegli Pro',
          stripeProductId: 'prod_pro',
          stripePriceId: 'price_pro',
          order: 2,
        },
        {
          id: '3',
          name: 'Agency',
          price: 249,
          currency: 'EUR',
          interval: 'monthly',
          features: [
            'Locali Illimitati',
            'White Label (Logo ClubGallery rimosso)',
            'Spazio Archiviazione Illimitato',
            'API Personalizzate',
            'Account Manager Dedicato',
          ],
          highlighted: false,
          ctaText: 'Contatta il Team',
          stripeProductId: 'prod_agency',
          stripePriceId: 'price_agency',
          order: 3,
        },
      ],
    },
    testimonials: {
      enabled: false,
      title: 'Dicono di noi',
      items: [],
    },
    footer: {
      companyName: 'ClubGallery SaaS',
      tagline: "L'emozione dei tuoi eventi, immortalata e condivisa.",
      social: {
        facebook: 'https://facebook.com/clubgallery',
        instagram: 'https://instagram.com/clubgallery',
        twitter: '',
        linkedin: '',
      },
      contact: {
        email: 'info@clubgallery.com',
        phone: '+39 012 3456789',
        address: 'Milano, Italia',
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
      copyright: '© 2025 ClubGallery. Tutti i diritti riservati.',
    },
    branding: {
      primaryColor: '#6366f1',
      secondaryColor: '#a855f7',
      accentColor: '#f43f5e',
    },
    seo: {
      title: 'ClubGallery - Gestione Gallerie Fotografiche per Locali e Discoteche',
      description:
        'La piattaforma professionale per gestire le foto dei tuoi eventi. Branding personalizzato, ottimizzazione immagini e condivisione rapida.',
      keywords: ['discoteca', 'locali', 'fotografia eventi', 'club gallery', 'saas gallery'],
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
      logger.info('✅ Default landing page settings initialized');
    }
  } catch (error) {
    logger.error('❌ Error initializing default landing page:', error);
    throw error;
  }
}
