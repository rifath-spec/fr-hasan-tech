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
  Briefcase,
  Zap
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const AboutPage: React.FC = () => {
  const { settings, navigate } = useApp();

  const ceoName = settings.aboutContent.ceoName || 'FR Hasan';
  const ceoTitle = settings.aboutContent.ceoTitle || 'Founder & Chief Executive Officer (CEO)';
  const ceoPhoto = settings.aboutContent.ceoPhoto || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80';
  const ceoBio = settings.aboutContent.ceoBio || "FR Hasan is the founder and visionary leader of FR HASAN TECH. With extensive experience across telecommunication networks, digital imaging, and information technology infrastructure, he oversees the company's continuous commitment to customer satisfaction, fast turnaround times, and high-performance digital services.";
  const ceoQuote = settings.aboutContent.ceoQuote || "Empowering individuals and local businesses through reliable technology, seamless telecommunication connectivity, and precision digital print solutions.";

  const handleCEOWhatsApp = () => {
    openWhatsAppChat(
      settings.whatsappNumber || '076 859 7800',
      `Hello ${ceoName} at ${settings.shopName}, I would like to connect regarding business services.`
    );
  };

  return (
    <div className="w-full bg-white py-8 sm:py-12">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#1E5AA8] font-semibold text-xs mb-2.5 shadow-soft-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Company Profile & Leadership</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A202C] tracking-tight">
            {settings.aboutContent.title}
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] mt-2">
            {settings.aboutContent.subtitle}
          </p>
        </div>

        {/* Business Description Block (Centered) */}
        <div className="max-w-4xl mx-auto my-6 text-center space-y-3.5">
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
            {settings.aboutContent.story}
          </p>
          <div className="p-5 sm:p-6 rounded-2xl bg-[#E8F0FE] border border-blue-100 text-[#164785] font-medium text-sm sm:text-base leading-relaxed shadow-soft-sm">
            <span className="font-bold block mb-1 uppercase tracking-wider text-xs text-[#1E5AA8]">Our Mission & Core Purpose</span>
            "{settings.aboutContent.mission}"
          </div>
        </div>

        {/* Executive Leadership & CEO Profile Bento Card */}
        {/* NOTE FOR FOUNDER: Replace this placeholder CEO stock photo URL with an actual high-resolution photo of FR Hasan when available for real-world authenticity. */}
        <div className="my-8 sm:my-10 max-w-5xl mx-auto">
          <div className="bento-card p-6 sm:p-10 lg:p-12 border border-slate-200/90 shadow-soft-lg bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30">
            <div className="flex items-center gap-2 pb-6 border-b border-slate-100">
              <Award className="w-5 h-5 text-[#1E5AA8]" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Executive Leadership</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-6">
              
              {/* CEO Photo Frame (Aspect 1:1) */}
              <div className="md:col-span-5 flex flex-col items-center">
                <div className="relative group">
                  {/* Decorative backdrop glow */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#1E5AA8] to-amber-500 rounded-3xl blur-xs opacity-40 group-hover:opacity-60 transition duration-300"></div>
                  
                  <div className="relative w-52 h-52 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-4 border-white shadow-soft-md bg-slate-100">
                    <img
                      src={ceoPhoto}
                      alt={`${ceoName} - CEO of ${settings.shopName}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback image if remote CDN is blocked
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  </div>

                  {/* Founder & CEO Pill Badge */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white font-bold text-xs rounded-full shadow-soft-md whitespace-nowrap border border-white/20 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Founder & CEO</span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <h3 className="text-xl font-bold text-slate-900">{ceoName}</h3>
                  <p className="text-xs font-semibold text-[#1E5AA8] mt-0.5">{ceoTitle}</p>
                </div>
              </div>

              {/* CEO Bio & Vision */}
              <div className="md:col-span-7 space-y-4">
                
                {/* Quote block */}
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 relative">
                  <Quote className="w-5 h-5 text-amber-400 mb-1" />
                  <p className="text-sm font-medium italic leading-relaxed text-amber-900">
                    "{ceoQuote}"
                  </p>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">
                  {ceoBio}
                </p>

                {/* Key Leadership Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Telecom & Mobile Expertise</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Digital Print Standards</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">Customer-First Service</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-800 bg-white p-2.5 rounded-lg border border-slate-200/90 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">IT & Network Innovation</span>
                  </div>
                </div>

                {/* Direct Action Connect */}
                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleCEOWhatsApp}
                    className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-soft-sm active-press transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-[#F59E0B]" />
                    <span>Connect with {ceoName}</span>
                  </button>

                  <a
                    href={`mailto:${settings.email}`}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 active-press transition-colors border border-slate-300/80"
                  >
                    <Mail className="w-4 h-4 text-slate-600" />
                    <span>{settings.email}</span>
                  </a>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Why Choose Us Grid */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-center text-[#1A202C] mb-8">
            Why Choose FR HASAN TECH
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Feature 1 */}
            <div className="bento-card p-6 border border-slate-200/90 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2">Professional Quality</h4>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                We maintain high industry standards across every document and mobile service with laser-calibrated equipment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bento-card p-6 border border-slate-200/90 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2">Fast Turnaround</h4>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                Rapid express turnaround times to get you back to your study or workday with zero delay.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bento-card p-6 border border-slate-200/90 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2">Reliable Connectivity</h4>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                Genuine network SIM cards (Dialog, Mobitel, Hutch, Airtel) and authentic data reloads on demand.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bento-card p-6 border border-slate-200/90 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mt-2">Convenient Location</h4>
              <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                Easy walk-in storefront in Mullipotana (Plus Code: F37F+49) with instant digital WhatsApp file transfer and support.
              </p>
            </div>
          </div>
        </div>

        {/* CTA banner Bento Card */}
        <div className="mt-14 max-w-3xl mx-auto p-8 rounded-2xl bg-gradient-to-r from-[#0C203B] via-[#164785] to-[#1E5AA8] text-white text-center shadow-soft-lg border border-blue-900/40">
          <h3 className="text-xl sm:text-2xl font-bold">Have a print job or mobile query?</h3>
          <p className="text-blue-100 text-sm mt-2 max-w-lg mx-auto">
            Drop us a message on WhatsApp or visit our physical counter in Mullipotana, Thampalagamam. We're ready to assist.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/contact')}
              className="px-6 py-3 rounded-xl bg-white text-[#164785] font-bold text-sm hover:bg-blue-50 transition-colors shadow-sm"
            >
              Contact Us Now
            </button>
            <button
              onClick={() => navigate('/services')}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-colors border border-white/20"
            >
              Browse Catalog
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

