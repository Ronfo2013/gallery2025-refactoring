/**
 * Centralized text constants for the project.
 * Includes strings for Frontend, API responses, and Backend/System messages.
 */

export const TEXTS = {
  // ============================================
  // FRONTEND UI
  // ============================================
  FRONTEND: {
    COMMON: {
      SAVE: 'Salva',
      CANCEL: 'Annulla',
      DELETE: 'Elimina',
      EDIT: 'Modifica',
      CREATE: 'Crea',
      LOADING: 'Caricamento...',
      SUCCESS: 'Operazione completata con successo',
      ERROR: 'Si è verificato un errore',
      CONFIRM_DELETE: 'Sei sicuro di voler eliminare questo elemento?',
      NO_DATA: 'Nessun dato disponibile',
    },
    SUPERADMIN: {
      DASHBOARD_TITLE: 'SuperAdmin Dashboard',
      BRANDS_MANAGEMENT: 'Gestione Brand',
      SETTINGS: 'Impostazioni Piattaforma',
      ANALYTICS: 'Statistiche',
      CREATE_BRAND_TITLE: 'Crea un nuovo Brand',
      CREATE_BRAND_DESC: 'Inserisci i dettagli per registrare un nuovo locale o fotografo.',
    },
    BRAND_ADMIN: {
      DASHBOARD_TITLE: 'Dashboard Brand',
      ALBUMS: 'I miei Album',
      UPLOAD_PHOTOS: 'Carica Foto',
      SETTINGS: 'Impostazioni Brand',
      CUSTOMIZE_GALLERY: 'Personalizza Gallery',
    },
    LANDING_PAGE: {
      HERO_TITLE: 'ClubGallery: La tua Piattaforma Foto Professionale',
      HERO_SUBTITLE:
        'Gestisci, condividi e valorizza le foto dei tuoi eventi con branding personalizzato.',
      CTA_START: 'Inizia Ora Gratis',
      FEATURES_TITLE: 'Perché scegliere ClubGallery?',
      PRICING_TITLE: 'Piani Semplici e Trasparenti',
      GALLERY_TITLE: 'Ispìrati dalle nostre Gallery',
    },
    LEGAL: {
      PRIVACY_POLICY: 'Informativa sulla Privacy',
      TERMS_OF_SERVICE: 'Termini e Condizioni di Servizio',
      COOKIES: 'Gestione Cookie',
      GDPR_COMPLIANCE: 'Tutti i tuoi dati sono trattati in conformità con il GDPR.',
    },
  },

  // ============================================
  // API RESPONSES
  // ============================================
  API: {
    ERRORS: {
      NOT_FOUND: 'Risorsa non trovata.',
      UNAUTHORIZED: 'Accesso non autorizzato. Effettua il login.',
      FORBIDDEN: 'Non hai i permessi necessari per questa azione.',
      INVALID_DATA: 'I dati inviati non sono validi o incompleti.',
      SERVER_ERROR: 'Errore interno del server. Riprova più tardi.',
      DB_ERROR: 'Errore critico durante la persistenza dei dati.',
      AUTH_FAILED: 'Credenziali non valide. Controlla email e password.',
      DUPLICATE_SLUG: 'Questo URL o Subdomain è già in uso. Scegline un altro.',
      STRIPE_ERROR: "Si è verificato un errore durante l'elaborazione del pagamento.",
    },
    SUCCESS: {
      SETTINGS_UPDATED: 'Configurazione salvata con successo.',
      BRAND_CREATED: 'Brand creato correttamente. Le credenziali sono visibili ora.',
      PHOTO_UPLOADED: 'Immagine caricata e ottimizzata correttamente.',
      ALBUM_CREATED: 'Nuovo album creato con successo.',
      SUBSCRIPTION_ACTIVE: 'Abbonamento attivato correttamente. Benvenuto!',
    },
  },

  // ============================================
  // BACKEND / SYSTEM
  // ============================================
  BACKEND: {
    EMAILS: {
      WELCOME_SUBJECT: '🚀 Benvenuto su ClubGallery!',
      WELCOME_BODY: (brandName: string, email: string, password?: string) => `
        Ciao ${brandName},
        
        Siamo entusiasti di darti il benvenuto su ClubGallery!
        Il tuo account è stato creato correttamente e sei pronto per caricare le tue prime foto.
        
        Dettagli di accesso:
        - Dashboard: https://clubgallery.com/dashboard
        - Email: ${email}
        ${password ? `- Password temporanea: ${password}` : '- Password: Usa la password già associata a questo account.'}
        
        Configura il tuo brand (logo e colori) direttamente dalle impostazioni della dashboard.
        
        A presto,
        Il Team di ClubGallery
      `,
      RESET_PASSWORD_SUBJECT: '🔑 Recupero Password ClubGallery',
    },
    LOGS: {
      BRAND_CREATED: (brandId: string) => `[SYSTEM] Nuovo brand creato con successo: ${brandId}`,
      PAYMENT_RECEIVED: (amount: number) => `[STRIPE] Pagamento ricevuto: ${amount}€`,
      CRITICAL_ERROR:
        '[CRITICAL] Errore di sistema rilevato! Controllare i log di Cloud Functions.',
    },
  },
};
