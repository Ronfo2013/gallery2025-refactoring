/**
 * SuperAdmin Panel
 *
 * Dashboard completo per la gestione della piattaforma SaaS:
 * - System Info & Health
 * - SEO Settings (tradizionale + AI search)
 * - Company/Fiscal Data
 * - Stripe Configuration
 * - Analytics & Revenue
 * - Brands Management
 * - Activity Logs
 * - Alerts & Monitoring
 */

import {
  AlertCircleIcon,
  BarChartIcon,
  BuildingIcon,
  CheckCircleIcon,
  CreditCardIcon,
  FileTextIcon,
  HomeIcon,
  SaveIcon,
  SearchIcon,
  SettingsIcon,
  TrendingUpIcon,
  UsersIcon,
  XCircleIcon,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '../../components/AdminLogin';
import GlassAuthLayout from '../../components/layout/GlassAuthLayout';
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth';
import {
  getBrandsStatistics,
  getPlatformSettings,
  getRecentActivityLogs,
  getSystemHealth,
  isSuperAdmin,
  updateAnalytics,
  updatePlatformSettings,
} from '../../services/platform/platformService';
import { Button, Card, CardBody, CardHeader, StatsCard } from '../../src/components/ui';
import { ActivityLog, PlatformSettings, SystemHealth } from '../../types';
import {
  LandingPageEditor,
  LandingPageEditorHandle,
} from '../../components/landing-editor/LandingPageEditor';
import BrandsManager from './tabs/BrandsManager';
import { logger } from '@/utils/logger';

const SuperAdminPanel: React.FC = () => {
  const navigate = useNavigate();

  // Use Firebase Auth hook
  const { isAuthenticated, isLoading: authLoading, login, resetPassword, user } = useFirebaseAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'system' | 'seo' | 'company' | 'stripe' | 'analytics' | 'brands' | 'logs' | 'landing'
  >('system');

  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [brandsStats, setBrandsStats] = useState({ total: 0, active: 0, suspended: 0, pending: 0 });
  const [brandsStatsLoading, setBrandsStatsLoading] = useState(false);
  const [brandsStatsLoaded, setBrandsStatsLoaded] = useState(false);
  const [pricingInputs, setPricingInputs] = useState({ monthlyPrice: '', trialDays: '' });

  useEffect(() => {
    if (activeTab !== 'analytics' && brandsStatsLoaded) {
      setBrandsStatsLoaded(false);
    }
  }, [activeTab, brandsStatsLoaded]);

  // Lazy-load brands stats when needed
  useEffect(() => {
    if (activeTab !== 'analytics' || brandsStatsLoaded || brandsStatsLoading) {
      return;
    }

    let cancelled = false;

    const fetchBrandsStats = async () => {
      try {
        setBrandsStatsLoading(true);
        const statsData = await getBrandsStatistics();
        if (!cancelled) {
          setBrandsStats(statsData);
          setBrandsStatsLoaded(true);
        }
      } catch (error) {
        if (!cancelled) {
        logger.error('Error loading brand stats:', error);
        }
      } finally {
        if (!cancelled) {
          setBrandsStatsLoading(false);
        }
      }
    };

    fetchBrandsStats();

    return () => {
      cancelled = true;
    };
  }, [activeTab, brandsStatsLoaded, brandsStatsLoading]);

  // Load data when authenticated
  useEffect(() => {
    if (authLoading) {
      return;
    }

    const loadData = async () => {
      if (!isAuthenticated || !user) {
        // Not authenticated - AdminLogin component will be shown
        setLoading(false);
        return;
      }

      // Check if user is SuperAdmin
      const isSA = await isSuperAdmin(user.uid);
      if (!isSA) {
        alert('⛔ Accesso negato. Solo SuperAdmin possono accedere a questa pagina.');
        navigate('/');
        return;
      }

      setIsAuthorized(true);

      try {
        // Load all data in parallel (brands stats lazy-loaded in analytics tab)
        const [settingsData, healthData, logsData] = await Promise.all([
          getPlatformSettings(),
          getSystemHealth(),
          getRecentActivityLogs(20),
        ]);

        setSettings(settingsData);
        setPricingInputs({
          monthlyPrice: settingsData.pricing.monthlyPrice.toString(),
          trialDays: (settingsData.pricing.trialDays ?? 0).toString(),
        });
        setSystemHealth(healthData);
        setActivityLogs(logsData);
      } catch (error) {
        logger.error('Error loading data:', error);
        alert('Errore nel caricamento dei dati');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [authLoading, isAuthenticated, user, navigate]);

  const handlePricingInputChange = (field: 'monthlyPrice' | 'trialDays', value: string) => {
    setPricingInputs((prev) => ({ ...prev, [field]: value }));
    setSettings((prev) => {
      if (!prev) {
        return prev;
      }
      const nextPricing = { ...prev.pricing };

      if (value === '') {
        if (field === 'monthlyPrice') {
          nextPricing.monthlyPrice = 0;
        } else {
          nextPricing.trialDays = 0;
        }
        return { ...prev, pricing: nextPricing };
      }

      const parsedValue = field === 'monthlyPrice' ? parseFloat(value) : parseInt(value, 10);
      if (Number.isNaN(parsedValue)) {
        return prev;
      }

      if (field === 'monthlyPrice') {
        nextPricing.monthlyPrice = parsedValue;
      } else {
        nextPricing.trialDays = parsedValue;
      }

      return { ...prev, pricing: nextPricing };
    });
  };

  const landingEditorRef = useRef<LandingPageEditorHandle | null>(null);

  // Save settings
  const handleSaveSettings = async () => {
    if (!settings) {
      return;
    }

    setSaving(true);
    try {
      await updatePlatformSettings(settings);
      await updateAnalytics(); // Update analytics after save
      alert('✅ Impostazioni salvate con successo!');
    } catch (error) {
      logger.error('Error saving settings:', error);
      alert('❌ Errore nel salvataggio');
    } finally {
      setSaving(false);
    }
  };

  // Show login form if not authenticated
  if (!isAuthenticated && !authLoading) {
    return (
      <GlassAuthLayout
        title="SuperAdmin Login"
        subtitle="Autenticati per gestire sistema, SEO, brands e analytics."
      >
        <AdminLogin onLogin={login} onResetPassword={resetPassword} />
      </GlassAuthLayout>
    );
  }

  if (authLoading || loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <div className="text-center animate-scale-in">
          <div
            className="spinner spinner-lg mb-4 mx-auto"
            style={{ borderTopColor: 'var(--admin-accent)' }}
          ></div>
          <p>Loading SuperAdmin Panel...</p>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
        <p className="text-red-400">Error: Unable to load settings</p>
      </div>
    );
  }

  const tabs = [
    { id: 'system', label: 'Sistema', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'landing', label: 'Landing Page', icon: <HomeIcon className="w-4 h-4" /> },
    { id: 'seo', label: 'SEO & AI', icon: <SearchIcon className="w-4 h-4" /> },
    { id: 'company', label: 'Azienda', icon: <BuildingIcon className="w-4 h-4" /> },
    { id: 'stripe', label: 'Stripe', icon: <CreditCardIcon className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChartIcon className="w-4 h-4" /> },
    { id: 'brands', label: 'Brands', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'logs', label: 'Logs', icon: <FileTextIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen relative bg-slate-950 text-slate-50">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-32 h-80 w-80 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="absolute top-40 -left-24 h-72 w-72 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute bottom-[-4rem] right-1/3 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl" />
      </div>

      <div className="relative z-10 p-6 md:p-8 slide-up">
        <div className="container-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="heading-lg mb-2 admin-text">🔐 SuperAdmin Panel</h1>
          <p className="body-lg admin-text-muted">
            Gestione completa della piattaforma {settings.systemName}
          </p>
        </div>

        <div className="rounded-3xl border border-white/15 bg-slate-900/40 backdrop-blur-2xl shadow-[0_20px_80px_rgba(15,23,42,0.9)] p-4 md:p-8">
          {/* System Health Banner */}
          {systemHealth && (
            <Card
              className="mb-8"
              style={{
                backgroundColor:
                  systemHealth.status === 'healthy'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : systemHealth.status === 'degraded'
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${
                  systemHealth.status === 'healthy'
                    ? '#10b981'
                    : systemHealth.status === 'degraded'
                      ? '#f59e0b'
                      : '#ef4444'
                }`,
              }}
            >
              <CardBody>
                <div className="flex items-center gap-4">
                  {systemHealth.status === 'healthy' ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-400" />
                  ) : systemHealth.status === 'degraded' ? (
                    <AlertCircleIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <XCircleIcon className="w-8 h-8 text-red-400" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-2 admin-text">
                      System Status: {systemHealth.status.toUpperCase()}
                    </h3>
                    <div className="flex gap-6 text-sm admin-text-muted">
                      <span>
                        ⏱️ Uptime: <strong>{systemHealth.uptime}%</strong>
                      </span>
                      <span>
                        ⚡ Response: <strong>{systemHealth.responseTime}ms</strong>
                      </span>
                      <span>
                        ❌ Errors: <strong>{systemHealth.errorRate}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Tabs Navigation */}
          <Card className="mb-8 bg-slate-900/80 border border-white/10">
            <CardBody className="p-2">
              <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap hover-lift"
                  style={{
                    backgroundColor: activeTab === tab.id ? '#1e293b' : 'transparent',
                    color: activeTab === tab.id ? '#60a5fa' : '#94a3b8',
                    borderBottom:
                      activeTab === tab.id ? '2px solid #60a5fa' : '2px solid transparent',
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
              </div>
            </CardBody>
          </Card>

          {/* Tab Content */}
          {activeTab === 'system' && (
            <Card className="bg-slate-900/80 border border-white/10">
            <CardHeader>
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-6 h-6 admin-accent" />
                <h2 className="text-2xl font-bold admin-text">Informazioni Sistema</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="admin-label">Nome Sistema</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.systemName}
                    onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Versione</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.systemVersion}
                    onChange={(e) => setSettings({ ...settings, systemVersion: e.target.value })}
                  />
                </div>

                <div>
                  <label className="admin-label">Status Sistema</label>
                  <select
                    className="admin-input"
                    value={settings.systemStatus}
                    onChange={(e) =>
                      setSettings({ ...settings, systemStatus: e.target.value as any })
                    }
                  >
                    <option value="operational">✅ Operational</option>
                    <option value="maintenance">🔧 Maintenance</option>
                    <option value="degraded">⚠️ Degraded</option>
                  </select>
                </div>

                {settings.systemStatus === 'maintenance' && (
                  <div>
                    <label className="admin-label">Messaggio Manutenzione</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={settings.maintenanceMessage || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, maintenanceMessage: e.target.value })
                      }
                      placeholder="Es: Manutenzione programmata fino alle 18:00"
                    />
                  </div>
                )}
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--admin-border)' }}>
                <h3 className="text-lg font-semibold mb-4 admin-text">Feature Flags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowSignup}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, allowSignup: e.target.checked },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span>Permetti nuove registrazioni</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowCustomDomains}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, allowCustomDomains: e.target.checked },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span>Permetti domini custom</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.allowGoogleOAuth}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, allowGoogleOAuth: e.target.checked },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span>Google OAuth per utenti finali</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.features.maintenanceMode}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          features: { ...settings.features, maintenanceMode: e.target.checked },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span className="text-red-400 font-bold">⚠️ Modalità Manutenzione</span>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--admin-border)' }}>
                <h3 className="text-lg font-semibold mb-4 admin-text">Alerts & Notifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="admin-label">Email Notifiche</label>
                    <input
                      type="email"
                      className="admin-input"
                      value={settings.alerts.notificationEmail || ''}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, notificationEmail: e.target.value },
                        })
                      }
                      placeholder="admin@tuodominio.com"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.alerts.emailNotifications}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          alerts: { ...settings.alerts, emailNotifications: e.target.checked },
                        })
                      }
                      className="w-5 h-5"
                    />
                    <span>Abilita notifiche email per errori critici</span>
                  </label>

                  <div className="col-span-2">
                    <div
                      className="rounded-lg p-4"
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid #ef4444',
                      }}
                    >
                      <p className="text-sm admin-text">
                        <strong>Errori Critici:</strong> {settings.alerts.criticalErrors}
                        {settings.alerts.lastErrorTimestamp && (
                          <span className="ml-2">
                            (Ultimo:{' '}
                            {new Date(settings.alerts.lastErrorTimestamp).toLocaleString('it-IT')})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* SEO TAB */}
        {activeTab === 'seo' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <SearchIcon className="w-6 h-6 admin-accent" />
                <h2 className="text-2xl font-bold admin-text">SEO & AI Search Optimization</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="admin-label">Meta Title</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.seo.metaTitle}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, metaTitle: e.target.value },
                      })
                    }
                    maxLength={60}
                  />
                  <p className="text-xs mt-1 admin-text-muted">
                    {settings.seo.metaTitle.length}/60 caratteri
                  </p>
                </div>

                <div>
                  <label className="admin-label">Meta Description</label>
                  <textarea
                    className="admin-input"
                    rows={3}
                    value={settings.seo.metaDescription}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, metaDescription: e.target.value },
                      })
                    }
                    maxLength={160}
                  />
                  <p className="text-xs mt-1 admin-text-muted">
                    {settings.seo.metaDescription.length}/160 caratteri
                  </p>
                </div>

                <div>
                  <label className="admin-label">Meta Keywords (separati da virgola)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.seo.metaKeywords}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, metaKeywords: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">Open Graph Image URL</label>
                  <input
                    type="url"
                    className="admin-input"
                    value={settings.seo.ogImage || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        seo: { ...settings.seo, ogImage: e.target.value },
                      })
                    }
                    placeholder="https://..."
                  />
                </div>

                <div className="border-t pt-4" style={{ borderColor: 'var(--admin-border)' }}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    🤖 AI Search Engine Optimization
                    <label className="flex items-center gap-2 cursor-pointer ml-auto">
                      <input
                        type="checkbox"
                        checked={settings.seo.aiSearchOptimization.enabled}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            seo: {
                              ...settings.seo,
                              aiSearchOptimization: {
                                ...settings.seo.aiSearchOptimization,
                                enabled: e.target.checked,
                              },
                            },
                          })
                        }
                        className="w-5 h-5"
                      />
                      <span className="text-sm">Abilita</span>
                    </label>
                  </h3>

                  {settings.seo.aiSearchOptimization.enabled && (
                    <>
                      <div className="mb-4">
                        <label className="admin-label">
                          Summary per AI (breve descrizione per modelli AI)
                        </label>
                        <textarea
                          className="admin-input"
                          rows={3}
                          value={settings.seo.aiSearchOptimization.summaryText || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              seo: {
                                ...settings.seo,
                                aiSearchOptimization: {
                                  ...settings.seo.aiSearchOptimization,
                                  summaryText: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Descrizione concisa del servizio per AI search engines"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="admin-label">Key Features (uno per riga)</label>
                        <textarea
                          className="admin-input"
                          rows={6}
                          value={settings.seo.aiSearchOptimization.keyFeatures.join('\n')}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              seo: {
                                ...settings.seo,
                                aiSearchOptimization: {
                                  ...settings.seo.aiSearchOptimization,
                                  keyFeatures: e.target.value.split('\n').filter((f) => f.trim()),
                                },
                              },
                            })
                          }
                          placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                        />
                      </div>

                      <div>
                        <label className="admin-label">
                          Target Audience (per AI understanding)
                        </label>
                        <input
                          type="text"
                          className="admin-input"
                          value={settings.seo.aiSearchOptimization.targetAudience || ''}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              seo: {
                                ...settings.seo,
                                aiSearchOptimization: {
                                  ...settings.seo.aiSearchOptimization,
                                  targetAudience: e.target.value,
                                },
                              },
                            })
                          }
                          placeholder="Es: Fotografi professionisti, agenzie fotografiche, brand"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* COMPANY TAB */}
        {activeTab === 'company' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BuildingIcon className="w-6 h-6 admin-accent" />
                <h2 className="text-2xl font-bold admin-text">Dati Azienda / Fiscali</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="admin-label">Ragione Sociale</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.company.name}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, name: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">Partita IVA</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.company.vatNumber || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, vatNumber: e.target.value },
                      })
                    }
                    placeholder="IT12345678901"
                  />
                </div>

                <div>
                  <label className="admin-label">Codice Fiscale</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.company.taxCode || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, taxCode: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">Indirizzo</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.company.address || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, address: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">Città</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.company.city || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, city: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">Paese</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={settings.company.country || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, country: e.target.value },
                      })
                    }
                    placeholder="IT"
                  />
                </div>

                <div>
                  <label className="admin-label">Email Aziendale</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={settings.company.email}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, email: e.target.value },
                      })
                    }
                  />
                </div>

                <div>
                  <label className="admin-label">Telefono</label>
                  <input
                    type="tel"
                    className="admin-input"
                    value={settings.company.phone || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, phone: e.target.value },
                      })
                    }
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="admin-label">PEC (Fatturazione Elettronica)</label>
                  <input
                    type="email"
                    className="admin-input"
                    value={settings.company.pec || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        company: { ...settings.company, pec: e.target.value },
                      })
                    }
                    placeholder="fatture@pec.tuodominio.it"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* STRIPE TAB */}
        {activeTab === 'stripe' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-6 h-6 admin-accent" />
                <h2 className="text-2xl font-bold admin-text">Stripe Configuration</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div
                className="rounded-lg p-4 mb-6"
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid #f59e0b',
                }}
              >
                <p className="text-sm admin-text">
                  ⚠️ <strong>Attenzione:</strong> Modificare questi valori solo se sai cosa stai
                  facendo. Gli ID Stripe devono corrispondere ai prodotti/prezzi configurati nel tuo
                  account Stripe.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="admin-label">Stripe Price ID</label>
                  <input
                    type="text"
                    className="admin-input font-mono text-sm"
                    value={settings.stripe.priceId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, priceId: e.target.value },
                      })
                    }
                    placeholder="price_1ABC123XYZ"
                  />
                  <p className="text-xs mt-1 admin-text-muted">
                    Trovalo in: Stripe Dashboard → Products → Il tuo prodotto → Pricing
                  </p>
                </div>

                <div>
                  <label className="admin-label">Stripe Product ID</label>
                  <input
                    type="text"
                    className="admin-input font-mono text-sm"
                    value={settings.stripe.productId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, productId: e.target.value },
                      })
                    }
                    placeholder="prod_ABC123XYZ"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.stripe.webhookConfigured}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, webhookConfigured: e.target.checked },
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span>✅ Webhook Stripe configurato</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.stripe.testMode}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        stripe: { ...settings.stripe, testMode: e.target.checked },
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span className={settings.stripe.testMode ? 'text-yellow-400' : 'text-green-400'}>
                    {settings.stripe.testMode ? '🧪 Test Mode' : '🚀 Production Mode'}
                  </span>
                </label>
              </div>

              <div className="border-t pt-4" style={{ borderColor: 'var(--admin-border)' }}>
                <h3 className="text-lg font-semibold mb-4 admin-text">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="admin-label">Prezzo Mensile</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={pricingInputs.monthlyPrice}
                      onChange={(e) => handlePricingInputChange('monthlyPrice', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="admin-label">Valuta</label>
                    <select
                      className="admin-input"
                      value={settings.pricing.currency}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          pricing: { ...settings.pricing, currency: e.target.value },
                        })
                      }
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div>
                    <label className="admin-label">Giorni Trial Gratuito</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={pricingInputs.trialDays}
                      onChange={(e) => handlePricingInputChange('trialDays', e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="admin-label">Features Incluse nel Piano</label>
                  <textarea
                    className="admin-input"
                    rows={6}
                    value={settings.pricing.features.join('\n')}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        pricing: {
                          ...settings.pricing,
                          features: e.target.value.split('\n').filter((f) => f.trim()),
                        },
                      })
                    }
                    placeholder="Una feature per riga"
                  />
                  <p className="text-xs mt-1 admin-text-muted">
                    Una feature per riga. Verranno mostrate nella landing page.
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <BarChartIcon className="w-6 h-6 admin-accent" />
                <h2 className="text-2xl font-bold admin-text">Analytics & Revenue</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                  label="Total Brands"
                  value={settings.analytics.totalBrands}
                  icon={<UsersIcon className="w-6 h-6 admin-accent" />}
                  iconBgColor="bg-blue-100"
                  iconColor="text-blue-600"
                />

                <StatsCard
                  label="Active Brands"
                  value={settings.analytics.activeBrands}
                  icon={<CheckCircleIcon className="w-6 h-6 admin-accent" />}
                  iconBgColor="bg-green-100"
                  iconColor="text-green-600"
                />

                <StatsCard
                  label="Monthly Revenue"
                  value={`€${settings.analytics.monthlyRevenue.toFixed(2)}`}
                  icon={<TrendingUpIcon className="w-6 h-6 admin-accent" />}
                  iconBgColor="bg-purple-100"
                  iconColor="text-purple-600"
                />

                <StatsCard
                  label="Total Revenue"
                  value={`€${settings.analytics.totalRevenue.toFixed(2)}`}
                  icon={<CreditCardIcon className="w-6 h-6 admin-accent" />}
                  iconBgColor="bg-orange-100"
                  iconColor="text-orange-600"
                />
              </div>

              {/* Brands Breakdown Stats */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold admin-text">Breakdown Brands</h3>
                </CardHeader>
                <CardBody>
                  {brandsStatsLoading ? (
                    <p className="text-sm admin-text-muted">
                      Aggiornamento statistiche in corso...
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div>
                        <p className="text-sm mb-2 admin-text-muted">Total</p>
                        <p className="text-2xl font-bold admin-text">{brandsStats.total}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-2 admin-text-muted">Active</p>
                        <p className="text-2xl font-bold text-green-400">{brandsStats.active}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-2 admin-text-muted">Pending</p>
                        <p className="text-2xl font-bold text-yellow-400">{brandsStats.pending}</p>
                      </div>
                      <div>
                        <p className="text-sm mb-2 admin-text-muted">Suspended</p>
                        <p className="text-2xl font-bold text-red-400">{brandsStats.suspended}</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>

              {/* Google Analytics Input */}
              <div>
                <label className="admin-label">Google Analytics ID (Landing Page)</label>
                <input
                  type="text"
                  className="admin-input"
                  value={settings.analytics.googleAnalyticsId || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      analytics: { ...settings.analytics, googleAnalyticsId: e.target.value },
                    })
                  }
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-xs mt-1">Verrà usato nella landing page pubblica</p>
              </div>
            </CardBody>
          </Card>
        )}

        {/* BRANDS TAB */}
        {activeTab === 'brands' && <BrandsManager />}

        {/* LANDING PAGE TAB */}
        {activeTab === 'landing' && <LandingPageEditor ref={landingEditorRef} />}

        {/* LOGS TAB */}
        {activeTab === 'logs' && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileTextIcon className="w-6 h-4" />
                <h2 className="text-2xl font-bold admin-text">Activity Logs</h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              <div className="space-y-3">
                {activityLogs.length === 0 ? (
                  <p className="admin-text-muted">Nessun log disponibile</p>
                ) : (
                  activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-lg p-4 flex items-start gap-3"
                      style={{
                        backgroundColor: 'var(--admin-surface)',
                        border: '1px solid var(--admin-border)',
                      }}
                    >
                      <span className="text-2xl">
                        {log.type === 'brand_created'
                          ? '🎨'
                          : log.type === 'brand_suspended'
                            ? '⛔'
                            : log.type === 'settings_updated'
                              ? '⚙️'
                              : log.type === 'payment_received'
                                ? '💰'
                                : '❌'}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold admin-text">{log.description}</p>
                          <p className="text-xs admin-text-muted">
                            {new Date(log.timestamp).toLocaleString('it-IT')}
                          </p>
                        </div>
                        <p className="text-sm mt-1 admin-text-muted">Actor: {log.actor}</p>
                        {log.brandId && (
                          <p className="text-xs mt-1 admin-text-muted">Brand: {log.brandId}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/')} className="hover-lift">
            <HomeIcon className="w-4 h-4 mr-2" />
            Torna alla Home
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              if (activeTab === 'landing') {
                landingEditorRef.current?.save();
              } else {
                handleSaveSettings();
              }
            }}
            disabled={activeTab === 'landing' ? landingEditorRef.current?.isSaving : saving}
            className="hover-lift"
          >
            <SaveIcon className="w-4 h-4 mr-2" />
            {activeTab === 'landing'
              ? landingEditorRef.current?.isSaving
                ? 'Salvataggio Landing...'
                : 'Salva Landing'
              : saving
                ? 'Salvataggio...'
                : 'Salva Impostazioni'}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default SuperAdminPanel;
