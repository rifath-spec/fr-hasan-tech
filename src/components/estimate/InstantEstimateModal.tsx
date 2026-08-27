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
  Sliders, 
  Search, 
  HelpCircle, 
  Info, 
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ShoppingBag
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
  STANDARD_SIZE_GROUPS,
  convertLength 
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
  const [selectedSizeId, setSelectedSizeId] = useState<string>('size-a4');
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

  // Set default active service when list loads or modal opens
  useEffect(() => {
    if (estimateServices.length > 0 && !activeServiceId) {
      const defaultService = estimateServices.find(s => s.active) || estimateServices[0];
      if (defaultService) {
        setActiveServiceId(defaultService.id);
        // If it's a color service by default, set color option
        if (defaultService.name.toLowerCase().includes('colour') || defaultService.name.toLowerCase().includes('color')) {
          setIsColor(true);
        } else {
          setIsColor(false);
        }
      }
    }
  }, [estimateServices, activeServiceId]);

  // If active service changes, adapt options
  const currentService = useMemo(() => {
    return estimateServices.find(s => s.id === activeServiceId) || null;
  }, [estimateServices, activeServiceId]);

  useEffect(() => {
    if (currentService) {
      setQuantity(Math.max(currentService.minQuantity || 1, 1));
      if (currentService.name.toLowerCase().includes('colour') || currentService.name.toLowerCase().includes('color')) {
        setIsColor(true);
      }
    }
  }, [currentService]);

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

  // Calculation for active configured item
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
  }, [currentService, quantity, copies, currentSize, isCustomSize, customWidth, customHeight, customUnit, isColor, isDoubleSided, selectedThickness, selectedBinding, customNotes]);

  // Single Item configured object as EstimateItem
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

  // Add currently configured item to estimate list
  const handleAddToList = () => {
    if (!currentConfiguredItem) return;
    setEstimateList(prev => [...prev, currentConfiguredItem]);
    showToast(`Added "${currentConfiguredItem.serviceName}" to estimate list`, 'success');
    // Reset quantity for next item
    setQuantity(1);
    setCustomNotes('');
  };

  // Remove item from list
  const handleRemoveFromList = (index: number) => {
    setEstimateList(prev => prev.filter((_, idx) => idx !== index));
    showToast('Item removed from estimate list', 'info');
  };

  // Clear all items in basket
  const handleClearAll = () => {
    setEstimateList([]);
    setQuantity(1);
    setCustomNotes('');
    showToast('Estimate list cleared', 'info');
  };

  // WhatsApp Order Trigger
  const handleWhatsAppSend = () => {
    let message = generateEstimateWhatsAppText(
      itemsToEstimate,
      grandCalculation,
      settings.shopName || 'FR.HASAN TECH'
    );

    if (customerName.trim()) {
      message = `*Customer:* ${customerName.trim()}\n\n` + message;
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
      message = `*Customer:* ${customerName.trim()}\n\n` + message;
    }

    navigator.clipboard.writeText(message);
    setCopied(true);
    showToast('Estimate details copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isEstimateModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200">
        
        {/* ==================================================================== */}
        {/* HEADER BAR (Theme Dark Blue + Cyan Accent) */}
        {/* ==================================================================== */}
        <div 
          className="px-5 py-4 sm:px-6 sm:py-4.5 text-white flex items-center justify-between shrink-0 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #062B5C 0%, #083875 100%)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#38BDF8] shadow-inner">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Instant Estimate Calculator
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#16B95A] text-white">
                  Real-time Rates
                </span>
              </div>
              <p className="text-xs text-[#BFD3EA]">
                Calculate your estimated price before sending your files via WhatsApp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeEstimateModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ==================================================================== */}
        {/* MODAL BODY (Two-Column Layout on Tablet/Desktop) */}
        {/* ==================================================================== */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* ------------------------------------------------------------------ */}
            {/* LEFT COLUMN: Service Selection & Real-Time Option Configuration */}
            {/* ------------------------------------------------------------------ */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Category Pills & Search */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Step 1: Choose Service
                  </span>
                  {estimateCategories.length > 0 && (
                    <span className="text-[11px] text-slate-400 font-medium">
                      {filteredServices.length} service(s) available
                    </span>
                  )}
                </div>

                {/* Category Pills Scrollable */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-[#0B4F9C] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All Services
                  </button>
                  {estimateCategories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        selectedCategoryId === cat.id
                          ? 'bg-[#0B4F9C] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Service Cards Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
                  {filteredServices.map(srv => {
                    const isSelected = activeServiceId === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => setActiveServiceId(srv.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-[#0D6EFD] bg-blue-50/70 shadow-xs ring-2 ring-[#0D6EFD]/20'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-[#0B4F9C]' : 'text-slate-800'}`}>
                            {srv.name}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                            {srv.description}
                          </div>
                        </div>
                        <div className="mt-2 text-[11px] font-extrabold text-[#0B4F9C]">
                          From LKR {srv.basePrice.toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Service Configuration Controls */}
              {currentService && (
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Step 2: Configure & Options
                    </span>
                    <span className="text-xs font-bold text-[#0B4F9C] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      {currentService.name}
                    </span>
                  </div>

                  {/* Quantity & Copies Row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Quantity ({currentService.unit}s)
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => Math.max(currentService.minQuantity || 1, prev - 1))}
                          className="w-9 h-9 rounded-l-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={currentService.minQuantity || 1}
                          max={currentService.maxQuantity || 99999}
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(currentService.minQuantity || 1, parseInt(e.target.value) || 1))}
                          className="w-full h-9 border-y border-slate-300 text-center font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]"
                        />
                        <button
                          type="button"
                          onClick={() => setQuantity(prev => prev + 1)}
                          className="w-9 h-9 rounded-r-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Copies (Sets)
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => setCopies(prev => Math.max(1, prev - 1))}
                          className="w-9 h-9 rounded-l-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={copies}
                          onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full h-9 border-y border-slate-300 text-center font-bold text-slate-900 text-sm focus:outline-none focus:ring-1 focus:ring-[#0D6EFD]"
                        />
                        <button
                          type="button"
                          onClick={() => setCopies(prev => prev + 1)}
                          className="w-9 h-9 rounded-r-lg bg-slate-100 border border-slate-300 hover:bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Paper / Material Size Selector */}
                  {currentService.supportedOptions?.hasSizesOption && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700">
                          Document / Paper Size
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsCustomSize(!isCustomSize)}
                          className="text-[11px] font-bold text-[#0D6EFD] hover:underline cursor-pointer"
                        >
                          {isCustomSize ? 'Choose Standard Size' : 'Custom Dimensions (mm/in)'}
                        </button>
                      </div>

                      {!isCustomSize ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          {availableSizes.map(size => {
                            const isSelected = selectedSizeId === size.id;
                            return (
                              <button
                                key={size.id}
                                type="button"
                                onClick={() => setSelectedSizeId(size.id)}
                                className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-blue-50 border-[#0D6EFD] text-[#0B4F9C] font-bold shadow-xs'
                                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <div className="text-xs font-bold">{size.name}</div>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {size.widthMm}×{size.heightMm}mm
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Custom Dimensions Panel */
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                          <div className="text-[11px] font-bold text-slate-700">Custom Dimensions</div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Width:</span>
                              <input
                                type="number"
                                min={10}
                                value={customWidth}
                                onChange={(e) => setCustomWidth(parseFloat(e.target.value) || 0)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Height:</span>
                              <input
                                type="number"
                                min={10}
                                value={customHeight}
                                onChange={(e) => setCustomHeight(parseFloat(e.target.value) || 0)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-bold text-slate-800"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block mb-0.5">Unit:</span>
                              <select
                                value={customUnit}
                                onChange={(e) => setCustomUnit(e.target.value as UnitOfLength)}
                                className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs font-semibold text-slate-800"
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

                  {/* Print Color & Print Sides Toggles */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Color Toggle */}
                    {currentService.supportedOptions?.hasColorOption && (
                      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          Colour Output
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsColor(false)}
                            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              !isColor
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            B&W (Mono)
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsColor(true)}
                            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              isColor
                                ? 'bg-[#0B4F9C] text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            Full Colour
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Single vs Double-Sided */}
                    {currentService.supportedOptions?.hasSidesOption && (
                      <div className="border border-slate-200 rounded-lg p-2.5 bg-slate-50">
                        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                          Print Sides
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setIsDoubleSided(false)}
                            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              !isDoubleSided
                                ? 'bg-[#0B4F9C] text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            Single Sided
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsDoubleSided(true)}
                            className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                              isDoubleSided
                                ? 'bg-[#0B4F9C] text-white shadow-xs'
                                : 'bg-white text-slate-600 border border-slate-200'
                            }`}
                          >
                            Double Sided
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Lamination Thickness Selector */}
                  {currentService.supportedOptions?.hasThicknessOption && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Pouch Thickness / Gauge
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {['80 micron', '100 micron', '125 micron', '150 micron', '200 micron'].map(th => (
                          <button
                            key={th}
                            type="button"
                            onClick={() => setSelectedThickness(th)}
                            className={`py-1.5 px-2 rounded-lg text-xs font-medium border text-center transition-all cursor-pointer ${
                              selectedThickness === th
                                ? 'bg-blue-50 border-[#0D6EFD] text-[#0B4F9C] font-bold'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {th}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Binding Type Selector */}
                  {currentService.supportedOptions?.hasBindingOption && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Binding Style & Material
                      </label>
                      <select
                        value={selectedBinding}
                        onChange={(e) => setSelectedBinding(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium text-slate-800 focus:ring-2 focus:ring-[#0D6EFD] focus:outline-none cursor-pointer"
                      >
                        <option value="Plastic Comb Binding (Standard)">Plastic Comb Binding (Standard Clear Cover)</option>
                        <option value="Wire-O Metal Binding">Wire-O Metal Ring Binding</option>
                        <option value="Heavy Duty Spine Ring (150+ pgs)">Heavy Duty Ring (150+ pages)</option>
                        <option value="Project Soft Tape Binding">Project Soft Spine Tape</option>
                        <option value="Hardcover Book Binding">Hardcover Gold Foil / Embossed</option>
                      </select>
                    </div>
                  )}

                  {/* Custom Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Special Instructions or Paper Grammage (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 100gsm art paper, punch 2 holes, urgent order..."
                      value={customNotes}
                      onChange={(e) => setCustomNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0D6EFD]"
                    />
                  </div>

                  {/* Add To Multi-Item Estimate List Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleAddToList}
                      className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4 text-[#38BDF8]" />
                      <span>Add This Item to Estimate List (Multi-service)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ------------------------------------------------------------------ */}
            {/* RIGHT COLUMN: Real-Time Summary, Multi-Item Basket & WhatsApp Order */}
            {/* ------------------------------------------------------------------ */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Basket Card */}
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-md space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#0B4F9C]" />
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      Estimate Summary
                    </h3>
                  </div>
                  {estimateList.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                    >
                      Clear List
                    </button>
                  )}
                </div>

                {/* Optional Customer Name Input */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Your Name (Optional - for WhatsApp quote):
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#0D6EFD]"
                  />
                </div>

                {/* Items List in Basket or Active Preview */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {estimateList.length === 0 ? (
                    /* Showing Active Item Preview */
                    currentCalculated && currentConfiguredItem && (
                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-[#0D6EFD] uppercase tracking-wider">
                              Active Configuration
                            </span>
                            <h4 className="text-xs font-bold text-slate-800">
                              {currentConfiguredItem.serviceName}
                            </h4>
                          </div>
                          <span className="font-extrabold text-[#0B4F9C] text-sm">
                            LKR {currentCalculated.total.toFixed(2)}
                          </span>
                        </div>

                        {/* Breakdown pills */}
                        <div className="flex flex-wrap gap-1 text-[10px] text-slate-600">
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Qty: {currentCalculated.quantity} {currentConfiguredItem.unit}s
                          </span>
                          {currentConfiguredItem.selectedSize && (
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              Size: {currentConfiguredItem.selectedSize.name}
                            </span>
                          )}
                          {currentConfiguredItem.selectedOptions.color && (
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              {currentConfiguredItem.selectedOptions.color}
                            </span>
                          )}
                          {currentConfiguredItem.selectedOptions.sides && (
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                              {currentConfiguredItem.selectedOptions.sides}
                            </span>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 pt-1 border-t border-blue-100/60 flex items-center justify-between">
                          <span>Unit rate: LKR {currentCalculated.calculatedUnitPrice.toFixed(2)} / {currentConfiguredItem.unit}</span>
                          <span className="text-blue-600 font-medium">Auto-calculating</span>
                        </div>
                      </div>
                    )
                  ) : (
                    /* Render Added Items */
                    estimateList.map((item, idx) => (
                      <div 
                        key={item.id || idx}
                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">
                            {idx + 1}. {item.serviceName}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {item.quantity} {item.unit}s · {item.selectedSize?.name || 'Standard'} {item.selectedOptions.color ? `· ${item.selectedOptions.color}` : ''} {item.selectedOptions.sides ? `· ${item.selectedOptions.sides}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-bold text-[#0B4F9C]">
                            LKR {item.itemTotal.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromList(idx)}
                            className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Grand Total Price Block */}
                <div 
                  className="rounded-xl p-4 text-white space-y-2"
                  style={{ background: 'linear-gradient(135deg, #061B3A 0%, #082C5C 100%)' }}
                >
                  <div className="flex items-center justify-between text-xs text-blue-200">
                    <span>Total Services / Items:</span>
                    <span>{grandCalculation.itemCount} item(s)</span>
                  </div>

                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-sm font-semibold text-slate-200">
                      Estimated Grand Total:
                    </span>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-extrabold text-[#38BDF8]">
                        LKR {grandCalculation.estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimers & Notes */}
                <div className="bg-amber-50/80 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Disclaimer:</span> This is an instant preliminary estimate. Final invoice amount is confirmed upon review of your exact PDF/Word files and paper requirements.
                  </div>
                </div>

                {/* Action Buttons: WhatsApp and Copy */}
                <div className="space-y-2 pt-1">
                  {/* WhatsApp Direct CTA */}
                  <button
                    type="button"
                    id="send-estimate-whatsapp-btn"
                    onClick={handleWhatsAppSend}
                    className="w-full py-3.5 px-4 rounded-xl text-white text-sm sm:text-base font-bold flex items-center justify-center gap-2.5 transition-all active-press cursor-pointer shadow-md"
                    style={{ backgroundColor: '#16B95A' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#12A94F')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#16B95A')}
                  >
                    <MessageCircle className="w-5 h-5 fill-white text-white shrink-0" />
                    <span>Send Estimate via WhatsApp</span>
                  </button>

                  {/* Copy Summary Button */}
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-200"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-[#16B95A]" />
                        <span className="text-[#16B95A]">Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copy Formatted Estimate Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Shop Helpline Box */}
              <div className="bg-slate-100 rounded-xl p-3 text-center text-xs text-slate-600">
                <span>Need bulk discounts (500+ pages) or custom binding?</span>
                <div className="font-bold text-[#0B4F9C] mt-0.5">
                  Call / WhatsApp: {settings.whatsappNumber || '076 859 7800'}
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
