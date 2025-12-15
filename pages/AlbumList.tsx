/**
 * Album List - Professional Gallery Homepage
 *
 * Features:
 * - Hero section with brand info
 * - Responsive grid layout
 * - Empty state
 * - Loading skeletons
 * - Professional card design
 *
 * @version 2.0.0
 */

import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { useBrand } from '../contexts/BrandContext';
import { Link } from 'react-router-dom';
import { Card, CardBody, EmptyState } from '../src/components/ui';
import { FolderIcon, ImageIcon, CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import AlbumCardSkeleton from '../components/AlbumCardSkeleton';

const AlbumListNew: React.FC = () => {
  const { albums, loading } = useAppContext();
  const { brand } = useBrand();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      {brand && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          {brand.branding?.logo && (
            <img
              src={brand.branding?.logo}
              alt={brand.name}
              className="h-20 w-20 mx-auto mb-4 rounded-2xl shadow-xl object-cover"
            />
          )}
          <h1 className="heading-xl text-gray-900 mb-3">{brand.name}</h1>
          <p className="text-muted body-lg max-w-2xl mx-auto">
            Browse our collection of photo albums
          </p>
        </motion.div>
      )}

      {/* Loading State with Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <AlbumCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && albums.length === 0 && (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FolderIcon className="w-20 h-20" />}
              title="No Albums Available"
              description="There are no photo albums to display at the moment. Check back soon!"
            />
          </CardBody>
        </Card>
      )}

      {/* Albums Grid */}
      {!loading && albums.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {albums.map((album) => {
            const coverPhoto = album.photos[0];
            const photoCount = album.photos.length;

            return (
              <motion.div key={album.id} variants={itemVariants}>
                <Link to={`/album/${album.id}`}>
                  <Card hover className="overflow-hidden h-full group">
                    {/* Cover Image */}
                    <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
                      {coverPhoto ? (
                        <>
                          <img
                            src={coverPhoto.thumbnail || coverPhoto.url}
                            alt={album.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            loading="lazy"
                          />
                          {/* Overlay on Hover */}
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                            <div className="transform translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                              <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
                                <span className="text-sm font-medium text-gray-900">
                                  View Album
                                </span>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FolderIcon className="w-16 h-16 text-gray-300" />
                        </div>
                      )}

                      {/* Photo Count Badge */}
                      <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {photoCount}
                      </div>
                    </div>

                    {/* Album Info */}
                    <CardBody>
                      <h3 className="font-semibold text-gray-900 mb-2 truncate">{album.title}</h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarIcon className="w-4 h-4 mr-1.5" />
                        {album.createdAt
                          ? new Date(album.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Recently added'}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

export default AlbumListNew;
