# 🎨 Landing Page Personalizzabile - Piano di Implementazione

**Data:** 20 Novembre 2025  
**Status:** 📋 Planning

---

## 🎯 Obiettivo

Rendere la Landing Page completamente personalizzabile dal SuperAdmin Panel, permettendo di modificare:

- Hero section (titolo, sottotitolo, CTA, immagine)
- Features section (icone, testi, descrizioni)
- Pricing section (piani, prezzi, features)
- Footer (social links, contatti, copyright)
- Colori e branding
- SEO metadata

---

## 📋 Struttura Dati Firestore

### Collection: `platform_settings`

Document ID: `landing_page`

```typescript
interface LandingPageSettings {
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    ctaText: string;
    ctaUrl: string;
    backgroundImage?: string;
    backgroundVideo?: string;
  };

  // Features Section
  features: {
    title: string;
    subtitle: string;
    items: Array<{
      id: string;
      icon: string; // Lucide icon name or emoji
      title: string;
      description: string;
    }>;
  };

  // Pricing Section
  pricing: {
    title: string;
    subtitle: string;
    plans: Array<{
      id: string;
      name: string;
      price: number;
      currency: string;
      interval: 'one-time' | 'monthly' | 'yearly';
      features: string[];
      highlighted: boolean;
      ctaText: string;
      stripeProductId: string;
      stripePriceId: string;
    }>;
  };

  // Testimonials (optional)
  testimonials?: {
    enabled: boolean;
    title: string;
    items: Array<{
      id: string;
      name: string;
      role: string;
      company: string;
      avatar?: string;
      text: string;
      rating: number;
    }>;
  };

  // Footer
  footer: {
    companyName: string;
    tagline: string;
    social: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      linkedin?: string;
    };
    contact: {
      email: string;
      phone?: string;
      address?: string;
    };
    links: Array<{
      id: string;
      label: string;
      url: string;
    }>;
    copyright: string;
  };

  // Branding
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily?: string;
  };

  // SEO
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };

  // Metadata
  updatedAt: Timestamp;
  updatedBy: string; // SuperAdmin UID
}
```

---

## 🏗️ Componenti da Creare

### 1. Service Layer

#### `landingPageService.ts`

```typescript
// services/platform/landingPageService.ts
export async function getLandingPageSettings(): Promise<LandingPageSettings>;
export async function updateLandingPageSettings(
  settings: Partial<LandingPageSettings>
): Promise<void>;
export async function uploadLandingImage(file: File, path: string): Promise<string>;
```

### 2. Context

#### `LandingPageContext.tsx`

```typescript
// contexts/LandingPageContext.tsx
interface LandingPageContextType {
  settings: LandingPageSettings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}
```

### 3. SuperAdmin Panel - Landing Page Editor

#### Tab "Landing Page" nel SuperAdminPanel

**Sezioni:**

1. **Hero Editor**
   - Input: Title, Subtitle
   - Button: CTA Text, CTA URL
   - Upload: Background Image/Video
   - Preview live

2. **Features Editor**
   - Lista features (drag & drop per riordinare)
   - Add/Edit/Delete features
   - Icon picker (Lucide icons + emoji)

3. **Pricing Editor**
   - Lista piani (drag & drop)
   - Add/Edit/Delete piani
   - Toggle "highlighted"
   - Collegamento con Stripe (product/price ID)

4. **Testimonials Editor** (optional)
   - Add/Edit/Delete testimonials
   - Upload avatar
   - Rating stars

5. **Footer Editor**
   - Company info
   - Social links
   - Contact info
   - Custom links

6. **Branding Editor**
   - Color pickers (primary, secondary, accent)
   - Logo upload
   - Font family selector

7. **SEO Editor**
   - Meta title, description, keywords
   - OG image upload
   - Preview Google/Social share

---

## 🎨 UI Components

### LandingPage (refactored)

```typescript
// pages/public/LandingPage.tsx
const LandingPage: React.FC = () => {
  const { settings, loading } = useLandingPage();

  if (loading) return <PreloaderModern />;
  if (!settings) return <DefaultLanding />; // Fallback

  return (
    <>
      <HeroSection data={settings.hero} branding={settings.branding} />
      <FeaturesSection data={settings.features} />
      <PricingSection data={settings.pricing} />
      {settings.testimonials?.enabled && (
        <TestimonialsSection data={settings.testimonials} />
      )}
      <FooterSection data={settings.footer} />
    </>
  );
};
```

### Editor Components

```typescript
// components/landing-editor/HeroEditor.tsx
// components/landing-editor/FeaturesEditor.tsx
// components/landing-editor/PricingEditor.tsx
// components/landing-editor/FooterEditor.tsx
// components/landing-editor/BrandingEditor.tsx
// components/landing-editor/SEOEditor.tsx
```

---

## 🔄 Flusso di Lavoro

### SuperAdmin

1. Accede a SuperAdmin Panel → Tab "Landing Page"
2. Modifica sezioni (Hero, Features, Pricing, ecc.)
3. Preview live delle modifiche
4. Salva → aggiorna Firestore `platform_settings/landing_page`
5. (optional) Trigger deploy automatico o manuale

### Utente Pubblico

1. Visita il dominio principale (senza brand)
2. LandingPage carica settings da Firestore
3. Renderizza componenti dinamici con i dati salvati
4. Apply branding CSS variables
5. CTA → redirect a Stripe checkout

---

## 📦 Librerie Necessarie

- **react-colorful** - Color picker moderno
- **react-beautiful-dnd** - Drag & drop per riordinare features/piani
- **react-icons** - Icon picker (già abbiamo lucide-react)
- **emoji-picker-react** - Emoji picker per features

---

## ⚙️ Implementazione Step-by-Step

### Phase 1: Service Layer + Context (30 min)

- [ ] Creare `landingPageService.ts`
- [ ] Creare `LandingPageContext.tsx`
- [ ] Creare documento Firestore iniziale con dati di default

### Phase 2: Refactor LandingPage Esistente (1h)

- [ ] Estrarre componenti: Hero, Features, Pricing, Footer
- [ ] Rendere componenti data-driven
- [ ] Integrare con `LandingPageContext`
- [ ] Fallback a UI statica se settings non disponibili

### Phase 3: SuperAdmin Editor UI (2h)

- [ ] Creare tab "Landing Page" in SuperAdminPanel
- [ ] Implementare HeroEditor
- [ ] Implementare FeaturesEditor
- [ ] Implementare PricingEditor
- [ ] Implementare FooterEditor

### Phase 4: Branding & SEO Editor (1h)

- [ ] BrandingEditor (color pickers, logo upload)
- [ ] SEOEditor (meta tags, OG image)

### Phase 5: Advanced Features (1h)

- [ ] Drag & drop riordinamento
- [ ] Live preview
- [ ] Image upload ottimizzato
- [ ] Testimonials editor (optional)

### Phase 6: Testing & Deploy (30 min)

- [ ] Test completo di tutte le sezioni
- [ ] Verifica responsive
- [ ] Verifica SEO metadata
- [ ] Deploy produzione

**Tempo totale stimato:** ~6 ore

---

## 🚀 Quick Win (MVP)

Per un MVP rapido, implementare solo:

1. **Hero Editor** (title, subtitle, CTA)
2. **Branding Editor** (colors, logo)
3. **SEO Editor** (meta tags)

Lasciare Features, Pricing, Footer come componenti statici per ora.

**Tempo MVP:** ~2 ore

---

## 📝 Note Implementative

### Storage Structure

```
platform/
├── landing/
│   ├── hero-bg.jpg
│   ├── logo.png
│   ├── og-image.jpg
│   └── testimonials/
│       ├── avatar-1.jpg
│       ├── avatar-2.jpg
│       └── ...
```

### Firestore Security Rules

```javascript
match /platform_settings/{docId} {
  // Lettura pubblica per landing_page
  allow read: if docId == 'landing_page';

  // Scrittura solo per SuperAdmin
  allow write: if request.auth != null &&
    exists(/databases/$(database)/documents/superadmins/$(request.auth.uid));
}
```

### CSS Variables per Branding

```css
:root {
  --landing-primary: #3b82f6;
  --landing-secondary: #8b5cf6;
  --landing-accent: #10b981;
}
```

---

## 🎯 Priorità

1. **CRITICO:** Fix dashboard loading (✅ FATTO)
2. **HIGH:** Landing Hero + Branding editor (MVP)
3. **MEDIUM:** Features & Pricing editor
4. **LOW:** Testimonials, advanced features

---

## 🔗 File da Modificare

- [ ] `services/platform/landingPageService.ts` (NEW)
- [ ] `contexts/LandingPageContext.tsx` (NEW)
- [ ] `pages/public/LandingPage.tsx` (REFACTOR)
- [ ] `pages/superadmin/SuperAdminPanel.tsx` (ADD TAB)
- [ ] `components/landing-editor/` (NEW FOLDER)
- [ ] `firestore.rules` (UPDATE)
- [ ] `types.ts` (ADD LandingPageSettings)

---

**Prossimi step:** Vuoi procedere con l'implementazione completa o preferisci l'MVP rapido (2h)?
