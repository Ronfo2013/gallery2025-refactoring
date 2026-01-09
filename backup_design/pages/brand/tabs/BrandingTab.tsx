/**
 * Branding Tab - Professional brand customization with live preview
 */

import React, { useState, useRef } from 'react';
import { useAppContext } from '../../../contexts/AppContext';
import { updateBrandBranding } from '../../../services/brand/brandService';
import { storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Card, CardHeader, CardBody, Button, Input } from '../../../src/components/ui';
import { PaletteIcon, UploadIcon, EyeIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Brand } from '../../../types';

interface BrandingTabProps {
  brand: Brand;
}

const BrandingTab: React.FC<BrandingTabProps> = ({ brand }) => {
  const { updateSiteSettings } = useAppContext();

  const [branding, setBranding] = useState(
    brand.branding || {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
    }
  );

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(brand.branding?.logo || null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be smaller than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Saving branding...');

    try {
      // Handle logo upload if new file selected
      const logoFile = logoInputRef.current?.files?.[0];
      const finalBranding = { ...branding };

      if (logoFile) {
        const logoPath = `brands/${brand.id}/logos/${Date.now()}-${logoFile.name}`;
        const logoRef = ref(storage, logoPath);

        await uploadBytes(logoRef, logoFile);
        const logoUrl = await getDownloadURL(logoRef);

        finalBranding.logo = logoUrl;
        finalBranding.logoPath = logoPath;

        // Update site settings with new logo
        await updateSiteSettings({ logoUrl, logoPath });
      }

      // Update branding in Firestore
      await updateBrandBranding(brand.id, finalBranding);

      toast.success('Branding updated successfully!', { id: loadingToast });

      // Reload to apply CSS variables
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update branding', { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 slide-up">
      {/* Header */}
      <div>
        <h2 className="heading-lg text-gray-900 flex items-center gap-3">
          <PaletteIcon className="w-8 h-8" />
          Brand Customization
        </h2>
        <p className="text-muted body-sm mt-1">Customize your gallery's appearance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Card */}
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-gray-900">Brand Settings</h3>
          </CardHeader>
          <CardBody className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Brand Logo</label>

              {logoPreview && (
                <div className="mb-4">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-24 w-24 rounded-xl object-cover border-2 border-gray-200 shadow-sm"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label htmlFor="logo-upload">
                  <div className="btn btn-outline btn-md cursor-pointer inline-flex items-center gap-2">
                    <UploadIcon className="w-4 h-4" />
                    {logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </div>
                </label>
                <p className="text-xs text-gray-500">
                  Recommended: Square image, at least 200x200px (Max 5MB)
                </p>
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Primary Color</label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300 shadow-sm"
                  />
                </div>
                <Input
                  type="text"
                  value={branding.primaryColor}
                  onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                  placeholder="#3b82f6"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Used for buttons, links, and accents</p>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Secondary Color
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300 shadow-sm"
                  />
                </div>
                <Input
                  type="text"
                  value={branding.secondaryColor}
                  onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                  placeholder="#8b5cf6"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Used for secondary elements</p>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Background Color
              </label>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={branding.backgroundColor}
                    onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                    className="h-12 w-20 rounded-lg cursor-pointer border-2 border-gray-300 shadow-sm"
                  />
                </div>
                <Input
                  type="text"
                  value={branding.backgroundColor}
                  onChange={(e) => setBranding({ ...branding, backgroundColor: e.target.value })}
                  placeholder="#ffffff"
                  className="flex-1 font-mono"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Gallery background color</p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleSaveBranding}
                disabled={isSaving}
                loading={isSaving}
                className="w-full"
              >
                {isSaving ? 'Saving...' : 'Save Branding'}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Page will reload automatically to apply changes
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Live Preview Card */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
            <EyeIcon className="w-5 h-5 text-gray-400" />
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Preview Container */}
              <div
                className="p-8 rounded-xl border-2 transition-all duration-300"
                style={{
                  backgroundColor: branding.backgroundColor,
                  borderColor: branding.primaryColor,
                }}
              >
                {/* Logo & Brand Name */}
                <div className="flex items-center gap-4 mb-6">
                  {logoPreview && (
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="h-16 w-16 rounded-lg object-cover shadow-md"
                    />
                  )}
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
                      {brand.name}
                    </h3>
                    <p className="text-sm opacity-70" style={{ color: branding.primaryColor }}>
                      www.clubgallery.com/{brand.slug}
                    </p>
                  </div>
                </div>

                {/* Button Preview */}
                <div className="space-y-3">
                  <button
                    className="px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105 shadow-md"
                    style={{
                      backgroundColor: branding.primaryColor,
                      color: '#ffffff',
                    }}
                  >
                    Primary Button
                  </button>

                  <button
                    className="px-6 py-3 rounded-lg font-medium transition-transform hover:scale-105 shadow-md"
                    style={{
                      backgroundColor: branding.secondaryColor,
                      color: '#ffffff',
                    }}
                  >
                    Secondary Button
                  </button>
                </div>

                {/* Card Preview */}
                <div className="mt-6 p-4 rounded-lg bg-white bg-opacity-50 backdrop-blur-sm">
                  <div
                    className="w-full h-32 rounded-lg mb-3"
                    style={{ backgroundColor: branding.primaryColor + '20' }}
                  />
                  <div
                    className="h-4 rounded mb-2"
                    style={{ backgroundColor: branding.primaryColor + '30', width: '70%' }}
                  />
                  <div
                    className="h-3 rounded"
                    style={{ backgroundColor: branding.secondaryColor + '20', width: '40%' }}
                  />
                </div>
              </div>

              {/* Preview Info */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>💡 Tip:</strong> This preview shows how your brand colors will appear on
                  your public gallery. Make sure there's good contrast for readability.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default BrandingTab;
