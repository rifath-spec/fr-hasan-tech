import React, { useState, useEffect } from 'react';
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
  Trash2, 
  Eye, 
  EyeOff, 
  Link, 
  Sparkles,
  FileCode,
  FileJson,
  Download,
  Users,
  UserPlus,
  UserX,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { ShopSettings, AdminRole, AdminUser } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';
import { FRHasanLogo } from '../common/FRHasanLogo';
import { SUPABASE_SQL_SCHEMA, SUPABASE_OFFERS_SQL_MIGRATION, SUPABASE_ADMIN_USERS_SQL_MIGRATION } from '../../data/supabaseSqlScript';
import { SupabaseService } from '../../services/supabaseService';
import { getSupabaseConfig, getActiveCredentials } from '../../lib/supabase';
import { SqlBackupModal } from './SqlBackupModal';
import { 
  generateSqlBackup, 
  getBackupStats, 
  downloadFile, 
  DatabaseBackupPayload, 
  BackupStats 
} from '../../utils/sqlBackupGenerator';

export const AdminSettings: React.FC = () => {
  const { 
    settings, 
    updateSettings, 
    adminUser, 
    adminUsers,
    resetAdminPassword, 
    addAdminUser,
    updateAdminUser,
    deleteAdminUser,
    resetToInitialData, 
    clearAllData, 
    clearServices, 
    clearPackages, 
    clearSims, 
    clearTransactions, 
    seedSupabaseDatabase, 
    updateSupabaseCredentials, 
    clearSupabaseCredentials, 
    isSupabaseConnected, 
    showToast,
    services,
    packages,
    sims,
    offers,
    transactions,
    estimateCategories,
    estimateSizes,
    estimateServices
  } = useApp();

  const [activeSection, setActiveSection] = useState<'shop' | 'branding' | 'pos' | 'security' | 'supabase' | 'data'>('shop');
  const [formData, setFormData] = useState<ShopSettings>({ ...settings });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Supabase Interactive Credentials State
  const initialCreds = getActiveCredentials();
  const [supabaseUrlInput, setSupabaseUrlInput] = useState<string>(initialCreds.url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState<string>(initialCreds.key);
  const [showKeySecret, setShowKeySecret] = useState<boolean>(false);
  const [isConnectingSupabase, setIsConnectingSupabase] = useState<boolean>(false);

  // Supabase Testing State
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; tables?: Record<string, number> } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // SQL Backup State
  const [showSqlBackupModal, setShowSqlBackupModal] = useState(false);
  const [sqlBackupContent, setSqlBackupContent] = useState('');
  const [sqlBackupStats, setSqlBackupStats] = useState<BackupStats | null>(null);
  const [isGeneratingBackup, setIsGeneratingBackup] = useState(false);

  // Password Modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Admin Auth & Users Table Diagnostics State
  const [isTestingAdminAuth, setIsTestingAdminAuth] = useState(false);
  const [testAdminAuthResult, setTestAdminAuthResult] = useState<{ ok: boolean; message: string; userCount?: number } | null>(null);
  const [copiedAdminMigration, setCopiedAdminMigration] = useState(false);

  // Admin User CRUD Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [userModalMode, setUserModalMode] = useState<'create' | 'edit'>('create');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<{
    name: string;
    email: string;
    password?: string;
    role: AdminRole;
    phone: string;
    isActive: boolean;
  }>({
    name: '',
    email: '',
    password: '',
    role: 'Admin',
    phone: '',
    isActive: true
  });
  const [userFormError, setUserFormError] = useState('');
  const [isSavingUser, setIsSavingUser] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Confirmation Modals
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [showClearServicesConfirm, setShowClearServicesConfirm] = useState(false);
  const [showClearPackagesConfirm, setShowClearPackagesConfirm] = useState(false);
  const [showClearSimsConfirm, setShowClearSimsConfirm] = useState(false);

  // Keep form data in sync when settings change externally
  useEffect(() => {
    setFormData({ ...settings });
  }, [settings]);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSavingSettings(true);
    try {
      await updateSettings(formData);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3500);
    } catch (err: any) {
      showToast(err?.message || "Failed to save settings", "error");
    } finally {
      setIsSavingSettings(false);
    }
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
          heroContent: {
            title: prev.heroContent?.title || '',
            tagline: prev.heroContent?.tagline || '',
            description: prev.heroContent?.description || '',
            backgroundImageUrl: result
          }
        }));
      } else if (field === 'ceo') {
        setFormData(prev => ({
          ...prev,
          aboutContent: {
            title: prev.aboutContent?.title || '',
            subtitle: prev.aboutContent?.subtitle || '',
            story: prev.aboutContent?.story || '',
            mission: prev.aboutContent?.mission || '',
            ...(prev.aboutContent || {}),
            ceoPhoto: result
          }
        }));
      }
      showToast(`${field.toUpperCase()} image updated! Click 'Save Configuration' to persist.`, "info");
    };
    reader.readAsDataURL(file);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
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

    setIsChangingPassword(true);
    try {
      const ok = await resetAdminPassword(newPassword);
      if (ok) {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTestAdminUsersTable = async () => {
    setIsTestingAdminAuth(true);
    setTestAdminAuthResult(null);
    try {
      const res = await SupabaseService.testAdminUsersTable();
      setTestAdminAuthResult(res);
      if (res.ok) {
        showToast(res.message, "success");
      } else {
        showToast(res.message, "error");
      }
    } finally {
      setIsTestingAdminAuth(false);
    }
  };

  const handleCopyAdminMigrationSql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_ADMIN_USERS_SQL_MIGRATION);
      setCopiedAdminMigration(true);
      showToast("Admin Users SQL Migration copied to clipboard!", "success");
      setTimeout(() => setCopiedAdminMigration(false), 2500);
    } catch {
      showToast("Unable to copy to clipboard", "warning");
    }
  };

  const handleOpenCreateUser = () => {
    setUserModalMode('create');
    setEditingUserId(null);
    setUserForm({
      name: '',
      email: '',
      password: '',
      role: 'Admin',
      phone: '',
      isActive: true
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: AdminUser) => {
    setUserModalMode('edit');
    setEditingUserId(user.id);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role || 'Admin',
      phone: user.phone || '',
      isActive: user.isActive !== false
    });
    setUserFormError('');
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserFormError('');

    if (!userForm.name.trim()) {
      setUserFormError('Please enter user full name');
      return;
    }
    if (!userForm.email.trim()) {
      setUserFormError('Please enter email address');
      return;
    }
    if (userModalMode === 'create' && (!userForm.password || userForm.password.length < 6)) {
      setUserFormError('Password must be at least 6 characters');
      return;
    }

    setIsSavingUser(true);
    try {
      if (userModalMode === 'create') {
        await addAdminUser({
          name: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          password: userForm.password,
          role: userForm.role,
          phone: userForm.phone.trim(),
          isActive: userForm.isActive
        });
      } else if (editingUserId) {
        const updates: Partial<AdminUser> = {
          name: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          role: userForm.role,
          phone: userForm.phone.trim(),
          isActive: userForm.isActive
        };
        if (userForm.password && userForm.password.length >= 6) {
          updates.password = userForm.password;
        }
        await updateAdminUser(editingUserId, updates);
      }
      setShowUserModal(false);
    } catch (err: any) {
      setUserFormError(err?.message || 'Failed to save account');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleToggleUserActive = async (user: AdminUser) => {
    if (user.id === adminUser?.id) {
      showToast('You cannot deactivate your own currently active account', 'error');
      return;
    }
    await updateAdminUser(user.id, { isActive: !user.isActive });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    if (userToDelete.id === adminUser?.id) {
      showToast('You cannot delete your own currently active account', 'error');
      setShowDeleteUserConfirm(false);
      return;
    }
    await deleteAdminUser(userToDelete.id);
    setShowDeleteUserConfirm(false);
    setUserToDelete(null);
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

  const handleSaveSupabaseCredentials = async () => {
    setIsConnectingSupabase(true);
    setTestResult(null);
    try {
      const trimmedUrl = supabaseUrlInput.trim();
      const trimmedKey = supabaseKeyInput.trim();

      if (!trimmedUrl || !trimmedKey) {
        showToast("Please enter both Supabase URL and Anon Key", "error");
        return;
      }

      const res = await updateSupabaseCredentials(trimmedUrl, trimmedKey);
      setTestResult(res);
    } finally {
      setIsConnectingSupabase(false);
    }
  };

  const handleResetSupabaseCredentials = async () => {
    await clearSupabaseCredentials();
    const creds = getActiveCredentials();
    setSupabaseUrlInput(creds.url);
    setSupabaseKeyInput(creds.key);
    setTestResult(null);
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

  const getFullBackupPayload = (): DatabaseBackupPayload => ({
    settings: formData,
    services,
    sims,
    packages,
    offers,
    transactions,
    estimateCategories,
    estimateSizes,
    estimateServices,
    adminUsers
  });

  const handleGenerateSqlBackup = (autoDownload = false) => {
    setIsGeneratingBackup(true);
    try {
      const payload = getFullBackupPayload();
      const sql = generateSqlBackup(payload);
      const stats = getBackupStats(payload);
      setSqlBackupContent(sql);
      setSqlBackupStats(stats);

      if (autoDownload) {
        const filename = `FRHasanTech_Database_Backup_${new Date().toISOString().split('T')[0]}.sql`;
        downloadFile(sql, filename, 'application/sql');
        showToast(`Downloaded SQL database backup (${stats.totalRecords} records)!`, "success");
      } else {
        setShowSqlBackupModal(true);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to generate SQL backup", "error");
    } finally {
      setIsGeneratingBackup(false);
    }
  };

  const handleCopySqlBackup = () => {
    try {
      const payload = getFullBackupPayload();
      const sql = generateSqlBackup(payload);
      navigator.clipboard.writeText(sql);
      showToast("Live Database SQL backup script copied to clipboard!", "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to copy SQL backup", "error");
    }
  };

  const downloadBackupJSON = () => {
    try {
      const payload = getFullBackupPayload();
      const stats = getBackupStats(payload);
      const exportObject = {
        application: "FR.HASAN TECH - POS & Digital Services Platform",
        version: "2.0",
        exportedAt: new Date().toISOString(),
        shopName: formData.shopName || settings.shopName,
        stats,
        database: payload
      };
      const blob = new Blob([JSON.stringify(exportObject, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FRHasanTech_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`Full JSON backup downloaded (${stats.totalRecords} records)!`, "success");
    } catch (err: any) {
      showToast(err?.message || "Failed to export JSON backup", "error");
    }
  };

  const config = getSupabaseConfig();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">System & Shop Settings</h2>
          <p className="text-xs text-gray-500">Configure business information, branding visuals, POS parameters, receipt templates, and Supabase database backend</p>
        </div>

        {showSaveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings saved successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs / Section Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-gray-200/70 p-1.5 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveSection('shop')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'shop' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Shop Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('branding')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'branding' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Logo & Media</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('pos')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'pos' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>POS & Slips</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('supabase')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors relative ${
            activeSection === 'supabase' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Supabase DB</span>
          {isSupabaseConnected && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('security')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'security' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('data')}
          className={`py-2.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            activeSection === 'data' ? 'bg-white text-[#1E5AA8] shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Backup & Reset</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-soft-sm p-6 space-y-6">
        
        {/* SECTION 1: SHOP INFORMATION */}
        {activeSection === 'shop' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Store className="w-4 h-4 text-[#1E5AA8]" />
                <span>Public Storefront Details</span>
              </h3>
              <span className="text-[11px] text-gray-400">Updates live public contact cards & footer</span>
            </div>

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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Google Maps Direct Link</label>
                <input
                  type="text"
                  value={formData.googleMapsUrl || ''}
                  onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
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
                  placeholder="https://www.google.com/maps/embed?..."
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-md flex items-center gap-2 shadow-soft-sm active-press transition-colors disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSavingSettings ? 'animate-spin' : ''}`} />
                <span>{isSavingSettings ? 'Saving...' : 'Save Store Details'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SECTION 2: BRANDING & MEDIA */}
        {activeSection === 'branding' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#1E5AA8]" />
                <span>Visual Brand, Hero Backdrop & Leadership Media</span>
              </h3>
            </div>

            {/* 1. Official Store Logo */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-24 h-24 shrink-0 bg-white rounded-xl border border-slate-200 p-2 flex items-center justify-center shadow-soft-xs">
                  {formData.logoUrl && formData.logoUrl !== '/fr-hasan-logo.svg' ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Store Logo" 
                      className="max-h-full max-w-full object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <FRHasanLogo className="w-full h-full" />
                  )}
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <span className="font-bold text-sm text-slate-900 block">Official Shop Logo / Badge</span>
                  <p className="text-xs text-slate-500">
                    Displayed across header navigation, customer receipts, and digital share cards.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <label className="px-3.5 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Custom Logo</span>
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
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        aboutContent: {
                          title: prev.aboutContent?.title || '',
                          subtitle: prev.aboutContent?.subtitle || '',
                          story: prev.aboutContent?.story || '',
                          mission: prev.aboutContent?.mission || '',
                          ...(prev.aboutContent || {}),
                          ceoPhoto: e.target.value
                        }
                      }))}
                      placeholder="https://res.cloudinary.com/..."
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">CEO Name</label>
                    <input
                      type="text"
                      value={formData.aboutContent?.ceoName || 'FR Hasan'}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        aboutContent: {
                          title: prev.aboutContent?.title || '',
                          subtitle: prev.aboutContent?.subtitle || '',
                          story: prev.aboutContent?.story || '',
                          mission: prev.aboutContent?.mission || '',
                          ...(prev.aboutContent || {}),
                          ceoName: e.target.value
                        }
                      }))}
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">CEO Quote / Vision</label>
                    <input
                      type="text"
                      value={formData.aboutContent?.ceoQuote || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        aboutContent: {
                          title: prev.aboutContent?.title || '',
                          subtitle: prev.aboutContent?.subtitle || '',
                          story: prev.aboutContent?.story || '',
                          mission: prev.aboutContent?.mission || '',
                          ...(prev.aboutContent || {}),
                          ceoQuote: e.target.value
                        }
                      }))}
                      className="w-full p-2 bg-white border border-gray-300 rounded-md text-xs text-gray-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-md flex items-center gap-2 shadow-soft-sm active-press transition-colors disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSavingSettings ? 'animate-spin' : ''}`} />
                <span>{isSavingSettings ? 'Saving...' : 'Save Media & Branding'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SECTION 3: POS & RECEIPT */}
        {activeSection === 'pos' && (
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#1E5AA8]" />
                <span>Point of Sale & Thermal Slip Settings</span>
              </h3>
            </div>

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
                  placeholder="Rs. or LKR"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
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
                placeholder="FR.HASAN TECH - Complete Communication Hub"
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
                placeholder="Thank you for your business! Visit again."
                className="w-full p-2.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:border-[#1E5AA8] outline-none"
              />
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-md flex items-center gap-2 shadow-soft-sm active-press transition-colors disabled:opacity-50"
              >
                <Save className={`w-4 h-4 ${isSavingSettings ? 'animate-spin' : ''}`} />
                <span>{isSavingSettings ? 'Saving...' : 'Save POS Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SECTION 4: SUPABASE BACKEND & SQL SETUP */}
        {activeSection === 'supabase' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#1E5AA8]" />
                  <span>Supabase PostgreSQL Database Configuration</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct database synchronization for services catalog, SIM inventory, reload plans, and POS ledger.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                  isSupabaseConnected 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'}`} />
                  <span>{isSupabaseConnected ? 'Connected to PostgreSQL' : 'Local Fallback Mode'}</span>
                </span>
              </div>
            </div>

            {/* Interactive Connection Credentials Card */}
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-[#1E5AA8]" />
                  <span>API Connection Credentials</span>
                </span>
                {config.isCustomStored && (
                  <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">
                    Saved in Browser Storage
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Supabase Project URL (VITE_SUPABASE_URL) *
                  </label>
                  <input
                    type="url"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://tvcuhvtoegvfrsfihgfh.supabase.co"
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-[#1E5AA8] outline-none"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">Your project URL from Supabase Dashboard</span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Supabase Anon Key (VITE_SUPABASE_ANON_KEY) *
                  </label>
                  <div className="relative">
                    <input
                      type={showKeySecret ? 'text' : 'password'}
                      value={supabaseKeyInput}
                      onChange={(e) => setSupabaseKeyInput(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full p-2.5 pr-10 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKeySecret(!showKeySecret)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Use the `anon public` key (JWT or publishable string)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSaveSupabaseCredentials}
                  disabled={isConnectingSupabase}
                  className="px-4 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-soft-xs transition-colors disabled:opacity-50 active-press"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isConnectingSupabase ? 'animate-spin' : ''}`} />
                  <span>{isConnectingSupabase ? 'Verifying & Saving...' : 'Save & Connect Database'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTestingConn}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingConn ? 'animate-spin' : ''}`} />
                  <span>{isTestingConn ? 'Testing Query...' : 'Test Connection & Tables'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-soft-xs transition-colors disabled:opacity-50"
                >
                  <Table className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
                  <span>{isSeeding ? 'Seeding Tables...' : 'Seed / Sync Catalog to Supabase'}</span>
                </button>

                {config.isCustomStored && (
                  <button
                    type="button"
                    onClick={handleResetSupabaseCredentials}
                    className="px-3 py-2 text-slate-500 hover:text-red-600 text-xs font-medium transition-colors ml-auto"
                  >
                    Reset to Defaults
                  </button>
                )}

                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <span>Supabase Dashboard</span>
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
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-emerald-200 font-mono text-[11px]">
                      <div>services: <strong>{testResult.tables['services'] ?? 0} rows</strong></div>
                      <div>sim_cards: <strong>{testResult.tables['sim_cards'] ?? 0} rows</strong></div>
                      <div>mobile_packages: <strong>{testResult.tables['mobile_packages'] ?? 0} rows</strong></div>
                      <div>pos_transactions: <strong>{testResult.tables['pos_transactions'] ?? 0} rows</strong></div>
                      <div>offers: <strong>{testResult.tables['offers'] !== undefined ? `${testResult.tables['offers']} rows` : 'Table Not Found'}</strong></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SQL Script Viewer & Copy */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-xs text-gray-900 uppercase tracking-wider">PostgreSQL Schema & Migration Scripts (SQL)</h4>
                  <p className="text-[11px] text-gray-500">Run in your Supabase SQL Editor to ensure all tables (including offers) are active.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleGenerateSqlBackup(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1E5AA8] hover:bg-[#164785] text-white flex items-center gap-1.5 transition-colors shadow-soft-xs cursor-pointer"
                    title="Export live store data as an executable SQL backup script"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Export Live Data SQL</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(SUPABASE_OFFERS_SQL_MIGRATION);
                      showToast('Offers Migration SQL copied! Paste in Supabase SQL Editor.', 'success');
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1.5 transition-colors shadow-soft-xs cursor-pointer"
                    title="Copy only the SQL to add the 'offers' table"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Offers SQL Only</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySql}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-soft-xs cursor-pointer ${
                      copiedSql ? 'bg-emerald-600 text-white' : 'bg-slate-800 hover:bg-black text-white'
                    }`}
                  >
                    {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSql ? 'Copied Full SQL!' : 'Copy Full SQL Script'}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-300 bg-slate-900 text-slate-100 p-4 font-mono text-xs max-h-72 overflow-y-auto leading-relaxed shadow-inner">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: SECURITY & ADMIN (DATABASE-BACKED AUTHENTICATION) */}
        {activeSection === 'security' && (
          <div className="space-y-6">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#1E5AA8]" />
                  <span>Admin Authentication & Staff Management</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Manage database-backed accounts in the <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono text-gray-700">public.admin_users</code> table with Role-Based Access Control.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#1E5AA8] border border-blue-200">
                  {adminUsers.length} {adminUsers.length === 1 ? 'Account' : 'Accounts'}
                </span>
                <button
                  type="button"
                  onClick={handleOpenCreateUser}
                  className="px-3 py-1.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-soft-xs cursor-pointer active-press"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Admin / Staff</span>
                </button>
              </div>
            </div>

            {/* Diagnostics Card: Check Database Authentication Table */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E5AA8] flex items-center justify-center font-bold shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 block flex items-center gap-2">
                      <span>Database Table: <code>public.admin_users</code></span>
                      <span className={`px-2 py-0.5 text-[10.5px] rounded-full font-medium ${
                        isSupabaseConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isSupabaseConnected ? 'Supabase Connected' : 'Local / Offline Cache'}
                      </span>
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Provides persistent credential verification, custom roles, and encrypted SQL backups.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={isTestingAdminAuth}
                    onClick={handleTestAdminUsersTable}
                    className="px-3 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTestingAdminAuth ? 'animate-spin text-[#1E5AA8]' : ''}`} />
                    <span>{isTestingAdminAuth ? 'Testing Table...' : 'Verify Auth Table'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyAdminMigrationSql}
                    className="px-3 py-2 bg-slate-800 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedAdminMigration ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedAdminMigration ? 'Copied SQL!' : 'Copy Migration SQL'}</span>
                  </button>
                </div>
              </div>

              {/* Diagnostic Test Result Banner */}
              {testAdminAuthResult && (
                <div className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                  testAdminAuthResult.ok 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  {testAdminAuthResult.ok ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{testAdminAuthResult.message}</p>
                    {testAdminAuthResult.ok && typeof testAdminAuthResult.userCount === 'number' && (
                      <p className="text-[11px] text-emerald-700 mt-0.5">
                        Detected {testAdminAuthResult.userCount} active staff record(s) in remote database table.
                      </p>
                    )}
                    {!testAdminAuthResult.ok && (
                      <p className="text-[11px] text-amber-700 mt-1">
                        If the table does not exist in your database yet, click "Copy Migration SQL" above and paste it into your Supabase SQL Editor.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Current Active Session */}
            <div className="p-4 rounded-xl bg-white border border-gray-200 shadow-soft-xs space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Current Active Session
              </span>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-gray-900">{adminUser?.name || 'Administrator'}</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        {adminUser?.role || 'Super-Admin'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-600 block mt-0.5">{adminUser?.email}</span>
                    {adminUser?.phone && (
                      <span className="text-xs text-gray-400 block font-mono mt-0.5">{adminUser.phone}</span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPasswordModal(true)}
                  className="px-3.5 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-soft-xs cursor-pointer active-press transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Change My Password</span>
                </button>
              </div>
            </div>

            {/* Staff & Administrator Accounts Directory */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[#1E5AA8]" />
                    <span>Staff & Administrator Accounts</span>
                  </h4>
                  <p className="text-xs text-gray-500">
                    Accounts can log in at <code className="font-mono text-gray-700 bg-gray-100 px-1 rounded">/admin/login</code> with customized shop access levels.
                  </p>
                </div>
              </div>

              {adminUsers.length === 0 ? (
                <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                  <Shield className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-xs text-gray-500 font-medium">No admin accounts configured.</p>
                  <button
                    type="button"
                    onClick={handleOpenCreateUser}
                    className="mt-3 px-3 py-1.5 bg-[#1E5AA8] text-white text-xs font-bold rounded-lg"
                  >
                    Add Default Admin
                  </button>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-xl overflow-hidden shadow-soft-xs bg-white">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-4">Role</th>
                          <th className="py-3 px-4">Phone</th>
                          <th className="py-3 px-4 text-center">Status</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-xs">
                        {adminUsers.map((user) => {
                          const isCurrent = user.id === adminUser?.id;
                          return (
                            <tr key={user.id} className={`hover:bg-slate-50/70 transition-colors ${!user.isActive ? 'opacity-60 bg-gray-50/50' : ''}`}>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {user.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-gray-900">{user.name}</span>
                                      {isCurrent && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-[#1E5AA8]">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-gray-500 font-mono block">{user.email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  user.role === 'Super-Admin'
                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                    : user.role === 'Admin'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : user.role === 'Manager'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                                }`}>
                                  {user.role}
                                </span>
                              </td>

                              <td className="py-3 px-4 font-mono text-gray-600">
                                {user.phone || '—'}
                              </td>

                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  disabled={isCurrent}
                                  onClick={() => handleToggleUserActive(user)}
                                  title={isCurrent ? "You cannot deactivate your own account" : "Click to toggle active status"}
                                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                                    user.isActive
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  } ${isCurrent ? 'cursor-not-allowed opacity-80' : 'cursor-pointer'}`}
                                >
                                  {user.isActive ? 'Active' : 'Deactivated'}
                                </button>
                              </td>

                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditUser(user)}
                                    className="p-1.5 text-gray-500 hover:text-[#1E5AA8] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                    title="Edit User Details & Password"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isCurrent || adminUsers.length <= 1}
                                    onClick={() => {
                                      setUserToDelete(user);
                                      setShowDeleteUserConfirm(true);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      isCurrent || adminUsers.length <= 1
                                        ? 'text-gray-300 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                                    }`}
                                    title={isCurrent ? "Cannot delete yourself" : adminUsers.length <= 1 ? "Cannot delete last admin" : "Delete Account"}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* SQL Migration Script Box (Collapsible / Reference) */}
            <div className="border border-slate-200 rounded-xl bg-slate-900 text-slate-200 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  <span>SQL DDL Schema: public.admin_users</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyAdminMigrationSql}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedAdminMigration ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAdminMigration ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto leading-relaxed scrollbar-thin">
                {SUPABASE_ADMIN_USERS_SQL_MIGRATION}
              </pre>
            </div>

            {/* Row Level Security Note */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1">
              <span className="font-bold block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1E5AA8]" />
                <span>Security & Persistence Guarantee:</span>
              </span>
              <span>All authentication sessions are verified and persisted safely in client-side state and protected by Supabase Row Level Security (RLS). SQL exports include full admin DDL and INSERT scripts.</span>
            </div>

          </div>
        )}

        {/* SECTION 6: DATA MANAGEMENT & BACKUP */}
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

            {/* Backup & System Data Export */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-soft-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#1E5AA8]" />
                    <span>Database Backup & Data Export</span>
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Export your complete store catalog, inventory, POS sales, and configuration as ready-to-use SQL or portable JSON.
                  </p>
                </div>
                
                {/* Live Catalog Status Badge */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                  <span>Live Catalog:</span>
                  <span className="text-[#1E5AA8] font-bold">
                    {services.length} Services · {sims.length} SIMs · {packages.length} Plans · {transactions.length} Sales
                  </span>
                </div>
              </div>

              {/* Two Column Grid: SQL Backup (New Option!) vs JSON Backup */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. SQL BACKUP CARD (PROMINENT & SUPABASE-READY) */}
                <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/60 to-white flex flex-col justify-between space-y-4 shadow-soft-xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E5AA8] flex items-center justify-center font-bold">
                          <FileCode className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-slate-900 block">SQL Database Backup (.sql)</span>
                          <span className="text-[11px] text-[#1E5AA8] font-semibold">Supabase & PostgreSQL Dump</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1E5AA8] text-white">
                        Recommended
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Generates a full executable SQL script containing table DDL schemas, security policies, and idempotent <code className="font-mono text-blue-900 bg-blue-100/70 px-1 py-0.5 rounded">ON CONFLICT DO UPDATE</code> inserts for all live records. Run directly in Supabase SQL Editor.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10.5px]">
                      <span className="px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-800 font-medium">9 Tables Supported</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-800 font-medium">Safe Re-runnable DDL</span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100/80 text-blue-800 font-medium">Auto Escaped Data</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <button
                      type="button"
                      disabled={isGeneratingBackup}
                      onClick={() => handleGenerateSqlBackup(true)}
                      className="flex-1 py-2.5 px-3.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-soft-xs active-press cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .SQL Backup</span>
                    </button>

                    <button
                      type="button"
                      disabled={isGeneratingBackup}
                      onClick={() => handleGenerateSqlBackup(false)}
                      className="py-2.5 px-3 bg-white hover:bg-blue-50 text-[#1E5AA8] border border-blue-300 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileCode className="w-3.5 h-3.5" />
                      <span>Preview / Copy</span>
                    </button>
                  </div>
                </div>

                {/* 2. JSON BACKUP CARD */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold">
                        <FileJson className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">JSON System Snapshot (.json)</span>
                        <span className="text-[11px] text-slate-500 font-medium">Universal Application Dump</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Exports complete JSON structure containing shop profile, services catalog, SIM cards, mobile packages, special offers, POS transaction logs, and estimate calculator configurations.
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1 text-[10.5px]">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium">All 9 Data Tables</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium">Universal Format</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-medium">Timestamped</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center">
                    <button
                      type="button"
                      onClick={downloadBackupJSON}
                      className="w-full py-2.5 px-3.5 bg-slate-800 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-soft-xs active-press cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Factory Reset */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Restore Factory Data</h4>
                <p className="text-xs text-slate-600 mt-0.5">Reset application state back to official FR.HASAN TECH initial configuration.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2.5 bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
              >
                Reset to Initial Templates
              </button>
            </div>
          </div>
        )}

      </div>

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
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {isChangingPassword && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isChangingPassword ? 'Saving to Database...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin User Create / Edit Modal */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1E5AA8]" />
                <span>{userModalMode === 'create' ? 'Add New Administrator / Staff' : 'Edit Staff Account'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowUserModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            {userFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{userFormError}</span>
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. M. F. M. Hasan"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="staff@frhasantech.com"
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {userModalMode === 'create' ? 'Password * (min 6 characters)' : 'New Password (leave blank to keep current)'}
                </label>
                <input
                  type="password"
                  required={userModalMode === 'create'}
                  value={userForm.password || ''}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder={userModalMode === 'create' ? '••••••••' : 'Leave unchanged'}
                  className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-[#1E5AA8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value as AdminRole }))}
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-[#1E5AA8]"
                  >
                    <option value="Super-Admin">Super-Admin</option>
                    <option value="Admin">Admin</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={userForm.phone}
                    onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="076 859 7800"
                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 outline-none focus:border-[#1E5AA8]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="userActiveStatus"
                  checked={userForm.isActive}
                  onChange={(e) => setUserForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-[#1E5AA8] rounded border-gray-300 focus:ring-[#1E5AA8]"
                />
                <label htmlFor="userActiveStatus" className="font-semibold text-gray-700 cursor-pointer">
                  Account is Active (can sign in to admin dashboard)
                </label>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingUser}
                  className="px-4 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                >
                  {isSavingUser && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{userModalMode === 'create' ? 'Create Account' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteUserConfirm}
        title="Delete Staff Account?"
        message={`Are you sure you want to permanently remove "${userToDelete?.name}" (${userToDelete?.email})? This user will no longer be able to log in.`}
        confirmLabel="Yes, Delete Account"
        onConfirm={handleDeleteUser}
        onCancel={() => {
          setShowDeleteUserConfirm(false);
          setUserToDelete(null);
        }}
      />

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

      {/* Database SQL Backup Preview & Download Modal */}
      {showSqlBackupModal && sqlBackupStats && (
        <SqlBackupModal
          isOpen={showSqlBackupModal}
          onClose={() => setShowSqlBackupModal(false)}
          sqlContent={sqlBackupContent}
          stats={sqlBackupStats}
          shopName={formData.shopName || settings.shopName}
        />
      )}

    </div>
  );
};
