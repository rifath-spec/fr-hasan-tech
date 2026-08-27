import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ShieldCheck, 
  Clock, 
  ThumbsUp, 
  MapPin, 
  Award, 
  Sparkles, 
  Quote, 
  MessageCircle, 
  Mail, 
  CheckCircle2,
  Zap,
  Target,
  Phone,
  ArrowRight
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const AboutPage: React.FC = () => {
  const { settings, navigate } = useApp();

  const ceoName = settings.aboutContent.ceoName || 'FR Hasan';
  const ceoTitle = settings.aboutContent.ceoTitle || 'Founder & Chief Executive Officer (CEO)';
  const ceoPhoto = settings.aboutContent.ceoPhoto || 'https://res.cloudinary.com/dut2fzqdd/image/upload/v1787850870/WhatsApp_Image_2026-08-27_at_7.46.48_PM.jpg';
  const ceoBio = settings.aboutContent.ceoBio || "FR Hasan is the founder and visionary leader of FR HASAN TECH. With extensive experience across telecommunication networks, digital imaging, and information technology infrastructure, he oversees the company's continuous commitment to customer satisfaction, fast turnaround times, and high-performance digital services.";
  const ceoQuote = settings.aboutContent.ceoQuote || "Empowering individuals and local businesses through reliable technology, seamless telecommunication connectivity, and precision digital print solutions.";

  const handleCEOWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber || '076 859 7800',
      `Hello ${ceoName} at ${settings.shopName}, I would like to connect regarding business services.`
    );
  };

  return (
    <div className="w-full bg-slate-50/50 py-8 sm:py-12">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-8 sm:mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#1E5AA8] font-semibold text-xs mb-2.5 shadow-soft-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Company Profile & Leadership</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A202C] tracking-tight">
            {settings.aboutContent.title}
          </h1>
          <p className="text-sm sm:text-base text-[#64748B] mt-2 text-justify sm:text-left">
            {settings.aboutContent.subtitle}
          </p>
        </div>

        {/* 2-Column Responsive Layout: Left Sidebar + Right Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT SIDE: Founder & CEO Profile + Quick Facts / Direct Actions */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6 md:sticky md:top-24">
            
            {/* CEO Executive Card */}
            <div className="bento-card p-6 sm:p-7 border border-slate-200/90 shadow-soft-md bg-gradient-to-b from-white via-slate-50/60 to-blue-50/20 rounded-2xl flex flex-col items-center text-center">
              
              <div className="w-full flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1E5AA8]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Executive Leadership</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#1E5AA8] text-[10px] font-bold border border-blue-100">
                  Head Office
                </span>
              </div>

              {/* Photo Container */}
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#1E5AA8] to-amber-500 rounded-3xl blur-xs opacity-35 group-hover:opacity-55 transition duration-300"></div>
                
                <div className="relative w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-4 border-white shadow-soft-md bg-slate-100">
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

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-slate-900/90 backdrop-blur-xs text-white font-bold text-[11px] rounded-full shadow-soft-sm whitespace-nowrap border border-white/20 flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Founder & CEO</span>
                </div>
              </div>

              {/* Title & Name */}
              <div className="mt-4">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">{ceoName}</h3>
                <p className="text-xs font-semibold text-[#1E5AA8] mt-0.5">{ceoTitle}</p>
              </div>

              {/* Quote pill */}
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-left w-full relative">
                <Quote className="w-4 h-4 text-amber-500 mb-1" />
                <p className="text-xs font-medium italic leading-relaxed text-amber-900 text-justify sm:text-left">
                  "{ceoQuote}"
                </p>
              </div>

              {/* CEO Bio */}
              <p className="text-xs text-slate-600 leading-relaxed mt-4 text-justify sm:text-left">
                {ceoBio}
              </p>

              {/* Connect CTA Buttons */}
              <div className="w-full mt-5 pt-4 border-t border-slate-100 space-y-2">
                <button
                  onClick={handleCEOWhatsApp}
                  className="w-full py-2.5 px-4 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-soft-sm active-press transition-colors"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-[#F59E0B]" />
                  <span>Message on WhatsApp</span>
                </button>

                <a
                  href={`mailto:${settings.email}`}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 active-press transition-colors border border-slate-200 shadow-2xs"
                >
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="truncate">{settings.email}</span>
                </a>
              </div>

            </div>

            {/* Quick Store Info Badge */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-soft-sm space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4 text-[#1E5AA8]" />
                <span>Visit Storefront</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed text-justify sm:text-left">
                {settings.address || 'Mullipotana (Plus Code: F37F+49), Thampalagamam, Sri Lanka'}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Working Hours</span>
                <span className="font-semibold text-slate-800">8:00 AM – 9:00 PM</span>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: Business Story, Mission, Why Choose Us, and Action Modules */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            
            {/* Story & Background Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-5">
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#E8F0FE] text-[#1E5AA8] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Our Story & Origin</h2>
                  <p className="text-xs text-slate-500">Dedicated to excellence in telecom and document processing</p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-justify sm:text-left">
                {settings.aboutContent.story}
              </p>

              {/* Mission Highlight Banner */}
              <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#E8F0FE] via-blue-50 to-indigo-50/40 border border-blue-200/80 text-[#164785] shadow-soft-xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-[#1E5AA8]" />
                  <span className="font-extrabold uppercase tracking-wider text-xs text-[#1E5AA8]">Our Mission & Core Purpose</span>
                </div>
                <p className="text-sm sm:text-base font-semibold text-slate-800 italic leading-relaxed text-justify sm:text-left">
                  "{settings.aboutContent.mission}"
                </p>
              </div>

              {/* Core Competencies Matrix */}
              <div className="pt-3 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Core Operational Standards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Telecom & Mobile Hub</span>
                      <span className="text-[11px] text-slate-500">Authorized SIM & Reload partner</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Digital Print Precision</span>
                      <span className="text-[11px] text-slate-500">Laser-calibrated copy & print units</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Instant WhatsApp Transfers</span>
                      <span className="text-[11px] text-slate-500">Send files & pick up completed prints</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Fair & Transparent Rates</span>
                      <span className="text-[11px] text-slate-500">No hidden fees, bulk study discounts</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Why Choose FR HASAN TECH Grid */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Why Customers Trust FR HASAN TECH</h2>
                <p className="text-xs text-slate-500 mt-0.5">Reliable digital workflows built for speed, accuracy, and ease</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Feature 1 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Professional Quality</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed text-justify sm:text-left">
                      We maintain high industry standards across every document and mobile service with laser-calibrated equipment.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Fast Turnaround</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed text-justify sm:text-left">
                      Rapid express turnaround times to get you back to your study or workday with zero delay.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                      <ThumbsUp className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Reliable Connectivity</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed text-justify sm:text-left">
                      Genuine network SIM cards (Dialog, Mobitel, Hutch, Airtel) and authentic data reloads on demand.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-100 transition-all flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Convenient Location</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed text-justify sm:text-left">
                      Easy walk-in storefront in Mullipotana with instant digital WhatsApp file transfer and support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Contact & CTA Banner */}
            <div className="p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[#0C203B] via-[#164785] to-[#1E5AA8] text-white shadow-soft-md border border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-bold">Have a print job or mobile query?</h3>
                <p className="text-blue-100 text-xs max-w-md text-justify sm:text-left">
                  Drop us a message on WhatsApp or visit our physical counter in Mullipotana. We are ready to assist.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-[#164785] font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs"
                >
                  Contact Us
                </button>
                <button
                  onClick={() => navigate('/services')}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/20"
                >
                  View Services
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};


