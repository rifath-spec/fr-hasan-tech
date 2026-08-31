import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Copy, 
  Printer, 
  Smartphone, 
  Package, 
  ArrowRight, 
  ArrowLeft,
  Search, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Palette, 
  ShieldCheck, 
  Calculator, 
  MessageCircle, 
  ChevronRight,
  Info,
  SlidersHorizontal,
  Phone,
  Tag,
  Wifi,
  Zap,
  Globe,
  Grid,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { openWhatsAppChat } from '../../utils/whatsapp';
import { ServiceItem } from '../../types';

// Fallback high-resolution category artwork
const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  'Photocopy': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
  'Printing': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  'SIM Cards': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
  'Packages': 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
  'Lamination': 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
  'Document Binding': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80',
  'Scanning': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'Graphic Design': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
};

export const ServicesListPage: React.FC = () => {
  const { currentPath, navigate, services, settings, sims, packages, openEstimateModal, isLoadingData } = useApp();

  // Parse category from URL query or path if present (e.g. /services?category=Photocopy)
  const getCategoryFromUrl = (): string => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const cat = params.get('category');
        if (cat) return cat;

        // Also check if path is /services/category/xxx or /services/photocopy
        if (currentPath.includes('?category=')) {
          const match = currentPath.split('?category=')[1];
          if (match) return decodeURIComponent(match.split('&')[0]);
        }
      }
    } catch {
      // ignore
    }
    return 'All';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getCategoryFromUrl);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filtering state for embedded SIMs / Packages
  const [selectedNetwork, setSelectedNetwork] = useState<string>('All');
  const [selectedPackageCategory, setSelectedPackageCategory] = useState<string>('All');

  // Sync with URL changes
  useEffect(() => {
    const cat = getCategoryFromUrl();
    if (cat !== selectedCategory) {
      setSelectedCategory(cat);
    }
  }, [currentPath]);

  // Group published services by Category
  const publishedServices = useMemo(() => {
    return services.filter(s => s.isPublished);
  }, [services]);

  // All distinct categories
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    publishedServices.forEach(s => {
      if (s.category && s.category.trim()) {
        catSet.add(s.category.trim());
      }
    });

    return Array.from(catSet);
  }, [publishedServices]);

  // Grouped map: Category Name -> Array of ServiceItems
  const categoryGroups = useMemo(() => {
    const map: Record<string, ServiceItem[]> = {};
    
    // Initialize all known categories with empty array
    categories.forEach(cat => {
      map[cat] = [];
    });

    // Populate with actual services
    publishedServices.forEach(service => {
      const cat = (service.category || 'General Services').trim();
      if (!map[cat]) {
        map[cat] = [];
      }
      map[cat].push(service);
    });

    return map;
  }, [categories, publishedServices]);

  // Icon helper
  const getCategoryIcon = (category: string, className = "w-6 h-6 text-[#1E5AA8]") => {
    const lower = (category || '').toLowerCase();
    if (lower.includes('photo') && lower.includes('copy')) return <Copy className={className} />;
    if (lower === 'photocopy') return <Copy className={className} />;
    if (lower.includes('print')) return <Printer className={className} />;
    if (lower.includes('sim')) return <Smartphone className={className} />;
    if (lower.includes('package') || lower.includes('reload')) return <Package className={className} />;
    if (lower.includes('laminat')) return <Sparkles className={className} />;
    if (lower.includes('bind')) return <Layers className={className} />;
    if (lower.includes('design') || lower.includes('type')) return <Palette className={className} />;
    if (lower.includes('scan')) return <FileText className={className} />;
    if (lower.includes('id') || lower.includes('card') || lower.includes('bill')) return <ShieldCheck className={className} />;
    return <FileText className={className} />;
  };

  // Get representative image for category
  const getCategoryBanner = (catName: string, items: ServiceItem[]): string => {
    const itemWithImg = items.find(s => s.image && s.image.trim().length > 0);
    if (itemWithImg && itemWithImg.image) {
      return itemWithImg.image;
    }
    return CATEGORY_DEFAULT_IMAGES[catName] || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80';
  };

  // Starting price helper
  const getStartingPrice = (items: ServiceItem[]): string => {
    if (items.length === 0) return 'Custom quote';
    // Look for prices in items
    const prices = items.map(s => s.priceInfo).filter(Boolean);
    if (prices.length === 0) return 'Inquire for rates';
    return `Starting from ${prices[0]}`;
  };

  // Category switch handler
  const handleSelectCategory = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    const newUrl = cat === 'All' ? '/services' : `/services?category=${encodeURIComponent(cat)}`;
    navigate(newUrl);
  };

  // WhatsApp chat opener
  const handleWhatsAppInquiry = (serviceName?: string, catName?: string) => {
    const topic = serviceName 
      ? `your ${serviceName} (${catName || 'Services'}) service` 
      : `${catName || 'Services'} solutions`;
    const message = `Hello ${settings.shopName}, I would like to inquire about ${topic}. Could you please share more details or a quote?`;
    openWhatsAppChat(settings.whatsappNumber || '076 859 7800', message);
  };

  // Filtered services when a category or search is active
  const servicesInSelectedCategory = useMemo(() => {
    if (selectedCategory === 'All') {
      return publishedServices.filter(s => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) ||
               s.shortDescription.toLowerCase().includes(q) ||
               s.category.toLowerCase().includes(q) ||
               s.availableServicesList.some(item => item.toLowerCase().includes(q));
      });
    }

    const items = categoryGroups[selectedCategory] || [];
    if (!searchQuery.trim()) return items;

    const q = searchQuery.toLowerCase();
    return items.filter(s => {
      return s.name.toLowerCase().includes(q) ||
             s.shortDescription.toLowerCase().includes(q) ||
             s.availableServicesList.some(item => item.toLowerCase().includes(q)) ||
             s.importantNotes.some(note => note.toLowerCase().includes(q));
    });
  }, [selectedCategory, categoryGroups, publishedServices, searchQuery]);

  // Filter SIM Cards
  const activeSims = useMemo(() => {
    return sims.filter(s => {
      const matchesNet = selectedNetwork === 'All' || s.network === selectedNetwork;
      const matchesSearch = searchQuery === '' || 
        s.network.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.package.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesNet && matchesSearch;
    });
  }, [sims, selectedNetwork, searchQuery]);

  // Filter Packages
  const activePackages = useMemo(() => {
    return packages.filter(p => {
      if (p.status !== 'Active') return false;
      const matchesNet = selectedNetwork === 'All' || p.network === selectedNetwork;
      const pkgCat = p.category || (p.type.toLowerCase().includes('broadband') || p.type.toLowerCase().includes('router') || p.type.toLowerCase().includes('fiber') ? 'Home Broadband (Router / Wi-Fi)' : 'Mobile SIM Plans');
      const matchesCat = selectedPackageCategory === 'All' || pkgCat === selectedPackageCategory;
      const matchesSearch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.quota && p.quota.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.badge && p.badge.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesNet && matchesCat && matchesSearch;
    }).sort((a, b) => a.displayOrder - b.displayOrder);
  }, [packages, selectedNetwork, selectedPackageCategory, searchQuery]);

  const isShowingAllCategoriesView = selectedCategory === 'All' && !searchQuery.trim();

  return (
    <div className="w-full bg-[#F8FAFC] py-8 sm:py-12 min-h-screen">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* ========================================================================= */}
        {/* TOP NAVIGATION & BREADCRUMBS BAR */}
        {/* ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          
          {/* Breadcrumb path */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 flex-wrap">
            <button 
              onClick={() => navigate('/')} 
              className="hover:text-[#1E5AA8] font-medium transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <button 
              onClick={() => handleSelectCategory('All')} 
              className={`font-medium transition-colors cursor-pointer ${
                selectedCategory === 'All' ? 'text-[#1E5AA8] font-bold' : 'hover:text-[#1E5AA8]'
              }`}
            >
              Services Catalog
            </button>
            
            {selectedCategory !== 'All' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-900 font-bold bg-blue-50 text-[#1E5AA8] px-2.5 py-0.5 rounded-md text-xs border border-blue-100">
                  {selectedCategory}
                </span>
              </>
            )}
          </nav>

          {/* Quick Back Button (If inside a specific category) */}
          {selectedCategory !== 'All' && (
            <button
              onClick={() => handleSelectCategory('All')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-[#1E5AA8] hover:border-blue-200 hover:bg-blue-50/50 text-xs font-bold shadow-soft-xs transition-all active-press cursor-pointer self-start sm:self-auto"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to All Categories</span>
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MAIN PAGE HEADER / CATEGORY HERO */}
        {/* ========================================================================= */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          {selectedCategory === 'All' ? (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1E5AA8] text-xs font-bold mb-3 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#1E5AA8]" />
                <span>Organized by Main Service Category</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1A202C] tracking-tight">
                Our Services Catalog
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-[#64748B] mt-3 leading-relaxed">
                Choose a main category below to explore all related services, specifications, custom options, and instant pricing.
              </p>
            </>
          ) : (
            <>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-100 text-[#1E5AA8] text-xs font-bold mb-3 shadow-xs">
                <Tag className="w-3.5 h-3.5 text-[#1E5AA8]" />
                <span>Main Category Showcase</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F0FE] flex items-center justify-center text-[#1E5AA8] shadow-sm">
                  {getCategoryIcon(selectedCategory, "w-6 h-6 sm:w-7 sm:h-7 text-[#1E5AA8]")}
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1A202C] tracking-tight">
                  {selectedCategory}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                Showing all {categoryGroups[selectedCategory]?.length || 0} related services available under {selectedCategory}
              </p>
            </>
          )}
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE CATEGORY TABS & SEARCH BAR */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-soft-sm mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full min-w-0">
          
          {/* Horizontal Category Switcher Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto min-w-0 pb-2 md:pb-0">
            <button
              onClick={() => handleSelectCategory('All')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[40px] flex items-center gap-2 cursor-pointer shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-[#1E5AA8] text-white shadow-soft-sm ring-2 ring-blue-500/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5 shrink-0" />
              <span>All Categories ({categories.length})</span>
            </button>

            {categories.map((cat) => {
              const count = categoryGroups[cat]?.length || 0;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap min-h-[40px] flex items-center gap-2 cursor-pointer shrink-0 ${
                    isSelected
                      ? 'bg-[#1E5AA8] text-white shadow-soft-sm ring-2 ring-blue-500/20'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  {getCategoryIcon(cat, `w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`)}
                  <span>{cat}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Field */}
          <div className="relative w-full md:w-80 shrink-0 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={selectedCategory === 'All' ? "Search across all services..." : `Search in ${selectedCategory}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1E5AA8] focus:ring-2 focus:ring-[#1E5AA8]/15 outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/80 hover:bg-slate-300 w-5 h-5 rounded-full flex items-center justify-center font-bold"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* VIEW 1: MAIN CATEGORIES SHOWCASE GRID (When "All" is active) */}
        {/* ========================================================================= */}
        {isShowingAllCategoriesView && (
          <div className="space-y-6 w-full min-w-0">
            
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#1E5AA8]" />
                <span>Core Service Categories</span>
              </h2>
              <span className="text-xs sm:text-sm text-slate-500 font-medium">
                Click any category to list all related services
              </span>
            </div>

            {isLoadingData && categories.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-pulse w-full">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-80 flex flex-col justify-between shadow-soft-xs">
                    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                    </div>
                    <div className="h-9 bg-slate-100 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-12 text-center shadow-soft-sm">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Categories Added Yet</h3>
                <p className="text-sm text-slate-500 mt-1">Admin can create categories and add services from the dashboard.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
                {categories.map((catName) => {
                  const items = categoryGroups[catName] || [];
                  const banner = getCategoryBanner(catName, items);
                  const startingPrice = getStartingPrice(items);

                  return (
                    <div
                      key={catName}
                      onClick={() => handleSelectCategory(catName)}
                      className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col h-full w-full min-w-0"
                    >
                      <div className="flex-1 flex flex-col">
                        {/* Visual Banner */}
                        <div className="h-48 w-full relative overflow-hidden bg-slate-950 shrink-0">
                          <img
                            src={banner}
                            alt={catName}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/20" />
                          
                          {/* Top Badges */}
                          <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between pointer-events-none">
                            <span className="px-3 py-1 rounded-full bg-slate-900/90 backdrop-blur-md text-white font-bold text-xs shadow-md border border-white/20">
                              {catName}
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-white/95 backdrop-blur-md flex items-center justify-center text-[#1E5AA8] shadow-md border border-white/40">
                              {getCategoryIcon(catName, "w-4 h-4 text-[#1E5AA8]")}
                            </div>
                          </div>

                          {/* Bottom Category Title & Count */}
                          <div className="absolute bottom-3.5 left-3.5 right-3.5 text-white pointer-events-none">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#16B95A]/90 text-white text-[10px] font-bold tracking-wide uppercase shadow-xs">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                {items.length} {items.length === 1 ? 'Service' : 'Services'} Inside
                              </span>
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-sm truncate">
                              {catName}
                            </h3>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col">
                          {/* Price Tag Indicator */}
                          <div>
                            <div className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-[#1E5AA8] font-bold text-xs border border-blue-100/80 mb-3">
                              {startingPrice}
                            </div>
                          </div>

                          {/* Related Sub-Services Checklist */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                              Available In This Category:
                            </span>

                            {items.length === 0 ? (
                              <p className="text-xs text-slate-400 italic">No services listed yet</p>
                            ) : (
                              items.slice(0, 4).map((srv) => (
                                <div key={srv.id} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                  <span className="truncate">{srv.name}</span>
                                </div>
                              ))
                            )}

                            {items.length > 4 && (
                              <p className="text-[11px] text-[#1E5AA8] font-bold pt-1">
                                + {items.length - 4} more related services...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Button */}
                      <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 mt-auto">
                        <button
                          type="button"
                          className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#0D6EFD] bg-blue-50 group-hover:bg-[#1E5AA8] group-hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-soft-xs"
                        >
                          <span>Explore All {items.length} {catName} Services</span>
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 shrink-0" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: CATEGORY VIEW / ALL RELATED SERVICES UNDER SELECTED CATEGORY */}
        {/* ========================================================================= */}
        {!isShowingAllCategoriesView && (
          <div className="space-y-8 w-full min-w-0">
            
            {/* Category Header Banner */}
            <div className="bg-gradient-to-r from-[#062B5C] via-[#0A4385] to-[#1E5AA8] rounded-2xl p-5 sm:p-6 md:p-8 text-white shadow-soft-md flex flex-col md:flex-row items-start md:items-center justify-between gap-5 sm:gap-6 w-full min-w-0">
              <div className="space-y-2 max-w-2xl min-w-0 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                    Category: {selectedCategory}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/80 text-white text-xs font-bold">
                    {servicesInSelectedCategory.length} {servicesInSelectedCategory.length === 1 ? 'Service' : 'Services'} Available
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white break-words">
                  {selectedCategory === 'All' ? 'All Matching Services' : `${selectedCategory} Solutions`}
                </h2>
                <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
                  Browse and order from our complete collection of {selectedCategory} services below. We offer rapid turnaround, verified equipment, and direct WhatsApp support.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3 w-full md:w-auto shrink-0">
                <button
                  onClick={() => openEstimateModal()}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white text-[#0A4385] hover:bg-blue-50 font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active-press transition-colors cursor-pointer min-h-[42px]"
                >
                  <Calculator className="w-4 h-4 text-[#0D6EFD] shrink-0" />
                  <span className="whitespace-nowrap">Instant Estimate</span>
                </button>
                <button
                  onClick={() => handleWhatsAppInquiry(undefined, selectedCategory)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#16B95A] hover:bg-[#129a4a] text-white font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active-press transition-colors cursor-pointer min-h-[42px]"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="whitespace-nowrap">Order via WhatsApp</span>
                </button>
              </div>
            </div>

            {/* List of Related Services Grid */}
            {isLoadingData && servicesInSelectedCategory.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 animate-pulse w-full">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="bg-white rounded-2xl border border-slate-200 p-4 h-96 flex flex-col justify-between shadow-soft-xs">
                    <div className="w-full h-48 bg-slate-200 rounded-xl mb-4" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-full" />
                      <div className="h-3 bg-slate-100 rounded-md w-2/3" />
                    </div>
                    <div className="h-10 bg-slate-100 rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : servicesInSelectedCategory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center shadow-soft-sm w-full">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">
                  {searchQuery ? `No services match "${searchQuery}" in ${selectedCategory}.` : `No services have been added to ${selectedCategory} yet.`}
                </p>
                <button
                  onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  View All Services
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 w-full">
                {servicesInSelectedCategory.map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm hover:shadow-soft-lg hover:-translate-y-1 transition-all duration-200 overflow-hidden flex flex-col h-full w-full min-w-0"
                  >
                    <div className="flex-1 flex flex-col">
                      {/* Service Photo Banner */}
                      <div 
                        onClick={() => navigate(`/services/${service.slug}`)}
                        className="h-44 w-full relative overflow-hidden bg-slate-950 cursor-pointer shrink-0"
                      >
                        <img
                          src={service.image || CATEGORY_DEFAULT_IMAGES[service.category] || 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80'}
                          alt={service.name}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                        
                        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                          <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#1E5AA8] font-bold text-[11px] shadow-xs">
                            {service.category}
                          </span>
                          <div className="w-7 h-7 rounded-lg bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#1E5AA8] shadow-xs">
                            {getCategoryIcon(service.category, "w-4 h-4 text-[#1E5AA8]")}
                          </div>
                        </div>

                        <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                          <span className="text-xs font-bold text-amber-300 drop-shadow-sm block">
                            {service.priceInfo}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col">
                        <h3 
                          onClick={() => navigate(`/services/${service.slug}`)}
                          className="text-base sm:text-lg font-bold text-slate-900 hover:text-[#1E5AA8] transition-colors cursor-pointer line-clamp-1 break-words"
                        >
                          {service.name}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                          {service.shortDescription || service.fullDescription}
                        </p>

                        {/* Available Options Checklist */}
                        {service.availableServicesList.length > 0 && (
                          <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                            {service.availableServicesList.slice(0, 3).map((item, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                                <span className="truncate">{item}</span>
                              </div>
                            ))}
                            {service.availableServicesList.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-medium pl-5 block">
                                + {service.availableServicesList.length - 3} more options
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="p-4 sm:p-5 pt-3 border-t border-slate-100 space-y-2 mt-auto">
                      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => openEstimateModal(service.name)}
                          className="w-full py-2 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[38px]"
                          title="Calculate instant estimate for this service"
                        >
                          <Calculator className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">Estimate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleWhatsAppInquiry(service.name, service.category)}
                          className="w-full py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[38px]"
                        >
                          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">WhatsApp</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigate(`/services/${service.slug}`)}
                          className="w-full py-2 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0D6EFD] border border-blue-200/80 font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer min-h-[38px]"
                        >
                          <span className="truncate">Details</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========================================================================= */}
            {/* SPECIALIZED INVENTORY MODULE: SIM Cards Catalog (When SIM Cards is selected) */}
            {/* ========================================================================= */}
            {selectedCategory === 'SIM Cards' && (
              <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/90 shadow-soft-sm space-y-6 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-[#1E5AA8] shrink-0" />
                      <span>Live SIM Cards Stock & Network Inventory</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Official TRCSL Authorized SIM activations for Dialog, Mobitel, Hutch, and Airtel</p>
                  </div>

                  {/* Network Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full min-w-0">
                    {['All', 'Dialog', 'Mobitel', 'Hutch', 'Airtel'].map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                          selectedNetwork === net
                            ? 'bg-[#1E5AA8] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>

                {activeSims.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl w-full">
                    <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No SIM cards matching the current filter.</p>
                    <p className="text-xs text-slate-400 mt-1">Contact us on WhatsApp for real-time SIM inventory availability.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {activeSims.map(sim => (
                      <div 
                        key={sim.id} 
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-soft-sm transition-all flex flex-col justify-between w-full min-w-0"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                              sim.network === 'Dialog' ? 'bg-red-50 text-red-700 border border-red-200' :
                              sim.network === 'Mobitel' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              sim.network === 'Hutch' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {sim.network}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              sim.status === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {sim.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm break-words">{sim.simNumber}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{sim.package || 'Standard Prepaid SIM'}</p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-sm font-bold text-[#1E5AA8]">Rs. {sim.sellingPrice}</span>
                          <button
                            onClick={() => handleWhatsAppInquiry(`SIM Number: ${sim.simNumber} (${sim.network})`, 'SIM Cards')}
                            className="px-3 py-1.5 rounded-lg bg-[#16B95A] hover:bg-[#129a4a] text-white font-bold text-xs flex items-center gap-1 cursor-pointer min-h-[36px]"
                          >
                            <MessageCircle className="w-3 h-3 shrink-0" />
                            <span>Reserve</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* SPECIALIZED INVENTORY MODULE: Mobile & Broadband Packages (When Packages is selected) */}
            {/* ========================================================================= */}
            {selectedCategory === 'Packages' && (
              <div className="mt-12 bg-white rounded-2xl p-5 sm:p-6 md:p-8 border border-slate-200/90 shadow-soft-sm space-y-6 w-full min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
                  <div className="min-w-0">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#1E5AA8] shrink-0" />
                      <span>Mobile & Broadband Package Reloads</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Instant reload activation for Dialog, Mobitel, Hutch, and Airtel packages</p>
                  </div>

                  {/* Network Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full min-w-0">
                    {['All', 'Dialog', 'Mobitel', 'Hutch', 'Airtel'].map(net => (
                      <button
                        key={net}
                        onClick={() => setSelectedNetwork(net)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                          selectedNetwork === net
                            ? 'bg-[#1E5AA8] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {net}
                      </button>
                    ))}
                  </div>
                </div>

                {activePackages.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-xl w-full">
                    <Package className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-600">No packages found for the selected filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {activePackages.map(pkg => (
                      <div 
                        key={pkg.id} 
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-soft-sm transition-all flex flex-col justify-between w-full min-w-0"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                              pkg.network === 'Dialog' ? 'bg-red-50 text-red-700 border border-red-200' :
                              pkg.network === 'Mobitel' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                              pkg.network === 'Hutch' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {pkg.network}
                            </span>
                            {pkg.badge && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                {pkg.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm break-words">{pkg.name}</h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                          {pkg.quota && (
                            <div className="mt-2 text-xs font-semibold text-[#1E5AA8] bg-blue-50 px-2 py-0.5 rounded inline-block">
                              Quota: {pkg.quota} • {pkg.validity || '30 Days'}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-base font-extrabold text-[#1E5AA8]">Rs. {pkg.price}</span>
                          <button
                            onClick={() => handleWhatsAppInquiry(`Package Reload: ${pkg.name} - Rs. ${pkg.price} (${pkg.network})`, 'Packages')}
                            className="px-3 py-1.5 rounded-lg bg-[#16B95A] hover:bg-[#129a4a] text-white font-bold text-xs flex items-center gap-1 cursor-pointer min-h-[36px]"
                          >
                            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Reload via WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
