/**
 * Landing Page - Dynamic & Customizable
 *
 * Shown when no brand is detected (main domain).
 * Fully customizable from SuperAdmin Panel.
 */

import React, { useEffect } from 'react';
import { useLandingPage } from '../../contexts/LandingPageContext';
import Header from '../../components/Header';
import { HeroSection } from '../../components/landing/HeroSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { GallerySection } from '../../components/landing/GallerySection';
import { PricingSection } from '../../components/landing/PricingSection';
import { FooterSection } from '../../components/landing/FooterSection';

const GlassSection: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="rounded-3xl border border-white/40 bg-white/10 backdrop-blur-3xl shadow-[0_40px_120px_rgba(8,11,26,0.85)] p-6 md:p-10 mb-10">
    {children}
  </div>
);

const LandingPageNew: React.FC = () => {
  const { settings, error } = useLandingPage();

  // Safety check: if settings.branding is undefined, provide defaults
  const safeBranding =
    settings?.branding || ({
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      accentColor: '#10b981',
      logo: undefined,
    } as const);

  const footerData =
    settings?.footer || ({
      companyName: 'ClubGallery',
      tagline: '',
      links: [],
      socialLinks: [],
    } as const);

  // Update document title and meta when settings load
  useEffect(() => {
    if (settings?.seo) {
      document.title = settings.seo.title;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', settings.seo.description);

      // Update meta keywords
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement('meta');
        metaKeywords.setAttribute('name', 'keywords');
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute('content', settings.seo.keywords.join(', '));

      // Update OG tags
      if (settings.seo.ogImage) {
        let metaOgImage = document.querySelector('meta[property="og:image"]');
        if (!metaOgImage) {
          metaOgImage = document.createElement('meta');
          metaOgImage.setAttribute('property', 'og:image');
          document.head.appendChild(metaOgImage);
        }
        metaOgImage.setAttribute('content', settings.seo.ogImage);
      }
    }
  }, [settings]);

  // Don't show preloader for landing page - show content immediately with loading states
  if (error || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Page</h1>
          <p className="text-gray-600">{error || 'Failed to load landing page settings'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <div className="absolute -top-32 -right-10 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-[140px]" />
        <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-sky-500/15 blur-[130px]" />
        <div className="absolute bottom-[-5rem] right-1/4 h-64 w-64 rounded-full bg-emerald-500/15 blur-[150px]" />
      </div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <div className="container-xl mx-auto px-4 py-10 pt-24 space-y-10">
          <GlassSection>
            <HeroSection data={settings.hero} primaryColor={safeBranding.primaryColor} />
          </GlassSection>

          <GlassSection>
            <FeaturesSection data={settings.features} />
          </GlassSection>

          {settings.gallery && (
            <GlassSection>
              <GallerySection data={settings.gallery} />
            </GlassSection>
          )}

          <GlassSection>
            <PricingSection data={settings.pricing} accentColor={safeBranding.accentColor} />
          </GlassSection>

          {settings.testimonials?.enabled &&
            settings.testimonials.items.length > 0 && (
              <GlassSection>
                <section>
                  <div className="text-center mb-8">
                    <h2 className="text-4xl font-bold">{settings.testimonials.title}</h2>
                    <p className="text-slate-200 mt-2">Storie reali dai nostri club partner.</p>
                  </div>
                  <div className="grid md:grid-cols-3 gap-8">
                    {settings.testimonials.items
                      .sort((a, b) => a.order - b.order)
                      .map((testimonial) => (
                        <div
                          key={testimonial.id}
                          className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center font-semibold text-xl">
                              {testimonial.name.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-lg">{testimonial.name}</h4>
                              <p className="text-sm text-slate-300">
                                {testimonial.role} · {testimonial.company}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className="text-amber-300">
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="text-slate-200 italic">"{testimonial.text}"</p>
                        </div>
                      ))}
                  </div>
                </section>
              </GlassSection>
            )}

          <GlassSection>
              <FooterSection data={footerData} logo={safeBranding.logo} />
          </GlassSection>
        </div>
      </div>
    </div>
  );
};

export default LandingPageNew;
