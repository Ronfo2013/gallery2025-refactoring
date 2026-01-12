/**
 * Hero Section - Dynamic Landing Page Component
 */

import { logger } from '@/utils/logger';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { LandingHeroSettings } from '../../types';

interface HeroSectionProps {
  data: LandingHeroSettings;
  primaryColor?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  data,
  primaryColor: _primaryColor = '#3b82f6',
}) => {
  const { siteSettings } = useAppContext();
  const { user } = useFirebaseAuth();
  const [email, setEmail] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!email || !brandName) {
        throw new Error('Compila tutti i campi');
      }

      if (brandName.length < 3) {
        throw new Error('Il nome del club deve avere almeno 3 caratteri');
      }

      if (!siteSettings.whatsappNumber) {
        throw new Error('WhatsApp non è configurato. Contatta il supporto.');
      }

      const encodedText = encodeURIComponent(
        `Ciao! Vorrei attivare ClubGallery per il mio locale.\n\nNome club: ${brandName}\nEmail: ${email}`
      );
      const waUrl = `https://wa.me/${siteSettings.whatsappNumber}?text=${encodedText}`;
      window.open(waUrl, '_blank');
    } catch (err: any) {
      logger.error('Error:', err);
      setError(err.message || 'Impossibile aprire WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]">
      {/* Decorative Floating Elements */}
      <div className="absolute top-1/4 -left-20 w-64 h-64 bg-accent-indigo/20 rounded-full blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-accent-rose/10 rounded-full blur-[120px] animate-float" />

      {/* Background Image/Video Overlay */}
      {data.backgroundImage && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${data.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.15,
          }}
        />
      )}

      {data.backgroundVideo && (
        <div className="absolute inset-0 z-0 opacity-20">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src={data.backgroundVideo} type="video/mp4" />
          </video>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-accent-indigo uppercase tracking-widest mb-6 animate-fade-in shadow-glow-indigo">
              <span className="w-2 h-2 rounded-full bg-accent-indigo animate-pulse" />
              SaaS Gallery for Nightlife
            </div>

            <h1 className="section-title !mb-6 leading-[1.1]">
              {data.title || 'ClubGallery: La Piattaforma definitiva per le tue Foto'}
            </h1>

            <p className="section-subtitle !mx-0 mb-10 text-gray-400">
              {data.subtitle ||
                'Crea gallerie fotografiche professionali per i tuoi locali o eventi in pochi secondi. Branding unico, velocità estrema.'}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link
                to="/demo"
                className="btn-neon-indigo !px-10 !py-4 flex items-center gap-3 group transition-all"
              >
                <span>🚀 Esplora Demo</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              {!user ? (
                <Link
                  to="/login"
                  className="bg-white/5 hover:bg-white/10 text-white border border-white/20 !px-10 !py-4 rounded-2xl font-bold flex items-center gap-3 transition-all"
                >
                  <span>🔑 Area Clienti</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-accent-indigo/20 hover:bg-accent-indigo/30 text-white border border-accent-indigo/30 !px-10 !py-4 rounded-2xl font-bold flex items-center gap-3 transition-all"
                >
                  <span>📊 La tua Dashboard</span>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column: Signup Card */}
          <div className="w-full max-w-lg">
            <div className="glass-card glass-card-hover p-8 md:p-10 border-white/20">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Attiva ora</h3>
                <p className="text-gray-400 text-sm">
                  Inizia a gestire le tue gallery in pochi secondi.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Il tuo locale
                  </label>
                  <input
                    type="text"
                    placeholder="Nome del club (es. Midisco)"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    required
                    disabled={loading}
                    className="glass-input w-full"
                  />
                  {brandName && (
                    <p className="text-[10px] text-accent-indigo font-medium animate-fade-in ml-1">
                      URL: clubgallery.com/{brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                    Email aziendale
                  </label>
                  <input
                    type="email"
                    placeholder="email@locale.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    className="glass-input w-full"
                  />
                </div>

                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 px-4 py-3 rounded-xl text-sm animate-shake">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-neon-rose w-full mt-4 !py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processando...</span>
                    </div>
                  ) : (
                    data.ctaText || 'Attiva Gallery Gratis'
                  )}
                </button>

                <p className="text-[10px] text-gray-500 text-center uppercase tracking-tighter">
                  Proseguendo accetti i termini di servizio e la privacy policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
