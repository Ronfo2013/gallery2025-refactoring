/**
 * Hero Section - Dynamic Landing Page Component
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { LandingHeroSettings } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { logger } from '@/utils/logger';

interface HeroSectionProps {
  data: LandingHeroSettings;
  primaryColor?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ data, primaryColor = '#3b82f6' }) => {
  const { siteSettings } = useAppContext();
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
    <section
      className="relative py-20 md:py-32 overflow-hidden"
      style={{
        backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background overlay if image exists */}
      {data.backgroundImage && <div className="absolute inset-0 bg-black/50" />}

      {/* Background video if exists */}
      {data.backgroundVideo && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={data.backgroundVideo} type="video/mp4" />
        </video>
      )}

      <div className="relative container mx-auto px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1
            className={clsx(
              'text-5xl md:text-6xl font-bold mb-6 leading-tight',
              data.backgroundImage || data.backgroundVideo ? 'text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]' : 'text-gray-900'
            )}
          >
            {data.title}
          </h1>

          <p
            className={clsx(
              'text-xl md:text-2xl mb-12 max-w-3xl mx-auto',
              data.backgroundImage || data.backgroundVideo
                ? 'text-gray-200 drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]'
                : 'text-gray-600'
            )}
          >
            {data.subtitle}
          </p>

          {/* Signup Form Card */}
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 mb-12">
            <h3 className="text-2xl font-bold mb-2 text-gray-900">Attiva la gallery del tuo club</h3>
            <p className="text-gray-600 mb-6">
              Raccogli e mostra le foto delle tue serate in un&apos;unica gallery professionale.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Nome del tuo club"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1 text-left">
                  Questa sarà la tua pagina gallery:{' '}
                  https://www.clubgallery.com/
                  {brandName
                    ? brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')
                    : 'iltuo-club'}
                </p>
              </div>

              <input
                type="email"
                placeholder="La tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                {loading ? 'Processing...' : data.ctaText}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Verrai reindirizzato a WhatsApp per completare l&apos;attivazione con un consulente.
              </p>
            </form>

            {/* Demo Gallery CTA */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 mb-3">Or explore our demo first</p>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-white text-gray-900 border-2 border-gray-300 shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 hover:border-blue-500"
                onClick={() => {
                  logger.info('🖱️  Demo button clicked! Navigating to /demo');
                  logger.info('   Current URL:', window.location.href);
                }}
              >
                🎨 <span>Explore Demo Gallery</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
