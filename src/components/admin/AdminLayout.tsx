import React, { useState, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Grid, 
  Smartphone, 
  Package, 
  CreditCard, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Plus, 
  Globe, 
  ChevronRight, 
  Receipt,
  User,
  Shield,
  TrendingUp,
  DollarSign,
  Calculator
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle }) => {
  const { currentPath, navigate, logoutAdmin, adminUser, settings, isAdminAuthenticated, transactions } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // If not logged in, redirect to login
  if (!isAdminAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  // Calculate today's live revenue & transaction count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxs = (transactions || []).filter(t => t.date === todayStr);
  const todaySalesTotal = todayTxs
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + (t.totalAmount || 0), 0);

  const sidebarItems = [
    { label: 'Point of Sale (POS)', path: '/admin/pos', icon: Receipt, badge: 'Main POS' },
    { label: 'Record New Sale', path: '/admin/pos/new-sale', icon: Plus, isSub: true },
    { label: 'Transactions Ledger', path: '/admin/pos/transactions', icon: Receipt, isSub: true },
    { label: 'Revenue Reports', path: '/admin/pos/reports', icon: TrendingUp, isSub: true },
    { label: 'Services & Pricing', path: '/admin/services', icon: Grid },
    { label: 'Estimate Calculator', path: '/admin/estimate-settings', icon: Calculator, badge: 'New' },
    { label: 'SIM Management', path: '/admin/sims', icon: Smartphone },
    { label: 'Packages', path: '/admin/packages', icon: Package },
    { label: 'Overview Analytics', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin/pos') {
      return currentPath === '/admin/pos' || currentPath === '/admin/pos/dashboard';
    }
    if (path === '/admin/dashboard') {
      return currentPath === '/admin/dashboard';
    }
    return currentPath.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col lg:flex-row">
      
      {/* Mobile Top Header (Height 56px, Background #1E293B) */}
      <div className="lg:hidden h-14 bg-[#1E293B] text-white px-4 flex items-center justify-between sticky top-0 z-40 shadow-soft-md">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 active-press text-white"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#1E5AA8] flex items-center justify-center font-bold text-xs">
            POS
          </div>
          <span className="font-bold text-sm tracking-tight">Admin & POS Console</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/pos/new-sale')}
            className="p-2 rounded-lg bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow-xs"
            title="New Sale"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Fixed Left Sidebar (Width 260px, Background #1E293B) */}
      <aside className="hidden lg:flex w-[260px] bg-[#1E293B] text-white flex-col fixed top-0 bottom-0 left-0 z-30 select-none">
        
        {/* Top Logo Area */}
        <div className="p-4 pb-4 border-b border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E5AA8] to-[#0D47A1] text-white flex items-center justify-center font-bold shadow-md">
              <Receipt className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-sm text-white truncate leading-tight">
                {settings.shopName}
              </h2>
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                POS Register Ready
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all min-h-[40px] ${
                  item.isSub ? 'pl-7 text-xs opacity-90' : ''
                } ${
                  active
                    ? 'bg-[#1E5AA8] text-white shadow-soft-sm font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : item.isSub ? 'text-slate-500' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[9px] uppercase font-bold bg-[#F59E0B] text-slate-900 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick POS Short-cuts in Sidebar */}
        <div className="px-3 pb-3">
          <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <span>Fast Actions</span>
              <Receipt className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => navigate('/admin/pos/new-sale')}
                className="py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center active-press transition-colors shadow-xs"
              >
                + Sale
              </button>
              <button
                onClick={() => navigate('/admin/pos/new-expense')}
                className="py-1.5 px-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold text-center active-press transition-colors shadow-xs"
              >
                + Expense
              </button>
            </div>
          </div>
        </div>

        {/* Bottom User info & Logout */}
        <div className="p-3 border-t border-slate-700/80 bg-slate-900/60">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">{adminUser?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{adminUser?.email}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Open Public Website"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Public Site</span>
            </button>
            <button
              onClick={logoutAdmin}
              className="p-1.5 rounded bg-slate-800 hover:bg-red-900/60 text-slate-300 hover:text-red-300 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-[100] lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileSidebarOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              />

              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed top-0 bottom-0 left-0 w-[85%] max-w-[290px] bg-[#1E293B] text-white z-[101] shadow-2xl flex flex-col overflow-hidden h-full"
              >
                {/* Drawer Header */}
                <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#1E5AA8] text-white flex items-center justify-center font-bold text-xs">
                      <Receipt className="w-4 h-4 text-[#F59E0B]" />
                    </div>
                    <span className="font-bold text-sm text-white truncate max-w-[170px]">
                      {settings.shopName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <button
                        key={item.path}
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] min-h-[42px] ${
                          item.isSub ? 'pl-6 opacity-90' : ''
                        } ${
                          active
                            ? 'bg-[#1E5AA8] text-white shadow-soft-sm font-bold'
                            : 'text-slate-300 hover:bg-slate-800 active:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="truncate">{item.label}</span>
                        {item.badge && (
                          <span className="ml-auto text-[9px] uppercase font-bold bg-[#F59E0B] text-slate-900 px-1.5 py-0.5 rounded font-mono">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Drawer Bottom */}
                <div className="p-4 border-t border-slate-700 space-y-2 bg-slate-900/60">
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/');
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>View Public Website</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      logoutAdmin();
                      setMobileSidebarOpen(false);
                    }}
                    className="w-full py-2.5 bg-red-950/50 text-red-300 hover:bg-red-900/60 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Main Content Area (Margin-left 260px on desktop) */}
      <div className="flex-1 lg:ml-[260px] flex flex-col min-h-screen">
        
        {/* Top Navigation Bar (Height 64px, Background White, Shadow-sm) */}
        <header className="h-16 bg-white border-b border-gray-200 shadow-soft-sm px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          
          {/* Left Title & Breadcrumbs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right Action buttons & status */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Live Today's POS Sales Counter Pill in Header */}
            <div 
              onClick={() => navigate('/admin/pos')}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold cursor-pointer hover:bg-emerald-100/70 transition-colors"
              title="Click to open POS Register"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700">Today's Sales:</span>
              <span className="font-bold font-mono text-emerald-800">
                LKR {todaySalesTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Direct Quick Sale & Quick Expense CTAs on Header */}
            <button
              onClick={() => navigate('/admin/pos/new-sale')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#10B981] hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-soft-sm active-press transition-colors min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Record Sale</span>
              <span className="sm:hidden">Sale</span>
            </button>

            <button
              onClick={() => navigate('/admin/pos/new-expense')}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-soft-sm active-press transition-colors min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Expense</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center relative transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#EF4444]"></span>
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-soft-xl border border-gray-200 p-3 z-30 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100 font-bold text-gray-800">
                    <span>Recent Alerts</span>
                    <span className="text-[10px] text-gray-500 font-normal">Updated just now</span>
                  </div>
                  <div className="py-2 space-y-2">
                    <div className="p-2 rounded bg-amber-50 text-amber-800">
                      <span className="font-semibold block">SIM Stock Reminder</span>
                      <span>Mobitel Master Data SIM is low on stock (2 units left).</span>
                    </div>
                    <div className="p-2 rounded bg-blue-50 text-blue-800">
                      <span className="font-semibold block">POS System Ready</span>
                      <span>Transactions and reports running smoothly.</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="w-full text-center text-gray-500 hover:text-gray-800 pt-1 text-[11px]"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <div 
              onClick={() => navigate('/admin/settings')}
              className="flex items-center gap-2 cursor-pointer p-1 rounded-xl hover:bg-gray-50"
            >
              <div className="w-9 h-9 rounded-full bg-[#1E5AA8] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {adminUser?.name.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-gray-800 block leading-tight">{adminUser?.name}</span>
                <span className="text-[10px] text-gray-500 leading-tight">Admin</span>
              </div>
            </div>

          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

    </div>
  );
};
