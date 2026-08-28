import React, { useState, useMemo } from 'react';
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
  ArrowRight,
  Wifi,
  Zap,
  Tag,
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { NetworkProvider, PackageCategory } from '../../types';

interface ServiceDetailPageProps {
  slug: string;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug }) => {
  const { navigate, settings, services, packages, sims } = useApp();

  // Find target service
  const service = services.find(s => s.slug === slug) || services[0];

  // Filtering state for Packages and SIMs
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Filter packages dynamically
  const activePackages = useMemo(() => {
    return packages.filter(p => {
      if (p.status !== 'Active') return false;
      const matchesNet = selectedNetwork === 'All' || p.network === selectedNetwork;
      const pkgCat = p.category || (p.type.toLowerCase().includes('broadband') || p.type.toLowerCase().includes('router') || p.type.toLowerCase().includes('fiber') ? 'Home Broadband (Router / Wi-Fi)' : 'Mobile SIM Plans');
      const matchesCat = selectedCategory === 'All' || pkgCat === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.quota && p.quota.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesNet && matchesCat && matchesSearch;
    }).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [packages, selectedNetwork, selectedCategory, searchQuery]);

  // Filter SIM cards dynamically
  const activeSims = useMemo(() => {
    return sims.filter(s => {
      const matchesNet = selectedNetwork === 'All' || s.network === selectedNetwork;
      const matchesSearch = searchQuery === '' || s.network.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNet && matchesSearch;
    });
  }, [sims, selectedNetwork, searchQuery]);

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

          {/* Foreground details section */}
          <div className="p-6 sm:p-8">
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              {service.shortDescription}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 font-semibold text-sm sm:text-base text-[#1E5AA8] bg-[#E8F0FE] px-4 py-2 rounded-xl border border-blue-200/60 shadow-xs">
              {service.priceInfo}
            </div>
          </div>
        </div>

        {/* Main 2-Column Grid Layout for Desktop and Tablet */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Service Overview, Available Options, Specialized Catalogs, and Guidelines */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            
            {/* Service Full Overview Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1E5AA8]" />
                  <span>Service Overview</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed text-justify md:text-left">
                  {service.fullDescription}
                </p>
              </div>

              {/* Available Services List */}
              <div className="pt-2 border-t border-slate-100">
                <h3 className="text-base font-bold text-slate-900 mb-3">Available Options & Solutions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {service.availableServicesList.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                      <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SPECIFIC SECTION: SIM CARDS */}
              {service.category === 'SIM Cards' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Supported Telecommunication Networks & SIM Stock</h3>
                    <p className="text-xs text-gray-500 mt-0.5 text-justify md:text-left">Physical SIMs, eSIMs, and 4G/5G Router Data SIMs with in-store KYC registration</p>
                  </div>

                  {/* Filter Selector */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {['All', 'Dialog', 'Mobitel', 'Hutch', 'Airtel'].map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          selectedNetwork === net
                            ? 'bg-[#1E5AA8] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>

                  {/* SIM Cards Catalog Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeSims.map(sim => (
                      <div 
                        key={sim.id} 
                        className="p-5 rounded-2xl border border-gray-200 bg-white shadow-soft-sm hover:shadow-soft-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                              sim.network === 'Dialog' ? 'bg-red-50 text-red-700 border border-red-200' :
                              sim.network === 'Mobitel' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              sim.network === 'Hutch' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {sim.network}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sim.status === 'Available' ? 'bg-emerald-100 text-emerald-800' :
                              sim.status === 'Reserved' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {sim.status === 'Available' ? 'In Stock' : sim.status}
                            </span>
                          </div>

                          <h4 className="font-bold text-base text-gray-900">{sim.network} {sim.simType || 'Prepaid SIM'}</h4>
                          <p className="text-xs text-gray-500 mt-1 text-justify md:text-left">4G / 5G Tri-cut standard, micro, nano & eSIM ready</p>

                          <div className="mt-4 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                            <span className="text-xs text-slate-500">Retail Price</span>
                            <span className="font-mono font-bold text-base text-[#1E5AA8]">Rs. {sim.sellingPrice}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleWhatsApp(`Hello ${settings.shopName}, I would like to reserve a ${sim.network} SIM card (Price: Rs. ${sim.sellingPrice}). What documents should I bring for KYC registration?`)}
                          className="mt-4 w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>Reserve via WhatsApp</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Important Notice Prominent */}
                  <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-[#92400E]">TRCSL & KYC Registration Requirement</h4>
                        <p className="text-xs sm:text-sm text-[#B45309] mt-1 leading-relaxed text-justify md:text-left">
                          Please bring your original National Identity Card (NIC), Passport, or Driving License. SIM activation is completed instantly in our store following official telecommunication guidelines.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SPECIFIC SECTION: PACKAGES & HOME BROADBAND */}
              {service.category === 'Packages' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Mobile SIM Plans & Home Broadband Packages</h3>
                      <p className="text-xs text-gray-500 mt-0.5 text-justify md:text-left">Explore high-speed mobile data, 4G/5G Home Router Wi-Fi packs, and unlimited social boosters</p>
                    </div>

                    {/* Search input */}
                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search packages, 100GB..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:bg-white focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>

                  {/* Filter Row 1: Operator Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Operator:</span>
                    {['All', 'Dialog', 'Mobitel', 'Hutch', 'Airtel'].map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                          selectedNetwork === net
                            ? net === 'Dialog' ? 'bg-red-600 text-white' :
                              net === 'Mobitel' ? 'bg-blue-600 text-white' :
                              net === 'Hutch' ? 'bg-orange-500 text-white' :
                              net === 'Airtel' ? 'bg-red-500 text-white' :
                              'bg-[#1E5AA8] text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>

                  {/* Filter Row 2: Category Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Category:</span>
                    {[
                      { id: 'All', label: 'All Plans' },
                      { id: 'Home Broadband (Router / Wi-Fi)', label: '📶 Home Broadband' },
                      { id: 'Mobile SIM Plans', label: '📱 Mobile SIM Plans' },
                      { id: 'Social & Streaming', label: '🎬 Social & Video' },
                      { id: 'Work & Study', label: '💻 Work & Study' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                          selectedCategory === cat.id
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Packages Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {activePackages.length === 0 ? (
                      <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                        <Package className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No packages found matching your filter.</p>
                        <p className="text-xs text-slate-500 mt-1">Try selecting "All" or a different operator.</p>
                      </div>
                    ) : (
                      activePackages.map(pkg => {
                        const isBroadband = pkg.category === 'Home Broadband (Router / Wi-Fi)' || pkg.type.toLowerCase().includes('broadband');
                        return (
                          <div 
                            key={pkg.id} 
                            className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                              isBroadband 
                                ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/30 to-white hover:border-indigo-400 shadow-soft-sm hover:shadow-soft-md'
                                : 'border-slate-200 bg-white hover:border-blue-300 shadow-soft-sm hover:shadow-soft-md'
                            }`}
                          >
                            <div>
                              {/* Header Tags */}
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                                    pkg.network === 'Dialog' ? 'bg-red-50 text-red-700 border border-red-200' :
                                    pkg.network === 'Mobitel' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                    pkg.network === 'Hutch' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                                    'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    {pkg.network}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                                    isBroadband ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                                  }`}>
                                    {isBroadband ? <Wifi className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                                    <span>{isBroadband ? 'Broadband' : 'Mobile'}</span>
                                  </span>
                                </div>

                                {pkg.badge && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                    {pkg.badge}
                                  </span>
                                )}
                              </div>

                              {/* Plan Name & Description */}
                              <h4 className="font-bold text-base text-gray-900">{pkg.name}</h4>
                              <p className="text-xs text-gray-600 mt-1 leading-relaxed text-justify md:text-left">{pkg.description}</p>

                              {/* Quota & Speed Highlight Box */}
                              <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                                {pkg.quota && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Data Quota:</span>
                                    <span className="font-bold text-slate-900">{pkg.quota}</span>
                                  </div>
                                )}
                                {pkg.speed && (
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Network Speed:</span>
                                    <span className="font-semibold text-indigo-700">{pkg.speed}</span>
                                  </div>
                                )}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium">Validity:</span>
                                  <span className="font-semibold text-slate-800">{pkg.validity || '30 Days'}</span>
                                </div>
                              </div>

                              {/* Feature Bullet Points */}
                              {pkg.features && pkg.features.length > 0 && (
                                <div className="mt-3 space-y-1.5">
                                  {pkg.features.map((feat, fIdx) => (
                                    <div key={fIdx} className="flex items-start gap-1.5 text-xs text-slate-700">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                      <span>{feat}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* USSD Code instruction if available */}
                              {pkg.ussdCode && (
                                <div className="mt-3 text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                                  Activation: {pkg.ussdCode}
                                </div>
                              )}
                            </div>

                            {/* Footer with Price & WhatsApp Button */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                              <div>
                                <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Total Price</span>
                                <span className="font-mono font-bold text-base text-[#1E5AA8]">
                                  Rs. {pkg.price.toLocaleString()}
                                </span>
                              </div>

                              <button
                                onClick={() => handleWhatsApp(`Hello ${settings.shopName}, I would like to reload/activate the following package:\n\n• Package: ${pkg.name}\n• Provider: ${pkg.network}\n• Category: ${pkg.category || pkg.type}\n• Price: Rs. ${pkg.price}\n• Quota: ${pkg.quota || 'Standard'}\n\nPlease let me know how to proceed!`)}
                                className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 active-press transition-colors shadow-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                <span>Reload</span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Important Notice Prominent */}
                  <div className="bg-[#FEF3C7] border-l-4 border-[#F59E0B] p-4 rounded-r-xl">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-[#92400E]">Instant Counter Reload & Online Assistance</h4>
                        <p className="text-xs sm:text-sm text-[#B45309] mt-1 leading-relaxed text-justify md:text-left">
                          Prices and government telecom taxes are subject to operator adjustments. Contact us on WhatsApp with your mobile or router number for instantaneous activation and confirmation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ESTIMATE CALCULATOR FOR PHOTOCOPY / PRINTING */}
              {(service.category === 'Photocopy' || service.category === 'Printing') && (
                <div className="p-5 bg-gradient-to-br from-blue-50/40 via-white to-slate-50 rounded-2xl border border-blue-100 space-y-4 shadow-soft-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#1E5AA8] flex items-center justify-center">
                        <Calculator className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">Instant Estimate Calculator</h3>
                        <p className="text-xs text-gray-500">Calculate job price based on page count and paper size</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-[#1E5AA8] border border-blue-200">
                      Live Counter Rates
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Color Mode</label>
                      <select
                        value={calcType}
                        onChange={(e) => setCalcType(e.target.value as 'bw' | 'color')}
                        className="w-full text-xs font-medium bg-white border border-gray-300 rounded-lg p-2.5 focus:border-[#1E5AA8] outline-none"
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
                        className="w-full text-xs font-medium bg-white border border-gray-300 rounded-lg p-2.5 focus:border-[#1E5AA8] outline-none"
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
                        className="w-full text-xs font-medium bg-white border border-gray-300 rounded-lg p-2.5 focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs">
                    <span className="text-gray-500">
                      Est. Rate: <span className="font-semibold text-gray-800">LKR {unitRate}.00 / page</span>
                    </span>
                    <div className="text-right">
                      <span className="text-gray-600 mr-2 text-xs">Estimated Total:</span>
                      <span className="text-lg font-mono font-bold text-[#1E5AA8]">LKR {estimatedTotal.toLocaleString()}.00</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Important Instructions Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E5AA8]" />
                  <span>Important Instructions & Tips</span>
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 list-disc list-inside">
                  {service.importantNotes.map((note, idx) => (
                    <li key={idx} className="text-justify md:text-left">{note}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Summary, Quick Pricing, Contact & WhatsApp Actions */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6 md:sticky md:top-24">
            
            {/* Quick Action & Price Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-sm space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Service Pricing</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-[#1E5AA8]">{service.priceInfo}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 text-justify md:text-left">
                  Transparent counter pricing. Volume discounts available for bulk copies and printing orders.
                </p>
              </div>

              {/* Primary WhatsApp Action */}
              <button
                onClick={() => handleWhatsApp()}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-soft-md active-press transition-all min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5 fill-white text-[#F59E0B]" />
                <span>Contact via WhatsApp</span>
              </button>

              {/* Direct Call Secondary Button */}
              <a
                href={`tel:${settings.phoneNumber.replace(/\s+/g, '')}`}
                className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
              >
                <Phone className="w-4 h-4 text-slate-600" />
                <span>Call Store: {settings.phoneNumber}</span>
              </a>

              {/* Trust Badges */}
              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Instant counter service & live processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Official TRCSL Authorized Telecommunications Partner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>High quality papers, toners & genuine SIMs</span>
                </div>
              </div>
            </div>

            {/* In-Store Location & Hours Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E5AA8]" />
                <span>In-Store Visit & Location</span>
              </h3>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Shop Location</span>
                <p className="text-xs font-semibold text-slate-800 leading-snug">{settings.address}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Business Hours</span>
                <p className="text-xs font-semibold text-slate-800 leading-snug">
                  Mon-Fri: {settings.openingHours?.monFri || '8:00 AM - 9:00 PM'}
                </p>
                <p className="text-[11px] text-slate-500">
                  Sat: {settings.openingHours?.sat || '8:30 AM - 8:00 PM'} • Sun: {settings.openingHours?.sun || '9:00 AM - 6:00 PM'}
                </p>
              </div>

              <button
                onClick={() => handleWhatsApp(`Hi ${settings.shopName}, I'm planning to visit your store for ${service.name}. Are you open now?`)}
                className="w-full py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-semibold text-xs flex items-center justify-center gap-2 active-press transition-colors min-h-[44px]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask Store Status on WhatsApp</span>
              </button>
            </div>

          </div>

        </div>

        {/* Related Services in Same Category Section */}
        {services.filter(s => s.isPublished && s.category === service.category && s.id !== service.id).length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider block mb-1">
                  More From This Category
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Other {service.category} Services
                </h3>
              </div>

              <button
                onClick={() => navigate(`/services?category=${encodeURIComponent(service.category)}`)}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1E5AA8] hover:text-[#164785] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>View All {service.category} Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services
                .filter(s => s.isPublished && s.category === service.category && s.id !== service.id)
                .slice(0, 4)
                .map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => navigate(`/services/${rel.slug}`)}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md transition-all p-4 cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {rel.image && (
                        <div className="h-32 w-full rounded-xl overflow-hidden mb-3 bg-slate-900">
                          <img
                            src={rel.image}
                            alt={rel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1E5AA8] transition-colors line-clamp-1">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {rel.shortDescription || rel.fullDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E5AA8]">{rel.priceInfo}</span>
                      <span className="text-xs font-bold text-slate-500 group-hover:text-[#1E5AA8] flex items-center gap-1">
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
