import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  ExternalLink, 
  Navigation, 
  CheckCircle2, 
  Copy, 
  Check, 
  Info,
  Calendar,
  Sparkles,
  Share2,
  Users
} from 'lucide-react';
import { ShareLocationModal } from '../common/ShareLocationModal';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const ContactPage: React.FC = () => {
  const { settings } = useApp();
  const [copiedPlusCode, setCopiedPlusCode] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const handleWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber || '076 859 7800',
      `Hello ${settings.shopName}, I am reaching out via your website.`
    );
  };

  const handleCopyPlusCode = () => {
    const code = settings.plusCode || 'F37F+49 Mullipotana';
    navigator.clipboard.writeText(code);
    setCopiedPlusCode(true);
    setTimeout(() => setCopiedPlusCode(false), 2500);
  };

  const daysOfWeek = [
    { day: 'Monday', hours: '7 AM – 10 PM', note: '' },
    { day: 'Tuesday', hours: '7 AM – 10 PM', note: 'Mawlid • Hours might differ' },
    { day: 'Wednesday', hours: '7 AM – 10 PM', note: 'Mawlid • Hours might differ' },
    { day: 'Thursday', hours: '7 AM – 10 PM', note: 'Nikini Full Moon Poya Day • Hours might differ' },
    { day: 'Friday', hours: '3 PM – 9 PM', note: 'Afternoon & Evening Service' },
    { day: 'Saturday', hours: '7 AM – 10 PM', note: 'Weekend Full Service' },
    { day: 'Sunday', hours: '7 AM – 10 PM', note: 'Weekend Full Service' },
  ];

  // Detect current day
  const todayIndex = new Date().getDay(); // 0 is Sunday, 1 is Monday...
  const dayNameMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNameMap[todayIndex];

  return (
    <div className="w-full bg-[#E8F0FE] py-8 sm:py-12 min-h-[calc(100vh-64px)]">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-[#1E5AA8] font-semibold text-xs mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Customer Care & Storefront Desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#164785] tracking-tight">
            Contact & Store Location
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] mt-2">
            Connect directly for document printing, photocopy orders, SIM registrations & mobile reloads.
          </p>
        </div>

        {/* 4 Contact Cards Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          
          {/* Card 1: WhatsApp (Primary) */}
          <div className="bg-[#F59E0B] text-white p-6 sm:p-7 rounded-2xl shadow-soft-md flex flex-col justify-between border border-amber-400/50">
            <div>
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 fill-white text-[#F59E0B]" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-amber-100 block">Fastest Response</span>
              <h2 className="text-xl font-bold mt-1">WhatsApp Chat</h2>
              <p className="text-xs text-amber-100 mt-1.5 leading-relaxed">
                Send PDFs, images, inquiries, or SIM reserve requests directly.
              </p>
              <p className="text-xl font-bold font-mono tracking-tight mt-3 text-white">
                {settings.whatsappNumber}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <button
                onClick={handleWhatsApp}
                className="w-full py-2.5 bg-white text-[#D97706] hover:bg-amber-50 font-bold rounded-xl active-press transition-colors text-xs flex items-center justify-center gap-2 min-h-[40px] shadow-sm"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>Start WhatsApp Chat</span>
              </button>

              <a
                href={settings.whatsappGroupUrl || 'https://chat.whatsapp.com/Gn3gKNe98zeLMzwVYsETNn?s=cl&p=a&ilr=4'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl active-press transition-colors text-xs flex items-center justify-center gap-2 min-h-[40px] border border-white/30"
              >
                <Users className="w-4 h-4 text-white" />
                <span>Join WhatsApp Group</span>
              </a>
            </div>
          </div>

          {/* Card 2: Phone */}
          <div className="bento-card p-6 sm:p-7 border border-slate-200/90 shadow-soft-md flex flex-col justify-between bg-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-4">
                <Phone className="w-6 h-6" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">Direct Line</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Call Us</h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                Speak directly with counter staff for urgent pricing or order status.
              </p>
              <p className="text-xl font-bold font-mono tracking-tight mt-3 text-[#1E5AA8]">
                {settings.phoneNumber}
              </p>
            </div>

            <div className="mt-5">
              <button
                onClick={() => window.location.href = `tel:${settings.phoneNumber}`}
                className="w-full py-3 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold rounded-xl active-press transition-colors text-xs flex items-center justify-center gap-2 min-h-[42px] shadow-sm"
              >
                <Phone className="w-4 h-4" />
                <span>Call Hotline</span>
              </button>
            </div>
          </div>

          {/* Card 3: Address & Exact Plus Code */}
          <div className="bento-card p-6 sm:p-7 border border-slate-200/90 shadow-soft-md flex flex-col justify-between bg-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block">Store Location</span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Visit Store</h2>
              <p className="text-sm font-bold text-slate-800 mt-2">
                {settings.address}
              </p>
              
              {/* Plus Code Badge & Copy */}
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Exact Plus Code</span>
                  <span className="text-xs font-mono font-bold text-[#1E5AA8] truncate block">
                    {settings.plusCode || 'F37F+49 Mullipotana'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPlusCode}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
                  title="Copy Plus Code"
                >
                  {copiedPlusCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] text-emerald-600 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <a
                href={settings.googleMapsUrl || 'https://maps.google.com/?q=FR+HASAN+TECH+Mullipotana+F37F%2B49'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl active-press transition-colors text-xs flex items-center justify-center gap-1.5 min-h-[42px]"
              >
                <Navigation className="w-4 h-4 text-[#1E5AA8]" />
                <span>Directions</span>
              </a>

              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="w-full py-3 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold rounded-xl active-press transition-colors text-xs flex items-center justify-center gap-1.5 min-h-[42px] shadow-sm"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>Share Location</span>
              </button>
            </div>
          </div>

          {/* Card 4: Quick Today Summary */}
          <div className="bento-card p-6 sm:p-7 border border-slate-200/90 shadow-soft-md flex flex-col justify-between bg-white">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">Store Hours</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Open Today
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">Open 7 Days</h2>
              
              <div className="mt-3 space-y-1.5 text-xs text-slate-700">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Mon – Thu, Sat – Sun:</span>
                  <span className="font-bold text-slate-900">7 AM – 10 PM</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Friday:</span>
                  <span className="font-bold text-emerald-700">3 PM – 9 PM</span>
                </div>
              </div>

              <div className="mt-3 p-2 bg-amber-50 rounded-lg border border-amber-200/70 text-[11px] text-amber-800 flex items-start gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>Special Holidays (Mawlid, Poya Day): 7 AM – 10 PM (Hours might differ)</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Express queue available in-store</span>
            </div>
          </div>

        </div>

        {/* Full 7-Day Weekly Schedule Detailed Breakdown Card */}
        <div className="bento-card p-6 sm:p-8 bg-white border border-slate-200/90 shadow-soft-md mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">Weekly Operating Schedule</h2>
                <p className="text-xs text-slate-500">Official opening hours and holiday schedules for FR.HASAN TECH</p>
              </div>
            </div>

            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full w-fit">
              Current Time Zone: Sri Lanka (GMT+5:30)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {daysOfWeek.map((item) => {
              const isToday = item.day === currentDayName;
              return (
                <div 
                  key={item.day}
                  className={`p-4 rounded-xl border transition-all ${
                    isToday
                      ? 'bg-blue-50/70 border-[#1E5AA8] ring-1 ring-[#1E5AA8] shadow-soft-xs'
                      : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${isToday ? 'text-[#1E5AA8]' : 'text-slate-900'}`}>
                      {item.day}
                    </span>
                    {isToday && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#1E5AA8] text-white px-2 py-0.5 rounded-full">
                        Today
                      </span>
                    )}
                  </div>

                  <p className="text-base font-extrabold text-slate-900 mt-2 font-mono">
                    {item.hours}
                  </p>

                  {item.note && (
                    <p className={`text-xs mt-1.5 font-medium ${
                      item.note.includes('might differ') ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {item.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Embedded Interactive Google Map Section */}
        <div className="bento-card p-4 sm:p-6 bg-white border border-slate-200/90 shadow-soft-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Interactive Map & Storefront Directions</span>
                  <span className="hidden sm:inline-block px-2.5 py-0.5 bg-blue-50 text-[#1E5AA8] text-xs font-mono font-bold rounded-md border border-blue-200/80">
                    Plus Code: {settings.plusCode || 'F37F+49 Mullipotana'}
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {settings.address} • Mullipotana, Sri Lanka
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(true)}
                className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#1E5AA8] text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors border border-blue-200"
              >
                <Share2 className="w-3.5 h-3.5 text-[#1E5AA8]" />
                <span>Share Location</span>
              </button>

              <button
                type="button"
                onClick={handleCopyPlusCode}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copiedPlusCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPlusCode ? 'Plus Code Copied' : 'Copy Plus Code'}</span>
              </button>

              <a
                href={settings.googleMapsUrl || 'https://maps.google.com/?q=FR+HASAN+TECH+Mullipotana+F37F%2B49'}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Real Interactive Google Maps Iframe */}
          <div className="w-full h-[400px] sm:h-[480px] lg:h-[520px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner relative">
            <iframe
              src={settings.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4717.1525016404!2d81.07080359098511!3d8.462772799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afb9f006b19d3a5%3A0x330171f2b7208671!2sFR%20HASAN%20TECH!5e1!3m2!1sen!2slk!4v1787638607633!5m2!1sen!2slk"}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="FR HASAN TECH Google Map Location"
              className="w-full h-full"
            />
          </div>
        </div>

      </div>

      {/* Share Location Modal */}
      <ShareLocationModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};

