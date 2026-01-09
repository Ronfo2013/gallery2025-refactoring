/**
 * Albums Manager Tab - Professional album and photo management
 */

import React, { useState } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  EmptyState,
  Badge,
} from '../../../src/components/ui';
import { FolderIcon, PlusIcon, TrashIcon, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import AlbumPhotoManager from '../../../components/AlbumPhotoManager';

interface AlbumsManagerProps {
  brandId: string;
}

const AlbumsManager: React.FC<AlbumsManagerProps> = ({ brandId }) => {
  const { albums, addAlbum, deleteAlbum } = useAppContext();
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) {
      toast.error('Please enter an album name');
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading('Creating album...');

    try {
      await addAlbum(newAlbumTitle.trim());
      toast.success(`Album "${newAlbumTitle}" created successfully!`, { id: loadingToast });
      setNewAlbumTitle('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create album', { id: loadingToast });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteAlbum = async (albumId: string, albumTitle: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${albumTitle}"?\n\nThis will permanently delete all photos in this album. This action cannot be undone.`
      )
    ) {
      return;
    }

    const loadingToast = toast.loading('Deleting album...');

    try {
      await deleteAlbum(albumId);
      toast.success(`Album "${albumTitle}" deleted`, { id: loadingToast });
      if (expandedAlbum === albumId) {
        setExpandedAlbum(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete album', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="heading-lg text-gray-900">Albums</h2>
          <p className="text-muted body-sm mt-1">Manage your photo albums</p>
        </div>
        <Badge variant="info">
          {albums.length} {albums.length === 1 ? 'Album' : 'Albums'}
        </Badge>
      </div>

      {/* Create Album Form */}
      <Card>
        <CardBody>
          <form onSubmit={handleCreateAlbum} className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              value={newAlbumTitle}
              onChange={(e) => setNewAlbumTitle(e.target.value)}
              placeholder="Enter album name (e.g., Summer 2025)"
              disabled={isCreating}
              className="flex-1"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isCreating || !newAlbumTitle.trim()}
              loading={isCreating}
              icon={<PlusIcon className="w-4 h-4" />}
              className="sm:w-auto w-full"
            >
              Create Album
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Albums List */}
      {albums.length === 0 ? (
        <Card>
          <CardBody>
            <EmptyState
              icon={<FolderIcon className="w-16 h-16" />}
              title="No Albums Yet"
              description="Create your first album to start organizing your photos. Albums help you group related photos together."
              action={{
                label: 'Create First Album',
                onClick: () =>
                  (
                    document.querySelector('input[placeholder*="album name"]') as HTMLInputElement
                  )?.focus(),
              }}
            />
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {albums.map((album) => {
            const isExpanded = expandedAlbum === album.id;
            const photoCount = album.photos.length;

            return (
              <Card key={album.id} className="overflow-hidden">
                <CardHeader className="flex items-center justify-between bg-gray-50">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{album.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                        <ImageIcon className="w-3.5 h-3.5" />
                        {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedAlbum(isExpanded ? null : album.id)}
                    >
                      {isExpanded ? 'Collapse' : 'Manage Photos'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<TrashIcon className="w-4 h-4" />}
                      onClick={() => handleDeleteAlbum(album.id, album.title)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardBody className="bg-white">
                    <AlbumPhotoManager album={album} brandId={brandId} />
                  </CardBody>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlbumsManager;
