import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Store, 
  Receipt, 
  Shield, 
  Save, 
  Database, 
  RotateCcw, 
  KeyRound, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Upload,
  UserCheck,
  Sparkles
} from 'lucide-react';
import { ShopSettings } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { FRHasanLogo } from '../common/FRHasanLogo';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    adminUser, 
    resetAdminPassword, 
    resetToInitialData,
    navigate
  } = useApp();

  const [activeSection, setActiveSection] = useState<'shop' | 'branding' | 'pos' | 'security' | 'data'>('shop');
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Reset Data Modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
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

  const downloadBackupJSON = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: formData,
      localStorage: { ...localStorage }
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FRHasanTech_FullBackup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System & Shop Settings</h2>
          <p className="text-xs text-gray-500">Configure business information, logo, hero visuals, POS parameters, receipt templates, and security</p>
        </div>

        {showSaveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs / Section Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-gray-200/70 p-1.5 rounded-xl">
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
                  // If user pasted a full iframe HTML snippet, extract the src URL
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

        {/* SECTION: BRANDING & MEDIA (Logo, Hero Background, CEO Profile) */}
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
                      src={formData.aboutContent?.ceoPhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'}
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
              <span>All authentication sessions are verified and persisted safely in client-side encrypted state according to your requirement.</span>
            </div>
          </div>
        )}

        {/* SECTION 4: DATA MANAGEMENT & BACKUP */}
        {activeSection === 'data' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#1E5AA8]" />
              <span>Backup, Restore & Reset</span>
            </h3>

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

              <div className="p-4 rounded-xl border border-red-200 bg-red-50/50 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-red-900">Restore Factory Data</h4>
                  <p className="text-xs text-red-700 mt-1">Reset application state back to official FR.HASAN TECH initial configuration.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="mt-4 w-full py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors"
                >
                  Reset to Initial Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        {activeSection !== 'data' && (
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

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset All Store Data to Defaults?"
        message="This will overwrite current local storage with fresh initial demo data (services, SIMs, mobile packages, and sample transactions). Any custom changes will be replaced."
        confirmLabel="Yes, Reset Everything"
        onConfirm={() => {
          resetToInitialData();
          setShowResetConfirm(false);
          setFormData({ ...settings });
        }}
        onCancel={() => setShowResetConfirm(false)}
      />

    </div>
  );
};

