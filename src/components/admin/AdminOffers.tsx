import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OfferItem } from '../../types';
import { 
  Tag, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Star, 
  Share2, 
  ExternalLink, 
  Check, 
  X, 
  Copy, 
  Clock, 
  Flame, 
  Sparkles,
  Percent,
  DollarSign,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  Database,
  Code
} from 'lucide-react';
import { 
  shareToWhatsApp, 
  shareToFacebook, 
  copyOfferShareLink, 
  getOfferShareUrl, 
  claimOfferOnWhatsApp 
} from '../../utils/share';
import { SUPABASE_OFFERS_SQL_MIGRATION } from '../../data/supabaseSqlScript';

const CATEGORY_OPTIONS = [
  'General',
  'Photocopy',
  'Printing & Lamination',
  'Graphic Design & CV',
  'SIM Cards',
  'Mobile Packages',
  'Tech Services'
];

const PRESET_BADGES = [
  'Special Deal',
  '50% OFF',
  'Combo Deal',
  'Hot Deal',
  'Student Special',
  'Limited Time',
  'Best Seller',
  'Eid Offer',
  'New Arrival'
];

export const AdminOffers: React.FC = () => {
  const { offers, addOffer, updateOffer, deleteOffer, showToast, settings, navigate } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'featured'>('all');
  const [showSqlHelper, setShowSqlHelper] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleCopySql = () => {
    try {
      navigator.clipboard.writeText(SUPABASE_OFFERS_SQL_MIGRATION);
      setCopiedSql(true);
      showToast('Special Offers SQL script copied to clipboard! Paste in Supabase SQL Editor.', 'success');
      setTimeout(() => setCopiedSql(false), 3000);
    } catch {
      showToast('Failed to copy SQL. Please copy manually from Settings > Database.', 'error');
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<OfferItem | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<OfferItem, 'id'>>({
    title: '',
    badge: 'Special Deal',
    shortDescription: '',
    description: '',
    imageUrl: '',
    originalPrice: undefined,
    offerPrice: undefined,
    discountPercentage: undefined,
    currency: 'LKR',
    validUntil: 'Limited Time',
    category: 'General',
    features: ['Instant Service Delivery', 'Premium Quality Guaranteed'],
    terms: ['Valid while promotional stocks last', 'Offer subject to terms'],
    featured: false,
    active: true,
    status: 'Active',
    isPublished: true,
    sortOrder: 0,
    ctaText: 'Claim on WhatsApp'
  });

  const [newFeatureText, setNewFeatureText] = useState('');
  const [newTermText, setNewTermText] = useState('');

  // Filtered offers list
  const filteredOffers = useMemo(() => {
    return (offers || []).filter(offer => {
      // Status filter
      if (filterStatus === 'active' && !offer.active) return false;
      if (filterStatus === 'inactive' && offer.active) return false;
      if (filterStatus === 'featured' && !offer.featured) return false;

      // Category filter
      if (filterCategory !== 'all' && offer.category !== filterCategory) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = offer.title?.toLowerCase().includes(q);
        const matchDesc = offer.description?.toLowerCase().includes(q) || offer.shortDescription?.toLowerCase().includes(q);
        const matchBadge = offer.badge?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchBadge;
      }

      return true;
    }).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [offers, filterStatus, filterCategory, searchQuery]);

  // Open modal for new offer
  const handleOpenNew = () => {
    setEditingOffer(null);
    setFormData({
      title: '',
      badge: 'Special Deal',
      shortDescription: '',
      description: '',
      imageUrl: '',
      originalPrice: undefined,
      offerPrice: undefined,
      discountPercentage: undefined,
      currency: 'LKR',
      validUntil: 'Limited Time',
      category: 'General',
      features: ['Instant Delivery', 'Premium Quality Guaranteed'],
      terms: ['Valid while promotional stocks last'],
      featured: false,
      active: true,
      status: 'Active',
      isPublished: true,
      sortOrder: (offers?.length || 0) + 1,
      ctaText: 'Claim on WhatsApp'
    });
    setIsModalOpen(true);
  };

  // Open modal for editing existing offer
  const handleOpenEdit = (offer: OfferItem) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title || '',
      badge: offer.badge || 'Special Deal',
      shortDescription: offer.shortDescription || '',
      description: offer.description || '',
      imageUrl: offer.imageUrl || offer.image || '',
      originalPrice: offer.originalPrice,
      offerPrice: offer.offerPrice,
      discountPercentage: offer.discountPercentage,
      currency: offer.currency || 'LKR',
      validUntil: offer.validUntil || 'Limited Time',
      category: offer.category || 'General',
      features: offer.features ? [...offer.features] : [],
      terms: offer.terms ? [...offer.terms] : [],
      featured: offer.featured || false,
      active: offer.active !== false,
      status: offer.status || 'Active',
      isPublished: offer.isPublished !== false,
      sortOrder: offer.sortOrder || 0,
      ctaText: offer.ctaText || 'Claim on WhatsApp'
    });
    setIsModalOpen(true);
  };

  // Calculate discount percentage automatically when prices change
  const handleOriginalPriceChange = (val: number | undefined) => {
    setFormData(prev => {
      let discount = prev.discountPercentage;
      if (val && prev.offerPrice && val > prev.offerPrice) {
        discount = Math.round(((val - prev.offerPrice) / val) * 100);
      }
      return { ...prev, originalPrice: val, discountPercentage: discount };
    });
  };

  const handleOfferPriceChange = (val: number | undefined) => {
    setFormData(prev => {
      let discount = prev.discountPercentage;
      if (prev.originalPrice && val && prev.originalPrice > val) {
        discount = Math.round(((prev.originalPrice - val) / prev.originalPrice) * 100);
      }
      return { ...prev, offerPrice: val, discountPercentage: discount };
    });
  };

  const handleAddFeature = () => {
    if (!newFeatureText.trim()) return;
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeatureText.trim()]
    }));
    setNewFeatureText('');
  };

  const handleRemoveFeature = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== idx)
    }));
  };

  const handleAddTerm = () => {
    if (!newTermText.trim()) return;
    setFormData(prev => ({
      ...prev,
      terms: [...(prev.terms || []), newTermText.trim()]
    }));
    setNewTermText('');
  };

  const handleRemoveTerm = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      terms: (prev.terms || []).filter((_, i) => i !== idx)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Offer Title is required', 'error');
      return;
    }

    try {
      if (editingOffer) {
        await updateOffer(editingOffer.id, formData);
      } else {
        await addOffer(formData);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(`Failed to save offer: ${err?.message || 'Error'}`, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    try {
      await deleteOffer(offerToDelete.id);
      setIsDeleteModalOpen(false);
      setOfferToDelete(null);
    } catch (err: any) {
      showToast('Failed to delete offer', 'error');
    }
  };

  const handleToggleActive = async (offer: OfferItem) => {
    const updatedStatus = !offer.active;
    await updateOffer(offer.id, {
      active: updatedStatus,
      status: updatedStatus ? 'Active' : 'Inactive',
      isPublished: updatedStatus
    });
  };

  const handleToggleFeatured = async (offer: OfferItem) => {
    const updated = !offer.featured;
    await updateOffer(offer.id, { featured: updated });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      
      {/* 1. Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Special Offers & Promotions</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Create and manage customer deals, combo bundles, and social-sharable discount packages.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopySql}
            className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Copy PostgreSQL SQL migration for the offers table"
          >
            {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Database className="w-3.5 h-3.5 text-amber-600" />}
            <span>{copiedSql ? 'SQL Copied!' : 'Copy Offers SQL'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSqlHelper(!showSqlHelper)}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Toggle database migration instructions"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{showSqlHelper ? 'Hide SQL Help' : 'SQL Guide'}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/offers')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
            title="Open Public Offers Page"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Page</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 rounded-xl bg-[#062B5C] hover:bg-[#083b7e] text-white font-bold text-xs flex items-center gap-2 shadow-soft-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Offer</span>
          </button>
        </div>
      </div>

      {/* SQL Migration Helper Banner */}
      {showSqlHelper && (
        <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border border-amber-200/80 rounded-2xl p-5 shadow-soft-sm space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Database className="w-4 h-4 text-amber-600" />
              <span>Supabase "public.offers" Table Migration Guide</span>
            </div>
            <button
              onClick={() => setShowSqlHelper(false)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            If you see <code className="bg-amber-100/80 px-1 py-0.5 rounded text-amber-900 font-mono text-[11px]">Could not find the table 'public.offers' in the schema cache (PGRST205)</code>, your Supabase project was initialized before the offers table was added. Click <strong>Copy Offers SQL</strong> below and paste it into your <strong>Supabase Dashboard &gt; SQL Editor</strong> to enable instant cloud syncing and real-time updates.
          </p>
          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <button
              type="button"
              onClick={handleCopySql}
              className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied to Clipboard!' : 'Copy Standalone Offers Migration SQL'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/settings')}
              className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Go to Admin Settings &gt; Database</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-soft-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search offers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#1E5AA8] focus:bg-white"
          />
        </div>

        {/* Category & Status Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {/* Status buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'}`}
            >
              All ({offers?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'active' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Active
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('featured')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'featured' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Featured
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1 rounded-lg transition-all ${filterStatus === 'inactive' ? 'bg-white text-slate-500 shadow-xs font-bold' : 'text-slate-600'}`}
            >
              Inactive
            </button>
          </div>
        </div>
      </div>

      {/* 3. Offers List Cards / Table */}
      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-soft-sm">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Tag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">No Offers Found</h3>
          <p className="text-xs text-slate-500 mb-4">
            {searchQuery || filterStatus !== 'all'
              ? 'No promotions match your current filters. Try changing filter criteria.'
              : 'You have not added any promotional offers yet. Click below to add your first deal!'}
          </p>
          <button
            type="button"
            onClick={handleOpenNew}
            className="px-4 py-2 bg-[#062B5C] text-white rounded-xl text-xs font-bold hover:bg-[#083b7e] transition-colors"
          >
            Create Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => {
            const displayImage = offer.imageUrl || offer.image;
            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between shadow-soft-sm hover:shadow-soft-md ${
                  offer.featured ? 'border-amber-400 ring-1 ring-amber-400/30' : 'border-slate-200'
                } ${!offer.active ? 'opacity-70 bg-slate-50/60' : ''}`}
              >
                {/* Top Banner Image */}
                <div className="relative h-40 bg-gradient-to-r from-slate-900 to-[#062B5C] rounded-t-2xl overflow-hidden">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={offer.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                      <Tag className="w-8 h-8 text-amber-400 mb-1" />
                      <span className="text-xs text-white font-bold">{offer.category || 'Special Deal'}</span>
                    </div>
                  )}

                  {/* Overlays */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-400 text-slate-950 shadow-xs">
                      {offer.badge || 'Offer'}
                    </span>
                    {offer.discountPercentage && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white shadow-xs">
                        {offer.discountPercentage}% OFF
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(offer)}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                        offer.featured ? 'bg-amber-400 text-slate-900' : 'bg-black/40 text-white/80 hover:text-white'
                      }`}
                      title={offer.featured ? 'Featured Offer' : 'Click to Feature on Top'}
                    >
                      <Star className={`w-3.5 h-3.5 ${offer.featured ? 'fill-slate-900' : ''}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleActive(offer)}
                      className={`p-1.5 rounded-lg backdrop-blur-md transition-colors ${
                        offer.active ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                      }`}
                      title={offer.active ? 'Active on Public Site' : 'Inactive (Hidden)'}
                    >
                      {offer.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-400 mb-1">
                      <span className="uppercase text-[#1E5AA8] bg-blue-50 px-2 py-0.5 rounded">
                        {offer.category || 'General'}
                      </span>
                      {offer.validUntil && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-3 h-3 text-amber-500" />
                          {offer.validUntil}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                      {offer.title}
                    </h3>

                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">
                      {offer.shortDescription || offer.description}
                    </p>
                  </div>

                  {/* Pricing & Control Toolbar */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-[#062B5C]">
                          {offer.currency || 'LKR'} {offer.offerPrice?.toLocaleString() ?? 'Free/Package'}
                        </span>
                        {offer.originalPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            {offer.currency || 'LKR'} {offer.originalPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        offer.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {offer.active ? 'Live on Site' : 'Draft / Paused'}
                      </span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      {/* Social share button */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => shareToWhatsApp(offer, settings.shopName)}
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Share to WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            await copyOfferShareLink(offer.id);
                            showToast('Link copied for sharing!', 'success');
                          }}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors"
                          title="Copy share link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Edit & Delete */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(offer)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#1E5AA8] hover:text-white text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setOfferToDelete(offer);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                          title="Delete Offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Create / Edit Offer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#062B5C] text-white flex items-center justify-center">
                  <Tag className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editingOffer ? 'Edit Special Offer' : 'Create New Special Offer'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    This promotion will appear directly in the public offers section and can be shared.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              
              {/* Offer Title */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Offer Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Professional CV Package — 3 Formats + Free Print"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#1E5AA8] font-semibold text-slate-900 text-xs"
                />
              </div>

              {/* Badge & Category Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Badge / Tag Text</label>
                  <input
                    type="text"
                    placeholder="e.g. 50% OFF, Limited Deal"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#1E5AA8] text-xs font-medium"
                  />
                  {/* Preset badge chips */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {PRESET_BADGES.slice(0, 4).map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setFormData({ ...formData, badge: b })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-amber-100 text-slate-700 font-semibold transition-colors"
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#1E5AA8] text-xs font-medium"
                  >
                    {CATEGORY_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Short & Full Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Short Description (for cards & social share)</label>
                <input
                  type="text"
                  placeholder="e.g., Get modern ATS-friendly CV design in English & Tamil with 2 free revisions."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#1E5AA8] text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Offer Details</label>
                <textarea
                  rows={3}
                  placeholder="Detailed description of what is included, special benefits, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-[#1E5AA8] text-xs leading-relaxed"
                />
              </div>

              {/* Pricing Grid */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Pricing & Discount</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-500 font-semibold block mb-1">Original Price (LKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      value={formData.originalPrice ?? ''}
                      onChange={(e) => handleOriginalPriceChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[#062B5C] font-bold block mb-1">Offer Price (LKR) *</label>
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={formData.offerPrice ?? ''}
                      onChange={(e) => handleOfferPriceChange(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-full p-2 bg-white border border-[#1E5AA8] rounded-lg text-xs font-bold text-[#062B5C]"
                    />
                  </div>

                  <div>
                    <label className="text-emerald-700 font-semibold block mb-1">Discount (% OFF)</label>
                    <input
                      type="number"
                      placeholder="Auto or e.g. 33"
                      value={formData.discountPercentage ?? ''}
                      onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Image URL & Validity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Image URL (Banner/Artwork)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Validity (End Date / Stock Notice)</label>
                  <input
                    type="text"
                    placeholder="e.g. Valid until 30 April 2026 or Limited Stock"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white text-xs font-medium"
                  />
                </div>
              </div>

              {/* Features / Highlights List */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Included Perks & Highlights</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a perk (e.g. Free 1x Passport Photo print)..."
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-[#062B5C] text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {(formData.features || []).map((feat, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-700 text-xs font-medium">{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(idx)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions List */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">Terms & Conditions (Optional)</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add a condition (e.g. 1 redemption per customer)..."
                    value={newTermText}
                    onChange={(e) => setNewTermText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTerm(); } }}
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTerm}
                    className="px-3 py-2 bg-slate-700 text-white rounded-lg font-bold text-xs shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="space-y-1 pt-1">
                  {(formData.terms || []).map((term, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                      <span className="text-slate-600 text-xs">{term}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTerm(idx)}
                        className="text-red-500 hover:text-red-700 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      active: e.target.checked, 
                      status: e.target.checked ? 'Active' : 'Inactive',
                      isPublished: e.target.checked
                    })}
                    className="w-4 h-4 rounded text-[#1E5AA8] focus:ring-0"
                  />
                  <span>Publish Offer (Active on Public Site)</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-amber-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <span>Feature on Top</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#062B5C] hover:bg-[#083b7e] text-white font-bold rounded-xl shadow-soft-sm transition-colors cursor-pointer"
                >
                  {editingOffer ? 'Save Changes' : 'Publish Offer'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {isDeleteModalOpen && offerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900">Delete Special Offer?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete <strong className="text-slate-800 font-semibold">{offerToDelete.title}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setOfferToDelete(null);
                }}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
