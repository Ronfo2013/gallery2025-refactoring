/**
 * Landing Page Editor - Unified Component
 *
 * Allows SuperAdmin to customize all aspects of the landing page.
 */

import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Plus, Trash2, Save, Upload, GripVertical } from 'lucide-react';
import { LandingPageSettings, LandingFeatureItem, LandingPricingPlan } from '../../types';
import {
  updateLandingPageSettings,
  uploadLandingImage,
  getLandingPageSettings,
  getDefaultLandingPageSettings,
} from '../../services/platform/landingPageService';
import { auth } from '../../firebaseConfig';
import toast from 'react-hot-toast';
import { logger } from '@/utils/logger';

export interface LandingPageEditorHandle {
  save: () => Promise<void>;
  isSaving: boolean;
}

type LandingPageEditorProps = {};

const LandingPageEditorComponent: React.ForwardRefRenderFunction<
  LandingPageEditorHandle,
  LandingPageEditorProps
> = (_props, ref) => {
  const [settings, setSettings] = useState<LandingPageSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<
    'hero' | 'features' | 'gallery' | 'pricing' | 'footer' | 'branding' | 'seo'
  >('hero');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      let data = await getLandingPageSettings();
      if (!data) {
        // Initialize with defaults
        data = getDefaultLandingPageSettings();
      }
      setSettings(data);
    } catch (error: any) {
      logger.error('Error loading settings:', error);
      toast.error('Failed to load landing page settings');
      // Fallback to defaults
      setSettings(getDefaultLandingPageSettings());
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings || !auth.currentUser) {
      toast.error('You must be logged in to save');
      return;
    }

    try {
      setSaving(true);
      await updateLandingPageSettings(settings, auth.currentUser.uid);
      toast.success('Landing page updated successfully!');
    } catch (error: any) {
      logger.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  useImperativeHandle(
    ref,
    () => ({
      save: handleSave,
      isSaving: saving,
    }),
    [handleSave, saving]
  );

  const handleImageUpload = async (
    file: File,
    field: keyof LandingPageSettings,
    pathKey?: string
  ) => {
    try {
      const timestamp = Date.now();
      const path = `${field}-${timestamp}-${file.name}`;

      toast.loading('Uploading image...');
      const { url, path: storagePath } = await uploadLandingImage(file, path);

      setSettings((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          ...prev,
          [field]: {
            ...(prev[field] as any),
            ...(pathKey ? { [pathKey]: storagePath } : {}),
            ...(field === 'branding' && pathKey === 'logo'
              ? { logo: url, logoPath: storagePath }
              : field === 'hero' && pathKey === 'backgroundImage'
                ? { backgroundImage: url, backgroundImagePath: storagePath }
                : field === 'seo' && pathKey === 'ogImage'
                  ? { ogImage: url, ogImagePath: storagePath }
                  : {}),
          },
        };
      });

      toast.dismiss();
      toast.success('Image uploaded!');
    } catch (error: any) {
      toast.dismiss();
      toast.error('Failed to upload image');
      logger.error('Upload error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div
          className="spinner spinner-lg"
          style={{ borderTopColor: 'var(--admin-accent, #60a5fa)' }}
        ></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Failed to load settings</p>
      </div>
    );
  }

  const sections = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'features', label: 'Features' },
    { id: 'gallery', label: 'Gallery Demo' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'footer', label: 'Footer' },
    { id: 'branding', label: 'Branding' },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Landing Page Editor</h2>
          <p className="text-gray-400">Customize your landing page</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary flex items-center gap-2 hover-lift"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id as any)}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
              activeSection === section.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Editor Content */}
      <div className="card p-8">
        {/* Hero Section Editor */}
        {activeSection === 'hero' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Hero Section</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={settings.hero.title}
                onChange={(e) =>
                  setSettings({ ...settings, hero: { ...settings.hero, title: e.target.value } })
                }
                className="admin-input w-full"
                placeholder="Main headline"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
              <textarea
                value={settings.hero.subtitle}
                onChange={(e) =>
                  setSettings({ ...settings, hero: { ...settings.hero, subtitle: e.target.value } })
                }
                className="admin-input w-full"
                rows={3}
                placeholder="Supporting text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CTA Text</label>
                <input
                  type="text"
                  value={settings.hero.ctaText}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      hero: { ...settings.hero, ctaText: e.target.value },
                    })
                  }
                  className="admin-input w-full"
                  placeholder="Get Started"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">CTA URL</label>
                <input
                  type="text"
                  value={settings.hero.ctaUrl}
                  onChange={(e) =>
                    setSettings({ ...settings, hero: { ...settings.hero, ctaUrl: e.target.value } })
                  }
                  className="admin-input w-full"
                  placeholder="#pricing"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Image
              </label>
              <div className="flex items-center gap-4">
                {settings.hero.backgroundImage && (
                  <img
                    src={settings.hero.backgroundImage}
                    alt="Hero background"
                    className="w-32 h-32 object-cover rounded-lg"
                  />
                )}
                <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
                  <Upload size={20} />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'hero', 'backgroundImage');
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Features Section Editor */}
        {activeSection === 'features' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Features</h3>
              <button
                onClick={() => {
                  const newFeature: LandingFeatureItem = {
                    id: Date.now().toString(),
                    icon: '✨',
                    title: 'New Feature',
                    description: 'Feature description',
                    order: settings.features.items.length + 1,
                  };
                  setSettings({
                    ...settings,
                    features: {
                      ...settings.features,
                      items: [...settings.features.items, newFeature],
                    },
                  });
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Feature
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Section Title</label>
              <input
                type="text"
                value={settings.features.title}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: { ...settings.features, title: e.target.value },
                  })
                }
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Subtitle
              </label>
              <input
                type="text"
                value={settings.features.subtitle}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    features: { ...settings.features, subtitle: e.target.value },
                  })
                }
                className="admin-input w-full"
              />
            </div>

            <div className="space-y-4">
              {settings.features.items
                .sort((a, b) => a.order - b.order)
                .map((feature) => (
                  <div key={feature.id} className="p-4 bg-gray-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GripVertical size={20} className="text-gray-500" />
                        <span className="text-gray-400 text-sm">Feature #{feature.order}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSettings({
                            ...settings,
                            features: {
                              ...settings.features,
                              items: settings.features.items.filter((f) => f.id !== feature.id),
                            },
                          });
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          Icon (emoji or text)
                        </label>
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => {
                            const updated = settings.features.items.map((f) =>
                              f.id === feature.id ? { ...f, icon: e.target.value } : f
                            );
                            setSettings({
                              ...settings,
                              features: { ...settings.features, items: updated },
                            });
                          }}
                          className="admin-input w-full text-center text-2xl"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">Title</label>
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const updated = settings.features.items.map((f) =>
                              f.id === feature.id ? { ...f, title: e.target.value } : f
                            );
                            setSettings({
                              ...settings,
                              features: { ...settings.features, items: updated },
                            });
                          }}
                          className="admin-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Description</label>
                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const updated = settings.features.items.map((f) =>
                            f.id === feature.id ? { ...f, description: e.target.value } : f
                          );
                          setSettings({
                            ...settings,
                            features: { ...settings.features, items: updated },
                          });
                        }}
                        className="admin-input w-full"
                        rows={2}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Gallery Section Editor */}
        {activeSection === 'gallery' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Gallery Demo / Preview</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.gallery?.enabled ?? false}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      gallery: {
                        ...(settings.gallery || {
                          title: 'Guarda Come Funziona',
                          subtitle: 'Una gallery professionale pronta in pochi minuti',
                          style: 'live-demo',
                          demoImages: [],
                        }),
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="w-5 h-5 rounded"
                />
                <span className="text-gray-300">Mostra sezione Gallery</span>
              </label>
            </div>

            {settings.gallery?.enabled && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={settings.gallery.title}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          gallery: { ...settings.gallery!, title: e.target.value },
                        })
                      }
                      className="admin-input w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={settings.gallery.subtitle}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          gallery: { ...settings.gallery!, subtitle: e.target.value },
                        })
                      }
                      className="admin-input w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Display Style
                  </label>
                  <select
                    value={settings.gallery.style}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gallery: { ...settings.gallery!, style: e.target.value as any },
                      })
                    }
                    className="admin-input w-full"
                  >
                    <option value="mockup">📸 Mockup/Screenshot (statico)</option>
                    <option value="live-demo">🖼️ Live Demo Gallery (interattiva)</option>
                    <option value="both">🎨 Entrambi (mockup + demo)</option>
                  </select>
                </div>

                {/* Mockup Upload */}
                {(settings.gallery.style === 'mockup' || settings.gallery.style === 'both') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Mockup/Screenshot Image
                    </label>
                    <div className="flex items-center gap-4">
                      {settings.gallery.mockupImage && (
                        <img
                          src={settings.gallery.mockupImage}
                          alt="Mockup"
                          className="w-48 h-auto rounded-lg border border-gray-600"
                        />
                      )}
                      <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
                        <Upload size={20} />
                        Upload Mockup
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImageUpload(file, 'gallery', 'mockupImage');
                            }
                          }}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Screenshot della gallery per mostrare il prodotto. Consigliato: 1920x1080px
                    </p>
                  </div>
                )}

                {/* Demo Images */}
                {(settings.gallery.style === 'live-demo' || settings.gallery.style === 'both') && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-medium text-gray-300">
                        Demo Images (Gallery Interattiva)
                      </label>
                      <button
                        onClick={() => {
                          const newImage = {
                            id: Date.now().toString(),
                            url: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800',
                            title: 'New Image',
                            order: (settings.gallery?.demoImages.length || 0) + 1,
                          };
                          setSettings({
                            ...settings,
                            gallery: {
                              ...settings.gallery!,
                              demoImages: [...(settings.gallery?.demoImages || []), newImage],
                            },
                          });
                        }}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <Plus size={20} />
                        Add Image
                      </button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {settings.gallery?.demoImages
                        .sort((a, b) => a.order - b.order)
                        .map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full aspect-square object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                              <input
                                type="text"
                                value={image.title}
                                onChange={(e) => {
                                  const updated = settings.gallery!.demoImages.map((img) =>
                                    img.id === image.id ? { ...img, title: e.target.value } : img
                                  );
                                  setSettings({
                                    ...settings,
                                    gallery: { ...settings.gallery!, demoImages: updated },
                                  });
                                }}
                                className="admin-input w-full text-xs"
                                placeholder="Title"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <input
                                type="url"
                                value={image.url}
                                onChange={(e) => {
                                  const updated = settings.gallery!.demoImages.map((img) =>
                                    img.id === image.id ? { ...img, url: e.target.value } : img
                                  );
                                  setSettings({
                                    ...settings,
                                    gallery: { ...settings.gallery!, demoImages: updated },
                                  });
                                }}
                                className="admin-input w-full text-xs"
                                placeholder="Image URL"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <button
                                onClick={() => {
                                  setSettings({
                                    ...settings,
                                    gallery: {
                                      ...settings.gallery!,
                                      demoImages: settings.gallery!.demoImages.filter(
                                        (img) => img.id !== image.id
                                      ),
                                    },
                                  });
                                }}
                                className="text-red-400 hover:text-red-300 text-sm"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Aggiungi 6-12 immagini esempio. Usa URL diretti o Unsplash
                      (https://images.unsplash.com/...)
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Pricing Section Editor */}
        {activeSection === 'pricing' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold text-white">Pricing Plans</h3>
              <button
                onClick={() => {
                  const newPlan: LandingPricingPlan = {
                    id: Date.now().toString(),
                    name: 'New Plan',
                    price: 99,
                    currency: 'EUR',
                    interval: 'one-time',
                    features: ['Feature 1', 'Feature 2'],
                    highlighted: false,
                    ctaText: 'Get Started',
                    stripeProductId: '',
                    stripePriceId: '',
                    order: settings.pricing.plans.length + 1,
                  };
                  setSettings({
                    ...settings,
                    pricing: { ...settings.pricing, plans: [...settings.pricing.plans, newPlan] },
                  });
                }}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Plan
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Section Title
                </label>
                <input
                  type="text"
                  value={settings.pricing.title}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, title: e.target.value },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Section Subtitle
                </label>
                <input
                  type="text"
                  value={settings.pricing.subtitle}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      pricing: { ...settings.pricing, subtitle: e.target.value },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>
            </div>

            <div className="space-y-4">
              {settings.pricing.plans
                .sort((a, b) => a.order - b.order)
                .map((plan) => (
                  <div key={plan.id} className="p-4 bg-gray-800 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <GripVertical size={20} className="text-gray-500" />
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => {
                            const updated = settings.pricing.plans.map((p) =>
                              p.id === plan.id ? { ...p, name: e.target.value } : p
                            );
                            setSettings({
                              ...settings,
                              pricing: { ...settings.pricing, plans: updated },
                            });
                          }}
                          className="admin-input flex-1 font-bold"
                        />
                        <label className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={plan.highlighted}
                            onChange={(e) => {
                              const updated = settings.pricing.plans.map((p) =>
                                p.id === plan.id ? { ...p, highlighted: e.target.checked } : p
                              );
                              setSettings({
                                ...settings,
                                pricing: { ...settings.pricing, plans: updated },
                              });
                            }}
                            className="rounded"
                          />
                          Highlighted
                        </label>
                      </div>
                      <button
                        onClick={() => {
                          setSettings({
                            ...settings,
                            pricing: {
                              ...settings.pricing,
                              plans: settings.pricing.plans.filter((p) => p.id !== plan.id),
                            },
                          });
                        }}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Price</label>
                        <input
                          type="number"
                          value={plan.price}
                          onChange={(e) => {
                            const updated = settings.pricing.plans.map((p) =>
                              p.id === plan.id ? { ...p, price: Number(e.target.value) } : p
                            );
                            setSettings({
                              ...settings,
                              pricing: { ...settings.pricing, plans: updated },
                            });
                          }}
                          className="admin-input w-full"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Currency</label>
                        <select
                          value={plan.currency}
                          onChange={(e) => {
                            const updated = settings.pricing.plans.map((p) =>
                              p.id === plan.id ? { ...p, currency: e.target.value } : p
                            );
                            setSettings({
                              ...settings,
                              pricing: { ...settings.pricing, plans: updated },
                            });
                          }}
                          className="admin-input w-full"
                        >
                          <option value="EUR">EUR</option>
                          <option value="USD">USD</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Interval</label>
                        <select
                          value={plan.interval}
                          onChange={(e) => {
                            const updated = settings.pricing.plans.map((p) =>
                              p.id === plan.id ? { ...p, interval: e.target.value as any } : p
                            );
                            setSettings({
                              ...settings,
                              pricing: { ...settings.pricing, plans: updated },
                            });
                          }}
                          className="admin-input w-full"
                        >
                          <option value="one-time">One-time</option>
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">CTA Text</label>
                        <input
                          type="text"
                          value={plan.ctaText}
                          onChange={(e) => {
                            const updated = settings.pricing.plans.map((p) =>
                              p.id === plan.id ? { ...p, ctaText: e.target.value } : p
                            );
                            setSettings({
                              ...settings,
                              pricing: { ...settings.pricing, plans: updated },
                            });
                          }}
                          className="admin-input w-full"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-400 mb-1">
                        Features (one per line)
                      </label>
                      <textarea
                        value={plan.features.join('\n')}
                        onChange={(e) => {
                          const updated = settings.pricing.plans.map((p) =>
                            p.id === plan.id
                              ? {
                                  ...p,
                                  features: e.target.value.split('\n').filter((f) => f.trim()),
                                }
                              : p
                          );
                          setSettings({
                            ...settings,
                            pricing: { ...settings.pricing, plans: updated },
                          });
                        }}
                        className="admin-input w-full"
                        rows={4}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Footer Section Editor */}
        {activeSection === 'footer' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Footer</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Company Name</label>
                <input
                  type="text"
                  value={settings.footer.companyName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, companyName: e.target.value },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tagline</label>
                <input
                  type="text"
                  value={settings.footer.tagline}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      footer: { ...settings.footer, tagline: e.target.value },
                    })
                  }
                  className="admin-input w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Copyright</label>
              <input
                type="text"
                value={settings.footer.copyright}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    footer: { ...settings.footer, copyright: e.target.value },
                  })
                }
                className="admin-input w-full"
              />
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Contact Information</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.footer.contact.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: {
                          ...settings.footer,
                          contact: { ...settings.footer.contact, email: e.target.value },
                        },
                      })
                    }
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={settings.footer.contact.phone || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: {
                          ...settings.footer,
                          contact: { ...settings.footer.contact, phone: e.target.value },
                        },
                      })
                    }
                    className="admin-input w-full"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1">Address</label>
                  <input
                    type="text"
                    value={settings.footer.contact.address || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        footer: {
                          ...settings.footer,
                          contact: { ...settings.footer.contact, address: e.target.value },
                        },
                      })
                    }
                    className="admin-input w-full"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Social Links</h4>
              <div className="grid grid-cols-2 gap-4">
                {['facebook', 'instagram', 'twitter', 'linkedin', 'github'].map((platform) => (
                  <div key={platform}>
                    <label className="block text-xs text-gray-400 mb-1 capitalize">
                      {platform}
                    </label>
                    <input
                      type="url"
                      value={(settings.footer.social as any)[platform] || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          footer: {
                            ...settings.footer,
                            social: { ...settings.footer.social, [platform]: e.target.value },
                          },
                        })
                      }
                      className="admin-input w-full"
                      placeholder={`https://${platform}.com/...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Branding Section Editor */}
        {activeSection === 'branding' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">Branding</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Logo</label>
              <div className="flex items-center gap-4">
                {settings.branding?.logo && (
                  <img
                    src={settings.branding?.logo}
                    alt="Logo"
                    className="h-16 object-contain bg-white p-2 rounded"
                  />
                )}
                <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
                  <Upload size={20} />
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'branding', 'logo');
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(['primaryColor', 'secondaryColor', 'accentColor'] as const).map((colorKey) => (
                <div key={colorKey}>
                  <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">
                    {colorKey.replace('Color', ' Color')}
                  </label>
                  <div className="space-y-2">
                    <div
                      className="w-full h-12 rounded-lg border-2 border-gray-600 cursor-pointer"
                      style={{ backgroundColor: settings.branding[colorKey] }}
                      onClick={() => setShowColorPicker(colorKey)}
                    />
                    <input
                      type="text"
                      value={settings.branding[colorKey]}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          branding: { ...settings.branding, [colorKey]: e.target.value },
                        })
                      }
                      className="admin-input w-full text-center"
                    />
                    {showColorPicker === colorKey && (
                      <div className="relative">
                        <div className="absolute z-10 mt-2">
                          <div className="fixed inset-0" onClick={() => setShowColorPicker(null)} />
                          <div className="relative">
                            <HexColorPicker
                              color={settings.branding[colorKey]}
                              onChange={(color) =>
                                setSettings({
                                  ...settings,
                                  branding: { ...settings.branding, [colorKey]: color },
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Section Editor */}
        {activeSection === 'seo' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-white mb-4">SEO Settings</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Meta Title</label>
              <input
                type="text"
                value={settings.seo.title}
                onChange={(e) =>
                  setSettings({ ...settings, seo: { ...settings.seo, title: e.target.value } })
                }
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Meta Description
              </label>
              <textarea
                value={settings.seo.description}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: { ...settings.seo, description: e.target.value },
                  })
                }
                className="admin-input w-full"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Keywords (comma-separated)
              </label>
              <input
                type="text"
                value={settings.seo.keywords.join(', ')}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    seo: {
                      ...settings.seo,
                      keywords: e.target.value.split(',').map((k) => k.trim()),
                    },
                  })
                }
                className="admin-input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">OG Image</label>
              <div className="flex items-center gap-4">
                {settings.seo.ogImage && (
                  <img src={settings.seo.ogImage} alt="OG" className="w-48 h-auto rounded-lg" />
                )}
                <label className="btn btn-secondary cursor-pointer flex items-center gap-2">
                  <Upload size={20} />
                  Upload OG Image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, 'seo', 'ogImage');
                      }
                    }}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-2">Recommended: 1200x630px</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const LandingPageEditor = forwardRef<LandingPageEditorHandle, LandingPageEditorProps>(
  LandingPageEditorComponent
);

LandingPageEditor.displayName = 'LandingPageEditor';
