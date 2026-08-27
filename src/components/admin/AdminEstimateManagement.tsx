import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  Database, 
  Search, 
  SlidersHorizontal, 
  Layers, 
  Printer, 
  Palette, 
  Sparkles, 
  Info, 
  CheckCircle2, 
  Eye, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Smartphone,
  Package,
  FileText,
  Tag,
  FolderPlus
} from 'lucide-react';
import { EstimateCategory, EstimateService, EstimateSize } from '../../types';
import { STANDARD_SIZE_GROUPS } from '../../services/estimateCalculator';

export const AdminEstimateManagement: React.FC = () => {
  const { 
    estimateCategories, 
    estimateServices, 
    estimateSizes,
    addEstimateService,
    updateEstimateService,
    deleteEstimateService,
    addEstimateCategory,
    updateEstimateCategory,
    deleteEstimateCategory,
    addEstimateSize,
    updateEstimateSize,
    deleteEstimateSize,
    seedEstimateDatabase,
    openEstimateModal,
    isSupabaseConnected,
    showToast 
  } = useApp();

  // Active tab: 'services' | 'sizes' | 'categories'
  const [activeTab, setActiveTab] = useState<'services' | 'sizes' | 'categories'>('services');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Service Edit / Create Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceFormData, setServiceFormData] = useState<Partial<EstimateService>>({
    name: '',
    categoryId: 'cat-photocopy',
    description: '',
    basePrice: 5,
    unit: 'page',
    minQuantity: 1,
    maxQuantity: 2000,
    supportedOptions: {
      hasSizesOption: true,
      hasColorOption: true,
      hasSidesOption: true,
      hasThicknessOption: false,
      hasBindingOption: false,
    },
    active: true,
  });

  // Size Edit / Create Modal State
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null);
  const [sizeFormData, setSizeFormData] = useState<Partial<EstimateSize>>({
    name: '',
    code: '',
    sizeGroup: 'ISO_A',
    widthMm: 210,
    heightMm: 297,
    sizeType: 'document',
    priceMultiplier: 1.0,
    active: true,
  });

  // Category Edit / Create Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categorySearchFilter, setCategorySearchFilter] = useState('');
  const [categoryFormData, setCategoryFormData] = useState<Partial<EstimateCategory>>({
    name: '',
    description: '',
    icon: 'Layers',
    active: true,
    sortOrder: 1,
  });

  // Syncing / Seeding State
  const [isSyncing, setIsSyncing] = useState(false);

  // --------------------------------------------------------------------------
  // Category Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddCategory = () => {
    setEditingCategoryId(null);
    setCategoryFormData({
      name: '',
      description: '',
      icon: 'Layers',
      active: true,
      sortOrder: estimateCategories.length + 1,
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: EstimateCategory) => {
    setEditingCategoryId(cat.id);
    setCategoryFormData({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleToggleCategoryActive = async (cat: EstimateCategory) => {
    await updateEstimateCategory(cat.id, { active: !cat.active });
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name?.trim()) {
      showToast('Please enter category name', 'error');
      return;
    }

    if (editingCategoryId) {
      await updateEstimateCategory(editingCategoryId, categoryFormData);
    } else {
      await addEstimateCategory({
        name: categoryFormData.name.trim(),
        description: categoryFormData.description || '',
        icon: categoryFormData.icon || 'Layers',
        active: categoryFormData.active !== undefined ? categoryFormData.active : true,
        sortOrder: Number(categoryFormData.sortOrder) || estimateCategories.length + 1,
      });
    }
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    const linkedCount = estimateServices.filter(s => s.categoryId === id).length;
    if (linkedCount > 0) {
      if (!window.confirm(`Category "${name}" is linked to ${linkedCount} service(s). Deleting it will leave those services without a category. Proceed?`)) {
        return;
      }
    } else {
      if (!window.confirm(`Are you sure you want to delete category "${name}"?`)) {
        return;
      }
    }
    await deleteEstimateCategory(id);
  };

  const renderCategoryIcon = (iconName: string, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Copy':
        return <Copy className={className} />;
      case 'Printer':
        return <Printer className={className} />;
      case 'Palette':
        return <Palette className={className} />;
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Layers':
        return <Layers className={className} />;
      case 'Smartphone':
        return <Smartphone className={className} />;
      case 'Package':
        return <Package className={className} />;
      case 'FileText':
        return <FileText className={className} />;
      case 'ShieldCheck':
        return <ShieldCheck className={className} />;
      default:
        return <Tag className={className} />;
    }
  };

  // --------------------------------------------------------------------------
  // Service Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddService = () => {
    setEditingServiceId(null);
    setServiceFormData({
      name: '',
      categoryId: estimateCategories[0]?.id || 'cat-photocopy',
      description: '',
      basePrice: 10,
      pricePerUnit: 10,
      pricingModel: 'per_page',
      unit: 'page',
      minQuantity: 1,
      maxQuantity: 2000,
      sortOrder: estimateServices.length + 1,
      supportedOptions: {
        hasSizesOption: true,
        hasColorOption: true,
        hasSidesOption: true,
        hasThicknessOption: false,
        hasBindingOption: false,
      },
      active: true,
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service: EstimateService) => {
    setEditingServiceId(service.id);
    setServiceFormData({ 
      ...service,
      supportedOptions: service.supportedOptions || {
        hasSizesOption: true,
        hasColorOption: false,
        hasSidesOption: false,
        hasThicknessOption: false,
        hasBindingOption: false,
      }
    });
    setIsServiceModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceFormData.name || !serviceFormData.categoryId) {
      showToast('Please enter a service name and select a category', 'error');
      return;
    }

    if (editingServiceId) {
      await updateEstimateService(editingServiceId, serviceFormData);
    } else {
      await addEstimateService({
        name: serviceFormData.name!,
        categoryId: serviceFormData.categoryId!,
        description: serviceFormData.description || '',
        basePrice: Number(serviceFormData.basePrice) || 0,
        pricePerUnit: Number(serviceFormData.basePrice) || 0,
        pricingModel: 'per_page',
        unit: serviceFormData.unit || 'page',
        minQuantity: Number(serviceFormData.minQuantity) || 1,
        maxQuantity: Number(serviceFormData.maxQuantity) || 2000,
        sortOrder: estimateServices.length + 1,
        supportedOptions: serviceFormData.supportedOptions || {
          hasSizesOption: true,
          hasColorOption: false,
          hasSidesOption: false,
          hasThicknessOption: false,
          hasBindingOption: false,
        },
        active: serviceFormData.active !== undefined ? serviceFormData.active : true,
      });
    }
    setIsServiceModalOpen(false);
  };

  const handleDeleteService = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete service "${name}"?`)) {
      await deleteEstimateService(id);
    }
  };

  // --------------------------------------------------------------------------
  // Size Handlers
  // --------------------------------------------------------------------------
  const handleOpenAddSize = () => {
    setEditingSizeId(null);
    setSizeFormData({
      name: '',
      code: '',
      sizeGroup: 'ISO_A',
      widthMm: 210,
      heightMm: 297,
      sizeType: 'document',
      priceMultiplier: 1.0,
      active: true,
    });
    setIsSizeModalOpen(true);
  };

  const handleOpenEditSize = (size: EstimateSize) => {
    setEditingSizeId(size.id);
    setSizeFormData({ ...size });
    setIsSizeModalOpen(true);
  };

  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sizeFormData.name || !sizeFormData.code) {
      showToast('Please enter size name and code', 'error');
      return;
    }

    if (editingSizeId) {
      await updateEstimateSize(editingSizeId, sizeFormData);
    } else {
      await addEstimateSize({
        name: sizeFormData.name!,
        code: sizeFormData.code!,
        sizeGroup: sizeFormData.sizeGroup || 'ISO_A',
        widthMm: Number(sizeFormData.widthMm) || 0,
        heightMm: Number(sizeFormData.heightMm) || 0,
        sizeType: sizeFormData.sizeType || 'document',
        priceMultiplier: Number(sizeFormData.priceMultiplier) || 1.0,
        sortOrder: estimateSizes.length + 1,
        active: sizeFormData.active !== undefined ? sizeFormData.active : true,
      });
    }
    setIsSizeModalOpen(false);
  };

  const handleDeleteSize = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete size "${name}"?`)) {
      await deleteEstimateSize(id);
    }
  };

  // --------------------------------------------------------------------------
  // Supabase Seed Trigger
  // --------------------------------------------------------------------------
  const handleSeedDatabase = async () => {
    setIsSyncing(true);
    await seedEstimateDatabase();
    setIsSyncing(false);
  };

  // Filtered Services List
  const filteredServices = estimateServices.filter(s => {
    const matchCat = selectedCategoryFilter === 'all' || s.categoryId === selectedCategoryFilter;
    const matchQuery = !searchFilter.trim() || 
      s.name.toLowerCase().includes(searchFilter.toLowerCase()) || 
      s.description.toLowerCase().includes(searchFilter.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B4F9C] flex items-center justify-center shrink-0 border border-blue-100 shadow-inner">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Instant Estimate Calculator Management</span>
              {isSupabaseConnected && (
                <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Supabase Live Sync
                </span>
              )}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage database-driven services, base rates, option multipliers, and paper sizes for the customer calculator.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openEstimateModal()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Eye className="w-4 h-4 text-[#38BDF8]" />
            <span>Test Customer Calculator</span>
          </button>

          <button
            type="button"
            disabled={isSyncing}
            onClick={handleSeedDatabase}
            className="px-4 py-2.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0B5ED7] disabled:opacity-50 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Database className="w-4 h-4" />
            <span>{isSyncing ? 'Syncing to Supabase...' : 'Sync Tables to Supabase'}</span>
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'services'
              ? 'bg-[#0B4F9C] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Services & Rates ({estimateServices.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sizes')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'sizes'
              ? 'bg-[#0B4F9C] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Standard Sizes & Multipliers ({estimateSizes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'categories'
              ? 'bg-[#0B4F9C] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Categories ({estimateCategories.length})</span>
        </button>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: SERVICES & RATES */}
      {/* ==================================================================== */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D6EFD]"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none"
              >
                <option value="all">All Categories</option>
                {estimateCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleOpenAddService}
              className="w-full sm:w-auto px-4 py-2 bg-[#16B95A] hover:bg-[#12A94F] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          {/* Services Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Base Rate (LKR)</th>
                    <th className="py-3 px-4">Unit</th>
                    <th className="py-3 px-4">Enabled Options</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredServices.map(service => {
                    const cat = estimateCategories.find(c => c.id === service.categoryId);
                    return (
                      <tr key={service.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          <div>{service.name}</div>
                          <div className="text-[11px] font-normal text-slate-400 line-clamp-1">{service.description}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0B4F9C] font-semibold text-xs">
                            {cat?.name || service.categoryId}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-extrabold text-[#0B4F9C]">
                          LKR {service.basePrice.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          per {service.unit}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 text-[10px]">
                            {service.supportedOptions?.hasSizesOption && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">Sizes</span>}
                            {service.supportedOptions?.hasColorOption && <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded font-semibold">Colour</span>}
                            {service.supportedOptions?.hasSidesOption && <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold">Sides</span>}
                            {service.supportedOptions?.hasThicknessOption && <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Thickness</span>}
                            {service.supportedOptions?.hasBindingOption && <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-semibold">Binding</span>}
                            {!service.supportedOptions || (!service.supportedOptions.hasSizesOption && !service.supportedOptions.hasColorOption && !service.supportedOptions.hasSidesOption && !service.supportedOptions.hasThicknessOption && !service.supportedOptions.hasBindingOption) ? (
                              <span className="text-slate-400 text-[10px]">Standard</span>
                            ) : null}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            service.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {service.active ? 'Active' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditService(service)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit service"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteService(service.id, service.name)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                              title="Delete service"
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
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SIZES & MULTIPLIERS */}
      {/* ==================================================================== */}
      {activeTab === 'sizes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-600">
              Standard paper series (ISO A, US ANSI, JIS B, Photo sizes) and their price multipliers.
            </p>
            <button
              type="button"
              onClick={handleOpenAddSize}
              className="px-4 py-2 bg-[#16B95A] hover:bg-[#12A94F] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Standard Size</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Size Name</th>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Dimensions (mm)</th>
                    <th className="py-3 px-4">Price Multiplier</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {estimateSizes.map(size => (
                    <tr key={size.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{size.name}</td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-xs text-blue-600">{size.code}</td>
                      <td className="py-3.5 px-4 text-slate-500">{size.sizeGroup}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-mono text-xs">{size.widthMm} × {size.heightMm} mm</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">
                          ×{size.priceMultiplier || 1.0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditSize(size)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit size"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSize(size.id, size.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete size"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: CATEGORIES */}
      {/* ==================================================================== */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search categories..."
                value={categorySearchFilter}
                onChange={(e) => setCategorySearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D6EFD]"
              />
            </div>

            <button
              type="button"
              onClick={handleOpenAddCategory}
              className="w-full sm:w-auto px-4 py-2 bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white text-xs sm:text-sm font-bold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Categories Grid */}
          {estimateCategories.filter(cat => 
            !categorySearchFilter.trim() ||
            cat.name.toLowerCase().includes(categorySearchFilter.toLowerCase()) ||
            cat.description.toLowerCase().includes(categorySearchFilter.toLowerCase())
          ).length === 0 ? (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No Categories Found</h4>
              <p className="text-xs text-slate-500">Create your first service category or adjust search terms.</p>
              <button
                type="button"
                onClick={handleOpenAddCategory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D6EFD] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Create Category</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {estimateCategories
                .filter(cat => 
                  !categorySearchFilter.trim() ||
                  cat.name.toLowerCase().includes(categorySearchFilter.toLowerCase()) ||
                  cat.description.toLowerCase().includes(categorySearchFilter.toLowerCase())
                )
                .map(cat => {
                  const linkedServices = estimateServices.filter(s => s.categoryId === cat.id);
                  return (
                    <div key={cat.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-soft-sm hover:shadow-soft-md transition-shadow space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0B4F9C] flex items-center justify-center shrink-0 border border-blue-100 shadow-xs">
                              {renderCategoryIcon(cat.icon, "w-5 h-5")}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm leading-snug">{cat.name}</h4>
                              <span className="text-[11px] text-slate-400 font-mono">ID: {cat.id}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleCategoryActive(cat)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                              cat.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                            title="Click to toggle status"
                          >
                            {cat.active ? 'Active' : 'Disabled'}
                          </button>
                        </div>

                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {cat.description || 'No description provided.'}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
                          {linkedServices.length} {linkedServices.length === 1 ? 'service' : 'services'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Category"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* SERVICE EDIT/CREATE MODAL */}
      {/* ==================================================================== */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingServiceId ? 'Edit Estimate Service' : 'Add Estimate Service'}
              </h3>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={serviceFormData.name || ''}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Colour Laser Printing (Glossy)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#0D6EFD]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    value={serviceFormData.categoryId}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  >
                    {estimateCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Price (LKR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={serviceFormData.basePrice || 0}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, basePrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Billing Unit</label>
                  <input
                    type="text"
                    value={serviceFormData.unit || 'page'}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, unit: e.target.value }))}
                    placeholder="e.g. page, doc, book, pouch"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={serviceFormData.minQuantity || 1}
                    onChange={(e) => setServiceFormData(prev => ({ ...prev, minQuantity: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={serviceFormData.description || ''}
                  onChange={(e) => setServiceFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Short description shown to customer"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              {/* Supported Options Checkboxes */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
                <span className="font-bold text-slate-800 block text-xs uppercase tracking-wider">
                  Supported Customer Options
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFormData.supportedOptions?.hasSizesOption || false}
                      onChange={(e) => setServiceFormData(prev => ({
                        ...prev,
                        supportedOptions: { ...(prev.supportedOptions || {}), hasSizesOption: e.target.checked }
                      }))}
                      className="rounded text-[#0D6EFD]"
                    />
                    <span>Paper / Size Selector</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFormData.supportedOptions?.hasColorOption || false}
                      onChange={(e) => setServiceFormData(prev => ({
                        ...prev,
                        supportedOptions: { ...(prev.supportedOptions || {}), hasColorOption: e.target.checked }
                      }))}
                      className="rounded text-[#0D6EFD]"
                    />
                    <span>Color vs B&W Toggle</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFormData.supportedOptions?.hasSidesOption || false}
                      onChange={(e) => setServiceFormData(prev => ({
                        ...prev,
                        supportedOptions: { ...(prev.supportedOptions || {}), hasSidesOption: e.target.checked }
                      }))}
                      className="rounded text-[#0D6EFD]"
                    />
                    <span>Double-Sided Toggle</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFormData.supportedOptions?.hasThicknessOption || false}
                      onChange={(e) => setServiceFormData(prev => ({
                        ...prev,
                        supportedOptions: { ...(prev.supportedOptions || {}), hasThicknessOption: e.target.checked }
                      }))}
                      className="rounded text-[#0D6EFD]"
                    />
                    <span>Thickness Gauge Selector</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFormData.supportedOptions?.hasBindingOption || false}
                      onChange={(e) => setServiceFormData(prev => ({
                        ...prev,
                        supportedOptions: { ...(prev.supportedOptions || {}), hasBindingOption: e.target.checked }
                      }))}
                      className="rounded text-[#0D6EFD]"
                    />
                    <span>Binding Type Selector</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white font-bold"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* SIZE EDIT/CREATE MODAL */}
      {/* ==================================================================== */}
      {isSizeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSizeId ? 'Edit Standard Size' : 'Add Standard Size'}
              </h3>
              <button
                type="button"
                onClick={() => setIsSizeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSize} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Size Name *</label>
                  <input
                    type="text"
                    required
                    value={sizeFormData.name || ''}
                    onChange={(e) => setSizeFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. A4 Paper"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    value={sizeFormData.code || ''}
                    onChange={(e) => setSizeFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="e.g. A4"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Width (mm) *</label>
                  <input
                    type="number"
                    required
                    value={sizeFormData.widthMm || 0}
                    onChange={(e) => setSizeFormData(prev => ({ ...prev, widthMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Height (mm) *</label>
                  <input
                    type="number"
                    required
                    value={sizeFormData.heightMm || 0}
                    onChange={(e) => setSizeFormData(prev => ({ ...prev, heightMm: parseFloat(e.target.value) || 0 }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Price Multiplier (e.g. 2.0 for A3 double rate)</label>
                <input
                  type="number"
                  step="0.05"
                  value={sizeFormData.priceMultiplier || 1.0}
                  onChange={(e) => setSizeFormData(prev => ({ ...prev, priceMultiplier: parseFloat(e.target.value) || 1.0 }))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white font-bold"
                >
                  Save Size
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* CATEGORY EDIT/CREATE MODAL */}
      {/* ==================================================================== */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingCategoryId ? 'Edit Service Category' : 'Add New Service Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Laser Printing & Copies"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#0D6EFD]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={categoryFormData.description || ''}
                  onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this service category..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:ring-2 focus:ring-[#0D6EFD]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Category Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { name: 'Copy', label: 'Photocopy' },
                    { name: 'Printer', label: 'Printing' },
                    { name: 'Palette', label: 'Photo/Design' },
                    { name: 'Sparkles', label: 'Lamination' },
                    { name: 'Layers', label: 'Binding' },
                    { name: 'Smartphone', label: 'Telecom' },
                    { name: 'Package', label: 'Packages' },
                    { name: 'FileText', label: 'Documents' },
                    { name: 'ShieldCheck', label: 'Cards/IDs' },
                    { name: 'Tag', label: 'General' },
                  ].map(iconItem => (
                    <button
                      key={iconItem.name}
                      type="button"
                      onClick={() => setCategoryFormData(prev => ({ ...prev, icon: iconItem.name }))}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                        categoryFormData.icon === iconItem.name
                          ? 'border-[#0D6EFD] bg-blue-50/80 text-[#0D6EFD] font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      {renderCategoryIcon(iconItem.name, "w-4 h-4 mb-1")}
                      <span className="text-[10px] truncate max-w-full">{iconItem.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={categoryFormData.sortOrder || 1}
                    onChange={(e) => setCategoryFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 1 }))}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="inline-flex items-center gap-2 cursor-pointer pb-2">
                    <input
                      type="checkbox"
                      checked={categoryFormData.active ?? true}
                      onChange={(e) => setCategoryFormData(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-[#0D6EFD] rounded border-slate-300 focus:ring-[#0D6EFD]"
                    />
                    <span className="text-xs font-bold text-slate-700">Category Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white font-bold shadow-xs"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
