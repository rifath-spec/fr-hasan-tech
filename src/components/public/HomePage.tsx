import React, { useState } from 'react';
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
  Share2
} from 'lucide-react';
import { motion } from 'motion/react';
import { RotatableWhyChooseUs } from './RotatableWhyChooseUs';
import { ShareLocationModal } from '../common/ShareLocationModal';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const HomePage: React.FC = () => {
  const { navigate, settings, services } = useApp();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const ceoName = settings.aboutContent.ceoName || 'FR Hasan';
  const ceoTitle = settings.aboutContent.ceoTitle || 'Founder & CEO';
  const ceoPhoto = settings.aboutContent.ceoPhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80';
  const ceoQuote = settings.aboutContent.ceoQuote || "Empowering individuals and local businesses through reliable technology, seamless telecommunication connectivity, and precision digital print solutions.";

  const handleWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber || '076 859 7800',
      `Hello ${settings.shopName}, I would like to inquire about your services.`
    );
  };

  const getServiceIcon = (iconName: string, category: string) => {
    switch (category) {
      case 'Photocopy':
        return <Copy className="w-7 h-7 text-[#1E5AA8]" />;
      case 'Printing':
        return <Printer className="w-7 h-7 text-[#1E5AA8]" />;
      case 'SIM Cards':
        return <Smartphone className="w-7 h-7 text-[#1E5AA8]" />;
      case 'Packages':
        return <Package className="w-7 h-7 text-[#1E5AA8]" />;
      default:
        return <FileText className="w-7 h-7 text-[#1E5AA8]" />;
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC]">
      {/* 2.2 HERO SECTION with Technology Gradient & Decorative Elements */}
      <section 
        id="hero-section"
        className="relative overflow-hidden text-white rounded-b-[20px] sm:rounded-b-[28px] shadow-lg transition-all"
        style={{
          background: 'linear-gradient(135deg, #061B3A 0%, #082C5C 50%, #0B4F9C 100%)',
          boxShadow: '0 12px 30px -10px rgba(6, 27, 58, 0.4)'
        }}
      >
        {/* Subtle Technology Decorative Background: Circuit traces, nodes & digital grid */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Right-side Soft Radial Cyan/Blue Glow */}
          <div 
            className="absolute top-1/2 -translate-y-1/2 -right-16 sm:right-0 w-[550px] sm:w-[750px] h-[550px] sm:h-[750px] pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(25,167,232,0.20) 0%, rgba(25,167,232,0) 65%)'
            }}
          />

          {/* Left subtle ambient glow */}
          <div 
            className="absolute -top-32 -left-32 w-96 h-96 pointer-events-none opacity-40"
            style={{
              background: 'radial-gradient(circle, rgba(13,110,253,0.15) 0%, rgba(13,110,253,0) 70%)'
            }}
          />

          {/* Subtle Digital Grid */}
          <div 
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Technology Circuit Trace Lines & Nodes SVG */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.09]" preserveAspectRatio="none" viewBox="0 0 1440 600">
            <path d="M 0 80 L 320 80 L 380 140 L 750 140 L 800 90 L 1150 90 L 1220 160 L 1440 160" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="6 6" />
            <circle cx="380" cy="140" r="4" fill="#38BDF8" />
            <circle cx="800" cy="90" r="4" fill="#38BDF8" />
            <circle cx="1220" cy="160" r="4" fill="#38BDF8" />

            <path d="M 100 480 L 450 480 L 520 410 L 900 410 L 960 470 L 1440 470" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
            <circle cx="450" cy="480" r="3.5" fill="#38BDF8" />
            <circle cx="520" cy="410" r="3.5" fill="#38BDF8" />
            <circle cx="960" cy="470" r="3.5" fill="#38BDF8" />
          </svg>
        </div>

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

                {/* Tertiary CTA: Share Location */}
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl text-sm sm:text-base font-semibold flex items-center justify-center gap-2 transition-all active-press cursor-pointer min-h-[48px]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#062B5C',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.08)'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F0F5FF')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                  title="Share Store Location with Customers & Friends"
                >
                  <Share2 className="w-4 h-4 text-[#062B5C] shrink-0" />
                  <span>Share Location</span>
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

                  {/* Top Overlays: Status Badge + Express Services */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                    {/* Top-Left: Store Open & Active with green dot */}
                    <span 
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md"
                      style={{
                        backgroundColor: 'rgba(7, 25, 50, 0.88)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <span className="w-2 h-2 rounded-full bg-[#16B95A] animate-pulse" />
                      <span>Store Open & Active</span>
                    </span>

                    {/* Top-Right: Express Services */}
                    <span 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-md"
                      style={{ backgroundColor: '#FF9D1C' }}
                    >
                      Express Services
                    </span>
                  </div>

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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
          
          {/* Quick Action 1: Instant Document Print */}
          <div 
            onClick={handleWhatsApp}
            className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-blue-50/60 transition-colors cursor-pointer border border-transparent hover:border-blue-100 group"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100/80 text-[#0D6EFD] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#0D6EFD] transition-colors">
                Send to Print
              </h4>
              <p className="text-xs text-slate-500 truncate">
                Send files via WhatsApp for instant print
              </p>
            </div>
          </div>

          {/* Quick Action 2: SIM & Mobile Reload */}
          <div 
            onClick={() => navigate('/services/sims')}
            className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-emerald-50/60 transition-colors cursor-pointer border border-transparent hover:border-emerald-100 group"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100/80 text-[#16B95A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors">
                SIM & Reloads
              </h4>
              <p className="text-xs text-slate-500 truncate">
                Dialog, Mobitel, Airtel, Hutch
              </p>
            </div>
          </div>

          {/* Quick Action 3: Opening Hours & Schedule */}
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50/60 border border-slate-100">
            <div className="w-11 h-11 rounded-xl bg-amber-100/80 text-[#FF9D1C] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16B95A] shrink-0" />
                <h4 className="text-sm font-bold text-slate-900 leading-snug">
                  Open Today
                </h4>
              </div>
              <p className="text-xs text-slate-500 truncate">
                8:00 AM – 10:00 PM (Daily)
              </p>
            </div>
          </div>

          {/* Quick Action 4: Google Maps & Directions */}
          <a
            href="https://maps.google.com/?q=8.5064,81.1378"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-xl bg-[#062B5C] text-white hover:bg-[#083875] transition-all group shadow-sm"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white leading-snug">
                  Get Directions
                </h4>
                <p className="text-[11px] text-blue-200 truncate">
                  529, Siraj Nagar, Thampalagamam
                </p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-sky-300 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </a>

        </div>
      </section>

      {/* 2.3 Our Services Section */}
      <section className="py-10 sm:py-14 bg-[#F8FAFC]">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Our Services
            </h2>
          </div>

          {/* Service Cards Bento Grid - Responsive 1 to 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 xl:gap-7">
            {services.filter(s => s.isPublished).map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className="group bento-card border border-slate-200/90 shadow-soft-sm hover:shadow-soft-lg flex flex-col justify-between overflow-hidden bg-white rounded-2xl"
              >
                <div className="flex flex-col">
                  {/* Service Photo Banner */}
                  <div 
                    onClick={() => navigate(`/services/${service.slug}`)}
                    className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img 
                      src={service.image || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'} 
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    {/* Rich dark gradient overlay for text readability & contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/30" />
                    
                    {/* Top-Left Category Pill & Top-Right Icon Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-white/20">
                        {service.category}
                      </span>
                      <div className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1E5AA8] shadow-md border border-white/40">
                        {getServiceIcon(service.icon, service.category)}
                      </div>
                    </div>

                    {/* Bottom floating service name over photo */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-sm truncate">
                        {service.name}
                      </h3>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Short Description with WCAG AA High Contrast text-slate-600 */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-2">
                      {service.shortDescription}
                    </p>

                    {/* Price Info Pill */}
                    <div className="mt-3">
                      <span 
                        className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md truncate max-w-full"
                        title={service.priceInfo}
                      >
                        {service.priceInfo}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Controls: View Details */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center mt-auto">
                  <button
                    type="button"
                    onClick={() => navigate(`/services/${service.slug}`)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#0D6EFD] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* 2.4 Why Choose Us Section (360° Horizontal Rotatable Total Showcase) */}
      <section className="py-8 sm:py-10 lg:py-12 bg-[#F8FAFC] border-y border-slate-200/80 overflow-hidden">
        <RotatableWhyChooseUs />
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
