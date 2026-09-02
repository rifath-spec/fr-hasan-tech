import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Printer, 
  Copy, 
  Smartphone, 
  Package, 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  ThumbsUp, 
  MapPin, 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  Radio, 
  FileText, 
  Quote, 
  Zap, 
  Award, 
  Share2,
  Calculator,
  Layers,
  Palette,
  CreditCard,
  Mail,
  Laptop,
  Monitor,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { ShareLocationModal } from '../common/ShareLocationModal';
import { openWhatsAppChat } from '../../utils/whatsapp';

// The 11 core services in requested order
const MAIN_SERVICES_ORDER = [
  'Printing',
  'Visiting Cards',
  'Invitation Card',
  'Certificate Design',
  'CV Creation',
  'Microsoft Office Installation',
  'Windows Installation',
  'Document Printing',
  'Packages',
  'SIM Cards',
  'Photocopy',
];

const DEFAULT_SERVICE_IMAGES: Record<string, string> = {
  'Printing': 'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=1200&q=80',
  'Visiting Cards': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
  'Invitation Card': 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
  'Certificate Design': 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
  'CV Creation': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
  'Microsoft Office Installation': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  'Windows Installation': 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
  'Document Printing': 'https://images.unsplash.com/photo-1589330694653-dad6bc01cf0f?auto=format&fit=crop&w=1200&q=80',
  'Packages': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
  'SIM Cards': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  'Photocopy': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
};

export const HomePage: React.FC = () => {
  const { navigate, settings, services, openEstimateModal, isLoadingData } = useApp();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const about: any = settings?.aboutContent || {};
  const ceoName = about.ceoName || 'Faseerath Hasan';
  const ceoTitle = about.ceoTitle || 'Founder & CEO';
  const ceoPhoto = about.ceoPhoto || 'https://res.cloudinary.com/dut2fzqdd/image/upload/v1787850870/WhatsApp_Image_2026-08-27_at_7.46.48_PM.jpg';
  const ceoQuote = about.ceoQuote || "Empowering individuals and local businesses through reliable technology, seamless telecommunication connectivity, and precision digital print solutions.";

  const handleWhatsApp = () => {
    openWhatsAppChat(
      settings?.whatsappNumber || '076 859 7800',
      `Hello ${settings?.shopName || 'FR.HASAN TECH'}, I would like to inquire about your services.`
    );
  };

  const handleServiceWhatsApp = (serviceName: string, category: string) => {
    openWhatsAppChat(
      settings?.whatsappNumber || '076 859 7800',
      `Hello ${settings?.shopName || 'FR.HASAN TECH'}, I am interested in your ${serviceName} (${category}) service. Could you please provide more details?`
    );
  };

  const getServiceIcon = (category: string, name: string = '', className: string = "w-6 h-6 text-[#1E5AA8]") => {
    const combined = `${category} ${name}`.toLowerCase();
    if (combined.includes('photo') && combined.includes('copy')) return <Copy className={className} />;
    if (combined.includes('visiting') || combined.includes('business card')) return <CreditCard className={className} />;
    if (combined.includes('invitation')) return <Mail className={className} />;
    if (combined.includes('certificate')) return <Award className={className} />;
    if (combined.includes('cv') || combined.includes('resume')) return <FileText className={className} />;
    if (combined.includes('office')) return <Laptop className={className} />;
    if (combined.includes('windows') || combined.includes('os install') || combined.includes('laptop')) return <Monitor className={className} />;
    if (combined.includes('doc') || combined.includes('document')) return <FileText className={className} />;
    if (combined.includes('print')) return <Printer className={className} />;
    if (combined.includes('sim')) return <Smartphone className={className} />;
    if (combined.includes('package') || combined.includes('bundle') || combined.includes('reload')) return <Package className={className} />;
    return <Sparkles className={className} />;
  };

  // Sort published services so all 11 core services are presented in exact order
  const publishedServices = useMemo(() => {
    const list = services.filter(s => s.isPublished);
    return [...list].sort((a, b) => {
      const getOrderRank = (item: typeof a) => {
        const cat = (item.category || '').trim();
        const name = (item.name || '').trim();
        const slug = (item.slug || '').trim();

        // 1. Direct Category Match
        const catIdx = MAIN_SERVICES_ORDER.findIndex(o => o.toLowerCase() === cat.toLowerCase());
        if (catIdx !== -1) return catIdx;

        // 2. Name Match
        const nameIdx = MAIN_SERVICES_ORDER.findIndex(o => 
          name.toLowerCase() === o.toLowerCase() || 
          name.toLowerCase().includes(o.toLowerCase()) || 
          o.toLowerCase().includes(name.toLowerCase())
        );
        if (nameIdx !== -1) return nameIdx;

        // 3. Slug Match
        const slugFormatted = slug.replace(/-/g, ' ').toLowerCase();
        const slugIdx = MAIN_SERVICES_ORDER.findIndex(o => slugFormatted.includes(o.toLowerCase()) || o.toLowerCase().includes(slugFormatted));
        if (slugIdx !== -1) return slugIdx;

        return 999;
      };

      const rankA = getOrderRank(a);
      const rankB = getOrderRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return (a.sortOrder || 99) - (b.sortOrder || 99);
    });
  }, [services]);

  return (
    <div className="w-full bg-[#F8FAFC]">
      {/* 2.2 HERO SECTION with Technology Gradient */}
      <section 
        id="hero-section"
        className="relative overflow-hidden text-white rounded-b-[20px] sm:rounded-b-[28px] shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, #061B3A 0%, #082C5C 50%, #0B4F9C 100%)',
          boxShadow: '0 12px 30px -10px rgba(6, 27, 58, 0.4)'
        }}
      >
        {/* Hero Main Content Container */}
        <div className="relative z-10 w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-6 pb-8 sm:py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-14 items-center">
            
            {/* Left Column (52–55% width on desktop, 2nd on mobile) */}
            <div className="order-2 lg:order-1 lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start">
              
              {/* Main Heading: FR.HASAN TECH */}
              <h1 className="text-3xl sm:text-4xl lg:text-[54px] xl:text-[62px] font-extrabold text-white tracking-tight leading-[1.12]">
                FR.HASAN{' '}
                <span 
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: 'linear-gradient(90deg, #19A7E8 0%, #42C8FF 100%)'
                  }}
                >
                  TECH
                </span>
              </h1>

              {/* Supporting Headline */}
              <p 
                className="text-lg sm:text-xl lg:text-[22px] xl:text-[24px] font-semibold mt-3.5 max-w-2xl leading-snug"
                style={{ color: '#38BDF8' }}
              >
                Your Premier Partner for Technology, Digital Printing & Mobile Services
              </p>

              {/* Concise Professional Description */}
              <p 
                className="text-sm sm:text-base lg:text-[17px] mt-4 max-w-[600px] leading-[1.65] font-normal"
                style={{ color: '#D8E6F5' }}
              >
                Quality printing, photocopying, telecom SIM cards, package reloads, and IT services right in your neighborhood. Fast, reliable, and backed by dedicated technical expertise.
              </p>

              {/* CTA Action Buttons Group */}
              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3.5 w-full sm:w-auto">
                {/* Primary CTA: WhatsApp Direct */}
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 transition-all active-press cursor-pointer min-h-[48px]"
                  style={{
                    backgroundColor: '#16B95A',
                    boxShadow: '0 4px 14px 0 rgba(22, 185, 90, 0.38)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#12A94F')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16B95A')}
                >
                  <MessageCircle className="w-5 h-5 fill-white text-white shrink-0" />
                  <span>WhatsApp Direct</span>
                </button>

                {/* Secondary CTA: View Services */}
                <button
                  type="button"
                  onClick={() => navigate('/services')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all active-press cursor-pointer min-h-[48px]"
                  style={{ backgroundColor: '#0D6EFD' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0B5ED7')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0D6EFD')}
                >
                  <span>View Services</span>
                  <ArrowRight className="w-4 h-4 shrink-0" />
                </button>

                {/* Tertiary CTA: Instant Estimate */}
                <button
                  type="button"
                  id="hero-instant-estimate-btn"
                  onClick={() => openEstimateModal()}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all active-press cursor-pointer min-h-[48px]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#062B5C',
                    border: '1px solid rgba(255, 255, 255, 0.7)',
                    boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.12)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F5FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  title="Calculate instant estimated price for printing, photocopy, lamination & binding"
                >
                  <Calculator className="w-5 h-5 text-[#0D6EFD] shrink-0" />
                  <span>Instant Estimate</span>
                </button>
              </div>

              {/* 3 Compact Trust Metrics / Statistics */}
              <div 
                className="mt-8 pt-6 w-full max-w-[600px] grid grid-cols-3 gap-2 sm:gap-4 border-t"
                style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
              >
                {/* Metric 1 */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left pr-2 sm:pr-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#19A7E8] shrink-0" />
                    <span className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white leading-tight">
                      15K+
                    </span>
                  </div>
                  <span 
                    className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-1"
                    style={{ color: '#BFD3EA' }}
                  >
                    PRINTS SERVED
                  </span>
                </div>

                {/* Metric 2 */}
                <div 
                  className="flex flex-col items-center lg:items-start text-center lg:text-left px-2 sm:px-4 border-x"
                  style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#16B95A] shrink-0" />
                    <span className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white leading-tight">
                      99.9%
                    </span>
                  </div>
                  <span 
                    className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-1"
                    style={{ color: '#BFD3EA' }}
                  >
                    SATISFACTION
                  </span>
                </div>

                {/* Metric 3 */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left pl-2 sm:pl-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#FF9D1C] shrink-0" />
                    <span className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-white leading-tight">
                      7 DAYS
                    </span>
                  </div>
                  <span 
                    className="text-[10px] sm:text-xs font-semibold tracking-wider uppercase mt-1"
                    style={{ color: '#BFD3EA' }}
                  >
                    OPEN DAILY
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column (45–48% width on desktop, 1st on mobile) - FR.HASAN TECH Store Card */}
            <div className="order-1 lg:order-2 lg:col-span-5 w-full flex justify-center lg:justify-end">
              <div 
                className="w-full max-w-[540px] overflow-hidden rounded-[20px] relative group shadow-2xl transition-all"
                style={{
                  backgroundColor: '#071932',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 20px 40px -12px rgba(6, 27, 58, 0.6)'
                }}
              >
                <div className="w-full aspect-[4/3] sm:aspect-[16/11] relative overflow-hidden bg-[#071932] flex items-center justify-center p-2.5 sm:p-3">
                  {/* Real Store Showcase Photograph */}
                  <img
                    src="https://res.cloudinary.com/dut2fzqdd/image/upload/v1787591739/unnamed.jpg"
                    alt="FR.HASAN TECH Physical Store and Digital Printing Services"
                    className="w-full h-full object-contain object-center rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
                    style={{ filter: 'contrast(1.05) saturate(1.05) brightness(1.02)' }}
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Subtle vignette scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071932]/75 via-transparent to-black/25 pointer-events-none rounded-xl" />

                  {/* Bottom Translucent Information Bar */}
                  <div 
                    className="absolute bottom-4 left-4 right-4 p-3 rounded-xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs backdrop-blur-md"
                    style={{
                      backgroundColor: 'rgba(7, 25, 50, 0.88)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}
                  >
                    <div className="flex flex-col text-[11px] sm:text-xs">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#FF9D1C] shrink-0" />
                        <span>Mon–Thu, Sat: 8:00 AM – 10:00 PM</span>
                      </div>
                      <div className="text-[10px] text-blue-200/90 pl-5">
                        Fri: 3:00 PM – 9:00 PM
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 font-semibold text-xs pt-1 sm:pt-0 border-t sm:border-t-0 border-white/10" style={{ color: '#16B95A' }}>
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-[#16B95A]" />
                      <span>Direct WhatsApp & Walk-in</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* User-Friendly Quick Utility Bar */}
      <section className="relative -mt-4 sm:-mt-6 z-20 max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-soft-lg p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Quick Action 1: Instant Document Print (Blue / Sky Theme) */}
          <div 
            onClick={handleWhatsApp}
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-br from-blue-50/90 via-blue-50/40 to-sky-50/80 border border-blue-200/80 hover:border-blue-300 hover:shadow-soft-md transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#0D6EFD] to-[#38BDF8] text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#0D6EFD] transition-colors">
                Send to Print
              </h4>
              <p className="text-xs text-blue-900/70 font-medium truncate">
                Send files via WhatsApp
              </p>
            </div>
          </div>

          {/* Quick Action 2: SIM & Mobile Reload (Emerald / Mint Theme) */}
          <div 
            onClick={() => navigate('/services/sims')}
            className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-teal-50/80 border border-emerald-200/80 hover:border-emerald-300 hover:shadow-soft-md transition-all cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#16B95A] to-[#10B981] text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-500/25 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                SIM & Reloads
              </h4>
              <p className="text-xs text-emerald-900/70 font-medium truncate">
                Dialog, Mobitel, Airtel, Hutch
              </p>
            </div>
          </div>

          {/* Quick Action 3: Opening Hours & Schedule (Amber / Orange Theme) */}
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-orange-50/80 border border-amber-200/80 hover:border-amber-300 hover:shadow-soft-md transition-all">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#F59E0B] to-[#FF9D1C] text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/25">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16B95A] animate-pulse shrink-0" />
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Open Today
                </h4>
              </div>
              <p className="text-xs text-amber-900/70 font-medium truncate">
                8:00 AM – 10:00 PM (Daily)
              </p>
            </div>
          </div>

          {/* Quick Action 4: Google Maps & Directions (Deep Navy to Ocean Gradient) */}
          <a
            href="https://maps.google.com/?q=8.5064,81.1378"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-[#062B5C] via-[#0D6EFD] to-[#1E5AA8] text-white hover:from-[#083875] hover:to-[#0D6EFD] transition-all group shadow-soft-md border border-blue-400/30"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                <MapPin className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white leading-snug">
                  Get Directions
                </h4>
                <p className="text-[11px] text-blue-100 font-medium truncate">
                  529, Siraj Nagar, Thampalagamam
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-200 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </a>

        </div>
      </section>

      {/* 2.3 Our Services Section - All 11 Core Services */}
      <section className="py-10 sm:py-14 bg-[#F8FAFC]">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
            <div className="text-left max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1E5AA8] text-xs font-bold mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>All 11 Core Services & Solutions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                Our Services
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-2">
                Explore our full suite of professional digital printing, document processing, IT installations, and telecommunication solutions.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => openEstimateModal()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs sm:text-sm shadow-soft-xs transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>Instant Estimator</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/services')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-[#1E5AA8] font-bold text-xs sm:text-sm shadow-soft-xs transition-all cursor-pointer"
              >
                <span>Full Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* All 11 Services Bento Grid */}
          {isLoadingData && publishedServices.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-96 flex flex-col justify-between shadow-soft-xs">
                  <div className="w-full h-44 bg-slate-200 rounded-xl mb-4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                  </div>
                  <div className="h-9 bg-slate-100 rounded-xl mt-4" />
                </div>
              ))}
            </div>
          ) : publishedServices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-10 sm:p-14 text-center max-w-xl mx-auto shadow-soft-sm">
              <div className="w-14 h-14 bg-blue-50 text-[#1E5AA8] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <Printer className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">No Services Published Yet</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Services will appear here once added to the catalog. Contact us directly on WhatsApp for any printing or telecom inquiries.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {publishedServices.map((service, sIndex) => {
                const bannerImg = service.image || service.imageUrl || DEFAULT_SERVICE_IMAGES[service.category] || DEFAULT_SERVICE_IMAGES[service.name] || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80';
                const serviceSlug = service.slug || service.id;

                return (
                  <div
                    key={service.id ? `home-srv-${service.id}` : `home-srv-${service.slug || sIndex}`}
                    onClick={() => navigate(`/services/${serviceSlug}`)}
                    className="group bento-card border border-slate-200/90 shadow-soft-sm hover:shadow-soft-lg flex flex-col justify-between overflow-hidden bg-white rounded-2xl transform-gpu hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex flex-col">
                      {/* Service Photo Banner */}
                      <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-900">
                        <img 
                          src={bannerImg} 
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          decoding="async"
                        />
                        {/* Rich dark gradient overlay for text contrast */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/20 pointer-events-none" />
                        
                        {/* Top Category Badge & Icon */}
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-white/20 truncate max-w-[70%]">
                            {service.category}
                          </span>
                          <div className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1E5AA8] shadow-md border border-white/40 shrink-0">
                            {getServiceIcon(service.category, service.name, "w-4 h-4 text-[#1E5AA8]")}
                          </div>
                        </div>

                        {/* Bottom Service Title */}
                        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                          <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                            {service.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                        {/* Price Badge */}
                        <div className="mb-3">
                          <span 
                            className="inline-block text-xs font-bold text-[#1E5AA8] bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg truncate max-w-full"
                          >
                            {service.priceInfo ? service.priceInfo : service.singlePrice ? `LKR ${service.singlePrice.toLocaleString()}${service.unit ? ` / ${service.unit}` : ''}` : 'Official Rates'}
                          </span>
                        </div>

                        {/* Short Description */}
                        <p className="text-xs sm:text-[13px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                          {service.shortDescription || service.description || 'Professional service with fast turnaround and dedicated quality.'}
                        </p>

                        {/* Available Features / Sub-services preview */}
                        {service.availableServicesList && service.availableServicesList.length > 0 && (
                          <div className="space-y-1.5 border-t border-slate-100 pt-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              Key Highlights:
                            </span>
                            {service.availableServicesList.slice(0, 2).map((item, fIdx) => (
                              <div key={fIdx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-3 border-t border-slate-100 flex items-center gap-2 mt-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/services/${serviceSlug}`);
                        }}
                        className="flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold text-[#0D6EFD] bg-blue-50 group-hover:bg-[#1E5AA8] group-hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-soft-xs"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleServiceWhatsApp(service.name, service.category);
                        }}
                        className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all cursor-pointer shrink-0"
                        title="Inquire via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </section>

      {/* Leadership & CEO Message Spotlight (Bento Grid) */}
      <section className="py-8 sm:py-10 lg:py-12 bg-white">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="bento-card p-6 sm:p-8 lg:p-10 border border-slate-200/90 shadow-soft-md bg-gradient-to-r from-blue-50/40 via-white to-amber-50/30">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center">
              
              {/* CEO Photo Frame */}
              {/* NOTE FOR FOUNDER: Replace this placeholder CEO stock photo URL with an actual high-resolution photo of FR Hasan when available for real-world authenticity. */}
              <div className="md:col-span-4 lg:col-span-3 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden border-4 border-white shadow-soft-lg bg-slate-100 relative">
                    <img
                      src={ceoPhoto}
                      alt={`${ceoName} - CEO of ${settings.shopName}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-slate-900 text-white font-bold text-[11px] rounded-full shadow-soft-sm whitespace-nowrap border border-white/20 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Founder & CEO</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="text-lg font-bold text-slate-900">{ceoName}</h3>
                  <p className="text-xs font-semibold text-[#1E5AA8]">{ceoTitle}</p>
                </div>
              </div>

              {/* CEO Message & Commitment */}
              <div className="md:col-span-8 lg:col-span-9 space-y-3.5 text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/70 text-[#1E5AA8] font-bold text-xs">
                  <Award className="w-3.5 h-3.5" />
                  <span>Leadership Commitment</span>
                </div>

                <div className="p-4 sm:p-5 rounded-xl bg-white/80 border border-slate-200/80 shadow-xs relative">
                  <Quote className="w-5 h-5 text-amber-500 mb-1" />
                  <p className="text-sm sm:text-base lg:text-lg font-medium italic leading-relaxed text-slate-800">
                    "{ceoQuote}"
                  </p>
                </div>

                <p className="text-xs sm:text-sm lg:text-base text-slate-700 leading-relaxed max-w-4xl">
                  Under the leadership of {ceoName}, FR HASAN TECH bridges top-tier digital imaging with all-island telecommunications support, offering our neighborhood reliable, fast, and dedicated tech service.
                </p>

                <div className="pt-1.5 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => navigate('/about')}
                    className="px-5 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-soft-sm active-press transition-colors"
                  >
                    <span>Read Full CEO Profile & Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    className="px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-soft-sm active-press transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#F59E0B]" />
                    <span>Direct Inquiries</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-soft-sm active-press transition-colors border border-slate-300"
                  >
                    <Share2 className="w-4 h-4 text-[#1E5AA8]" />
                    <span>Share Store Location</span>
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Share Location Modal */}
      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

    </div>
  );
};
