import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  ChevronRight, 
  Copy, 
  Printer, 
  Smartphone, 
  Package, 
  MessageCircle, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Calculator, 
  UploadCloud,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { openWhatsAppChat } from '../../utils/whatsapp';

interface ServiceDetailPageProps {
  slug: string;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug }) => {
  const { navigate, settings, services, packages } = useApp();

  // Find target service
  const service = services.find(s => s.slug === slug) || services[0];

  // Quick price estimator for Photocopy/Printing
  const [calcType, setCalcType] = useState<'bw' | 'color'>('bw');
  const [calcPages, setCalcPages] = useState<number>(20);
  const [calcSize, setCalcSize] = useState<'a4' | 'a3'>('a4');

  const unitRate = calcType === 'bw' 
    ? (calcSize === 'a4' ? 5 : 15) 
    : (calcSize === 'a4' ? 35 : 75);
  const estimatedTotal = calcPages * unitRate;

  const handleWhatsApp = (customMsg?: string) => {
    const text = customMsg || `Hello ${settings.shopName}, I would like to inquire about your ${service.name} service.`;
    openWhatsAppChat(settings.whatsappNumber || '076 859 7800', text);
  };

  const getServiceIcon = () => {
    switch (service.category) {
      case 'Photocopy':
        return <Copy className="w-10 h-10 text-[#1E5AA8]" />;
      case 'Printing':
        return <Printer className="w-10 h-10 text-[#1E5AA8]" />;
      case 'SIM Cards':
        return <Smartphone className="w-10 h-10 text-[#1E5AA8]" />;
      case 'Packages':
        return <Package className="w-10 h-10 text-[#1E5AA8]" />;
      default:
        return <FileText className="w-10 h-10 text-[#1E5AA8]" />;
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] py-8 sm:py-12">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-[#64748B] mb-6">
          <button 
            onClick={() => navigate('/')} 
            className="hover:text-[#1E5AA8] transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <button 
            onClick={() => navigate('/services')} 
            className="hover:text-[#1E5AA8] transition-colors"
          >
            Services
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">{service.name}</span>
        </nav>

        {/* Hero Area */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-soft-sm mb-8 w-full">
          {service.image ? (
            <div className="h-52 sm:h-64 md:h-72 lg:h-80 w-full relative overflow-hidden bg-slate-950">
              <img
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              {/* Cinematic Gradient Scrim for high legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex items-end justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#164785] text-xs font-bold mb-2.5 shadow-sm">
                    <span>Category: {service.category}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                    {service.name}
                  </h1>
                </div>
                <div className="flex w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg items-center justify-center text-[#1E5AA8] shrink-0">
                  {getServiceIcon()}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-44 sm:h-56 w-full relative overflow-hidden bg-gradient-to-r from-[#164785] to-[#1E5AA8] p-6 sm:p-8 flex items-end justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-white text-xs font-bold mb-2.5">
                  <span>Category: {service.category}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {service.name}
                </h1>
              </div>
              <div className="flex w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/95 shadow-md items-center justify-center text-[#1E5AA8] shrink-0">
                {getServiceIcon()}
              </div>
            </div>
          )}

          {/* Foreground details section matching user specifications */}
          <div className="p-6 sm:p-8">
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {service.shortDescription}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 font-semibold text-sm sm:text-base text-[#1E5AA8] bg-[#E8F0FE] px-4 py-2 rounded-xl border border-blue-200/60 shadow-xs">
              {service.priceInfo}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-8">
          
          {/* Service Full Overview Card */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-soft-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Service Overview</h2>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                {service.fullDescription}
              </p>
            </div>

            {/* Available Services List */}
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Available Options & Solutions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.availableServicesList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-gray-800">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Conditional Specific Content */}
            {service.category === 'SIM Cards' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-gray-900">Supported Telecommunication Networks</h3>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-4 py-2 rounded-lg bg-red-50 text-red-700 font-bold border border-red-200 text-sm">
                    Dialog (4G / 5G Ready)
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200 text-sm">
                    Mobitel (eSIM & Physical)
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-orange-50 text-orange-700 font-bold border border-orange-200 text-sm">
                    Hutch (High-Speed Data)
                  </span>
                  <span className="px-4 py-2 rounded-lg bg-yellow-50 text-amber-800 font-bold border border-yellow-200 text-sm">
                    Airtel (Unlimited Freedom)
                  </span>
                </div>

                {/* Important Notice Prominent (Section 2.3) */}
                <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#92400E]">Live Network & Stock Notice</h4>
                      <p className="text-xs sm:text-sm text-[#B45309] mt-1 leading-relaxed">
                        Availability and prices may change. Contact us on WhatsApp for the latest information and instant KYC registration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {service.category === 'Packages' && (
              <div className="space-y-4 pt-2">
                <h3 className="text-base font-bold text-gray-900">Popular Packages & Top-ups</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {packages.filter(p => p.status === 'Active').map(pkg => (
                    <div key={pkg.id} className="p-4 rounded-xl border border-gray-200 bg-slate-50 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#E8F0FE] text-[#1E5AA8]">
                            {pkg.network}
                          </span>
                          <span className="text-xs text-gray-500 font-medium">{pkg.type}</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 mt-2">{pkg.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{pkg.description}</p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm font-bold text-[#1E5AA8]">LKR {pkg.price.toLocaleString()}</span>
                        <button
                          onClick={() => handleWhatsApp(`Hi, I would like to reload ${pkg.name} (${pkg.network}) for LKR ${pkg.price}`)}
                          className="text-xs text-[#D97706] hover:underline font-semibold flex items-center gap-1"
                        >
                          <span>Reload via WhatsApp</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Important Notice Prominent */}
                <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-[#92400E]">Package Notice</h4>
                      <p className="text-xs sm:text-sm text-[#B45309] mt-1 leading-relaxed">
                        Availability and prices may change. Contact us on WhatsApp for the latest information and instant OTP reload activation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {(service.category === 'Photocopy' || service.category === 'Printing') && (
              <div className="p-4 bg-[#F8FAFC] rounded-xl border border-gray-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#1E5AA8]" />
                  <h3 className="text-sm font-bold text-gray-900">Quick Estimate Calculator</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Color Mode</label>
                    <select
                      value={calcType}
                      onChange={(e) => setCalcType(e.target.value as 'bw' | 'color')}
                      className="w-full text-xs font-medium bg-white border border-gray-300 rounded p-2 focus:border-[#1E5AA8] outline-none"
                    >
                      <option value="bw">Black & White</option>
                      <option value="color">Full Colour</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Paper Size</label>
                    <select
                      value={calcSize}
                      onChange={(e) => setCalcSize(e.target.value as 'a4' | 'a3')}
                      className="w-full text-xs font-medium bg-white border border-gray-300 rounded p-2 focus:border-[#1E5AA8] outline-none"
                    >
                      <option value="a4">A4 Standard</option>
                      <option value="a3">A3 Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-600 block mb-1">Number of Pages</label>
                    <input
                      type="number"
                      min={1}
                      value={calcPages}
                      onChange={(e) => setCalcPages(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full text-xs font-medium bg-white border border-gray-300 rounded p-2 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    Est. Unit Rate: <span className="font-semibold text-gray-800">LKR {unitRate}.00/page</span>
                  </span>
                  <div className="text-right">
                    <span className="text-gray-600 mr-2">Estimated Cost:</span>
                    <span className="text-base font-bold text-[#1E5AA8]">LKR {estimatedTotal.toLocaleString()}.00</span>
                  </div>
                </div>
              </div>
            )}

            {/* Important Notes Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-gray-900 mb-2">Important Instructions & Tips</h3>
              <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 list-disc list-inside">
                {service.importantNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>

            {/* WhatsApp CTA (Full-Width Accent Button as specified) */}
            <button
              onClick={() => handleWhatsApp()}
              className="w-full py-4 rounded-md bg-[#F59E0B] hover:bg-[#D97706] text-white text-base font-bold flex items-center justify-center gap-2.5 shadow-soft-md active-press transition-all min-h-[48px]"
            >
              <MessageCircle className="w-5 h-5 fill-white text-[#F59E0B]" />
              <span>Contact on WhatsApp for {service.name}</span>
            </button>
          </div>

          {/* Contact Info Block (Bottom of each service page as specified in 2.3) */}
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-soft-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact & In-Store Assistance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Phone Number</span>
                <span className="text-sm font-bold text-gray-900 mt-1 block">{settings.phoneNumber}</span>
              </div>
              <div 
                onClick={() => handleWhatsApp()}
                className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 cursor-pointer hover:bg-amber-100/50 transition-colors"
              >
                <span className="text-xs font-semibold text-[#D97706] uppercase tracking-wider block">Clickable WhatsApp</span>
                <span className="text-sm font-bold text-[#D97706] mt-1 block">{settings.whatsappNumber}</span>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Store Address</span>
                <span className="text-xs font-medium text-gray-800 mt-1 block leading-tight">{settings.address}</span>
              </div>
            </div>

            <button
              onClick={() => handleWhatsApp()}
              className="w-full py-3 rounded-md bg-[#1E5AA8] hover:bg-[#164785] text-white font-semibold text-sm flex items-center justify-center gap-2 active-press transition-colors min-h-[44px]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat on WhatsApp</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
