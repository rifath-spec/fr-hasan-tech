import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  Receipt, 
  Shield, 
  Save, 
  Database, 
  KeyRound, 
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Upload,
  UserCheck,
  Server,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Table,
  Trash2
} from 'lucide-react';
import { ShopSettings } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { FRHasanLogo } from '../common/FRHasanLogo';
import { SUPABASE_SQL_SCHEMA } from '../../data/supabaseSqlScript';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured, getSupabaseConfig } from '../../lib/supabase';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    adminUser, 
    resetAdminPassword, 
    resetToInitialData,
    clearAllData,
    clearServices,
    clearPackages,
    clearSims,
    clearTransactions,
    seedSupabaseDatabase,
    refreshFromSupabase,
    isSupabaseConnected,
    showToast
  } = useApp();

  const [activeSection, setActiveSection] = useState<'shop' | 'branding' | 'pos' | 'security' | 'supabase' | 'data'>('shop');
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Supabase Testing State
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; tables?: Record<string, number> } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Confirmation Modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showClearServicesConfirm, setShowClearServicesConfirm] = useState(false);
  const [showClearPackagesConfirm, setShowClearPackagesConfirm] = useState(false);
  const [showClearSimsConfirm, setShowClearSimsConfirm] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formData);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleFileUpload = (field: 'logo' | 'hero' | 'ceo', file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (field === 'logo') {
        setFormData(prev => ({ ...prev, logoUrl: result }));
      } else if (field === 'hero') {
        setFormData(prev => ({
          ...prev,
          heroBackgroundUrl: result,
          heroContent: { ...prev.heroContent, backgroundImageUrl: result }
        }));
      } else if (field === 'ceo') {
        setFormData(prev => ({
          ...prev,
          aboutContent: { ...prev.aboutContent, ceoPhoto: result }
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    resetAdminPassword(newPassword);
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
      setCopiedSql(true);
      showToast("Supabase PostgreSQL SQL Schema copied to clipboard!", "success");
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      showToast("Unable to copy to clipboard automatically", "warning");
    }
  };

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    setTestResult(null);
    try {
      const res = await SupabaseService.testConnection();
      setTestResult(res);
      if (res.ok) {
        showToast("Supabase database connection verified successfully!", "success");
      } else {
        showToast(res.message, "error");
      }
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    try {
      const res = await seedSupabaseDatabase();
      if (res.ok) {
        showToast(res.message, "success");
        await handleTestConnection();
      } else {
        showToast(res.message, "error");
      }
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const res = await clearAllData();
      if (res.ok) {
        showToast(res.message, "success");
        await handleTestConnection();
      } else {
        showToast(res.message, "error");
      }
    } finally {
      setIsClearing(false);
      setShowClearAllConfirm(false);
    }
  };

  const handleClearServicesOnly = async () => {
    setIsClearing(true);
    try {
      await clearServices();
      await handleTestConnection();
    } finally {
      setIsClearing(false);
      setShowClearServicesConfirm(false);
    }
  };

  const handleClearPackagesOnly = async () => {
    setIsClearing(true);
    try {
      await clearPackages();
      await handleTestConnection();
    } finally {
      setIsClearing(false);
      setShowClearPackagesConfirm(false);
    }
  };

  const handleClearSimsOnly = async () => {
    setIsClearing(true);
    try {
      await clearSims();
      await handleTestConnection();
    } finally {
      setIsClearing(false);
      setShowClearSimsConfirm(false);
    }
  };

  const downloadBackupJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: formData,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FRHasanTech_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const config = getSupabaseConfig();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System & Shop Settings</h2>
          <p className="text-xs text-gray-500">Configure business information, logo, hero visuals, POS parameters, receipt templates, and Supabase database backend</p>
        </div>

        {showSaveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs / Section Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-gray-200/70 p-1.5 rounded-xl">
        <button
          onClick={() => setActiveSection('shop')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'shop' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop Profile</span>
        </button>

        <button
          onClick={() => setActiveSection('branding')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'branding' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo & Media</span>
        </button>

        <button
          onClick={() => setActiveSection('pos')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'pos' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>POS & Slips</span>
        </button>

        <button
          onClick={() => setActiveSection('supabase')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors relative ${
            activeSection === 'supabase' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Supabase DB</span>
          {isSupabaseConfigured && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5" />
          )}
        </button>

        <button
          onClick={() => setActiveSection('security')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'security' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>

        <button
          onClick={() => setActiveSection('data')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'data' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup</span>
        </button>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 shadow-soft-sm p-6 space-y-6">
        
        {/* SECTION 1: SHOP INFORMATION */}
        {activeSection === 'shop' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
              <Store className="w-4 h-4 text-[#1E5AA8]" />
              <span>Public Storefront Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  value={formData.shopName}
                  onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tagline</label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Store Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Exact Plus Code</label>
                <input
                  type="text"
                  value={formData.plusCode || ''}
                  onChange={(e) => setFormData({ ...formData, plusCode: e.target.value })}
                  placeholder="e.g. F37F+49 Mullipotana"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Primary Phone *</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Public Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">WhatsApp Hotline *</label>
                <input
                  type="text"
                  required
                  value={formData.whatsappNumber}
                  onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">WhatsApp Group Invite Link</label>
                <input
                  type="url"
                  value={formData.whatsappGroupUrl || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappGroupUrl: e.target.value })}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Operating Hours Summary *</label>
                <input
                  type="text"
                  required
                  value={formData.openingHours.monFri}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    openingHours: { ...formData.openingHours, monFri: e.target.value } 
                  })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Google Maps Link</label>
                <input
                  type="text"
                  value={formData.googleMapsUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Embedded Map URL / Iframe Src</label>
              <input
                type="text"
                value={formData.mapEmbedUrl || ''}
                onChange={(e) => {
                  let val = e.target.value;
                  const match = val.match(/src=["']([^"']+)["']/);
                  if (match && match[1]) {
                    val = match[1];
                  }
                  setFormData({ ...formData, mapEmbedUrl: val });
                }}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">Paste the Google Maps embed iframe code or embed URL directly.</p>
            </div>
          </div>
        )}

        {/* SECTION: BRANDING & MEDIA */}
        {activeSection === 'branding' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#1E5AA8]" />
              <span>Official Brand Assets & Visual Media</span>
            </h3>

            {/* 1. Logo Configuration */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-28 h-28 shrink-0 bg-white p-2 rounded-2xl border border-slate-200 shadow-soft-sm flex items-center justify-center">
                  <FRHasanLogo 
                    size="xl" 
                    variant="badge" 
                    customSrc={formData.logoUrl} 
                    className="w-24 h-24"
                  />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <span className="font-bold text-sm text-slate-900 block">Official Shop Logo</span>
                  <p className="text-xs text-slate-500">
                    Displayed on the public navigation bar, mobile menu, thermal receipt headers, and footer.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="px-3.5 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload New Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload('logo', e.target.files[0]);
                        }}
                      />
                    </label>

                    {formData.logoUrl && formData.logoUrl !== '/fr-hasan-logo.svg' && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoUrl: '/fr-hasan-logo.svg' })}
                        className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Reset to Vector Badge
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Hero Background Image Configuration */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-36 h-24 shrink-0 bg-slate-200 rounded-xl overflow-hidden border border-slate-300 shadow-soft-xs relative">
                  <img
                    src={formData.heroContent?.backgroundImageUrl || formData.heroBackgroundUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'}
                    alt="Hero Workplace Background"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-[9px] text-white rounded font-mono">
                    Hero Media
                  </span>
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <span className="font-bold text-sm text-slate-900 block">Hero Background / Workplace Photo</span>
                  <p className="text-xs text-slate-500">
                    High-resolution backdrop image for the homepage hero showcase.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="px-3.5 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Hero Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleFileUpload('hero', e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Executive CEO Portrait & Profile */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                <UserCheck className="w-4 h-4 text-[#1E5AA8]" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">Executive Leadership (CEO Profile)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-4 flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-300 shadow-soft-sm relative">
                    <img
                      src={formData.aboutContent?.ceoPhoto || 'https://res.cloudinary.com/dut2fzqdd/image/upload/v1787850870/WhatsApp_Image_2026-08-27_at_7.46.48_PM.jpg'}
                      alt="CEO Portrait"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <label className="mt-2 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-md cursor-pointer flex items-center gap-1 transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Upload Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFileUpload('ceo', e.target.files[0]);
                      }}
                    />
                  </label>
                </div>

                <div className="sm:col-span-8 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">CEO Photo Image URL</label>
                    <input
                      type="url"
                      value={formData.aboutContent?.ceoPhoto || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        aboutContent: { ...formData.aboutContent, ceoPhoto: e.target.value }
                      })}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">CEO Name</label>
                    <input
                      type="text"
                      value={formData.aboutContent?.ceoName || 'FR Hasan'}
                      onChange={(e) => setFormData({
                        ...formData,
                        aboutContent: { ...formData.aboutContent, ceoName: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">CEO Quote / Vision</label>
                    <input
                      type="text"
                      value={formData.aboutContent?.ceoQuote || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        aboutContent: { ...formData.aboutContent, ceoQuote: e.target.value }
                      })}
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: POS & RECEIPT */}
        {activeSection === 'pos' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#1E5AA8]" />
              <span>Point of Sale & Thermal Slip Settings</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.posSettings.currencySymbol}
                  onChange={(e) => setFormData({
                    ...formData,
                    posSettings: { ...formData.posSettings, currencySymbol: e.target.value }
                  })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.posSettings.taxRate}
                  onChange={(e) => setFormData({
                    ...formData,
                    posSettings: { ...formData.posSettings, taxRate: parseFloat(e.target.value) || 0 }
                  })}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Receipt Header Line</label>
              <input
                type="text"
                value={formData.posSettings.receiptHeader}
                onChange={(e) => setFormData({
                  ...formData,
                  posSettings: { ...formData.posSettings, receiptHeader: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Receipt Footer Note</label>
              <input
                type="text"
                value={formData.posSettings.receiptFooter}
                onChange={(e) => setFormData({
                  ...formData,
                  posSettings: { ...formData.posSettings, receiptFooter: e.target.value }
                })}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>
          </div>
        )}

        {/* SECTION: SUPABASE BACKEND & SQL SETUP */}
        {activeSection === 'supabase' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#1E5AA8]" />
                  <span>Supabase PostgreSQL Connectivity</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct database synchronization for services catalog, SIM inventory, reload plans, and POS ledger.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  config.isConfigured 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${config.isConfigured ? 'bg-emerald-600' : 'bg-amber-600'}`} />
                  <span>{config.isConfigured ? 'Supabase Configured' : 'Credentials Missing in .env'}</span>
                </span>
              </div>
            </div>

            {/* Connection Credentials Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="font-bold text-slate-700 block mb-1">VITE_SUPABASE_URL</span>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 truncate select-all">
                    {config.url || 'Not configured in .env'}
                  </div>
                </div>
                <div>
                  <span className="font-bold text-slate-700 block mb-1">VITE_SUPABASE_ANON_KEY (Anon Public Key)</span>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-800 truncate">
                    {config.maskedKey}
                  </div>
                </div>
              </div>

              {/* API Key Security Tip */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold block text-amber-950 mb-0.5">⚠️ Important: Use the "anon public" key, not a Secret Key</span>
                <span>
                  Supabase blocks secret keys in web browsers. In your Supabase Dashboard, go to <strong>Project Settings &gt; API &gt; Project API keys</strong> and copy the <strong>anon public</strong> key (a long JWT string starting with <code>eyJhbGci...</code>).
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConn}
                  className="px-4 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-soft-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
                  <span>{isTestingConn ? 'Testing Query...' : 'Test Connection & Tables'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-soft-xs transition-colors disabled:opacity-50"
                >
                  <Table className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Seeding Tables...' : 'Seed / Sync Catalog to Supabase'}</span>
                </button>

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Supabase Dashboard</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </div>

              {/* Test Result Box */}
              {testResult && (
                <div className={`mt-3 p-3.5 rounded-lg border text-xs ${
                  testResult.ok 
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
                    : 'bg-red-50 text-red-900 border-red-200'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    {testResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-red-600" />}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.tables && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-200 font-mono text-[11px]">
                      <div>services: <strong>{testResult.tables['services'] ?? 0} rows</strong></div>
                      <div>sim_cards: <strong>{testResult.tables['sim_cards'] ?? 0} rows</strong></div>
                      <div>mobile_packages: <strong>{testResult.tables['mobile_packages'] ?? 0} rows</strong></div>
                      <div>pos_transactions: <strong>{testResult.tables['pos_transactions'] ?? 0} rows</strong></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SQL Script Viewer & Copy */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">PostgreSQL Schema & Security Script (SQL)</h4>
                  <p className="text-[11px] text-gray-500">Run this complete script once in your Supabase SQL Editor to create all 5 tables, triggers, indexes, and RLS policies.</p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-soft-xs ${
                    copiedSql ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-black text-white'
                  }`}
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 text-slate-100 p-4 font-mono text-xs max-h-72 overflow-y-auto leading-relaxed shadow-inner">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: SECURITY & ADMIN */}
        {activeSection === 'security' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#1E5AA8]" />
              <span>Admin Authentication & Credentials</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-bold text-sm text-gray-900 block">{adminUser?.name}</span>
                <span className="text-xs text-gray-600 block">{adminUser?.email}</span>
                <span className="text-[11px] text-gray-400 font-mono mt-1 block">Role: System Super-Admin</span>
              </div>

              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-md flex items-center gap-2 shadow-xs active-press"
              >
                <KeyRound className="w-4 h-4" />
                <span>Change Password</span>
              </button>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
              <span className="font-bold block">Security Note:</span>
              <span>All authentication sessions are verified and persisted safely in client-side state and protected by Supabase Row Level Security (RLS).</span>
            </div>
          </div>
        )}

        {/* SECTION 4: DATA MANAGEMENT & BACKUP */}
        {activeSection === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#1E5AA8]" />
                <span>Catalog Cleanup, Backup & Reset</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Manage live catalog data in Supabase. Remove dummy data to start completely fresh, or restore default store templates.
              </p>
            </div>

            {/* Prominent Clear / Wipe Data Card */}
            <div className="p-5 rounded-xl border border-red-200 bg-red-50/60 shadow-xs space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-red-950">Remove All Dummy Data (Start Fresh)</h4>
                  <p className="text-xs text-red-800/90 mt-1 leading-relaxed">
                    Instantly wipes all sample services, mobile packages, SIM inventory, and POS transactions from Supabase database and local state. Your store settings (shop name, phone number, hours) will remain preserved.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t border-red-200/60">
                <button
                  type="button"
                  disabled={isClearing}
                  onClick={() => setShowClearAllConfirm(true)}
                  className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 active-press"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isClearing ? 'Clearing Tables...' : 'Clear All Dummy & Catalog Data'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSeeding}
                  onClick={handleSeedDatabase}
                  className="px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Populating...' : 'Re-Populate Default Templates'}</span>
                </button>
              </div>
            </div>

            {/* Targeted Module Cleanups */}
            <div className="p-4 rounded-xl border border-gray-200 bg-white space-y-3">
              <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">Individual Table Cleanups</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Services Catalog</span>
                    <span className="text-[11px] text-gray-500">Photocopy, Printing, Lamination items</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearServicesConfirm(true)}
                    className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-xs font-bold rounded transition-colors"
                  >
                    Clear Services
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">Mobile & Broadband</span>
                    <span className="text-[11px] text-gray-500">Dialog, Mobitel, Hutch packages</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearPackagesConfirm(true)}
                    className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-xs font-bold rounded transition-colors"
                  >
                    Clear Packages
                  </button>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex flex-col justify-between gap-3">
                  <div>
                    <span className="font-bold text-xs text-gray-900 block">SIM Cards Inventory</span>
                    <span className="text-[11px] text-gray-500">Available & Sold SIM serials</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowClearSimsConfirm(true)}
                    className="w-full py-1.5 px-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 text-xs font-bold rounded transition-colors"
                  >
                    Clear SIM Cards
                  </button>
                </div>
              </div>
            </div>

            {/* Backup & Factory Reset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Export System Backup</h4>
                  <p className="text-xs text-gray-500 mt-1">Download complete JSON dump containing catalog, SIMs, reload plans, POS logs, and settings.</p>
                </div>
                <button
                  type="button"
                  onClick={downloadBackupJSON}
                  className="mt-4 w-full py-2 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-md transition-colors"
                >
                  Download JSON Backup
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Restore Factory Data</h4>
                  <p className="text-xs text-slate-600 mt-1">Reset application state back to official FR.HASAN TECH initial configuration.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold rounded-md transition-colors"
                >
                  Reset to Initial Templates
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        {activeSection !== 'data' && activeSection !== 'supabase' && (
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-sm font-bold rounded-md flex items-center gap-2 shadow-soft-sm active-press transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        )}

      </form>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setShowPasswordModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-xl shadow-soft-xl max-w-md w-full p-6 z-10 border border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Change Admin Password</h3>
            <p className="text-xs text-gray-500 mb-4">Set a new password for logging into the admin console.</p>

            {passwordError && (
              <div className="p-3 mb-3 bg-red-50 text-red-700 text-xs rounded-md">
                {passwordError}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1E5AA8] text-white rounded font-bold"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear All Dummy Data Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearAllConfirm}
        title="Remove All Dummy & Catalog Data?"
        message="This will delete all services, mobile packages, SIM cards, and transaction records from your Supabase database and local store state. You will have an empty catalog ready for your custom data."
        confirmLabel="Yes, Clear All Dummy Data"
        onConfirm={handleClearAll}
        onCancel={() => setShowClearAllConfirm(false)}
      />

      {/* Clear Services Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearServicesConfirm}
        title="Clear All Services?"
        message="This will delete all service catalog records (photocopy, printing, typing, etc.) from Supabase."
        confirmLabel="Yes, Clear Services"
        onConfirm={handleClearServicesOnly}
        onCancel={() => setShowClearServicesConfirm(false)}
      />

      {/* Clear Packages Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearPackagesConfirm}
        title="Clear All Mobile & Broadband Packages?"
        message="This will delete all mobile and broadband reload packages from Supabase."
        confirmLabel="Yes, Clear Packages"
        onConfirm={handleClearPackagesOnly}
        onCancel={() => setShowClearPackagesConfirm(false)}
      />

      {/* Clear SIMs Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearSimsConfirm}
        title="Clear All SIM Cards?"
        message="This will delete all SIM card inventory items from Supabase."
        confirmLabel="Yes, Clear SIMs"
        onConfirm={handleClearSimsOnly}
        onCancel={() => setShowClearSimsConfirm(false)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Store Data to Defaults?"
        message="This will reset application state and synchronize default templates with Supabase database."
        confirmLabel="Yes, Reset Everything"
        onConfirm={async () => {
          await resetToInitialData();
          setShowResetConfirm(false);
          setFormData({ ...settings });
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

    </div>
  );
};
