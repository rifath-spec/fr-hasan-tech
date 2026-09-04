import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../context/AppContext';
import { 
  MessageCircle, 
  Menu, 
  X, 
  Printer, 
  ChevronRight, 
  Copy, 
  Smartphone, 
  Package, 
  Home as HomeIcon, 
  Info, 
  MapPin,
  Sparkles,
  Users,
  Tag
} from 'lucide-react';
import { FRHasanLogo } from '../common/FRHasanLogo';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const PublicHeader: React.FC = () => {
  const { currentPath, navigate, settings, offers } = useApp();
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

  const activeOffersCount = (offers || []).filter(o => o.active !== false && o.isPublished !== false).length;

  const navItems = [
    { label: 'Home', path: '/', icon: HomeIcon },
    { label: 'Services', path: '/services', icon: Sparkles },
    { label: 'Offers', path: '/offers', icon: Tag, badge: activeOffersCount > 0 ? `${activeOffersCount}` : undefined },
    { label: 'About', path: '/about', icon: Info },
    { label: 'Contact', path: '/contact', icon: MapPin },
  ];

  const serviceLinks = [
    { label: 'Photocopy (B&W / Color)', path: '/services?category=Photocopy', icon: Copy, badge: 'From LKR 5' },
    { label: 'Laser & Photo Printing', path: '/services?category=Printing', icon: Printer, badge: 'HD Color' },
    { label: 'SIM Cards & eSIMs', path: '/services?category=SIM Cards', icon: Smartphone, badge: 'Instant Reg' },
    { label: 'Packages & Reloads', path: '/services?category=Packages', icon: Package, badge: 'All Telcos' },
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
      {/* Main Sticky Header with Deep Navy Gradient Theme */}
      <header 
        className="sticky top-0 left-0 right-0 z-40 transition-all border-b"
        style={{
          background: 'linear-gradient(90deg, #062B5C 0%, #0A4385 100%)',
          borderColor: 'rgba(255, 255, 255, 0.12)',
          boxShadow: '0 4px 20px -2px rgba(6, 43, 92, 0.25)'
        }}
      >
        <div className="w-full max-w-[1760px] mx-auto h-16 sm:h-[68px] px-3.5 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Left: Logo + Shop Name */}
          <div 
            onClick={() => handleNav('/')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none shrink-0 min-w-0"
            role="button"
            tabIndex={0}
          >
            <FRHasanLogo 
              size="sm" 
              variant="horizontal" 
              showLocation={true} 
              theme="dark" 
              customSrc={settings.logoUrl} 
            />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 bg-white/[0.06] backdrop-blur-md rounded-full border border-white/[0.12] shadow-xs">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => handleNav(item.path)}
                  className={`group relative px-4 lg:px-5 py-2 rounded-full text-xs lg:text-sm font-semibold transition-all duration-200 cursor-pointer select-none active:scale-[0.97] flex items-center gap-1.5 ${
                    active
                      ? 'bg-white text-[#062B5C] shadow-sm font-bold'
                      : 'text-[#E8F1FF] hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                      active ? 'bg-amber-500 text-white' : 'bg-amber-400/90 text-slate-900'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Header Actions Right */}
          <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 shrink-0">
            {/* Green Join WhatsApp Group CTA button (hidden on mobile, available in mobile menu) */}
            <a
              href={groupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl transition-all cursor-pointer shadow-sm active-press border border-white/20 whitespace-nowrap"
              style={{ backgroundColor: '#16B95A' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#12A94F')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16B95A')}
              title="Join our official WhatsApp Community Group"
            >
              <Users className="w-4 h-4 text-white shrink-0" />
              <span>Join Group</span>
            </a>

            {/* Orange Chat Direct CTA button (hidden on mobile, available in mobile menu) */}
            <button
              type="button"
              onClick={handleWhatsAppClick}
              className="hidden md:flex px-4 py-2 rounded-xl text-white items-center justify-center gap-2 text-xs sm:text-sm font-semibold shadow-sm active-press transition-all shrink-0 cursor-pointer border border-white/20 whitespace-nowrap"
              style={{ backgroundColor: '#FF9D1C' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F28C08')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FF9D1C')}
              title="Direct Chat on WhatsApp"
              aria-label="WhatsApp Contact"
            >
              <MessageCircle className="w-4 h-4 text-white fill-white shrink-0" />
              <span className="text-xs sm:text-sm font-bold">Chat</span>
            </button>

            {/* Hamburger Menu on Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white bg-white/10 hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors cursor-pointer border border-white/20 shrink-0"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </header>


      {/* Portal-rendered Mobile Menu Drawer for 100% reliable viewport layering */}
      {mounted && mobileMenuOpen && createPortal(
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/60 transition-opacity"
          />

          {/* Slide-in Drawer */}
          <div
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
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
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
                            ? 'bg-[#062B5C] text-white shadow-soft-sm'
                            : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              active ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {item.badge}
                            </span>
                          )}
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
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-sm active:scale-[0.98] transition-all"
                style={{ backgroundColor: '#16B95A' }}
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
                className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-soft-sm active:scale-[0.98] transition-all"
                style={{ backgroundColor: '#FF9D1C' }}
              >
                <MessageCircle className="w-4 h-4 fill-white text-[#FF9D1C]" />
                <span>Chat on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

