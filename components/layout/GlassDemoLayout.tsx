import React from 'react';
import Header from '../Header';
import Footer from '../Footer';
import CookieConsent from '../CookieConsent';
import GtmScript from '../GtmScript';

interface GlassDemoLayoutProps {
  children: React.ReactNode;
}

/**
 * GlassDemoLayout
 *
 * Layout dedicato alla gallery DEMO con vero effetto glassmorphism:
 * - Sfondo scuro con blob colorati
 * - Card centrale semi-trasparente con blur
 */
const GlassDemoLayout: React.FC<GlassDemoLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-slate-50 font-sans">
      {/* Background blobs / lights */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-70">
        <div className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-teal-500/25 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/4 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
      </div>

      {/* Foreground */}
      <div className="relative z-20 flex flex-col min-h-screen">
        <Header />
        <main className="container-xl mx-auto px-4 md:px-8 py-10 flex-grow">
          <div className="rounded-[40px] border border-white/30 bg-slate-900/85 text-slate-100 shadow-[0_60px_120px_rgba(15,23,42,0.95)] p-6 md:p-10 backdrop-blur-3xl">
            <div className="mb-6 flex flex-col gap-2 text-sm text-slate-200/90 md:flex-row md:items-center md:justify-between">
              <span className="font-semibold text-white">Menu</span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-300">
                ClubGallery Demo
              </span>
            </div>
            {children}
          </div>
        </main>
        <Footer />
        <CookieConsent />
        <GtmScript />
      </div>
    </div>
  );
};

export default GlassDemoLayout;
