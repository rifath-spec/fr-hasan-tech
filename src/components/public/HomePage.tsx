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
      {/* 2.2 Hero Section with Bento Structure & Custom Hero Backdrop */}
      <section className="py-4 sm:py-6 lg:py-8 bg-[#F8FAFC]">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-soft-xl">
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105 transition-transform duration-1000"
              style={{
                backgroundImage: `url(${settings.heroBackgroundUrl || settings.heroContent?.backgroundImageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1600&q=80'})`
              }}
            />
            {/* Gradient Scrim for Contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/70" />

            <div className="relative z-10 p-6 sm:p-8 lg:p-12 xl:p-14">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
                
                {/* Left 60% Content */}
                <div className="lg:col-span-7 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 font-semibold text-xs mb-3.5 shadow-soft-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Premier Document & Mobile Services Hub</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight leading-[1.15]">
                    {settings.heroContent.title}
                  </h1>

                  <p className="text-lg sm:text-xl text-blue-100/90 font-medium mt-2.5">
                    {settings.heroContent.tagline}
                  </p>

                  <p className="text-base sm:text-lg text-slate-300 mt-3 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                    {settings.heroContent.description}
                  </p>

                  {/* CTA Group */}
                  <div className="mt-5 flex flex-wrap items-stretch sm:items-center justify-center lg:justify-start gap-3">
                    <button
                      onClick={handleWhatsApp}
                      className="px-6 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2.5 shadow-soft-md active-press transition-all min-h-[48px]"
                    >
                      <MessageCircle className="w-5 h-5 fill-white text-[#F59E0B]" />
                      <span>WhatsApp Direct</span>
                    </button>

                    <button
                      onClick={() => navigate('/services')}
                      className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 active-press transition-all min-h-[48px] shadow-soft-sm"
                    >
                      <span>View Services</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-5 py-3.5 rounded-xl bg-blue-600/60 hover:bg-blue-600/80 backdrop-blur-md border border-blue-400/40 text-white text-sm sm:text-base font-semibold flex items-center justify-center gap-2 active-press transition-all min-h-[48px] shadow-soft-sm"
                      title="Share Store Location with Customers & Friends"
                    >
                      <Share2 className="w-4 h-4 text-sky-200" />
                      <span>Share Location</span>
                    </button>
                  </div>
                </div>

                {/* Right 40% Desktop Visual Image Container */}
                <div className="lg:col-span-5 hidden lg:block">
                  <div className="bento-card overflow-hidden bg-slate-950 border border-slate-700/80 shadow-soft-xl rounded-2xl relative group">
                    <div className="w-full aspect-[4/3] xl:aspect-[16/11] relative overflow-hidden bg-slate-950 flex items-center justify-center p-2.5 sm:p-3">
                      <img
                        src="https://res.cloudinary.com/dut2fzqdd/image/upload/v1787591739/unnamed.jpg"
                        alt="FR.HASAN TECH Store & Services Showcase"
                        className="w-full h-full object-contain object-center rounded-xl group-hover:scale-[1.02] transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      {/* Harmonizing subtle vignette gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/30 pointer-events-none rounded-xl" />

                      {/* Badges / Overlays positioned cleanly without clipping brand text */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-soft-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Store Open & Active</span>
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F59E0B] text-white text-xs font-bold shadow-soft-sm">
                          Express Services
                        </span>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 p-2.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/20 text-white flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 font-medium text-xs">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">{settings.openingHours?.monFri || '8:00 AM - 9:00 PM'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs shrink-0">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>Direct Walk-in Ready</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2.3 Our Services Section */}
      <section className="py-8 sm:py-10 lg:py-12 bg-white">
        <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
              Our Services
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
              Professional document printing, digital photocopying, authorized SIM cards, and instant mobile package reloads.
            </p>
          </div>

          {/* Service Cards Bento Grid - Responsive 1 to 4 cols */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 xl:gap-7">
            {services.filter(s => s.isPublished).map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/services/${service.slug}`)}
                className="group bento-card border border-slate-200/90 shadow-soft-sm hover:shadow-soft-lg cursor-pointer flex flex-col justify-between overflow-hidden bg-white rounded-2xl"
              >
                <div className="flex flex-col">
                  {/* Service Photo Banner - Consistent across all 4 services with top-left category pill and top-right icon badge */}
                  <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-900">
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
                  </div>
                </div>

                {/* Bottom price tag & View More (No text collision or overlap) */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                  <div className="min-w-0 flex-1">
                    <span 
                      className="inline-block text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-md truncate max-w-full"
                      title={service.priceInfo}
                    >
                      {service.priceInfo}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#1E5AA8] group-hover:text-[#164785] shrink-0 whitespace-nowrap">
                    <span>View More</span>
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                  </div>
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
                    <MessageCircle className="w-3.5 h-3.5 fill-white text-[#F59E0B]" />
                    <span>Direct Inquiries</span>
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 shadow-soft-xs active-press transition-colors border border-slate-300/80"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#1E5AA8]" />
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
