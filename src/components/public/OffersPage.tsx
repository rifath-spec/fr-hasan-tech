import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { OfferItem } from '../../types';
import { 
  Tag, 
  Share2, 
  Check, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  Clock, 
  Percent, 
  ArrowRight, 
  MessageCircle, 
  Filter, 
  Search,
  X,
  ChevronRight,
  ShieldCheck,
  Flame,
  Award,
  Calendar
} from 'lucide-react';
import { 
  shareToWhatsApp, 
  shareToFacebook, 
  shareToTwitter, 
  shareToTelegram, 
  shareViaWebShare, 
  copyOfferShareLink, 
  claimOfferOnWhatsApp,
  getOfferShareUrl 
} from '../../utils/share';

export const OffersPage: React.FC = () => {
  const { offers, settings, showToast, navigate, currentPath } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOfferForModal, setSelectedOfferForModal] = useState<OfferItem | null>(null);
  const [shareDrawerOffer, setShareDrawerOffer] = useState<OfferItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Check URL query param for ?id=offerId to auto-open offer modal or highlight
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const offerId = params.get('id');
        if (offerId && offers && offers.length > 0) {
          const match = offers.find(o => o.id === offerId);
          if (match) {
            setSelectedOfferForModal(match);
          }
        }
      }
    } catch {
      // safe fallback
    }
  }, [offers, currentPath]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    (offers || []).forEach(o => {
      if (o.category) set.add(o.category);
    });
    return ['all', ...Array.from(set)];
  }, [offers]);

  // Filtered offers (only published & active)
  const filteredOffers = useMemo(() => {
    return (offers || []).filter(offer => {
      if (offer.active === false || offer.isPublished === false) return false;

      // Category filter
      if (selectedCategory !== 'all' && offer.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = offer.title?.toLowerCase().includes(q);
        const matchDesc = offer.description?.toLowerCase().includes(q) || offer.shortDescription?.toLowerCase().includes(q);
        const matchBadge = offer.badge?.toLowerCase().includes(q);
        const matchCategory = offer.category?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchBadge || matchCategory;
      }

      return true;
    }).sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  }, [offers, selectedCategory, searchQuery]);

  const handleCopyLink = async (offer: OfferItem) => {
    const success = await copyOfferShareLink(offer.id);
    if (success) {
      setCopiedId(offer.id);
      showToast('Offer link copied to clipboard!', 'success');
      setTimeout(() => setCopiedId(null), 2500);
    } else {
      showToast('Could not copy link', 'error');
    }
  };

  const handleNativeShare = async (offer: OfferItem) => {
    const shared = await shareViaWebShare(offer, settings.shopName);
    if (!shared) {
      // Fallback to custom share modal
      setShareDrawerOffer(offer);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* 1. Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#062B5C] via-[#0D47A1] to-[#1E5AA8] text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-blue-900/40">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-4 shadow-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>Exclusive Deals & Special Offers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Save Big at {settings.shopName || 'FR.HASAN TECH'}
          </h1>
          
          <p className="text-base sm:text-lg text-blue-100/90 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Discover limited-time promotions, combo bundles, student discounts, and exclusive tech package offers. Claim directly via WhatsApp or share with friends!
          </p>

          {/* Search bar & quick stats */}
          <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-lg flex items-center gap-2">
            <div className="pl-3 text-blue-200">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers (e.g. CV Design, SIM, Wedding Card)..."
              className="w-full bg-transparent border-none text-white placeholder-blue-200/70 text-sm focus:outline-none px-2 py-1.5"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-blue-200 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Filter Tabs & Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Category Pills Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none mb-8">
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
            <div className="px-2.5 py-1.5 text-slate-400 flex items-center gap-1 text-xs font-semibold">
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filter:</span>
            </div>
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    active
                      ? 'bg-[#062B5C] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat === 'all' ? 'All Offers' : cat}
                </button>
              );
            })}
          </div>

          <div className="ml-auto text-xs text-slate-500 font-medium whitespace-nowrap pl-2">
            Showing <strong className="text-slate-800">{filteredOffers.length}</strong> {filteredOffers.length === 1 ? 'deal' : 'deals'}
          </div>
        </div>

        {/* Offers Grid */}
        {filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-100">
              <Tag className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Offers Found</h3>
            <p className="text-sm text-slate-500 mb-6">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try resetting the search keywords or selecting another category to see all deals.'
                : 'Stay tuned! Exciting new special offers and packages are coming soon.'}
            </p>
            {(searchQuery || selectedCategory !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-4 py-2 bg-[#062B5C] text-white rounded-xl text-xs font-bold hover:bg-[#083b7e] transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOffers.map((offer) => {
              const displayImage = offer.imageUrl || offer.image;
              const hasDiscount = offer.originalPrice && offer.offerPrice && offer.originalPrice > offer.offerPrice;

              return (
                <div
                  key={offer.id}
                  id={`offer-card-${offer.id}`}
                  className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden shadow-soft-sm hover:shadow-soft-md ${
                    offer.featured ? 'border-amber-400/80 ring-1 ring-amber-400/40' : 'border-slate-200/90'
                  }`}
                >
                  {/* Card Banner Image / Visual Header */}
                  <div className="relative h-48 bg-gradient-to-tr from-slate-900 via-[#062B5C] to-slate-800 overflow-hidden group">
                    {displayImage ? (
                      <img
                        src={displayImage}
                        alt={offer.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#062B5C] to-[#1E5AA8]">
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-amber-300 mb-2 border border-white/20">
                          <Tag className="w-6 h-6" />
                        </div>
                        <span className="text-white font-bold text-sm tracking-tight line-clamp-1">{offer.category || 'Special Deal'}</span>
                      </div>
                    )}

                    {/* Top Badges Overlay */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {offer.badge && (
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md flex items-center gap-1">
                            <Flame className="w-3 h-3 fill-slate-950" />
                            {offer.badge}
                          </span>
                        )}
                        {offer.featured && (
                          <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-[#062B5C]/90 text-white backdrop-blur-md border border-white/20 shadow-md">
                            Featured
                          </span>
                        )}
                      </div>

                      {offer.discountPercentage && (
                        <span className="px-2 py-1 rounded-lg text-xs font-extrabold bg-emerald-500 text-white shadow-md">
                          {offer.discountPercentage}% OFF
                        </span>
                      )}
                    </div>

                    {/* Validity pill at bottom of image */}
                    {offer.validUntil && (
                      <div className="absolute bottom-2.5 left-3 bg-slate-950/75 backdrop-blur-md text-slate-200 text-[11px] font-medium px-2.5 py-0.5 rounded-md flex items-center gap-1.5 border border-white/10">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>{offer.validUntil}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Category & Title */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[#1E5AA8] bg-blue-50 px-2 py-0.5 rounded-md">
                          {offer.category || 'General'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShareDrawerOffer(offer)}
                          className="p-1.5 text-slate-400 hover:text-[#062B5C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Share offer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>

                      <h2 
                        onClick={() => setSelectedOfferForModal(offer)}
                        className="text-lg font-bold text-slate-900 leading-snug hover:text-[#1E5AA8] transition-colors cursor-pointer line-clamp-2"
                      >
                        {offer.title}
                      </h2>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-2">
                        {offer.shortDescription || offer.description}
                      </p>

                      {/* Feature Highlights */}
                      {offer.features && offer.features.length > 0 && (
                        <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100">
                          {offer.features.slice(0, 3).map((feat, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{feat}</span>
                            </div>
                          ))}
                          {offer.features.length > 3 && (
                            <button
                              type="button"
                              onClick={() => setSelectedOfferForModal(offer)}
                              className="text-[11px] text-[#1E5AA8] font-bold hover:underline block pt-0.5"
                            >
                              +{offer.features.length - 3} more perks...
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price Section & CTA Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      {/* Price display */}
                      <div className="flex items-baseline justify-between gap-2">
                        <div>
                          {offer.offerPrice !== undefined && offer.offerPrice !== null ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-xl font-extrabold text-[#062B5C]">
                                {offer.currency || 'LKR'} {offer.offerPrice.toLocaleString()}
                              </span>
                              {hasDiscount && (
                                <span className="text-xs text-slate-400 line-through">
                                  {offer.currency || 'LKR'} {offer.originalPrice?.toLocaleString()}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-base font-bold text-emerald-600">
                              Special Package
                            </span>
                          )}
                        </div>

                        {hasDiscount && (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Save {offer.currency || 'LKR'} {((offer.originalPrice || 0) - (offer.offerPrice || 0)).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Primary WhatsApp CTA & Action Row */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => claimOfferOnWhatsApp(offer, settings.whatsappNumber, settings.shopName)}
                          className="flex-1 py-2.5 px-3 bg-[#16B95A] hover:bg-[#12A94F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-[0.98]"
                        >
                          <MessageCircle className="w-4 h-4 fill-white" />
                          <span>{offer.ctaText || 'Claim Deal'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNativeShare(offer)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="Share this deal on Social Media"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(offer)}
                          className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                          title="Copy offer link"
                        >
                          {copiedId === offer.id ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 3. Offer Details Modal */}
      {selectedOfferForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="relative h-48 bg-[#062B5C] text-white shrink-0">
              {(selectedOfferForModal.imageUrl || selectedOfferForModal.image) ? (
                <img
                  src={selectedOfferForModal.imageUrl || selectedOfferForModal.image}
                  alt={selectedOfferForModal.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#062B5C] to-[#1E5AA8]">
                  <Tag className="w-12 h-12 text-amber-300 opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              
              <button
                type="button"
                onClick={() => setSelectedOfferForModal(null)}
                className="absolute top-3 right-3 p-2 bg-slate-900/60 text-white rounded-full hover:bg-slate-900 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-3 left-4 right-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
                    {selectedOfferForModal.badge || 'Special Promo'}
                  </span>
                  <span className="text-[11px] text-slate-200 bg-white/20 backdrop-blur-xs px-2 py-0.5 rounded">
                    {selectedOfferForModal.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  {selectedOfferForModal.title}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Pricing breakdown */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div>
                  <span className="text-xs text-slate-500 block">Offer Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#062B5C]">
                      {selectedOfferForModal.currency || 'LKR'} {selectedOfferForModal.offerPrice?.toLocaleString()}
                    </span>
                    {selectedOfferForModal.originalPrice && selectedOfferForModal.originalPrice > (selectedOfferForModal.offerPrice || 0) && (
                      <span className="text-xs text-slate-400 line-through">
                        {selectedOfferForModal.currency || 'LKR'} {selectedOfferForModal.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>

                {selectedOfferForModal.validUntil && (
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Validity</span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      {selectedOfferForModal.validUntil}
                    </span>
                  </div>
                )}
              </div>

              {/* Full Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {selectedOfferForModal.description || selectedOfferForModal.shortDescription}
                </p>
              </div>

              {/* Features List */}
              {selectedOfferForModal.features && selectedOfferForModal.features.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">What is Included</h4>
                  <div className="space-y-2">
                    {selectedOfferForModal.features.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              {selectedOfferForModal.terms && selectedOfferForModal.terms.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Terms & Conditions</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs text-slate-500">
                    {selectedOfferForModal.terms.map((term, idx) => (
                      <li key={idx}>{term}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShareDrawerOffer(selectedOfferForModal);
                  setSelectedOfferForModal(null);
                }}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  claimOfferOnWhatsApp(selectedOfferForModal, settings.whatsappNumber, settings.shopName);
                  setSelectedOfferForModal(null);
                }}
                className="flex-1 py-2.5 px-4 bg-[#16B95A] hover:bg-[#12A94F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-soft-sm transition-colors cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Claim on WhatsApp</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. Social Media Sharing Drawer / Dialog */}
      {shareDrawerOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Share This Deal</h3>
              </div>
              <button
                type="button"
                onClick={() => setShareDrawerOffer(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Offer mini-preview */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
              {(shareDrawerOffer.imageUrl || shareDrawerOffer.image) ? (
                <img
                  src={shareDrawerOffer.imageUrl || shareDrawerOffer.image}
                  alt={shareDrawerOffer.title}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-[#062B5C] text-amber-300 flex items-center justify-center shrink-0">
                  <Tag className="w-5 h-5" />
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-xs font-bold text-slate-800 truncate">{shareDrawerOffer.title}</h4>
                <p className="text-[11px] text-emerald-600 font-semibold">
                  {shareDrawerOffer.currency || 'LKR'} {shareDrawerOffer.offerPrice?.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Social Share Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => {
                  shareToWhatsApp(shareDrawerOffer, settings.shopName);
                  setShareDrawerOffer(null);
                }}
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#16B95A] text-white flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 fill-white" />
                </div>
                <span>WhatsApp</span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => {
                  shareToFacebook(shareDrawerOffer);
                  setShareDrawerOffer(null);
                }}
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/70 text-blue-800 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#1877F2] text-white flex items-center justify-center font-bold">
                  f
                </div>
                <span>Facebook</span>
              </button>

              {/* Twitter / X */}
              <button
                type="button"
                onClick={() => {
                  shareToTwitter(shareDrawerOffer);
                  setShareDrawerOffer(null);
                }}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs">
                  𝕏
                </div>
                <span>Twitter / X</span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => {
                  shareToTelegram(shareDrawerOffer, settings.shopName);
                  setShareDrawerOffer(null);
                }}
                className="p-3 rounded-xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100/70 text-sky-800 text-xs font-bold flex items-center gap-2.5 transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#229ED9] text-white flex items-center justify-center font-bold text-xs">
                  TG
                </div>
                <span>Telegram</span>
              </button>
            </div>

            {/* Direct Copy Link Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Direct Offer Link</span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={getOfferShareUrl(shareDrawerOffer.id)}
                  className="flex-1 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink(shareDrawerOffer)}
                  className="px-3.5 py-2 bg-[#062B5C] hover:bg-[#083b7e] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {copiedId === shareDrawerOffer.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
