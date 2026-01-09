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

import { logger } from '@/utils/logger';
import clsx from 'clsx';
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
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLogin from '../../components/AdminLogin';
import {
  LandingPageEditor,
  LandingPageEditorHandle,
} from '../../components/landing-editor/LandingPageEditor';
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
import { Button, Card, CardBody, CardHeader, Input, StatsCard } from '../../src/components/ui';
import { ActivityLog, PlatformSettings, SystemHealth } from '../../types';
import BrandsManager from './tabs/BrandsManager';

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
          <div className="spinner spinner-lg mb-4 mx-auto !border-t-accent-indigo"></div>
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

      <div className="relative z-10 p-6 md:p-10 animate-fade-in scrollbar-premium">
        <div className="max-w-[1600px] mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-accent-rose uppercase tracking-[0.2em] mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-accent-rose animate-pulse" />
                Central Control Unit
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
                🔐 {settings.systemName} <span className="text-accent-indigo">Core</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="neon-rose"
                size="lg"
                onClick={handleSaveSettings}
                loading={saving}
                icon={<SaveIcon className="w-5 h-5" />}
              >
                SALVA CONFIGURAZIONE
              </Button>
            </div>
          </div>

          {/* Top Intelligence Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
            {/* Health Summary (Span 2) */}
            {systemHealth && (
              <div
                className={clsx(
                  'glass-card p-6 lg:col-span-2 flex items-center gap-6 border-l-4',
                  systemHealth.status === 'healthy' ? 'border-l-emerald-500' : 'border-l-rose-500'
                )}
              >
                <div
                  className={clsx(
                    'w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl',
                    systemHealth.status === 'healthy'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-rose-500/10 text-rose-400'
                  )}
                >
                  {systemHealth.status === 'healthy' ? (
                    <CheckCircleIcon className="w-10 h-10" />
                  ) : (
                    <AlertCircleIcon className="w-10 h-10" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-black text-white uppercase tracking-tighter">
                      System Pulse
                    </h3>
                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest',
                        systemHealth.status === 'healthy'
                          ? 'bg-emerald-500 text-black'
                          : 'bg-rose-500 text-white'
                      )}
                    >
                      {systemHealth.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Uptime</p>
                      <p className="text-sm font-black text-white">{systemHealth.uptime}%</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Latency</p>
                      <p className="text-sm font-black text-white">{systemHealth.responseTime}ms</p>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Load</p>
                      <p className="text-sm font-black text-white">{systemHealth.errorRate}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <StatsCard
              label="Total Brands"
              value={brandsStats.total}
              icon={<BuildingIcon className="w-6 h-6" />}
            />
            <StatsCard
              label="Active Users"
              value={brandsStats.active}
              icon={<UsersIcon className="w-6 h-6" />}
              trend={{ value: '+12%', positive: true, label: 'monthly' }}
            />
          </div>

          {/* Content Explorer Shell */}
          <div className="glass-card !bg-night-900/60 !p-0 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 bg-black/40 border-r border-white/10 p-4 shrink-0">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] mb-6 px-4">
                Navigation
              </h4>
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 relative group',
                      activeTab === tab.id
                        ? 'bg-accent-indigo/10 text-accent-indigo'
                        : 'text-gray-500 hover:text-white hover:bg-white/5'
                    )}
                  >
                    {activeTab === tab.id && (
                      <div className="absolute left-0 w-1 h-6 bg-accent-indigo rounded-r-full shadow-glow-indigo" />
                    )}
                    <span
                      className={clsx(
                        'transition-transform group-hover:scale-110',
                        activeTab === tab.id ? 'opacity-100' : 'opacity-40'
                      )}
                    >
                      {tab.icon}
                    </span>
                    <span className="uppercase tracking-widest text-[11px]">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 p-8 md:p-12 overflow-y-auto scrollbar-premium">
              <div className="max-w-4xl animate-slide-up">
                {/* SYSTEM TAB */}
                {activeTab === 'system' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <SettingsIcon className="w-6 h-6 text-accent-indigo" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                          Informazioni Sistema
                        </h2>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input
                          label="Nome Sistema"
                          value={settings.systemName}
                          onChange={(e) => setSettings({ ...settings, systemName: e.target.value })}
                        />
                        <Input
                          label="Versione"
                          value={settings.systemVersion}
                          onChange={(e) =>
                            setSettings({ ...settings, systemVersion: e.target.value })
                          }
                        />
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                            Status Sistema
                          </label>
                          <select
                            className="glass-input w-full"
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
                          <Input
                            label="Messaggio Manutenzione"
                            value={settings.maintenanceMessage || ''}
                            onChange={(e) =>
                              setSettings({ ...settings, maintenanceMessage: e.target.value })
                            }
                          />
                        )}
                      </div>

                      <div className="pt-8 border-t border-white/5 space-y-6">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                          Feature Flags
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {[
                            { label: 'Registrazioni', key: 'allowSignup' },
                            { label: 'Domini Custom', key: 'allowCustomDomains' },
                            { label: 'Google OAuth', key: 'allowGoogleOAuth' },
                          ].map((flag) => (
                            <label
                              key={flag.key}
                              className="flex items-center gap-3 group cursor-pointer"
                            >
                              <div className="relative w-12 h-6 bg-white/5 rounded-full border border-white/10 transition-colors group-hover:border-accent-indigo/50">
                                <input
                                  type="checkbox"
                                  className="sr-only peer"
                                  checked={(settings.features as any)[flag.key]}
                                  onChange={(e) =>
                                    setSettings({
                                      ...settings,
                                      features: {
                                        ...settings.features,
                                        [flag.key]: e.target.checked,
                                      },
                                    })
                                  }
                                />
                                <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full transition-all peer-checked:left-7 peer-checked:bg-accent-indigo peer-checked:shadow-glow-indigo" />
                              </div>
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest group-hover:text-white transition-colors">
                                {flag.label}
                              </span>
                            </label>
                          ))}

                          <label className="flex items-center gap-3 group cursor-pointer">
                            <div className="relative w-12 h-6 bg-rose-500/10 rounded-full border border-rose-500/20 transition-colors group-hover:border-rose-500/50">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.features.maintenanceMode}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    features: {
                                      ...settings.features,
                                      maintenanceMode: e.target.checked,
                                    },
                                  })
                                }
                              />
                              <div className="absolute top-1 left-1 w-4 h-4 bg-gray-500 rounded-full transition-all peer-checked:left-7 peer-checked:bg-rose-500" />
                            </div>
                            <span className="text-xs font-black text-rose-500 uppercase tracking-widest group-hover:text-rose-400 transition-colors">
                              ⚠️ Maint. Mode
                            </span>
                          </label>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* LANDING EDITOR TAB */}
                {activeTab === 'landing' && (
                  <div className="space-y-8 animate-scale-in">
                    <div className="glass-card p-2 border-accent-indigo/30 shadow-glow-indigo">
                      <LandingPageEditor ref={landingEditorRef} />
                    </div>
                  </div>
                )}

                {/* SEO TAB */}
                {activeTab === 'seo' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <SearchIcon className="w-6 h-6 text-accent-indigo" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                          SEO & AI Intelligence
                        </h2>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-8">
                      <Input
                        label="Meta Title"
                        value={settings.seo.metaTitle}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            seo: { ...settings.seo, metaTitle: e.target.value },
                          })
                        }
                        maxLength={60}
                        helperText={`${settings.seo.metaTitle.length}/60 characters`}
                      />
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                          Meta Description
                        </label>
                        <textarea
                          className="glass-input w-full min-h-[100px]"
                          value={settings.seo.metaDescription}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              seo: { ...settings.seo, metaDescription: e.target.value },
                            })
                          }
                          maxLength={160}
                        />
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                          {settings.seo.metaDescription.length}/160 characters
                        </p>
                      </div>

                      <div className="pt-8 border-t border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">
                            🤖 AI Optimization
                          </h3>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <span className="text-[10px] font-bold text-gray-500 uppercase group-hover:text-white transition-colors">
                              Enable AI Search
                            </span>
                            <div className="relative w-10 h-5 bg-white/5 rounded-full border border-white/10">
                              <input
                                type="checkbox"
                                className="sr-only peer"
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
                              />
                              <div className="absolute top-0.5 left-0.5 w-3.5 h-3.5 bg-gray-500 rounded-full transition-all peer-checked:left-6 peer-checked:bg-accent-indigo" />
                            </div>
                          </label>
                        </div>

                        {settings.seo.aiSearchOptimization.enabled && (
                          <div className="space-y-6 animate-slide-up">
                            <Input
                              label="Target Audience"
                              value={settings.seo.aiSearchOptimization.targetAudience}
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
                            />
                            <div className="space-y-2">
                              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Key Features (One per line)
                              </label>
                              <textarea
                                className="glass-input w-full min-h-[150px]"
                                value={settings.seo.aiSearchOptimization.keyFeatures.join('\n')}
                                onChange={(e) =>
                                  setSettings({
                                    ...settings,
                                    seo: {
                                      ...settings.seo,
                                      aiSearchOptimization: {
                                        ...settings.seo.aiSearchOptimization,
                                        keyFeatures: e.target.value
                                          .split('\n')
                                          .filter((f) => f.trim()),
                                      },
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}

                {/* COMPANY TAB */}
                {activeTab === 'company' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <BuildingIcon className="w-6 h-6 text-accent-indigo" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                          Identity & Fiscal
                        </h2>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                          <Input
                            label="Legal Entity Name"
                            value={settings.company.name}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                company: { ...settings.company, name: e.target.value },
                              })
                            }
                          />
                        </div>
                        <Input
                          label="VAT Number"
                          value={settings.company.vatNumber}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              company: { ...settings.company, vatNumber: e.target.value },
                            })
                          }
                        />
                        <Input
                          label="Tax Code"
                          value={settings.company.taxCode}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              company: { ...settings.company, taxCode: e.target.value },
                            })
                          }
                        />
                        <div className="md:col-span-2">
                          <Input
                            label="Legal Address"
                            value={settings.company.address}
                            onChange={(e) =>
                              setSettings({
                                ...settings,
                                company: { ...settings.company, address: e.target.value },
                              })
                            }
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}

                {activeTab === 'stripe' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <CreditCardIcon className="w-6 h-6 text-accent-indigo" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                          Financial Interface (Stripe)
                        </h2>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Input label="Mode" value={settings.stripe.mode} readOnly disabled />
                        <Input
                          label="Monthly Price (€)"
                          type="number"
                          value={pricingInputs.monthlyPrice}
                          onChange={(e) => handlePricingInputChange('monthlyPrice', e.target.value)}
                        />
                        <Input
                          label="Trial Period (Days)"
                          type="number"
                          value={pricingInputs.trialDays}
                          onChange={(e) => handlePricingInputChange('trialDays', e.target.value)}
                        />
                      </div>
                    </CardBody>
                  </Card>
                )}

                {activeTab === 'analytics' && (
                  <div className="space-y-8 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <StatsCard
                        label="Total Revenue"
                        value={`€ ${settings.analytics.totalRevenue.toFixed(2)}`}
                        icon={<TrendingUpIcon className="w-6 h-6" />}
                        trend={{ value: '+18.2%', positive: true }}
                      />
                      <StatsCard
                        label="Monthly Revenue"
                        value={`€ ${settings.analytics.monthlyRevenue.toFixed(2)}`}
                        icon={<TrendingUpIcon className="w-6 h-6" />}
                      />
                      <StatsCard
                        label="Active Brands"
                        value={settings.analytics.activeBrands}
                        icon={<UsersIcon className="w-6 h-6" />}
                        trend={{ value: '+12%', positive: true }}
                      />
                    </div>
                    <Card>
                      <CardHeader>
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                          Platform Growth
                        </h3>
                      </CardHeader>
                      <CardBody>
                        {brandsStatsLoading ? (
                          <div className="h-64 flex items-center justify-center">
                            <span className="w-8 h-8 border-2 border-accent-indigo border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                              { label: 'Total', value: brandsStats.total, color: 'text-white' },
                              {
                                label: 'Active',
                                value: brandsStats.active,
                                color: 'text-emerald-400',
                              },
                              {
                                label: 'Pending',
                                value: brandsStats.pending,
                                color: 'text-yellow-400',
                              },
                              {
                                label: 'Suspended',
                                value: brandsStats.suspended,
                                color: 'text-rose-400',
                              },
                            ].map((item) => (
                              <div
                                key={item.label}
                                className="text-center p-6 bg-white/2 rounded-2xl border border-white/5"
                              >
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">
                                  {item.label}
                                </p>
                                <p className={clsx('text-3xl font-black', item.color)}>
                                  {item.value}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </div>
                )}

                {activeTab === 'brands' && (
                  <div className="animate-scale-in">
                    <BrandsManager />
                  </div>
                )}

                {activeTab === 'logs' && (
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <FileTextIcon className="w-6 h-6 text-accent-indigo" />
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                          System Event Logs
                        </h2>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div className="space-y-4">
                        {activityLogs.length === 0 ? (
                          <div className="text-center py-12 text-gray-600 uppercase tracking-widest text-xs font-bold">
                            No events recorded.
                          </div>
                        ) : (
                          activityLogs.map((log) => (
                            <div
                              key={log.id}
                              className="flex items-center gap-4 p-4 bg-white/2 rounded-xl border border-white/5 hover:bg-white/5 transition-colors group"
                            >
                              <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center text-lg border border-white/10 group-hover:border-accent-indigo/30 group-hover:shadow-glow-indigo transition-all">
                                {log.type === 'brand_created'
                                  ? '🎨'
                                  : log.type === 'brand_suspended'
                                    ? '⛔'
                                    : '⚙️'}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-200">{log.description}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter mt-1">
                                  {new Date(log.timestamp).toLocaleString()} • {log.actor}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardBody>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPanel;
