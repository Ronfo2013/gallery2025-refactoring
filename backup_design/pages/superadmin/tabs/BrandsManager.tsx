/**
 * Brands Manager - SuperAdmin Tab
 *
 * Allows SuperAdmin to:
 * - View all brands
 * - Create new brands
 * - Delete brands
 * - View brand details and status
 */

import { logger } from '@/utils/logger';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';
import {
  CheckCircle,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Mail,
  Plus,
  Trash2,
  User,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { db } from '../../../firebaseConfig';
import { createBrandSuperuser } from '../../../services/platform/platformService';
import { Brand } from '../../../types';

const BrandsManager: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [createdBrand, setCreatedBrand] = useState<{
    brand: Brand;
    password: string;
    isNewUser?: boolean;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Create brand form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    email: '',
    phone: '',
    address: '',
    primaryColor: '#3b82f6',
    secondaryColor: '#8b5cf6',
    accentColor: '#10b981',
  });

  const formatDashboardUrl = (brand: Brand) => {
    const slug = brand.slug?.trim() || 'dashboard';
    return `${window.location.origin}/${slug}`;
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const brandsRef = collection(db, 'brands');
      const snapshot = await getDocs(brandsRef);

      const brandsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      })) as Brand[];

      // Sort by creation date (newest first)
      brandsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      setBrands(brandsData);
    } catch (error) {
      logger.error('Error loading brands:', error);
      toast.error('Errore nel caricamento dei brand');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Nome brand obbligatorio');
      return;
    }
    if (!formData.slug.trim()) {
      toast.error('Slug obbligatorio');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email obbligatoria');
      return;
    }

    // Check if slug is already taken
    const existingBrand = brands.find((b) => b.slug === formData.slug);
    if (existingBrand) {
      toast.error(`Slug "${formData.slug}" già in uso`);
      return;
    }

    const loadingToast = toast.loading('Creazione brand e utente in corso...');

    try {
      const brandsRef = collection(db, 'brands');

      // 1. Create brand document
      const newBrandData = {
        name: formData.name.trim(),
        slug: formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        subdomain: `${formData.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-')}.clubgallery.com`,
        status: 'active',
        ownerEmail: formData.email.trim(),
        phone: formData.phone.trim() || '',
        address: formData.address.trim() || '',
        branding: {
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor,
          accentColor: formData.accentColor,
          backgroundColor: '#ffffff',
        },
        subscription: {
          status: 'active',
          stripeCustomerId: '',
          currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
        seo: {
          metaTitle: formData.name,
          metaDescription: `Photo gallery for ${formData.name}`,
          metaKeywords: 'photo, gallery, photography',
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const brandDocRef = await addDoc(brandsRef, newBrandData);
      const brandId = brandDocRef.id;

      // 2. Create Firebase Auth user and superuser document (or reuse existing)
      const { userId, password, isNewUser } = await createBrandSuperuser(
        formData.email.trim(),
        brandId
      );

      // 3. Update brand with superuser ID
      await updateDoc(doc(db, 'brands', brandId), {
        superuserId: userId,
        updatedAt: serverTimestamp(),
        ...(isNewUser && password
          ? {
              temporaryPassword: password,
            }
          : {}),
      });

      toast.dismiss(loadingToast);

      // Close create modal FIRST
      setShowCreateModal(false);

      // Show success toast
      if (isNewUser) {
        toast.success(`Brand "${formData.name}" creato con successo!\nNuovo utente creato.`);
      } else {
        toast.success(
          `Brand "${formData.name}" creato con successo!\nUtente esistente riutilizzato.`
        );
      }

      // Reset form
      setFormData({
        name: '',
        slug: '',
        email: '',
        phone: '',
        address: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        accentColor: '#10b981',
      });

      // Store created brand data for credentials modal (ALWAYS show it now)
      setCreatedBrand({
        brand: {
          id: brandId,
          ...newBrandData,
          superuserId: userId,
          temporaryPassword: isNewUser && password ? password : undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Brand,
        password: isNewUser ? password : '', // Empty if existing user
        isNewUser, // Add this flag to know if password is valid
      });

      // Reload brands
      loadBrands();
    } catch (error: any) {
      logger.error('Error creating brand:', error);
      toast.dismiss(loadingToast);
      toast.error(`Errore: ${error.message || 'Impossibile creare il brand'}`);
    }
  };

  const handleDeleteBrand = async (brandId: string, brandName: string) => {
    if (
      !confirm(
        `Sei sicuro di voler eliminare il brand "${brandName}"?\n\nQuesta azione è irreversibile e cancellerà anche tutti gli album e le foto associate.`
      )
    ) {
      return;
    }

    try {
      setDeleting(brandId);

      // Delete brand document
      await deleteDoc(doc(db, 'brands', brandId));

      // Note: In production, you should also delete:
      // - All albums in brands/{brandId}/albums
      // - All photos in brands/{brandId}/albums/{albumId}/photos
      // - All files in Firebase Storage for this brand
      // This should be done via Cloud Function for safety

      toast.success(`Brand "${brandName}" eliminato con successo`);

      // Reload brands
      loadBrands();
    } catch (error) {
      logger.error('Error deleting brand:', error);
      toast.error("Errore nell'eliminazione del brand");
    } finally {
      setDeleting(null);
    }
  };

  const togglePasswordVisibility = (brandId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [brandId]: !prev[brandId],
    }));
  };

  const isPasswordVisible = (brandId: string) => !!revealedPasswords[brandId];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'suspended':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Attivo';
      case 'suspended':
        return 'Sospeso';
      case 'pending':
        return 'In attesa';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="spinner spinner-lg mb-4 mx-auto"></div>
          <p className="text-gray-400">Caricamento brand...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Gestione Brand</h2>
          <p className="text-gray-400 mt-1">
            {brands.length} brand{brands.length !== 1 ? 's' : ''} totali
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Nuovo Brand</span>
        </button>
      </div>

      {/* Brands List */}
      <div className="grid gap-4">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-semibold text-gray-100">{brand.name}</h3>
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(brand.status)}
                    <span className="text-sm text-gray-400">{getStatusLabel(brand.status)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <User className="w-4 h-4" />
                    <span className="font-mono">{brand.slug}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span>{brand.ownerEmail}</span>
                  </div>
                </div>
                {brand.temporaryPassword && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    <span>Password temporanea:</span>
                    <button
                      onClick={() => togglePasswordVisibility(brand.id)}
                      className="text-gray-400 hover:text-gray-200 transition-colors"
                      title="Mostra/nascondi password"
                    >
                      {isPasswordVisible(brand.id) ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                    <span className="font-mono text-blue-300">
                      {isPasswordVisible(brand.id) ? brand.temporaryPassword : '••••••••••••••••'}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(brand.temporaryPassword);
                        toast.success('Password copiata!');
                      }}
                      className="p-1 bg-slate-700 rounded-md hover:bg-slate-600 transition"
                      title="Copia password"
                    >
                      <Copy className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-600"
                      style={{ backgroundColor: brand.branding?.primaryColor || '#3b82f6' }}
                      title="Primary Color"
                    />
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-600"
                      style={{ backgroundColor: brand.branding?.secondaryColor || '#8b5cf6' }}
                      title="Secondary Color"
                    />
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-600"
                      style={{ backgroundColor: brand.branding?.accentColor || '#10b981' }}
                      title="Accent Color"
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    Creato: {new Date(brand.createdAt).toLocaleDateString('it-IT')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDeleteBrand(brand.id, brand.name)}
                disabled={deleting === brand.id}
                className="flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                title="Elimina brand"
              >
                <Trash2 className="w-5 h-5" />
                {deleting === brand.id && <span className="text-sm">Eliminazione...</span>}
              </button>
            </div>
          </div>
        ))}

        {brands.length === 0 && (
          <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
            <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">Nessun brand</h3>
            <p className="text-gray-500 mb-4">Crea il primo brand per iniziare</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crea Brand</span>
            </button>
          </div>
        )}
      </div>

      {/* Create Brand Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-100 mb-6">Crea Nuovo Brand</h3>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nome Brand *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Es: Acme Photography"
                  required
                />
              </div>

              {/* Slug (per URL pubblica) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Slug * (solo lettere minuscole, numeri e trattini)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                    })
                  }
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="acme-photo"
                  pattern="[a-z0-9\-]+"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL: https://www.clubgallery.com/{formData.slug || 'iltuo-club'}
                </p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Owner *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="owner@example.com"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Telefono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+39 123 456 7890"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Indirizzo</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Via Example 123, 00100 Roma"
                  rows={2}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Colore Primario
                  </label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Colore Secondario
                  </label>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Colore Accent
                  </label>
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Crea Brand
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal - Show Brand Info & Credentials */}
      {createdBrand && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-green-500 rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <h3 className="text-2xl font-bold text-gray-100">Brand Creato con Successo!</h3>
            </div>

            <div className="space-y-4 mb-6">
              {/* Brand Info Section */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <p className="text-sm font-semibold text-gray-300 mb-3">📋 Informazioni Brand</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Nome:</span>
                    <span className="text-sm font-semibold text-gray-100">
                      {createdBrand.brand.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Slug:</span>
                    <span className="text-sm font-mono text-blue-400">
                      {createdBrand.brand.slug}
                    </span>
                  </div>
                  {createdBrand.brand.phone && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Telefono:</span>
                      <span className="text-sm text-gray-100">{createdBrand.brand.phone}</span>
                    </div>
                  )}
                  {createdBrand.brand.address && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Indirizzo:</span>
                      <span className="text-sm text-gray-100">{createdBrand.brand.address}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Status:</span>
                    <span className="text-sm font-semibold text-green-400">
                      {createdBrand.brand.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gallery URL Section */}
              <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">🌐 URL Gallery Pubblica</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono text-blue-400 flex-1 break-all">
                    https://www.clubgallery.com/{createdBrand.brand.slug}
                  </p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `https://www.clubgallery.com/${createdBrand.brand.slug}`
                      );
                      toast.success('URL copiato!');
                    }}
                    className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                    title="Copia URL"
                  >
                    <Copy className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              {/* Login Credentials Section */}
              <div className="border-t border-slate-700 pt-4">
                <p className="text-sm font-semibold text-gray-300 mb-3">
                  🔐 Credenziali Accesso Dashboard
                </p>

                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-3">
                  <p className="text-sm text-gray-400 mb-2">Email Login</p>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-mono text-gray-100 flex-1">
                      {createdBrand.brand.ownerEmail}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(createdBrand.brand.ownerEmail);
                        toast.success('Email copiata!');
                      }}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Copia email"
                    >
                      <Copy className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>

                {/* Password Section - Show only for new users */}
                {createdBrand.isNewUser && createdBrand.password ? (
                  <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">Password Temporanea</p>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                        title={showPassword ? 'Nascondi password' : 'Mostra password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono text-green-400 flex-1">
                        {showPassword ? createdBrand.password : '••••••••••••••••'}
                      </p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(createdBrand.password);
                          toast.success('Password copiata!');
                        }}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                        title="Copia password"
                      >
                        <Copy className="w-5 h-5 text-gray-300" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4 mb-3">
                    <p className="text-sm text-yellow-300">
                      ⚠️ <strong>Utente Esistente:</strong> Questa email era già registrata.
                      L'utente userà la password che già conosce.
                    </p>
                  </div>
                )}

                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-2">URL Login Dashboard</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-mono text-blue-400 flex-1 break-all">
                      {formatDashboardUrl(createdBrand.brand)}
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(formatDashboardUrl(createdBrand.brand));
                        toast.success('URL copiato!');
                      }}
                      className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                      title="Copia URL"
                    >
                      <Copy className="w-4 h-4 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Warning Section - Only for new users */}
              {createdBrand.isNewUser && createdBrand.password && (
                <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-sm text-blue-300 mb-2">
                    <strong>🔐 Importante:</strong> Salva queste credenziali ora!
                  </p>
                  <p className="text-xs text-blue-200">
                    La password verrà mostrata solo questa volta. Il superuser può accedere alla
                    dashboard del brand con queste credenziali.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {createdBrand.isNewUser && createdBrand.password ? (
                <button
                  onClick={() => {
                    const credentials = `
🏢 BRAND CREATO: ${createdBrand.brand.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Informazioni Brand:
- Nome: ${createdBrand.brand.name}
- Slug: ${createdBrand.brand.slug}
- Status: ${createdBrand.brand.status}
${createdBrand.brand.phone ? `- Telefono: ${createdBrand.brand.phone}` : ''}
${createdBrand.brand.address ? `- Indirizzo: ${createdBrand.brand.address}` : ''}

🌐 Gallery Pubblica:
https://www.clubgallery.com/${createdBrand.brand.slug}

🔐 Credenziali Login Dashboard:
- Email: ${createdBrand.brand.ownerEmail}
- Password: ${createdBrand.password}
- URL Login: ${formatDashboardUrl(createdBrand.brand)}

⚠️ IMPORTANTE: Salva queste credenziali, la password non verrà mostrata di nuovo!
                    `.trim();
                    navigator.clipboard.writeText(credentials);
                    toast.success('Tutte le informazioni copiate negli appunti!');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copia Tutto</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    const info = `
🏢 BRAND CREATO: ${createdBrand.brand.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Informazioni:
- Slug: ${createdBrand.brand.slug}
- Email: ${createdBrand.brand.ownerEmail}
${createdBrand.brand.phone ? `- Telefono: ${createdBrand.brand.phone}` : ''}
${createdBrand.brand.address ? `- Indirizzo: ${createdBrand.brand.address}` : ''}

🌐 Gallery: https://www.clubgallery.com/${createdBrand.brand.slug}
🔐 Login: ${formatDashboardUrl(createdBrand.brand)}
                    `.trim();
                    navigator.clipboard.writeText(info);
                    toast.success('Informazioni copiate!');
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Copy className="w-5 h-5" />
                  <span>Copia Informazioni</span>
                </button>
              )}
              <button
                onClick={() => {
                  setCreatedBrand(null);
                  setShowPassword(false);
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {createdBrand.isNewUser ? 'Ho Salvato le Credenziali' : 'Chiudi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsManager;
