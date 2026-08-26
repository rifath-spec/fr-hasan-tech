import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Copy, Printer, Smartphone, Package, ArrowRight, Search, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const ServicesListPage: React.FC = () => {
  const { navigate, services, settings } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filtered = services.filter(s => {
    if (!s.isPublished) return false;
    const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.availableServicesList.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getServiceIcon = (category: string) => {
    switch (category) {
      case 'Photocopy':
        return <Copy className="w-8 h-8 text-[#1E5AA8]" />;
      case 'Printing':
        return <Printer className="w-8 h-8 text-[#1E5AA8]" />;
      case 'SIM Cards':
        return <Smartphone className="w-8 h-8 text-[#1E5AA8]" />;
      case 'Packages':
        return <Package className="w-8 h-8 text-[#1E5AA8]" />;
      default:
        return <FileText className="w-8 h-8 text-[#1E5AA8]" />;
    }
  };

  return (
    <div className="w-full bg-[#F8FAFC] py-8 sm:py-12">
      <div className="w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1A202C] tracking-tight">
            Our Services Catalog
          </h1>
          <p className="text-base sm:text-lg text-[#64748B] mt-3 leading-relaxed">
            Explore high-speed photocopying, premium digital & photo printing, official SIM activations, and mobile package reloads.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bento-card p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {['All', 'Photocopy', 'Printing', 'SIM Cards', 'Packages'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap min-h-[38px] ${
                  filterCategory === cat
                    ? 'bg-[#1E5AA8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services, formats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-[#1E5AA8] outline-none transition-colors"
            />
          </div>
        </div>

        {/* Services Cards Bento Grid in One Row */}
        {filtered.length === 0 ? (
          <div className="bento-card p-12 text-center">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Services Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your category filter or search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 xl:gap-7">
            {filtered.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/services/${service.slug}`)}
                className="bento-card cursor-pointer flex flex-col justify-between overflow-hidden bg-white border border-slate-200/90 shadow-soft-sm hover:shadow-soft-md rounded-2xl"
              >
                <div>
                  {service.image && (
                    <div className="h-44 w-full relative overflow-hidden bg-slate-900">
                      <img
                        src={service.image}
                        alt={service.name}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#1E5AA8] font-bold text-[11px] shadow-xs">
                          {service.category}
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#1E5AA8] shadow-xs">
                          {getServiceIcon(service.category)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {!service.image && (
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-[#E8F0FE] flex items-center justify-center shrink-0">
                          {getServiceIcon(service.category)}
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E5AA8] font-bold text-xs border border-blue-100">
                          {service.category}
                        </span>
                      </div>
                    )}

                    <h2 className="text-lg font-bold text-slate-900">
                      {service.name}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                      {service.shortDescription || service.fullDescription}
                    </p>

                    {/* Highlights list */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5">
                      {service.availableServicesList.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                          <span className="truncate">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-[#1E5AA8] truncate">
                    {service.priceInfo}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#1E5AA8] shrink-0 hover:text-[#164785]">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
