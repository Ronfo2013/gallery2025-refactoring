/**
 * Album View - Professional Photo Gallery with Lightbox
 *
 * Features:
 * - Responsive masonry grid
 * - Professional lightbox
 * - Image lazy loading
 * - Smooth animations
 * - Download support
 *
 * @version 2.0.0
 */

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Card, CardBody, EmptyState, Spinner, Button } from '../src/components/ui';
import {
  ArrowLeftIcon,
  ImageIcon,
  DownloadIcon,
  XIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Masonry from 'react-masonry-css';

const AlbumViewNew: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  const { albums, loading } = useAppContext();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<number, boolean>>({});

  const album = albums.find((a) => a.id === albumId);

  const breakpointColumnsObj = {
    default: 4,
    1280: 3,
    1024: 3,
    768: 2,
    640: 1,
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    if (lightboxIndex !== null && album) {
      setLightboxIndex((lightboxIndex - 1 + album.photos.length) % album.photos.length);
    }
  };

  const goToNext = () => {
    if (lightboxIndex !== null && album) {
      setLightboxIndex((lightboxIndex + 1) % album.photos.length);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (lightboxIndex === null) {
        return;
      }

      if (e.key === 'Escape') {
        closeLightbox();
      }
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      }
      if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [lightboxIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading album...</span>
      </div>
    );
  }

  if (!album) {
    return (
      <Card>
        <CardBody>
          <EmptyState
            icon={<ImageIcon className="w-20 h-20" />}
            title="Album Not Found"
            description="The album you're looking for doesn't exist or has been removed."
            action={{
              label: 'Back to Albums',
              onClick: () => window.history.back(),
            }}
          />
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link to="/">
          <Button
            variant="ghost"
            size="sm"
            icon={<ArrowLeftIcon className="w-4 h-4" />}
            className="mb-4"
          >
            Back to Albums
          </Button>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-lg text-gray-900 mb-2">{album.title}</h1>
            <p className="text-muted body-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              {album.photos.length} {album.photos.length === 1 ? 'photo' : 'photos'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Photos Grid - Masonry Layout */}
      {album.photos.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<ImageIcon className="w-16 h-16" />}
              title="No Photos Yet"
              description="This album doesn't have any photos yet."
            />
          </CardBody>
        </Card>
      ) : (
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex -ml-6 w-auto"
          columnClassName="pl-6 bg-clip-padding"
        >
          {album.photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="mb-6 group cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <Card hover className="overflow-hidden">
                <div className="relative">
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={photo.title}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onLoad={() => setImageLoading((prev) => ({ ...prev, [index]: false }))}
                  />
                  {imageLoading[index] && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      <Spinner size="sm" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
                </div>
                {photo.title && (
                  <CardBody className="p-3">
                    <p className="text-sm text-gray-700 truncate">{photo.title}</p>
                  </CardBody>
                )}
              </Card>
            </motion.div>
          ))}
        </Masonry>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black bg-opacity-95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all z-10 text-white"
            >
              <XIcon className="w-6 h-6" />
            </button>

            {/* Download Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                const photo = album.photos[lightboxIndex];
                handleDownload(photo.url, `${photo.title || 'photo'}.jpg`);
              }}
              className="absolute top-4 right-20 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all z-10 text-white"
            >
              <DownloadIcon className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            {album.photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all z-10 text-white"
              >
                <ChevronLeftIcon className="w-8 h-8" />
              </button>
            )}

            {/* Next Button */}
            {album.photos.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-lg transition-all z-10 text-white"
              >
                <ChevronRightIcon className="w-8 h-8" />
              </button>
            )}

            {/* Image */}
            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="max-w-7xl max-h-[90vh] px-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={album.photos[lightboxIndex].url}
                alt={album.photos[lightboxIndex].title}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Image Title */}
              {album.photos[lightboxIndex].title && (
                <div className="mt-4 text-center">
                  <p className="text-white text-lg font-medium">
                    {album.photos[lightboxIndex].title}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {lightboxIndex + 1} of {album.photos.length}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Masonry CSS */}
      <style>{`
        .my-masonry-grid {
          display: flex;
          margin-left: -30px;
          width: auto;
        }
        .my-masonry-grid_column {
          padding-left: 30px;
          background-clip: padding-box;
        }
      `}</style>
    </div>
  );
};

export default AlbumViewNew;
