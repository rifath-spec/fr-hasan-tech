import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  Calculator, 
  Plus, 
  Trash2, 
  MessageCircle, 
  Copy, 
  Check, 
  Printer, 
  FileText, 
  Layers, 
  Search, 
  Info, 
  Sparkles,
  ShoppingBag,
  Palette,
  ShieldCheck,
  Smartphone,
  BookOpen,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  EstimateCategory, 
  EstimateService, 
  EstimateSize, 
  EstimateItem, 
  UnitOfLength 
} from '../../types';
import { 
  calculateItemTotal, 
  calculateEstimateSummary, 
  generateEstimateWhatsAppText, 
  convertLength,
  formatCurrency
} from '../../services/estimateCalculator';
import { openWhatsAppChat } from '../../utils/whatsapp';

export const InstantEstimateModal: React.FC = () => {
  const { 
    isEstimateModalOpen, 
    closeEstimateModal, 
    estimateCategories, 
    estimateServices, 
    estimateSizes,
    settings,
    showToast 
  } = useApp();

  // Active filter state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Currently selected service to configure
  const [activeServiceId, setActiveServiceId] = useState<string>('');

  // Service configuration inputs
  const [quantity, setQuantity] = useState<number>(1);
  const [copies, setCopies] = useState<number>(1);
  const [selectedSizeId, setSelectedSizeId] = useState<string>('size-iso-a4');
  const [isCustomSize, setIsCustomSize] = useState<boolean>(false);
  const [customWidth, setCustomWidth] = useState<number>(210);
  const [customHeight, setCustomHeight] = useState<number>(297);
  const [customUnit, setCustomUnit] = useState<UnitOfLength>('mm');

  // Print/Copy Specific Options
  const [isColor, setIsColor] = useState<boolean>(false);
  const [isDoubleSided, setIsDoubleSided] = useState<boolean>(false);

  // Lamination & Binding Options
  const [selectedThickness, setSelectedThickness] = useState<string>('100 micron');
  const [selectedBinding, setSelectedBinding] = useState<string>('Plastic Comb Binding (Standard)');
  const [customNotes, setCustomNotes] = useState<string>('');

  // Estimate Basket (for multi-item estimate support)
  const [estimateList, setEstimateList] = useState<EstimateItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'configure' | 'basket'>('configure');

  // Active service helper
  const currentService = useMemo(() => {
    return estimateServices.find(s => s.id === activeServiceId) || null;
  }, [estimateServices, activeServiceId]);

  // Set default active service when modal opens or services load
  useEffect(() => {
    if (estimateServices.length > 0 && (!activeServiceId || !estimateServices.some(s => s.id === activeServiceId))) {
      const activeList = estimateServices.filter(s => s.active);
      const defaultService = activeList.find(s => s.categoryId === 'cat-photocopy' || s.categoryId === 'cat-printing') || activeList[0];
      if (defaultService) {
        setActiveServiceId(defaultService.id);
        const isCol = defaultService.name.toLowerCase().includes('colour') || defaultService.name.toLowerCase().includes('color');
        setIsColor(isCol);
      }
    }
  }, [estimateServices, activeServiceId, isEstimateModalOpen]);

  // Handle service switch defaults
  useEffect(() => {
    if (currentService) {
      setQuantity(Math.max(currentService.minQuantity || 1, 1));
      if (currentService.name.toLowerCase().includes('colour') || currentService.name.toLowerCase().includes('color')) {
        setIsColor(true);
      }
    }
  }, [currentService?.id]);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    return estimateServices.filter(service => {
      if (!service.active) return false;
      const matchCat = selectedCategoryId === 'all' || service.categoryId === selectedCategoryId;
      const matchQuery = !searchQuery.trim() || 
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [estimateServices, selectedCategoryId, searchQuery]);

  // Available Sizes for current service
  const availableSizes = useMemo(() => {
    if (!currentService) return estimateSizes;
    if (currentService.allowedSizeIds && currentService.allowedSizeIds.length > 0) {
      return estimateSizes.filter(s => currentService.allowedSizeIds?.includes(s.id));
    }
    return estimateSizes.filter(s => s.active);
  }, [estimateSizes, currentService]);

  // Current Size Object
  const currentSize: EstimateSize | null = useMemo(() => {
    if (isCustomSize) {
      const widthMm = convertLength(customWidth, customUnit, 'mm');
      const heightMm = convertLength(customHeight, customUnit, 'mm');
      return {
        id: 'custom-size',
        name: `Custom (${customWidth} × ${customHeight} ${customUnit})`,
        code: 'CUSTOM',
        sizeGroup: 'CUSTOM',
        widthMm,
        heightMm,
        sizeType: 'custom',
        priceMultiplier: 1.0,
        active: true,
        sortOrder: 999,
        isCustom: true
      };
    }
    return estimateSizes.find(s => s.id === selectedSizeId) || estimateSizes.find(s => s.code === 'A4') || null;
  }, [estimateSizes, selectedSizeId, isCustomSize, customWidth, customHeight, customUnit]);

  // Live calculation for active configured item
  const currentCalculated = useMemo(() => {
    if (!currentService) return null;
    return calculateItemTotal({
      service: currentService,
      quantity: Math.max(currentService.minQuantity || 1, quantity),
      copies,
      selectedSize: currentSize,
      customWidthMm: isCustomSize ? convertLength(customWidth, customUnit, 'mm') : undefined,
      customHeightMm: isCustomSize ? convertLength(customHeight, customUnit, 'mm') : undefined,
      color: currentService.supportedOptions?.hasColorOption ? (isColor ? 'Colour' : 'Black & White') : undefined,
      sides: currentService.supportedOptions?.hasSidesOption ? (isDoubleSided ? 'Double Side' : 'Single Side') : undefined,
      thickness: currentService.supportedOptions?.hasThicknessOption ? selectedThickness : undefined,
      bindingType: currentService.supportedOptions?.hasBindingOption ? selectedBinding : undefined,
      additionalNotes: customNotes.trim() || undefined,
    });
  }, [
    currentService, 
    quantity, 
    copies, 
    currentSize, 
    isCustomSize, 
    customWidth, 
    customHeight, 
    customUnit, 
    isColor, 
    isDoubleSided, 
    selectedThickness, 
    selectedBinding, 
    customNotes
  ]);

  // Current configured item as EstimateItem
  const currentConfiguredItem: EstimateItem | null = useMemo(() => {
    if (!currentService || !currentCalculated) return null;
    const category = estimateCategories.find(c => c.id === currentService.categoryId);
    return {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      serviceId: currentService.id,
      serviceName: currentService.name,
      categoryName: category?.name || 'Printing Service',
      unit: currentService.unit,
      baseUnitPrice: currentCalculated.unitPrice,
      calculatedUnitPrice: currentCalculated.calculatedUnitPrice,
      quantity: currentCalculated.quantity,
      copies: currentCalculated.copies,
      selectedSize: currentSize ? {
        id: currentSize.id,
        name: currentSize.name,
        widthMm: currentSize.widthMm,
        heightMm: currentSize.heightMm,
        isCustom: isCustomSize,
      } : undefined,
      selectedOptions: {
        color: currentService.supportedOptions?.hasColorOption ? (isColor ? 'Colour' : 'Black & White') : undefined,
        sides: currentService.supportedOptions?.hasSidesOption ? (isDoubleSided ? 'Double Side' : 'Single Side') : undefined,
        thickness: currentService.supportedOptions?.hasThicknessOption ? selectedThickness : undefined,
        bindingType: currentService.supportedOptions?.hasBindingOption ? selectedBinding : undefined,
        notes: customNotes.trim() || undefined,
      },
      itemTotal: currentCalculated.total,
    };
  }, [
    currentService, 
    currentCalculated, 
    estimateCategories, 
    currentSize, 
    isCustomSize, 
    isColor, 
    isDoubleSided, 
    selectedThickness, 
    selectedBinding, 
    customNotes
  ]);

  // Combined totals (Basket list OR single configured item if basket is empty)
  const itemsToEstimate = useMemo(() => {
    if (estimateList.length > 0) {
      return estimateList;
    }
    return currentConfiguredItem ? [currentConfiguredItem] : [];
  }, [estimateList, currentConfiguredItem]);

  const grandCalculation = useMemo(() => {
    return calculateEstimateSummary(itemsToEstimate);
  }, [itemsToEstimate]);

  // Category Icon resolver
  const getCategoryIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Copy':
        return <Copy className="w-4 h-4" />;
      case 'Printer':
        return <Printer className="w-4 h-4" />;
      case 'Palette':
        return <Palette className="w-4 h-4" />;
      case 'Shield':
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4" />;
      case 'BookOpen':
      case 'Layers':
        return <Layers className="w-4 h-4" />;
      case 'Smartphone':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // Quick preset quantities for rapid customer selection
  const quantityPresets = [1, 5, 10, 25, 50, 100, 250, 500];

  // Add currently configured item to estimate list
  const handleAddToList = () => {
    if (!currentConfiguredItem) return;
    setEstimateList(prev => [...prev, currentConfiguredItem]);
    showToast(`Added "${currentConfiguredItem.serviceName}" to order list!`, 'success');
    // Reset quantity for next item
    setQuantity(1);
    setCustomNotes('');
  };

  // Remove item from list
  const handleRemoveFromList = (index: number) => {
    setEstimateList(prev => prev.filter((_, idx) => idx !== index));
    showToast('Item removed from order list', 'info');
  };

  // Clear all items in basket
  const handleClearAll = () => {
    setEstimateList([]);
    setQuantity(1);
    setCustomNotes('');
    setViewMode('configure');
    showToast('Order list reset', 'info');
  };

  // WhatsApp Order Trigger
  const handleWhatsAppSend = () => {
    let message = generateEstimateWhatsAppText(
      itemsToEstimate,
      grandCalculation,
      settings.shopName || 'FR.HASAN TECH'
    );

    if (customerName.trim()) {
      message = `*Customer Name:* ${customerName.trim()}\n\n` + message;
    }

    openWhatsAppChat(settings.whatsappNumber || '076 859 7800', message);
  };

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    let message = generateEstimateWhatsAppText(
      itemsToEstimate,
      grandCalculation,
      settings.shopName || 'FR.HASAN TECH'
    );

    if (customerName.trim()) {
      message = `*Customer Name:* ${customerName.trim()}\n\n` + message;
    }

    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast('Estimate summary copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isEstimateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Modal Dialog Box */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100">
        
        {/* ==================================================================== */}
        {/* HEADER: Clean, Premium Navy Header */}
        {/* ==================================================================== */}
        <div 
          className="px-5 py-3.5 sm:px-7 sm:py-4.5 text-white flex items-center justify-between shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #062B5C 0%, #083875 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#38BDF8] shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Instant Estimate & Pricing
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#16B95A] text-white">
                  Real-time Rates
                </span>
              </div>
              <p className="text-xs text-[#BFD3EA] hidden sm:block">
                Choose your options for an instant price, then send directly via WhatsApp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Basket Button Toggle (if items > 0) */}
            {estimateList.length > 0 && (
              <button
                type="button"
                onClick={() => setViewMode(prev => prev === 'basket' ? 'configure' : 'basket')}
                className="px-3 py-1.5 rounded-xl bg-[#0D6EFD] hover:bg-[#0B5ED7] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{estimateList.length} {estimateList.length === 1 ? 'Item' : 'Items'}</span>
                <span className="bg-white/20 px-1.5 py-0.5 rounded-md text-[10px]">
                  {formatCurrency(grandCalculation.estimatedTotal)}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={closeEstimateModal}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
              aria-label="Close calculator"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* BODY CONTAINER */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 bg-slate-50">
          
          {/* BASKET VIEW (When user clicks on Basket mode with multiple items) */}
          {viewMode === 'basket' && estimateList.length > 0 ? (
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Your Estimate Order List</h3>
                  <p className="text-xs text-slate-500">Review your configured services before sending</p>
                </div>
                <button
                  type="button"
                  onClick={() => setViewMode('configure')}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#0B4F9C] hover:bg-blue-100 text-xs font-bold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add More Services</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {estimateList.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between gap-3 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#0B4F9C] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">{item.serviceName}</h4>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1 text-xs text-slate-600">
                          <span className="font-semibold text-[#0B4F9C]">{item.quantity} {item.unit}s</span>
                          {item.copies > 1 && <span className="text-slate-400">× {item.copies} copies</span>}
                          {item.selectedSize && <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.selectedSize.name}</span>}
                          {item.selectedOptions.color && <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.selectedOptions.color}</span>}
                          {item.selectedOptions.sides && <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.selectedOptions.sides}</span>}
                          {item.selectedOptions.thickness && <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.selectedOptions.thickness}</span>}
                          {item.selectedOptions.bindingType && <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">{item.selectedOptions.bindingType}</span>}
                        </div>
                        {item.selectedOptions.notes && (
                          <div className="text-[11px] text-amber-700 mt-1 italic">
                            Note: {item.selectedOptions.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-extrabold text-[#0B4F9C]">
                        {formatCurrency(item.itemTotal)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromList(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total & Action Card */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-slate-700">Estimated Grand Total:</span>
                  <span className="text-2xl font-black text-[#0B4F9C]">
                    {formatCurrency(grandCalculation.estimatedTotal)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Name (Optional - for WhatsApp greeting):
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleWhatsAppSend}
                    className="w-full py-3 px-4 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
                    style={{ backgroundColor: '#16B95A' }}
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-white" />
                    <span>Send Order via WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                    <span>{copied ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (

            /* STANDARD CONFIGURATOR VIEW: 2-Column Responsive Layout */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* ------------------------------------------------------------------ */}
              {/* LEFT COLUMN: Guided Service Selection & Easy Options */}
              {/* ------------------------------------------------------------------ */}
              <div className="lg:col-span-7 space-y-4">
                
                {/* STEP 1: SERVICE CATEGORY & SERVICE PICKER */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0B4F9C] text-white flex items-center justify-center text-xs font-black">
                        1
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">
                        Choose Your Service
                      </h3>
                    </div>

                    {/* Quick Search */}
                    <div className="relative w-full sm:w-48">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search service..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-[#0D6EFD]"
                      />
                    </div>
                  </div>

                  {/* Horizontal Category Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
                    <button
                      type="button"
                      onClick={() => setSelectedCategoryId('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedCategoryId === 'all'
                          ? 'bg-[#0B4F9C] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>All Services</span>
                    </button>

                    {estimateCategories.filter(c => c.active).map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedCategoryId === cat.id
                            ? 'bg-[#0B4F9C] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {getCategoryIcon(cat.icon)}
                        <span>{cat.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Service Cards Grid */}
                  {filteredServices.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No services match your search.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 sm:max-h-56 overflow-y-auto pr-1">
                      {filteredServices.map(srv => {
                        const isSelected = activeServiceId === srv.id;
                        return (
                          <button
                            key={srv.id}
                            type="button"
                            onClick={() => setActiveServiceId(srv.id)}
                            className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between relative group ${
                              isSelected
                                ? 'border-[#0D6EFD] bg-blue-50/70 shadow-xs ring-2 ring-[#0D6EFD]/20 text-[#0B4F9C]'
                                : 'border-slate-200 bg-white hover:bg-slate-50/90 text-slate-700'
                            }`}
                          >
                            <div>
                              <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#0B4F9C]' : 'text-slate-900'}`}>
                                {srv.name}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                                {srv.description}
                              </div>
                            </div>
                            <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-100/60">
                              <span className="text-[11px] font-extrabold text-[#0B4F9C]">
                                {formatCurrency(srv.basePrice)}
                              </span>
                              <span className="text-[10px] text-slate-400">/{srv.unit}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* STEP 2: CUSTOMER-FRIENDLY CONFIGURATION */}
                {currentService && (
                  <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#0B4F9C] text-white flex items-center justify-center text-xs font-black">
                          2
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          Customize Options & Quantity
                        </h3>
                      </div>
                      <span className="text-xs font-bold text-[#0B4F9C] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                        {currentService.name}
                      </span>
                    </div>

                    {/* Quantity Section with Quick Preset Buttons */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700">
                          Number of {currentService.unit}s:
                        </label>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Min: {currentService.minQuantity || 1} {currentService.unit}
                        </span>
                      </div>

                      {/* Stepper + Input */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center w-36 sm:w-44 shrink-0">
                          <button
                            type="button"
                            onClick={() => setQuantity(prev => Math.max(currentService.minQuantity || 1, prev - 1))}
                            className="w-10 h-10 rounded-l-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min={currentService.minQuantity || 1}
                            max={currentService.maxQuantity || 99999}
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(currentService.minQuantity || 1, parseInt(e.target.value) || 1))}
                            className="w-full h-10 border-y border-slate-300 text-center font-black text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#0D6EFD] bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setQuantity(prev => prev + 1)}
                            className="w-10 h-10 rounded-r-xl bg-slate-100 border border-slate-300 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-base flex items-center justify-center transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Quick Presets Pills */}
                        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                          {quantityPresets.map(preset => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setQuantity(preset)}
                              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 ${
                                quantity === preset
                                  ? 'bg-[#0B4F9C] text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {preset}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Paper / Material Size Selection */}
                    {currentService.supportedOptions?.hasSizesOption && (
                      <div className="space-y-2 pt-1 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">
                            Paper / Document Size:
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsCustomSize(!isCustomSize)}
                            className="text-[11px] font-bold text-[#0D6EFD] hover:underline cursor-pointer"
                          >
                            {isCustomSize ? '← Standard Sizes' : 'Custom Dimensions'}
                          </button>
                        </div>

                        {!isCustomSize ? (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {availableSizes.slice(0, 8).map(size => {
                              const isSelected = selectedSizeId === size.id;
                              return (
                                <button
                                  key={size.id}
                                  type="button"
                                  onClick={() => setSelectedSizeId(size.id)}
                                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                                    isSelected
                                      ? 'bg-blue-50 border-[#0D6EFD] text-[#0B4F9C] font-bold shadow-xs'
                                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="text-xs font-bold">{size.name}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                    {size.widthMm}×{size.heightMm} mm
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <span className="text-[11px] font-bold text-slate-700 block">Custom Measurements:</span>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <span className="text-[10px] text-slate-500 block mb-1">Width</span>
                                <input
                                  type="number"
                                  min={10}
                                  value={customWidth}
                                  onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block mb-1">Height</span>
                                <input
                                  type="number"
                                  min={10}
                                  value={customHeight}
                                  onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-500 block mb-1">Unit</span>
                                <select
                                  value={customUnit}
                                  onChange={(e) => setCustomUnit(e.target.value as UnitOfLength)}
                                  className="w-full bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-900"
                                >
                                  <option value="mm">mm (Millimeters)</option>
                                  <option value="cm">cm (Centimeters)</option>
                                  <option value="in">in (Inches)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Visual Color Mode & Print Sides Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                      {/* Color Choice */}
                      {currentService.supportedOptions?.hasColorOption && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Print Colour:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setIsColor(false)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                !isColor
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <span className="w-2.5 h-2.5 rounded-full bg-white border border-slate-400 shrink-0" />
                              <span className="text-xs">B&W (Mono)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsColor(true)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isColor
                                  ? 'bg-[#0B4F9C] text-white border-[#0B4F9C] shadow-xs font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <Palette className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                              <span className="text-xs">Full Colour</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Sides Choice */}
                      {currentService.supportedOptions?.hasSidesOption && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700 block">
                            Print Sides:
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setIsDoubleSided(false)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                !isDoubleSided
                                  ? 'bg-[#0B4F9C] text-white border-[#0B4F9C] shadow-xs font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-xs">1-Sided</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setIsDoubleSided(true)}
                              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                                isDoubleSided
                                  ? 'bg-[#0B4F9C] text-white border-[#0B4F9C] shadow-xs font-bold'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                              }`}
                            >
                              <Layers className="w-3.5 h-3.5 shrink-0" />
                              <span className="text-xs">2-Sided</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Lamination Thickness (if supported) */}
                    {currentService.supportedOptions?.hasThicknessOption && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-700 block">
                          Pouch Thickness:
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {['80 micron', '100 micron', '125 micron', '150 micron'].map(th => (
                            <button
                              key={th}
                              type="button"
                              onClick={() => setSelectedThickness(th)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-semibold border text-center transition-all cursor-pointer ${
                                selectedThickness === th
                                  ? 'bg-blue-50 border-[#0D6EFD] text-[#0B4F9C] font-bold shadow-xs'
                                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              {th}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Binding Style (if supported) */}
                    {currentService.supportedOptions?.hasBindingOption && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-700 block">
                          Binding Type:
                        </label>
                        <select
                          value={selectedBinding}
                          onChange={(e) => setSelectedBinding(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#0D6EFD] focus:outline-none cursor-pointer"
                        >
                          <option value="Plastic Comb Binding (Standard)">Plastic Comb Binding (Standard Clear Cover)</option>
                          <option value="Wire-O Metal Binding">Wire-O Metal Ring Binding</option>
                          <option value="Heavy Duty Spine Ring (150+ pgs)">Heavy Duty Ring (150+ pages)</option>
                          <option value="Project Soft Tape Binding">Project Soft Spine Tape</option>
                          <option value="Hardcover Book Binding">Hardcover Gold Foil / Embossed</option>
                        </select>
                      </div>
                    )}

                    {/* Special Instructions */}
                    <div className="pt-1 border-t border-slate-100">
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Special Instructions (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 100gsm paper, punch 2 holes, urgent order..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0D6EFD]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ------------------------------------------------------------------ */}
              {/* RIGHT COLUMN: Real-Time Live Price & Direct WhatsApp CTA */}
              {/* ------------------------------------------------------------------ */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Real-Time Live Price Card */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-[#0B4F9C]" />
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                        Estimated Cost
                      </h3>
                    </div>
                    {currentCalculated && (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        {formatCurrency(currentCalculated.calculatedUnitPrice)} / {currentService?.unit}
                      </span>
                    )}
                  </div>

                  {/* Dynamic Calculation Details */}
                  {currentCalculated && currentConfiguredItem && (
                    <div className="space-y-3">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                          <span>{currentConfiguredItem.serviceName}</span>
                          <span className="text-[#0B4F9C]">{formatCurrency(currentCalculated.total)}</span>
                        </div>

                        <div className="text-[11px] text-slate-500 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Quantity:</span>
                            <span className="font-semibold text-slate-700">{currentCalculated.quantity} {currentConfiguredItem.unit}s</span>
                          </div>
                          {currentConfiguredItem.selectedSize && (
                            <div className="flex items-center justify-between">
                              <span>Size:</span>
                              <span className="font-semibold text-slate-700">{currentConfiguredItem.selectedSize.name}</span>
                            </div>
                          )}
                          {currentConfiguredItem.selectedOptions.color && (
                            <div className="flex items-center justify-between">
                              <span>Color:</span>
                              <span className="font-semibold text-slate-700">{currentConfiguredItem.selectedOptions.color}</span>
                            </div>
                          )}
                          {currentConfiguredItem.selectedOptions.sides && (
                            <div className="flex items-center justify-between">
                              <span>Sides:</span>
                              <span className="font-semibold text-slate-700">{currentConfiguredItem.selectedOptions.sides}</span>
                            </div>
                          )}
                          {currentConfiguredItem.selectedOptions.thickness && (
                            <div className="flex items-center justify-between">
                              <span>Thickness:</span>
                              <span className="font-semibold text-slate-700">{currentConfiguredItem.selectedOptions.thickness}</span>
                            </div>
                          )}
                          {currentConfiguredItem.selectedOptions.bindingType && (
                            <div className="flex items-center justify-between">
                              <span>Binding:</span>
                              <span className="font-semibold text-slate-700">{currentConfiguredItem.selectedOptions.bindingType}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Grand Estimated Total Box */}
                      <div 
                        className="rounded-2xl p-4.5 text-white space-y-1 shadow-sm"
                        style={{ background: 'linear-gradient(135deg, #061B3A 0%, #082C5C 100%)' }}
                      >
                        <span className="text-xs font-semibold text-[#BFD3EA] block">
                          Estimated Total:
                        </span>
                        <div className="text-3xl sm:text-4xl font-black text-[#38BDF8] tracking-tight">
                          {formatCurrency(currentCalculated.total)}
                        </div>
                        <span className="text-[10px] text-slate-300 block pt-1">
                          Inclusive of standard 80gsm paper & laser toner
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Add to Multi-Service Order button */}
                  <button
                    type="button"
                    onClick={handleAddToList}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  >
                    <Plus className="w-4 h-4 text-[#0B4F9C]" />
                    <span>+ Add Another Service (Multi-Item Order)</span>
                  </button>

                  {/* Customer Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Name (Optional):
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mohamed / Kasun"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0D6EFD]"
                    />
                  </div>

                  {/* Primary WhatsApp Action CTA */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      id="send-estimate-whatsapp-btn"
                      onClick={handleWhatsAppSend}
                      className="w-full py-3.5 px-4 rounded-xl text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-[0.98] cursor-pointer"
                      style={{ backgroundColor: '#16B95A' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#12A94F')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16B95A')}
                    >
                      <MessageCircle className="w-5 h-5 fill-white text-white shrink-0" />
                      <span>Send Order via WhatsApp</span>
                    </button>

                    {/* Copy Text */}
                    <button
                      type="button"
                      onClick={handleCopySummary}
                      className="w-full py-2 px-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Estimate Text</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Friendly Guarantee Notice */}
                  <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Instant Estimate:</span> Final amount is confirmed in WhatsApp once your exact file and page count are verified.
                    </div>
                  </div>
                </div>

                {/* Shop Support Footer Card */}
                <div className="bg-slate-100/90 rounded-2xl p-3 text-center text-xs text-slate-600 border border-slate-200/60">
                  <div className="font-semibold">Need bulk discounts for 250+ pages?</div>
                  <div className="font-bold text-[#0B4F9C] mt-0.5">
                    Direct Hotline: {settings.whatsappNumber || '076 859 7800'}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
