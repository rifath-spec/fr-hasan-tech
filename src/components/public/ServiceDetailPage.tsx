import React, { useState, useMemo, useEffect } from 'react';
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
  Filter,
  Laptop,
  Award,
  Mail,
  CreditCard,
  Check,
  Star,
  Layers,
  Image as ImageIcon,
  Palette
} from 'lucide-react';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { ServicePackage } from '../../types';

interface ServiceDetailPageProps {
  slug: string;
}

export const ServiceDetailPage: React.FC<ServiceDetailPageProps> = ({ slug }) => {
  const { navigate, settings, services, packages, sims } = useApp();

  // Find target service by slug or fallback
  const service = services.find(s => s.slug === slug) || services[0];

  // Active selected gallery image
  const [activeImage, setActiveImage] = useState<string>(service?.image || service?.imageUrl || '');
  const [selectedPackageTier, setSelectedPackageTier] = useState<ServicePackage | null>(null);

  // Update active image when service changes
  useEffect(() => {
    if (service) {
      setActiveImage(service.image || service.imageUrl || '');
      if (service.packages && service.packages.length > 0) {
        setSelectedPackageTier(service.packages[0]);
      } else {
        setSelectedPackageTier(null);
      }
    }
  }, [service]);

  // Dynamic SEO Page Title & Meta Tags & JSON-LD
  useEffect(() => {
    if (!service) return;

    const pageTitle = service.seoTitle || `${service.name} | ${settings.shopName}`;
    const pageDesc = service.seoDescription || service.shortDescription || service.fullDescription;
    
    document.title = pageTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pageDesc);
    }

    // Insert or update Schema.org JSON-LD structured data for Service
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": service.name,
      "description": service.shortDescription || service.fullDescription,
      "provider": {
        "@type": "LocalBusiness",
        "name": settings.shopName,
        "telephone": settings.phoneNumber,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": settings.address,
          "addressCountry": "LK"
        }
      },
      "areaServed": "Sri Lanka",
      "offers": service.packages && service.packages.length > 0 ? service.packages.map(p => ({
        "@type": "Offer",
        "name": p.name,
        "price": p.price,
        "priceCurrency": p.currency || "LKR",
        "description": p.description
      })) : {
        "@type": "Offer",
        "price": service.singlePrice || 0,
        "priceCurrency": "LKR",
        "description": service.priceInfo
      }
    };

    let scriptTag = document.getElementById('service-json-ld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'service-json-ld';
      scriptTag.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      // clean up json ld if component unmounts
      const tag = document.getElementById('service-json-ld');
      if (tag) tag.remove();
    };
  }, [service, settings]);

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
    let text = customMsg;
    if (!text) {
      if (selectedPackageTier) {
        text = `Hello ${settings.shopName}, I would like to inquire about the *${selectedPackageTier.name}* package for *${service.name}* (Price: LKR ${selectedPackageTier.price.toLocaleString()}). Could you please share the next steps?`;
      } else {
        text = `Hello ${settings.shopName}, I would like to inquire about your *${service.name}* service (${service.priceInfo}).`;
      }
    }
    openWhatsAppChat(settings.whatsappNumber || '076 859 7800', text);
  };

  const getServiceIcon = () => {
    const cat = (service.category || '').toLowerCase();
    if (cat.includes('computer')) return <Laptop className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('cert')) return <Award className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('card') || cat.includes('visiting')) return <CreditCard className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('invit')) return <Mail className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('photocopy')) return <Copy className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('print')) return <Printer className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('sim')) return <Smartphone className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('package')) return <Package className="w-8 h-8 text-[#1E5AA8]" />;
    if (cat.includes('design')) return <Palette className="w-8 h-8 text-[#1E5AA8]" />;
    return <FileText className="w-8 h-8 text-[#1E5AA8]" />;
  };

  // Filter packages dynamically (for Packages service)
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

  // Check if service has multiple packages defined
  const hasServicePackages = Array.isArray(service.packages) && service.packages.length > 0;

  // All gallery pictures
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (service.image) list.push(service.image);
    if (service.imageUrl && !list.includes(service.imageUrl)) list.push(service.imageUrl);
    if (Array.isArray(service.galleryImages)) {
      service.galleryImages.forEach(img => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [service]);

  return (
    <div className="w-full bg-[#F8FAFC] py-8 sm:py-12">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-[#64748B] mb-6 flex-wrap">
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
          <button 
            onClick={() => navigate(`/services?category=${encodeURIComponent(service.category)}`)}
            className="hover:text-[#1E5AA8] transition-colors"
          >
            {service.category}
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-bold truncate max-w-xs">{service.name}</span>
        </nav>

        {/* Hero Area */}
        <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-soft-sm mb-8 w-full">
          {activeImage ? (
            <div className="h-56 sm:h-72 md:h-80 lg:h-96 w-full relative overflow-hidden bg-slate-950">
              <img
                src={activeImage}
                alt={service.name}
                className="w-full h-full object-cover object-center transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              {/* Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#164785] text-xs font-bold shadow-sm">
                      {service.category}
                    </span>
                    {service.featured && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold shadow-sm">
                        ⭐ Featured Service
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-sm">
                    {service.name}
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg items-center justify-center text-[#1E5AA8] shrink-0">
                    {getServiceIcon()}
                  </div>
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

          {/* Foreground overview snippet & Gallery thumbnails */}
          <div className="p-6 sm:p-8 bg-white border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                {service.shortDescription}
              </p>
              <div className="mt-3 inline-flex items-center gap-2 font-bold text-sm sm:text-base text-[#1E5AA8] bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-100 shadow-xs font-mono">
                {service.priceInfo}
              </div>
            </div>

            {/* Gallery thumbnails */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImage === img ? 'border-[#1E5AA8] ring-2 ring-blue-100 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${service.name} ${i+1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main 2-Column Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT COLUMN: Main Information, Pricing Packages, Options & Guidelines */}
          <div className="md:col-span-7 lg:col-span-8 space-y-6">
            
            {/* Service Full Overview Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-soft-sm space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#1E5AA8]" />
                  <span>Service Overview & Details</span>
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {service.fullDescription || service.description || service.shortDescription}
                </p>
              </div>

              {/* DYNAMIC MULTI-TIER PACKAGES GRID */}
              {hasServicePackages && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        <span>Available Service Packages & Pricing</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">Select a tier below to request an instant quote or book via WhatsApp</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {service.packages?.filter(p => p.active !== false).map((pkg, idx) => {
                      const isSelected = selectedPackageTier?.name === pkg.name;
                      const isPopular = pkg.name.toLowerCase().includes('premium') || pkg.name.toLowerCase().includes('pro');

                      return (
                        <div
                          key={pkg.id || idx}
                          onClick={() => setSelectedPackageTier(pkg)}
                          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                            isSelected 
                              ? 'border-purple-600 bg-purple-50/40 shadow-soft-md scale-[1.02]' 
                              : 'border-slate-200 bg-white hover:border-purple-200 shadow-soft-sm'
                          }`}
                        >
                          {isPopular && (
                            <span className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                              Recommended
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-base font-extrabold text-slate-900">{pkg.name}</h4>
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                isSelected ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {isSelected ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                              </span>
                            </div>

                            <div className="mb-3">
                              <span className="text-xs text-slate-400 font-semibold block">Fixed Price</span>
                              <div className="text-2xl font-extrabold text-purple-900 font-mono">
                                LKR {pkg.price.toLocaleString()}
                              </div>
                            </div>

                            {pkg.description && (
                              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                                {pkg.description}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPackageTier(pkg);
                              handleWhatsApp(`Hello ${settings.shopName}, I would like to order the *${pkg.name}* package for *${service.name}* (Price: LKR ${pkg.price.toLocaleString()}).`);
                            }}
                            className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors ${
                              isSelected
                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-purple-600 hover:text-white text-slate-700'
                            }`}
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-current" />
                            <span>Select & Inquire</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Available Services List */}
              {service.availableServicesList && service.availableServicesList.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 mb-3">Included Scope & Solutions</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.availableServicesList.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                        <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-slate-800">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SPECIFIC SECTION: SIM CARDS */}
              {service.category === 'SIM Cards' && (
                <div className="space-y-6 pt-4 border-t border-gray-100">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Supported Telecommunication Networks & SIM Stock</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Physical SIMs, eSIMs, and 4G/5G Router Data SIMs with in-store KYC registration</p>
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
                          <p className="text-xs text-gray-500 mt-1">4G / 5G Tri-cut standard, micro, nano & eSIM ready</p>

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
              {service.importantNotes && service.importantNotes.length > 0 && (
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#1E5AA8]" />
                    <span>Important Guidelines & Tips</span>
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-gray-600 list-disc list-inside">
                    {service.importantNotes.map((note, idx) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>

          </div>

          {/* RIGHT COLUMN: Sticky Price Card, Contact & WhatsApp Actions */}
          <div className="md:col-span-5 lg:col-span-4 space-y-6 md:sticky md:top-24">
            
            {/* Quick Action & Price Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-sm space-y-5">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Service Pricing</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl lg:text-3xl font-extrabold text-[#1E5AA8] font-mono">
                    {selectedPackageTier ? `LKR ${selectedPackageTier.price.toLocaleString()}` : service.priceInfo}
                  </span>
                  {selectedPackageTier && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                      {selectedPackageTier.name} Tier
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Direct counter service and online WhatsApp processing available with instant support.
                </p>
              </div>

              {/* Primary WhatsApp Action */}
              <button
                onClick={() => handleWhatsApp()}
                className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-soft-md active-press transition-all min-h-[48px]"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                <span>
                  {selectedPackageTier ? `Order ${selectedPackageTier.name} via WhatsApp` : 'Inquire via WhatsApp'}
                </span>
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
                  <span>Instant counter service & rapid delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified quality with genuine software & materials</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sri Lankan Rupees (LKR) transparent pricing</span>
                </div>
              </div>
            </div>

            {/* In-Store Location & Hours Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-soft-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#1E5AA8]" />
                <span>Store Location & Hours</span>
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
            </div>

          </div>

        </div>

        {/* Related Services in Same Category Section */}
        {services.filter(s => s.isPublished && s.id !== service.id).length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <span className="text-xs font-bold text-[#1E5AA8] uppercase tracking-wider block mb-1">
                  Explore More Solutions
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                  Other Services from FR.HASAN TECH
                </h3>
              </div>

              <button
                onClick={() => navigate('/services')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#1E5AA8] hover:text-[#164785] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <span>View All Services</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {services
                .filter(s => s.isPublished && s.id !== service.id)
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
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {rel.category}
                        </span>
                        {rel.featured && <span className="text-[10px] text-amber-500 font-bold">⭐</span>}
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-[#1E5AA8] transition-colors line-clamp-1">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {rel.shortDescription || rel.fullDescription}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1E5AA8] font-mono">{rel.priceInfo}</span>
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
