/**
 * Brand Selector Component
 *
 * Allows superusers who manage multiple brands to switch between them.
 * Shows a dropdown with all brands accessible to the current user.
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Check } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Brand } from '../../types';
import toast from 'react-hot-toast';

interface BrandSelectorProps {
  currentBrandId: string | null;
  userBrandIds: string[];
  onBrandChange: (brandId: string) => void;
}

export const BrandSelector: React.FC<BrandSelectorProps> = ({
  currentBrandId,
  userBrandIds,
  onBrandChange,
}) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadBrands();
  }, [userBrandIds]);

  const loadBrands = async () => {
    if (userBrandIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Fetch all brands for this user
      // Firestore 'in' query supports max 10 items, so batch if needed
      const brandPromises = userBrandIds.map(async (brandId) => {
        const brandDoc = await getDocs(query(collection(db, 'brands'), where('id', '==', brandId)));
        if (!brandDoc.empty) {
          return { id: brandDoc.docs[0].id, ...brandDoc.docs[0].data() } as Brand;
        }
        return null;
      });

      const brandsData = (await Promise.all(brandPromises)).filter((b): b is Brand => b !== null);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Errore nel caricamento dei brand');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBrand = (brandId: string) => {
    if (brandId === currentBrandId) {
      setIsOpen(false);
      return;
    }

    onBrandChange(brandId);
    setIsOpen(false);
    toast.success(`Switched to ${brands.find((b) => b.id === brandId)?.name || 'brand'}`);
  };

  // Don't show selector if user has only one brand
  if (userBrandIds.length <= 1) {
    return null;
  }

  const currentBrand = brands.find((b) => b.id === currentBrandId);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg">
        <Building2 className="w-5 h-5 text-gray-400 animate-pulse" />
        <span className="text-gray-400">Loading brands...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors min-w-[220px]"
      >
        <Building2 className="w-5 h-5 text-blue-400" />
        <div className="flex-1 text-left">
          <div className="text-sm text-gray-400">Current Brand</div>
          <div className="font-semibold text-gray-100">{currentBrand?.name || 'Select Brand'}</div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Dropdown Menu */}
          <div className="absolute top-full left-0 mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
            <div className="py-2">
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => handleSelectBrand(brand.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-700 transition-colors ${
                    brand.id === currentBrandId ? 'bg-slate-700/50' : ''
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: brand.branding?.primaryColor || '#3b82f6' }}
                  >
                    {brand.id === currentBrandId && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-gray-100">{brand.name}</div>
                    <div className="text-xs text-gray-400">{brand.subdomain}</div>
                  </div>
                  {brand.status !== 'active' && (
                    <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">
                      {brand.status}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-700 px-4 py-2 bg-slate-900">
              <div className="text-xs text-gray-500">
                Managing {brands.length} brand{brands.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
