/**
 * Landing Page - Dynamic & Customizable
 *
 * Shown when no brand is detected (main domain).
 * Fully customizable from SuperAdmin Panel.
 */

import React, { useEffect } from 'react';
import { useLandingPage } from '../../contexts/LandingPageContext';
import { HeroSection } from '../../components/landing/HeroSection';
import { FeaturesSection } from '../../components/landing/FeaturesSection';
import { GallerySection } from '../../components/landing/GallerySection';
import { PricingSection } from '../../components/landing/PricingSection';
import { FooterSection } from '../../components/landing/FooterSection';

const LandingPageNew: React.FC = () => {
  const { settings, error } = useLandingPage();

  // Safety check: if settings.branding is undefined, provide defaults
  const safeBranding = settings.branding || {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#10b981',
    logo: undefined,
  };

  const safeFooter = settings.footer || {
    companyName: 'Gallery',
    tagline: '',
    links: [],
    socialLinks: [],
  };

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {safeBranding.logo ? (
              <img
                src={safeBranding.logo}
                alt={safeFooter.companyName || 'Logo'}
                className="h-10"
              />
            ) : (
              <>
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
                  style={{
                    background: `linear-gradient(to bottom right, ${safeBranding.primaryColor}, ${safeBranding.secondaryColor})`,
                  }}
                >
                  {safeFooter.companyName.charAt(0)}
                </div>
                <span className="text-2xl font-bold text-gray-900">{safeFooter.companyName}</span>
              </>
            )}
          </div>
          <nav className="hidden md:flex gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="/#/superadmin" className="text-gray-600 hover:text-gray-900">
              Admin
            </a>
          </nav>
        </div>
      </header>

      {/* Dynamic Sections */}
      <HeroSection data={settings.hero} primaryColor={safeBranding.primaryColor} />

      <FeaturesSection data={settings.features} />

      {/* Gallery/Demo Section */}
      {settings.gallery && <GallerySection data={settings.gallery} />}

      <PricingSection data={settings.pricing} accentColor={safeBranding.accentColor} />

      {/* Testimonials (if enabled) */}
      {settings.testimonials?.enabled && settings.testimonials.items.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {settings.testimonials.title}
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {settings.testimonials.items
                .sort((a, b) => a.order - b.order)
                .map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      {testimonial.avatar ? (
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-sm text-gray-500">
                          {testimonial.role} at {testimonial.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex mb-3">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-700 italic">"{testimonial.text}"</p>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <FooterSection data={settings.footer} logo={safeBranding.logo} />
    </div>
  );
};

export default LandingPageNew;
