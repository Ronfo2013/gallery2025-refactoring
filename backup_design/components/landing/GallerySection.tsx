/**
 * Gallery Section - Landing Page Component
 *
 * Mostra una preview della gallery con:
 * - Mockup/Screenshot del prodotto
 * - Live demo con immagini esempio
 * - Entrambi
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { LandingGallerySettings } from '../../types';

interface GallerySectionProps {
  data: LandingGallerySettings;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ data }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!data.enabled) {
    return null;
  }

  const sortedImages = [...data.demoImages].sort((a, b) => a.order - b.order);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % sortedImages.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + sortedImages.length) % sortedImages.length);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{data.title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{data.subtitle}</p>
        </div>

        {/* Mockup Screenshot */}
        {(data.style === 'mockup' || data.style === 'both') && data.mockupImage && (
          <div className="mb-16 max-w-6xl mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-8 border-gray-800">
              <img
                src={data.mockupImage}
                alt="Gallery Platform Preview"
                className="w-full h-auto"
              />
              {/* Browser chrome mockup */}
              <div className="absolute top-0 left-0 right-0 h-10 bg-gray-800 flex items-center gap-2 px-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex-1 bg-gray-700 rounded ml-4 h-6 flex items-center px-3">
                  <span className="text-xs text-gray-400">
                    www.clubgallery.com/iltuo-club
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Demo Gallery */}
        {(data.style === 'live-demo' || data.style === 'both') && sortedImages.length > 0 && (
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-semibold text-sm">{image.title}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA sotto la gallery */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6 text-lg">
                Crea la tua gallery personalizzata in pochi minuti
              </p>
              <a
                href="#pricing"
                className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                Inizia Ora
              </a>
            </div>
          </div>
        )}

        {/* Lightbox */}
        {lightboxOpen && sortedImages.length > 0 && (
          <div
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>

            {/* Navigation arrows */}
            {sortedImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 text-white hover:text-gray-300 transition text-6xl font-light"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 text-white hover:text-gray-300 transition text-6xl font-light"
                >
                  ›
                </button>
              </>
            )}

            {/* Image */}
            <div className="max-w-5xl max-h-[90vh] relative" onClick={(e) => e.stopPropagation()}>
              <img
                src={sortedImages[lightboxIndex].url}
                alt={sortedImages[lightboxIndex].title}
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
                <p className="text-white text-center text-lg font-semibold">
                  {sortedImages[lightboxIndex].title}
                </p>
                <p className="text-gray-300 text-center text-sm mt-1">
                  {lightboxIndex + 1} / {sortedImages.length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
