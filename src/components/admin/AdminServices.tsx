import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceItem, ServiceCategory, ServicePackage } from '../../types';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Eye, 
  Copy, 
  Printer, 
  Smartphone, 
  Package, 
  FileText, 
  Layers, 
  Sparkles, 
  Palette, 
  ShieldCheck, 
  Image as ImageIcon, 
  Tag,
  Star,
  DollarSign,
  Globe,
  ListPlus,
  AlertCircle,
  Laptop,
  Award,
  Mail,
  CreditCard,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ConfirmModal } from '../common/ConfirmModal';

const DEFAULT_CATEGORY_PRESETS = [
  'Printing',
  'Visiting Cards',
  'Invitation Card',
  'Certificate Design',
  'CV Creation',
  'Microsoft Office Installation',
  'Windows Installation',
  'Document Printing',
  'Packages',
  'SIM Cards',
  'Photocopy',
  'Lamination',
  'Scanning',
  'Document Binding',
  'Computer Services',
  'Design & Documentation',
  'Printing & Design',
  'Typing & Typesetting',
  'Bill Payments',
  'Passport & ID Photos'
];

export const AdminServices: React.FC = () => {
  const { services, addService, updateService, deleteService, clearServices, settings } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Featured'>('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Form tabs
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'media' | 'content' | 'seo'>('basic');

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('Computer Services');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [sortOrder, setSortOrder] = useState<number>(0);

  // Pricing model: 'single' or 'packages'
  const [pricingModel, setPricingModel] = useState<'single' | 'packages'>('single');
  const [singlePrice, setSinglePrice] = useState<string>('1500');
  const [unit, setUnit] = useState<string>('Service');
  const [priceInfo, setPriceInfo] = useState('');
  const [packages, setPackages] = useState<ServicePackage[]>([]);

  // Media
  const [image, setImage] = useState('');
  const [galleryImagesStr, setGalleryImagesStr] = useState('');

  // Content
  const [shortDescription, setShortDescription] = useState('');
  const [fullDescription, setFullDescription] = useState('');
  const [availableListStr, setAvailableListStr] = useState('');
  const [notesStr, setNotesStr] = useState('');

  // SEO
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywordsStr, setSeoKeywordsStr] = useState('');

  // Collect all unique categories from services + presets
  const dynamicCategories = Array.from(new Set([
    ...DEFAULT_CATEGORY_PRESETS,
    ...services.map(s => s.category).filter(Boolean)
  ]));

  const openAddModal = () => {
    setEditingService(null);
    setActiveTab('basic');
    setName('');
    setSlug('');
    setCategory('Computer Services');
    setIsCustomCategory(false);
    setCustomCategoryName('');
    setIcon('Laptop');
    setStatus('Active');
    setIsPublished(true);
    setFeatured(false);
    setSortOrder(services.length + 1);

    setPricingModel('single');
    setSinglePrice('1500');
    setUnit('System');
    setPriceInfo('Starting from LKR 1,500');
    setPackages([]);

    setImage('');
    setGalleryImagesStr('');
    setShortDescription('');
    setFullDescription('');
    setAvailableListStr('');
    setNotesStr('');

    setSeoTitle('');
    setSeoDescription('');
    setSeoKeywordsStr('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setActiveTab('basic');
    setName(service.name);
    setSlug(service.slug || '');
    setCategory(service.category);
    setIsCustomCategory(!DEFAULT_CATEGORY_PRESETS.includes(service.category));
    setCustomCategoryName(!DEFAULT_CATEGORY_PRESETS.includes(service.category) ? service.category : '');
    setIcon(service.icon || 'FileText');
    setStatus(service.status);
    setIsPublished(service.isPublished);
    setFeatured(service.featured || false);
    setSortOrder(service.sortOrder ?? 0);

    const hasPackages = Array.isArray(service.packages) && service.packages.length > 0;
    setPricingModel(hasPackages ? 'packages' : 'single');
    setSinglePrice(service.singlePrice !== undefined ? String(service.singlePrice) : '');
    setUnit(service.unit || '');
    setPriceInfo(service.priceInfo || '');
    setPackages(hasPackages ? JSON.parse(JSON.stringify(service.packages)) : []);

    setImage(service.image || service.imageUrl || '');
    setGalleryImagesStr((service.galleryImages || []).join('\n'));
    setShortDescription(service.shortDescription || '');
    setFullDescription(service.fullDescription || service.description || '');
    setAvailableListStr((service.availableServicesList || []).join('\n'));
    setNotesStr((service.importantNotes || []).join('\n'));

    setSeoTitle(service.seoTitle || '');
    setSeoDescription(service.seoDescription || '');
    setSeoKeywordsStr((service.seoKeywords || []).join(', '));
    setIsModalOpen(true);
  };

  // Helper to add new package row in modal
  const handleAddPackage = () => {
    setPackages(prev => [
      ...prev,
      {
        id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: prev.length === 0 ? 'Plus' : prev.length === 1 ? 'Premium' : prev.length === 2 ? 'Pro' : `Tier ${prev.length + 1}`,
        price: 500,
        currency: 'LKR',
        description: '',
        active: true,
      }
    ]);
  };

  const handleUpdatePackage = (index: number, field: keyof ServicePackage, value: any) => {
    setPackages(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemovePackage = (index: number) => {
    setPackages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = (isCustomCategory && customCategoryName.trim()) 
      ? customCategoryName.trim() 
      : category;

    const availableServicesList = availableListStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const importantNotes = notesStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const galleryImages = galleryImagesStr
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const seoKeywords = seoKeywordsStr
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const generatedSlug = (slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    // Compute formatted price info
    let finalPriceInfo = priceInfo.trim();
    let numSinglePrice = singlePrice ? Number(singlePrice) : undefined;

    if (pricingModel === 'packages' && packages.length > 0) {
      const minPrice = Math.min(...packages.map(p => p.price));
      if (!finalPriceInfo || finalPriceInfo.startsWith('From LKR') || finalPriceInfo.startsWith('LKR')) {
        finalPriceInfo = `From LKR ${minPrice.toLocaleString()}`;
      }
    } else if (pricingModel === 'single' && numSinglePrice) {
      if (!finalPriceInfo) {
        finalPriceInfo = unit ? `LKR ${numSinglePrice.toLocaleString()} / ${unit}` : `LKR ${numSinglePrice.toLocaleString()}`;
      }
    }

    const resolvedIcon = 
      finalCategory === 'Photocopy' ? 'Copy' :
      finalCategory === 'Printing' ? 'Printer' :
      finalCategory === 'SIM Cards' ? 'Smartphone' :
      finalCategory === 'Packages' ? 'Package' :
      finalCategory.toLowerCase().includes('computer') ? 'Laptop' :
      finalCategory.toLowerCase().includes('cert') ? 'Award' :
      finalCategory.toLowerCase().includes('card') ? 'CreditCard' :
      finalCategory.toLowerCase().includes('invit') ? 'Mail' :
      finalCategory.toLowerCase().includes('design') ? 'Palette' :
      finalCategory.toLowerCase().includes('laminat') ? 'Sparkles' :
      finalCategory.toLowerCase().includes('bind') ? 'Layers' :
      'FileText';

    const servicePayload: Partial<ServiceItem> = {
      name,
      slug: generatedSlug,
      category: finalCategory,
      icon: resolvedIcon,
      shortDescription,
      fullDescription,
      description: fullDescription,
      priceInfo: finalPriceInfo || 'Custom Quote',
      singlePrice: pricingModel === 'single' ? numSinglePrice : undefined,
      unit: pricingModel === 'single' ? unit : undefined,
      packages: pricingModel === 'packages' ? packages : [],
      image: image.trim() || undefined,
      imageUrl: image.trim() || undefined,
      galleryImages,
      status,
      active: status === 'Active',
      isPublished,
      featured,
      sortOrder: Number(sortOrder) || 0,
      availableServicesList,
      importantNotes,
      seoTitle: seoTitle.trim() || `${name} | ${settings.shopName}`,
      seoDescription: seoDescription.trim() || shortDescription,
      seoKeywords,
    };

    if (editingService) {
      updateService(editingService.id, servicePayload);
    } else {
      addService(servicePayload as any);
    }

    setIsModalOpen(false);
  };

  const filtered = services.filter(s => {
    const matchesCat = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesStatus = 
      statusFilter === 'All' ? true :
      statusFilter === 'Active' ? s.status === 'Active' :
      statusFilter === 'Inactive' ? s.status === 'Inactive' :
      statusFilter === 'Featured' ? !!s.featured : true;

    const matchesQuery = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.priceInfo && s.priceInfo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.packages && s.packages.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())));

    return matchesCat && matchesStatus && matchesQuery;
  }).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const getCategoryBadgeIcon = (cat: string) => {
    const lower = (cat || '').toLowerCase();
    if (lower.includes('computer')) return <Laptop className="w-3.5 h-3.5" />;
    if (lower.includes('photocopy')) return <Copy className="w-3.5 h-3.5" />;
    if (lower.includes('print')) return <Printer className="w-3.5 h-3.5" />;
    if (lower.includes('sim')) return <Smartphone className="w-3.5 h-3.5" />;
    if (lower.includes('package')) return <Package className="w-3.5 h-3.5" />;
    if (lower.includes('card') || lower.includes('visiting')) return <CreditCard className="w-3.5 h-3.5" />;
    if (lower.includes('cert')) return <Award className="w-3.5 h-3.5" />;
    if (lower.includes('invit')) return <Mail className="w-3.5 h-3.5" />;
    if (lower.includes('design')) return <Palette className="w-3.5 h-3.5" />;
    return <FileText className="w-3.5 h-3.5" />;
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-soft-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Services Management</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#1E5AA8] font-bold text-xs border border-blue-100">
              {services.length} Total Services
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Manage database-driven services, single & multi-tier package pricing, SEO metadata, and visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {services.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 shadow-xs flex items-center gap-1.5 active-press transition-colors min-h-[42px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Catalog</span>
            </button>
          )}

          <button
            onClick={openAddModal}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold text-xs sm:text-sm rounded-xl shadow-soft-sm flex items-center justify-center gap-2 active-press transition-colors min-h-[42px]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search service by name, keyword, package or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {(['All', 'Active', 'Inactive', 'Featured'] as const).map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === st 
                    ? 'bg-slate-900 text-white shadow-xs' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {st === 'Featured' ? '⭐ Featured' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1 scrollbar-none">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === 'All'
                ? 'bg-[#1E5AA8] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({services.length})
          </button>
          {dynamicCategories.map(cat => {
            const count = services.filter(s => s.category === cat).length;
            if (count === 0 && categoryFilter !== cat) return null;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  categoryFilter === cat
                    ? 'bg-[#1E5AA8] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getCategoryBadgeIcon(cat)}
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  categoryFilter === cat ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-soft-sm text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {services.length === 0 ? 'No Services in Database' : 'No Matching Services Found'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {services.length === 0 
                ? 'Your service catalog is currently clean. Click below to add a service to the database.'
                : 'Try adjusting your search query or category filters.'}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1E5AA8] hover:bg-[#164785] text-white text-xs font-bold rounded-xl shadow-xs active-press"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Service</span>
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      {filtered.length > 0 && (
        <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-soft-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">Service Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pricing Model</th>
                <th className="py-3.5 px-4">Featured</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((service, idx) => {
                const hasPackages = Array.isArray(service.packages) && service.packages.length > 0;
                return (
                  <tr key={service.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400 font-bold">
                      {service.sortOrder !== undefined ? service.sortOrder : idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        {service.image ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                            <img src={service.image} alt={service.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center font-bold shrink-0 border border-blue-100">
                            {getCategoryBadgeIcon(service.category)}
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{service.name}</span>
                            {service.featured && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 font-normal truncate max-w-sm">
                            {service.shortDescription}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            /{service.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200/60 inline-flex items-center gap-1.5">
                        {getCategoryBadgeIcon(service.category)}
                        <span>{service.category}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {hasPackages ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
                            <Package className="w-3 h-3" />
                            <span>{service.packages?.length} Packages</span>
                          </span>
                          <div className="text-[11px] font-bold text-slate-900 font-mono">
                            {service.priceInfo}
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200">
                            Single Price
                          </span>
                          <div className="text-[11px] font-bold text-slate-900 font-mono">
                            {service.singlePrice ? `LKR ${service.singlePrice.toLocaleString()} ${service.unit ? `/ ${service.unit}` : ''}` : service.priceInfo}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => updateService(service.id, { featured: !service.featured })}
                        className={`p-1.5 rounded-lg border transition-all ${
                          service.featured 
                            ? 'bg-amber-50 border-amber-300 text-amber-600' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-amber-500'
                        }`}
                        title={service.featured ? 'Featured on home' : 'Click to feature on home'}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => updateService(service.id, { 
                          status: service.status === 'Active' ? 'Inactive' : 'Active',
                          active: service.status !== 'Active'
                        })}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                          service.status === 'Active' 
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {service.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(service)}
                          className="p-2 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-[#1E5AA8] transition-colors border border-transparent hover:border-blue-100"
                          title="Edit Service"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors border border-transparent hover:border-rose-100"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Stacked Card View */}
      {filtered.length > 0 && (
        <div className="lg:hidden space-y-3">
          {filtered.map(service => {
            const hasPackages = Array.isArray(service.packages) && service.packages.length > 0;
            return (
              <div key={service.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-soft-sm space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {service.image ? (
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 shadow-xs">
                        <img src={service.image} alt={service.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#1E5AA8] flex items-center justify-center font-bold shrink-0 border border-blue-100">
                        {getCategoryBadgeIcon(service.category)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                        <span>{service.name}</span>
                        {service.featured && <span className="text-[10px] text-amber-600 font-bold">⭐</span>}
                      </h3>
                      <span className="text-[11px] text-slate-500 font-medium">{service.category}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    service.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {service.status}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{service.shortDescription}</p>

                {hasPackages ? (
                  <div className="p-2.5 rounded-xl bg-purple-50/60 border border-purple-100 text-xs">
                    <div className="font-bold text-purple-900 flex items-center justify-between">
                      <span>{service.packages?.length} Tier Packages:</span>
                      <span className="font-mono text-purple-700">{service.priceInfo}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {service.packages?.map((pkg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-white text-purple-800 text-[10px] font-semibold border border-purple-200">
                          {pkg.name}: LKR {pkg.price}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Single Price:</span>
                    <span className="font-bold font-mono text-[#1E5AA8]">{service.priceInfo}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-slate-400">Slug: /{service.slug}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(service)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(service)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comprehensive Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div 
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          <div className="relative bg-white rounded-2xl shadow-soft-2xl max-w-2xl w-full max-h-[92vh] flex flex-col z-10 border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {editingService ? `Edit Service: ${editingService.name}` : 'Create New Service'}
                </h3>
                <p className="text-xs text-slate-500">Database-driven configuration with multi-package pricing and SEO</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-200 px-4 bg-slate-50/40 overflow-x-auto scrollbar-none">
              {[
                { id: 'basic', label: '1. Basic Info', icon: Tag },
                { id: 'pricing', label: '2. Pricing Model', icon: DollarSign },
                { id: 'media', label: '3. Media & Images', icon: ImageIcon },
                { id: 'content', label: '4. Content & Options', icon: ListPlus },
                { id: 'seo', label: '5. SEO & Meta', icon: Globe },
              ].map(t => {
                const TabIcon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id as any)}
                    className={`px-3.5 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                      activeTab === t.id
                        ? 'border-[#1E5AA8] text-[#1E5AA8] bg-white'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Service Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (!editingService) {
                          setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
                        }
                      }}
                      placeholder="e.g., Windows Installation, CV Creation, A3 Colour Printing"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-[#1E5AA8] focus:ring-2 focus:ring-blue-100 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">URL Slug</label>
                      <input
                        type="text"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. windows-installation"
                        className="w-full p-2.5 bg-slate-50 font-mono border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#1E5AA8] outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Sort Order</label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        placeholder="0"
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                      />
                    </div>
                  </div>

                  {/* Category Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-800 block">Category *</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(!isCustomCategory);
                          if (!isCustomCategory) setCustomCategoryName('');
                        }}
                        className="text-[11px] text-[#1E5AA8] hover:underline font-bold"
                      >
                        {isCustomCategory ? '← Choose Existing Category' : '+ Add New Custom Category'}
                      </button>
                    </div>

                    {!isCustomCategory ? (
                      <select
                        value={category}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setIsCustomCategory(true);
                            setCustomCategoryName('');
                          } else {
                            setCategory(e.target.value);
                          }
                        }}
                        className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-[#1E5AA8] outline-none"
                      >
                        {dynamicCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="__custom__">+ Add Custom Category...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        required={isCustomCategory}
                        value={customCategoryName}
                        onChange={(e) => setCustomCategoryName(e.target.value)}
                        placeholder="Enter category name (e.g. Computer Services, Design & Documentation)"
                        className="w-full p-2.5 bg-white border-2 border-[#1E5AA8] rounded-xl text-sm text-slate-900 focus:outline-none"
                        autoFocus
                      />
                    )}
                  </div>

                  {/* Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-semibold text-slate-800 text-xs">Active Status</span>
                      <button
                        type="button"
                        onClick={() => setStatus(status === 'Active' ? 'Inactive' : 'Active')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          status === 'Active' ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {status}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-semibold text-slate-800 text-xs">Publish on Web</span>
                      <button
                        type="button"
                        onClick={() => setIsPublished(!isPublished)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          isPublished ? 'bg-[#1E5AA8] text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {isPublished ? 'Published' : 'Hidden'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="font-semibold text-slate-800 text-xs">Featured on Home</span>
                      <button
                        type="button"
                        onClick={() => setFeatured(!featured)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          featured ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-700'
                        }`}
                      >
                        {featured ? '⭐ Featured' : 'Normal'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING MODEL */}
              {activeTab === 'pricing' && (
                <div className="space-y-5">
                  <div>
                    <label className="font-bold text-slate-800 block mb-2">Select Pricing Strategy</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPricingModel('single')}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          pricingModel === 'single'
                            ? 'bg-blue-50/80 border-[#1E5AA8] ring-2 ring-blue-100'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-[#1E5AA8]" />
                          <span>1. Single Price Model</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Single fixed or starting price (e.g. Windows Installation LKR 1,500 / system)
                        </p>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPricingModel('packages');
                          if (packages.length === 0) {
                            setPackages([
                              { name: 'Plus', price: 350, currency: 'LKR', description: 'Standard starter package', active: true },
                              { name: 'Premium', price: 600, currency: 'LKR', description: 'Advanced full package', active: true },
                              { name: 'Pro', price: 1000, currency: 'LKR', description: 'Executive VIP package', active: true },
                            ]);
                          }
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all ${
                          pricingModel === 'packages'
                            ? 'bg-purple-50/80 border-purple-600 ring-2 ring-purple-100'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-purple-600" />
                          <span>2. Multi-Tier Packages</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">
                          Multiple package tiers (e.g., Plus, Premium, Pro or Wedding, Cultural)
                        </p>
                      </button>
                    </div>
                  </div>

                  {pricingModel === 'single' ? (
                    <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#1E5AA8]" />
                        <span>Single Price Configuration</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Single Price (LKR)</label>
                          <input
                            type="number"
                            value={singlePrice}
                            onChange={(e) => setSinglePrice(e.target.value)}
                            placeholder="e.g. 1500"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:border-[#1E5AA8] outline-none"
                          />
                        </div>

                        <div>
                          <label className="font-semibold text-slate-700 block mb-1">Price Unit (Optional)</label>
                          <input
                            type="text"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="e.g. system, PC, page, card, set"
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">Custom Display Price Info Label</label>
                        <input
                          type="text"
                          value={priceInfo}
                          onChange={(e) => setPriceInfo(e.target.value)}
                          placeholder="e.g., Starting from LKR 1,500 / system (Leave blank for auto-format)"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 p-4 rounded-xl bg-purple-50/40 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-purple-900 text-xs">Multi-Tier Pricing Packages</h4>
                          <p className="text-[11px] text-purple-700">Customers can compare and choose between these tiers</p>
                        </div>
                        <button
                          type="button"
                          onClick={handleAddPackage}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Tier</span>
                        </button>
                      </div>

                      <div className="space-y-3">
                        {packages.map((pkg, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-purple-200/80 shadow-xs space-y-2">
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs text-purple-900">Package Tier #{idx + 1}</span>
                              <div className="flex items-center gap-2">
                                <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={pkg.active ?? true}
                                    onChange={(e) => handleUpdatePackage(idx, 'active', e.target.checked)}
                                    className="rounded text-purple-600"
                                  />
                                  <span>Active</span>
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleRemovePackage(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Package Name *</label>
                                <input
                                  type="text"
                                  required
                                  value={pkg.name}
                                  onChange={(e) => handleUpdatePackage(idx, 'name', e.target.value)}
                                  placeholder="e.g. Plus, Premium, Pro"
                                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                                />
                              </div>

                              <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Price (LKR) *</label>
                                <input
                                  type="number"
                                  required
                                  value={pkg.price}
                                  onChange={(e) => handleUpdatePackage(idx, 'price', Number(e.target.value))}
                                  placeholder="350"
                                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                                />
                              </div>

                              <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Currency</label>
                                <input
                                  type="text"
                                  value={pkg.currency || 'LKR'}
                                  onChange={(e) => handleUpdatePackage(idx, 'currency', e.target.value)}
                                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white outline-none"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-600 block mb-0.5">Package Feature / Scope Description</label>
                              <input
                                type="text"
                                value={pkg.description || ''}
                                onChange={(e) => handleUpdatePackage(idx, 'description', e.target.value)}
                                placeholder="e.g. Standard single-page resume layout with modern typography"
                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-purple-600 outline-none"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: MEDIA & IMAGES */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Main Cover Image URL</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="url"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://..."
                        className="flex-1 p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                      />
                      {image && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs">
                          <img src={image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">High resolution horizontal image (1200x800 recommended)</p>
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Additional Gallery Images (One URL per line)</label>
                    <textarea
                      rows={3}
                      value={galleryImagesStr}
                      onChange={(e) => setGalleryImagesStr(e.target.value)}
                      placeholder="https://images.unsplash.com/photo-1\nhttps://images.unsplash.com/photo-2"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: CONTENT & OPTIONS */}
              {activeTab === 'content' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Short Summary Description *</label>
                    <input
                      type="text"
                      required
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief teaser for service cards and search results"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Full Service Description</label>
                    <textarea
                      rows={3}
                      value={fullDescription}
                      onChange={(e) => setFullDescription(e.target.value)}
                      placeholder="Comprehensive overview displayed on the dedicated service detail page"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Available Service Options & Features (One per line)</label>
                    <textarea
                      rows={3}
                      value={availableListStr}
                      onChange={(e) => setAvailableListStr(e.target.value)}
                      placeholder="Windows 10 & 11 OS Setup\nMotherboard & GPU Driver Setup\nSecurity Configuration"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">Important Customer Notes & Guidelines (One per line)</label>
                    <textarea
                      rows={2}
                      value={notesStr}
                      onChange={(e) => setNotesStr(e.target.value)}
                      placeholder="Please back up critical files before system setup.\nPreview drafts sent via WhatsApp."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & META */}
              {activeTab === 'seo' && (
                <div className="space-y-4">
                  <div>
                    <label className="font-bold text-slate-800 block mb-1">SEO Meta Title</label>
                    <input
                      type="text"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="e.g. Professional Windows Installation Service | FR.HASAN TECH"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">SEO Meta Description</label>
                    <textarea
                      rows={2}
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Fast and reliable Windows operating system installation and configuration for laptops and desktop computers."
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-800 block mb-1">SEO Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={seoKeywordsStr}
                      onChange={(e) => setSeoKeywordsStr(e.target.value)}
                      placeholder="e.g. windows installation, laptop repair, OS setup, computer services"
                      className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:border-[#1E5AA8] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer */}
              <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 min-h-[42px]"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#1E5AA8] hover:bg-[#164785] text-white font-bold min-h-[42px] shadow-soft-sm active-press flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingService ? 'Save Changes' : 'Save to Database'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        message="This action will permanently delete this service from the database and remove it from the public website. This cannot be undone."
        confirmLabel="Delete Service"
        onConfirm={() => {
          if (deleteTarget) {
            deleteService(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Clear Catalog Confirmation Modal */}
      <ConfirmModal
        isOpen={showClearConfirm}
        title="Clear All Services from Database?"
        message="This will delete all services from your database and catalog. Default templates can be restored at any time in Settings > Data."
        confirmLabel="Yes, Clear Catalog"
        onConfirm={async () => {
          await clearServices();
          setShowClearConfirm(false);
        }}
        onCancel={() => setShowClearConfirm(false)}
      />

    </div>
  );
};
