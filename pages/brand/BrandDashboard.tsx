/**
 * Brand Dashboard - MVP Simplified
 * 
 * Unified dashboard for brand owners to:
 * - Manage albums and photos
 * - Customize branding (colors, logo)
 * - View settings
 * 
 * Simplified from AdminPanel for multi-brand MVP
 */

import React, { useState, useRef } from 'react';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import { useAppContext } from '../../context/AppContext';
import { useBrand } from '../../contexts/BrandContext';
import { updateBrandBranding } from '../../services/brand/brandService';
import { storage } from '../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import AlbumPhotoManager from '../../components/AlbumPhotoManager';

type TabType = 'albums' | 'branding' | 'settings';

const BrandDashboard: React.FC = () => {
  const { isAuthenticated, logout } = useFirebaseAuth();
  const { brand, refreshBrand } = useBrand();
  const {
    albums,
    siteSettings,
    addAlbum,
    deleteAlbum,
    updateSiteSettings,
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<TabType>('albums');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

  // Branding state
  const [branding, setBranding] = useState(brand?.branding || {
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    backgroundColor: '#ffffff',
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Check authentication
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold text-white mb-4">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please login to access the dashboard.</p>
          <a
            href="#/admin"
            className="block w-full py-3 bg-blue-600 text-white rounded-lg text-center font-bold hover:bg-blue-700 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Check if brand loaded
  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading brand...</p>
        </div>
      </div>
    );
  }

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlbumTitle.trim()) return;

    setIsCreatingAlbum(true);
    try {
      await addAlbum(newAlbumTitle);
      setNewAlbumTitle('');
      alert('✅ Album created successfully!');
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsCreatingAlbum(false);
    }
  };

  const handleDeleteAlbum = async (albumId: string, albumTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${albumTitle}"? This will delete all photos in this album.`)) {
      return;
    }

    try {
      await deleteAlbum(albumId);
      alert('✅ Album deleted successfully!');
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleSaveBranding = async () => {
    if (!brand) return;

    setIsSavingBranding(true);
    try {
      // Handle logo upload if file selected
      const logoFile = logoInputRef.current?.files?.[0];
      if (logoFile) {
        const logoPath = `brands/${brand.id}/logos/${Date.now()}-${logoFile.name}`;
        const logoRef = ref(storage, logoPath);
        await uploadBytes(logoRef, logoFile);
        const logoUrl = await getDownloadURL(logoRef);

        branding.logo = logoUrl;
        branding.logoPath = logoPath;
      }

      // Update branding in Firestore
      await updateBrandBranding(brand.id, branding);

      // Also update site settings logo if changed
      if (branding.logo) {
        await updateSiteSettings({ logoUrl: branding.logo, logoPath: branding.logoPath });
      }

      // Refresh brand to get updated data
      await refreshBrand();

      alert('✅ Branding updated! Page will reload to apply changes.');
      window.location.reload();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsSavingBranding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {brand.branding.logo && (
                <img
                  src={brand.branding.logo}
                  alt={brand.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl font-bold text-white">{brand.name}</h1>
                <p className="text-sm text-gray-400">{brand.subdomain}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a
                href={`https://${brand.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 transition text-sm"
              >
                View Gallery →
              </a>
              <button
                onClick={logout}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {(['albums', 'branding', 'settings'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium transition capitalize ${
                  activeTab === tab
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Albums Tab */}
        {activeTab === 'albums' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Manage Albums</h2>
              <form onSubmit={handleCreateAlbum} className="flex gap-2">
                <input
                  type="text"
                  value={newAlbumTitle}
                  onChange={(e) => setNewAlbumTitle(e.target.value)}
                  placeholder="New album name"
                  disabled={isCreatingAlbum}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isCreatingAlbum || !newAlbumTitle.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingAlbum ? 'Creating...' : 'Create Album'}
                </button>
              </form>
            </div>

            {albums.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📸</div>
                <h3 className="text-xl font-bold text-white mb-2">No Albums Yet</h3>
                <p className="text-gray-400 mb-6">Create your first album to get started</p>
              </div>
            ) : (
              <div className="space-y-6">
                {albums.map((album) => (
                  <div key={album.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{album.title}</h3>
                        <p className="text-sm text-gray-400">{album.photos.length} photos</p>
                      </div>
                      <button
                        onClick={() => handleDeleteAlbum(album.id, album.title)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
                      >
                        Delete Album
                      </button>
                    </div>
                    <AlbumPhotoManager album={album} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">Customize Branding</h2>

            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">
              {/* Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Brand Logo
                </label>
                {brand.branding.logo && (
                  <div className="mb-4">
                    <img
                      src={brand.branding.logo}
                      alt="Current logo"
                      className="h-20 w-20 rounded-lg object-cover border-2 border-gray-700"
                    />
                  </div>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">Recommended: Square image, at least 200x200px</p>
              </div>

              {/* Primary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-700"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Secondary Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-700"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="color"
                    value={branding.backgroundColor}
                    onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                    className="h-12 w-24 rounded-lg cursor-pointer border-2 border-gray-700"
                  />
                  <input
                    type="text"
                    value={branding.backgroundColor}
                    onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Preview
                </label>
                <div
                  className="p-6 rounded-lg border-2"
                  style={{
                    backgroundColor: branding.backgroundColor,
                    borderColor: branding.primaryColor,
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {brand.branding.logo && (
                      <div
                        className="h-12 w-12 rounded-lg"
                        style={{ backgroundColor: branding.primaryColor }}
                      />
                    )}
                    <h3 style={{ color: branding.primaryColor }} className="text-2xl font-bold">
                      {brand.name}
                    </h3>
                  </div>
                  <button
                    className="px-6 py-3 rounded-lg font-medium"
                    style={{
                      backgroundColor: branding.primaryColor,
                      color: '#ffffff',
                    }}
                  >
                    Primary Button
                  </button>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  onClick={handleSaveBranding}
                  disabled={isSavingBranding}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingBranding ? 'Saving...' : 'Save Branding'}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Page will reload after saving to apply changes
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>

            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Brand Name</label>
                <input
                  type="text"
                  value={brand.name}
                  disabled
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">Contact support to change brand name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subdomain</label>
                <input
                  type="text"
                  value={brand.subdomain}
                  disabled
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subscription Status</label>
                <span
                  className={`inline-block px-4 py-2 rounded-lg font-medium ${
                    brand.subscription.status === 'active'
                      ? 'bg-green-600 text-white'
                      : 'bg-red-600 text-white'
                  }`}
                >
                  {brand.subscription.status.toUpperCase()}
                </span>
                {brand.subscription.currentPeriodEnd && (
                  <p className="text-sm text-gray-400 mt-2">
                    Renews on: {new Date(brand.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Owner Email</label>
                <input
                  type="email"
                  value={brand.ownerEmail}
                  disabled
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BrandDashboard;

