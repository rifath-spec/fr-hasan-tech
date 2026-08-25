import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  MessageCircle, 
  Menu, 
  X, 
  Printer, 
  ChevronRight, 
  ShieldCheck, 
  Copy, 
  Smartphone, 
  Package, 
  Home as HomeIcon, 
  Info, 
  MapPin,
  Sparkles,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FRHasanLogo } from '../common/FRHasanLogo';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const PublicHeader: React.FC = () => {
  const { currentPath, navigate, settings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navItems = [
    { label: 'Home', path: '/', icon: HomeIcon },
    { label: 'Services', path: '/services', icon: Sparkles },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Contact', path: '/contact', icon: MapPin },
  ];

  const serviceLinks = [
    { label: 'Photocopy (B&W / Color)', path: '/services/photocopy', icon: Copy, badge: 'From LKR 5' },
    { label: 'Laser & Photo Printing', path: '/services/printing', icon: Printer, badge: 'HD Color' },
    { label: 'SIM Cards & eSIMs', path: '/services/sims', icon: Smartphone, badge: 'Instant Reg' },
    { label: 'Packages & Reloads', path: '/services/packages', icon: Package, badge: 'All Telcos' },
  ];

  const handleWhatsAppClick = () => {
    openWhatsAppChat(
      settings.whatsappNumber || '076 859 7800',
      `Hello ${settings.shopName}, I would like to inquire about your services.`
    );
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  const groupUrl = settings.whatsappGroupUrl || 'https://chat.whatsapp.com/Gn3gKNe98zeLMzwVYsETNn?s=cl&p=a&ilr=4';

  return (
    <>
      {/* Main Sticky Header */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-soft-sm transition-all">
        <div className="w-full max-w-[1760px] mx-auto h-16 sm:h-20 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between">
          
          {/* Brand Left: Logo + Shop Name */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none group"
            role="button"
            tabIndex={0}
          >
            <FRHasanLogo 
              size="md" 
              variant="horizontal" 
              showLocation={true} 
              customSrc={settings.logoUrl} 
            />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1.5 bg-slate-100/90 backdrop-blur-sm rounded-full border border-slate-200 shadow-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className={`group relative px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer select-none active:scale-[0.97] ${
                    active
                      ? 'bg-[#1E5AA8] text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-[#1E5AA8] hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                      active
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-[#1E5AA8]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Actions Right */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Join WhatsApp Group CTA button replacing Admin button */}
            <a
              href={groupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#25D366] hover:bg-[#20bd5a] rounded-full transition-all cursor-pointer shadow-xs active-press border border-white/20"
              title="Join our official WhatsApp Community Group"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              <span>Join Group</span>
            </a>

            {/* WhatsApp Direct Chat CTA button */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="h-9 w-9 sm:w-auto sm:px-4 sm:py-2 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-white flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold shadow-xs active-press transition-all shrink-0 cursor-pointer"
              title="Direct Chat on WhatsApp"
              aria-label="WhatsApp Contact"
            >
              <MessageCircle className="w-4 h-4 fill-white text-[#F59E0B]" />
              <span className="hidden sm:inline">Chat</span>
            </button>

            {/* Hamburger Menu on Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-full text-[#2D3748] hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>


      {/* Portal-rendered Mobile Menu Drawer for 100% reliable viewport layering */}
      {mounted && createPortal(
        <AnimatePresence>
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-[100] md:hidden">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setMobileMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              />

              {/* Slide-in Drawer */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                className="fixed top-0 right-0 bottom-0 w-[85%] max-w-[340px] bg-white h-full shadow-2xl flex flex-col z-[101] overflow-hidden"
              >
                {/* Drawer Header */}
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div onClick={() => handleNav('/')} className="cursor-pointer">
                    <FRHasanLogo 
                      size="sm" 
                      variant="horizontal" 
                      showLocation={false} 
                      customSrc={settings.logoUrl} 
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/70 active:bg-slate-300 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Drawer Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
                  
                  {/* Primary Navigation Links */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                      Main Menu
                    </span>
                    <div className="space-y-1">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <button
                            key={item.path}
                            type="button"
                            onClick={() => handleNav(item.path)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold text-left transition-all active:scale-[0.98] ${
                              active
                                ? 'bg-[#1E5AA8] text-white shadow-soft-sm'
                                : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight className={`w-4 h-4 ${active ? 'text-white/80' : 'text-slate-400'}`} />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direct Service Quick Links */}
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 block mb-2">
                      Direct Services
                    </span>
                    <div className="space-y-1">
                      {serviceLinks.map((srv) => {
                        const Icon = srv.icon;
                        const active = currentPath === srv.path;
                        return (
                          <button
                            key={srv.path}
                            type="button"
                            onClick={() => handleNav(srv.path)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all active:scale-[0.98] ${
                              active
                                ? 'bg-blue-50 text-[#1E5AA8] border border-blue-200 font-bold'
                                : 'text-slate-600 hover:bg-slate-50 active:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center shrink-0">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span>{srv.label}</span>
                            </div>
                            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                              {srv.badge}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Shop Details Box */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
                    <p className="font-bold text-slate-800">{settings.shopName}</p>
                    <p className="text-[11px] text-slate-500">529, Siraj Nagar, Thampalagamam (Mullipotana)</p>
                    <p className="text-[11px] text-emerald-600 font-semibold pt-1">
                      Open: 7:00 AM – 10:00 PM (Fri: 3–9 PM)
                    </p>
                  </div>

                </div>

                {/* Drawer Footer Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
                  <a
                    href={groupUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-sm active:scale-[0.98] transition-all"
                  >
                    <Users className="w-4 h-4 text-white" />
                    <span>Join WhatsApp Group</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      handleWhatsAppClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-sm active:scale-[0.98] transition-all"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#F59E0B]" />
                    <span>Chat on WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNav('/admin/dashboard')}
                    className="w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#1E5AA8]" />
                    <span>Admin Console</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

