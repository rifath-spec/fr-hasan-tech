import { EstimateService, EstimateItem, EstimateCalculation, EstimateSize, ServiceItem, EstimateCategory } from '../types';

export const formatCurrency = (amount: number): string => {
  const safeAmount = isNaN(amount) ? 0 : amount;
  return `Rs. ${safeAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export interface CalculateItemInput {
  service: EstimateService;
  quantity: number;
  copies?: number;
  selectedSize?: EstimateSize | null;
  customWidthMm?: number;
  customHeightMm?: number;
  customLabel?: string;
  color?: 'Black & White' | 'Colour';
  sides?: 'Single Side' | 'Double Side';
  thickness?: string;
  bindingType?: string;
  paperWeight?: string;
  additionalNotes?: string;
}

export const calculateItemTotal = (input: CalculateItemInput): {
  unitPrice: number;
  calculatedUnitPrice: number;
  total: number;
  quantity: number;
  copies: number;
  details: string;
} => {
  if (!input || !input.service) {
    return {
      unitPrice: 0,
      calculatedUnitPrice: 0,
      total: 0,
      quantity: 1,
      copies: 1,
      details: '',
    };
  }

  const {
    service,
    quantity: rawQty,
    copies: rawCopies = 1,
    selectedSize,
    customWidthMm,
    customHeightMm,
    color,
    sides,
    thickness,
    bindingType,
    paperWeight,
  } = input;

  // 1. Quantity Sanitization & Constraints
  const minQ = Number(service?.minQuantity) || 1;
  const maxQ = Number(service?.maxQuantity) || 99999;
  const quantity = Math.max(minQ, Math.min(maxQ, Math.floor(rawQty || 1)));
  const copies = Math.max(1, Math.min(999, Math.floor(rawCopies || 1)));

  // 2. Base Unit Price
  let unitPrice = Number(service?.basePrice ?? service?.pricePerUnit ?? 0);

  // 3. Size Multiplier / Adjustment
  if (selectedSize) {
    if (selectedSize.priceMultiplier && selectedSize.priceMultiplier > 0 && selectedSize.code !== 'A4') {
      unitPrice = unitPrice * selectedSize.priceMultiplier;
    }
  } else if (customWidthMm && customHeightMm) {
    // Custom size area scaling (relative to standard A4 210x297 = 62,370 mm²)
    const standardA4Area = 210 * 297;
    const customArea = Math.max(100, customWidthMm * customHeightMm);
    const areaRatio = Math.max(0.5, Math.min(10, customArea / standardA4Area));
    unitPrice = Math.round(unitPrice * areaRatio);
  }

  const supportedOptions = service?.supportedOptions || {};
  const serviceName = (service?.name || '').toLowerCase();

  // 4. Color Option Adjustment
  if (supportedOptions.hasColorOption && color) {
    if (color === 'Colour') {
      const colorAdj = supportedOptions.colorPrices?.colorPriceAdjustment ?? (serviceName.includes('colour') || serviceName.includes('color') ? 0 : 35);
      unitPrice += colorAdj;
    } else if (color === 'Black & White') {
      const bwAdj = supportedOptions.colorPrices?.bwPriceAdjustment ?? 0;
      unitPrice += bwAdj;
    }
  }

  // 5. Sides Option (Single Side vs Double Side)
  if (supportedOptions.hasSidesOption && sides) {
    if (sides === 'Double Side') {
      const doubleAdj = supportedOptions.sidesPrices?.doublePriceAdjustment ?? (unitPrice * 0.8);
      unitPrice += doubleAdj;
    }
  }

  // 6. Lamination Thickness Adjustment
  if (supportedOptions.hasThicknessOption && thickness) {
    const thicknessMap = supportedOptions.thicknessPrices || {
      '80 micron': 0,
      '100 micron': 0,
      '125 micron': 20,
      '150 micron': 40,
      '175 micron': 60,
      '200 micron': 80,
    };
    if (thicknessMap[thickness] !== undefined) {
      unitPrice += thicknessMap[thickness];
    }
  }

  // 7. Binding / Extra Options
  if (supportedOptions.hasBindingOption && bindingType) {
    const bindingMap = supportedOptions.bindingPrices || {
      'Spiral Binding (Plastic)': 150,
      'Wire-O Binding': 250,
      'Tape / Soft Cover': 100,
      'Hard Cover Book': 450,
    };
    if (bindingMap[bindingType] !== undefined) {
      unitPrice += bindingMap[bindingType];
    }
  }

  // Ensure unitPrice is not negative and rounded to 2 decimals
  unitPrice = Math.max(1, Math.round(unitPrice * 100) / 100);

  // 8. Total = unitPrice * quantity * copies
  const total = Math.round(unitPrice * quantity * copies * 100) / 100;

  // 9. Formatted summary details
  const detailsParts: string[] = [];
  if (selectedSize) {
    detailsParts.push(selectedSize.name);
  } else if (customWidthMm && customHeightMm) {
    detailsParts.push(`Custom (${customWidthMm}×${customHeightMm} mm)`);
  }
  if (color) detailsParts.push(color);
  if (sides) detailsParts.push(sides);
  if (thickness) detailsParts.push(thickness);
  if (bindingType) detailsParts.push(bindingType);
  if (paperWeight) detailsParts.push(paperWeight);

  const details = detailsParts.join(' • ');

  return {
    unitPrice: service.basePrice || 0,
    calculatedUnitPrice: unitPrice,
    total,
    quantity,
    copies,
    details,
  };
};

export const calculateEstimateSummary = (items: EstimateItem[]): EstimateCalculation => {
  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = safeItems.reduce((sum, item) => sum + (item?.itemTotal || 0), 0);
  const roundedTotal = Math.round(subtotal * 100) / 100;

  return {
    items: safeItems,
    itemCount: safeItems.length,
    subtotal: roundedTotal,
    estimatedTotal: roundedTotal,
    currency: 'Rs.',
    disclaimer: 'Final price may vary depending on the actual document, paper type, size, quality and requirements. This is an instant estimate, not a final invoice.',
  };
};

export const generateEstimateWhatsAppText = (
  items: EstimateItem[],
  calculation: EstimateCalculation,
  shopName: string = 'FR.HASAN TECH'
): string => {
  const safeItems = Array.isArray(items) ? items : [];
  if (safeItems.length === 0) {
    return `Hello ${shopName}, I would like to inquire about your printing and photocopy services.`;
  }

  let text = `*${shopName.toUpperCase()} - INSTANT ESTIMATE*\n`;
  text += `==================================\n\n`;
  text += `*Estimate Items (${safeItems.length}):*\n\n`;

  safeItems.forEach((item, index) => {
    if (!item) return;
    text += `${index + 1}. *${item.serviceName || 'Service'}*\n`;
    
    // Quantity & Unit
    const unit = item.unit || 'unit';
    if (item.copies > 1) {
      text += `   • ${item.quantity} ${unit}${item.quantity > 1 ? 's' : ''} × ${item.copies} copies\n`;
    } else {
      text += `   • ${item.quantity} ${unit}${item.quantity > 1 ? 's' : ''}\n`;
    }

    // Options breakdown
    const optionList: string[] = [];
    if (item.selectedSize?.name) {
      optionList.push(`Size: ${item.selectedSize.name}`);
    }
    const opts = item.selectedOptions || {};
    if (opts.color) {
      optionList.push(opts.color);
    }
    if (opts.sides) {
      optionList.push(opts.sides);
    }
    if (opts.thickness) {
      optionList.push(`Thickness: ${opts.thickness}`);
    }
    if (opts.bindingType) {
      optionList.push(`Binding: ${opts.bindingType}`);
    }
    if (opts.notes) {
      optionList.push(`Note: ${opts.notes}`);
    }

    if (optionList.length > 0) {
      text += `   • ${optionList.join(' | ')}\n`;
    }

    text += `   • Rate: ${formatCurrency(item.calculatedUnitPrice || 0)} / ${unit}\n`;
    text += `   • *Subtotal: ${formatCurrency(item.itemTotal || 0)}*\n\n`;
  });

  const grandTotal = calculation?.estimatedTotal ?? 0;
  text += `==================================\n`;
  text += `*ESTIMATED TOTAL: ${formatCurrency(grandTotal)}*\n`;
  text += `==================================\n\n`;
  text += `"Hello ${shopName}, I would like to proceed with this estimate. I will send my documents after confirming the requirements."`;

  return text;
};

export const STANDARD_SIZE_GROUPS = [
  { id: 'ISO_A', label: 'ISO A Series (Standard Printing)', description: 'A0 to A10 standards' },
  { id: 'ISO_B', label: 'ISO B Series (Posters & Books)', description: 'B0 to B10' },
  { id: 'ISO_C', label: 'ISO C Series (Envelopes)', description: 'C0 to C10' },
  { id: 'US_ANSI', label: 'US ANSI Series', description: 'ANSI A (Letter) to ANSI E' },
  { id: 'US_COMMON', label: 'US Common Standards', description: 'Legal, Tabloid, Statement, Executive' },
  { id: 'JIS', label: 'Japanese Standards (JIS B)', description: 'JIS B4, B5' },
  { id: 'ARCHITECTURAL', label: 'Architectural Drawings (ARCH)', description: 'ARCH A to ARCH E' },
  { id: 'PHOTO', label: 'Standard Photo Prints', description: 'Passport, Stamp, 4R, 5R, 8R, 10R' },
  { id: 'ID_CARD', label: 'ID Cards & Badges', description: 'Standard CR80, Driver License' },
  { id: 'LAMINATION', label: 'Lamination Pouches', description: 'Standard pouches with edge margin' },
  { id: 'CUSTOM', label: 'Custom Dimension', description: 'Enter any width & height' }
];

export const convertLength = (value: number, from: 'mm' | 'cm' | 'in', to: 'mm' | 'cm' | 'in'): number => {
  if (from === to) return value;
  let mm = value;
  if (from === 'cm') mm = value * 10;
  if (from === 'in') mm = value * 25.4;

  if (to === 'mm') return Math.round(mm * 100) / 100;
  if (to === 'cm') return Math.round((mm / 10) * 100) / 100;
  if (to === 'in') return Math.round((mm / 25.4) * 100) / 100;
  return mm;
};

// Aliases for component imports
export const calculateEstimateItemTotal = calculateItemTotal;
export const calculateMultipleItemsTotal = calculateEstimateSummary;
export const generateEstimateWhatsAppMessage = generateEstimateWhatsAppText;

/**
 * Maps a catalog ServiceItem (from the database `services` table) into an EstimateService
 * with auto-detected base price, units, categories, and applicable calculation options.
 */
export const mapServiceItemToEstimateService = (service: ServiceItem): EstimateService => {
  const cleanPriceStr = (service.priceInfo || '').replace(/,/g, '');
  const priceMatch = cleanPriceStr.match(/(?:Rs\.?|LKR)\s*([\d.]+)/i) || cleanPriceStr.match(/([\d.]+)/);
  const parsedBasePrice = priceMatch ? parseFloat(priceMatch[1]) : 10;
  
  // Extract unit from priceInfo e.g. "/ page", "/ copy", "/ pouch", "/ book", "/ set", "/ card", "/ sheet"
  const unitMatch = cleanPriceStr.match(/\/\s*([a-zA-Z& ]+)/);
  let parsedUnit = unitMatch ? unitMatch[1].trim() : '';
  if (!parsedUnit) {
    const catLower = (service.category || '').toLowerCase();
    const nameLower = (service.name || '').toLowerCase();
    if (catLower.includes('laminat') || nameLower.includes('laminat')) parsedUnit = 'Pouch';
    else if (catLower.includes('bind') || nameLower.includes('bind')) parsedUnit = 'Book';
    else if (catLower.includes('photo') || nameLower.includes('photo') || nameLower.includes('passport')) parsedUnit = 'Set';
    else if (catLower.includes('id') || nameLower.includes('id') || nameLower.includes('card')) parsedUnit = 'Card';
    else if (catLower.includes('sim') || nameLower.includes('sim')) parsedUnit = 'SIM';
    else if (catLower.includes('package') || nameLower.includes('package')) parsedUnit = 'Plan';
    else if (catLower.includes('sticker') || nameLower.includes('sticker')) parsedUnit = 'Sheet';
    else parsedUnit = 'Page';
  }

  // Determine category ID matching estimate categories or based on service category
  const catLower = (service.category || '').toLowerCase();
  const nameLower = (service.name || '').toLowerCase();
  const catSlug = (service.category || 'general').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  let categoryId = `cat-${catSlug}`;
  if (catLower.includes('photocopy') || nameLower.includes('photocopy')) categoryId = 'cat-photocopy';
  else if (catLower.includes('colour') || catLower.includes('color') || nameLower.includes('colour') || nameLower.includes('color')) categoryId = 'cat-colour-printing';
  else if (catLower.includes('print') || nameLower.includes('print')) categoryId = 'cat-printing';
  else if (catLower.includes('laminat') || nameLower.includes('laminat')) categoryId = 'cat-lamination';
  else if (catLower.includes('scan') || nameLower.includes('scan')) categoryId = 'cat-scanning';
  else if (catLower.includes('bind') || nameLower.includes('bind')) categoryId = 'cat-binding';
  else if (catLower.includes('photo') || nameLower.includes('photo') || nameLower.includes('passport')) categoryId = 'cat-photo-printing';
  else if (catLower.includes('id') || catLower.includes('card') || nameLower.includes('card')) categoryId = 'cat-id-services';

  const isPrintOrCopy = catLower.includes('print') || catLower.includes('copy') || nameLower.includes('print') || nameLower.includes('copy');
  const isLamination = catLower.includes('laminat') || nameLower.includes('laminat');
  const isBinding = catLower.includes('bind') || nameLower.includes('bind');
  const isScanning = catLower.includes('scan') || nameLower.includes('scan');

  return {
    id: service.id || `srv-${catSlug}`,
    categoryId,
    name: service.name,
    description: service.shortDescription || service.fullDescription || service.name,
    unit: parsedUnit,
    basePrice: parsedBasePrice || 10,
    pricePerUnit: parsedBasePrice || 10,
    minQuantity: 1,
    pricingModel: isBinding ? 'per_unit' : (isLamination ? 'per_unit' : 'per_page'),
    allowedSizeGroups: ['ISO_A', 'US_ANSI', 'ISO_B', 'PHOTO', 'ID_CARD'],
    supportedOptions: {
      hasColorOption: isPrintOrCopy || isScanning,
      colorPrices: { bwPriceAdjustment: 0, colorPriceAdjustment: (nameLower.includes('colour') || nameLower.includes('color')) ? 0 : 25 },
      hasSidesOption: isPrintOrCopy,
      sidesPrices: { singlePriceAdjustment: 0, doublePriceAdjustment: Math.round(parsedBasePrice * 0.8) },
      hasSizesOption: true,
      hasThicknessOption: isLamination,
      thicknessPrices: isLamination ? {
        '80 micron': 0,
        '100 micron': 0,
        '125 micron': 20,
        '150 micron': 35,
        '250 micron (Rigid)': 60,
      } : undefined,
      hasBindingOption: isBinding,
      bindingPrices: isBinding ? {
        'Plastic Comb Binding (Standard)': 0,
        'Spiral Coil Binding': 50,
        'Wire-O Metal Binding': 100,
        'Hard Cover Project Book': 200,
      } : undefined,
    },
    active: service.status === 'Active' && service.isPublished !== false,
    sortOrder: 50,
  };
};

/**
 * Combines estimateServices and all active services from the database table.
 */
export const getUnifiedEstimateServices = (
  estimateServices: EstimateService[] = [],
  databaseServices: ServiceItem[] = []
): EstimateService[] => {
  const result: EstimateService[] = [...(Array.isArray(estimateServices) ? estimateServices : [])];
  const existingIds = new Set(result.map(s => s.id));
  const existingNames = new Set(result.map(s => (s.name || '').toLowerCase().trim()));

  // Add all active services from the database table that are not already present
  if (Array.isArray(databaseServices)) {
    databaseServices.forEach((dbServ) => {
      if (!dbServ || dbServ.status === 'Inactive' || dbServ.isPublished === false) return;
      const normalizedName = (dbServ.name || '').toLowerCase().trim();
      
      // If service is not in estimateServices by id or by identical name, map and add it
      if (!existingIds.has(dbServ.id) && !existingNames.has(normalizedName)) {
        const mapped = mapServiceItemToEstimateService(dbServ);
        result.push(mapped);
        existingIds.add(mapped.id);
        existingNames.add(normalizedName);
      }
    });
  }

  return result;
};

/**
 * Synthesizes dynamic category entries for any categories present in the database services.
 */
export const getUnifiedEstimateCategories = (
  estimateCategories: EstimateCategory[] = [],
  databaseServices: ServiceItem[] = []
): EstimateCategory[] => {
  const result: EstimateCategory[] = [...(Array.isArray(estimateCategories) ? estimateCategories : [])];
  const existingCatIds = new Set(result.map(c => c.id));
  const existingCatNames = new Set(result.map(c => (c.name || '').toLowerCase().trim()));

  if (Array.isArray(databaseServices)) {
    databaseServices.forEach((dbServ) => {
      if (!dbServ || !dbServ.category) return;
      const catName = dbServ.category.trim();
      const normCatName = catName.toLowerCase();
      
      if (!existingCatNames.has(normCatName)) {
        const catSlug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const newCatId = `cat-${catSlug}`;
        
        if (!existingCatIds.has(newCatId)) {
          const icon = 
            normCatName.includes('photo') ? 'Copy' :
            normCatName.includes('print') ? 'Printer' :
            normCatName.includes('laminat') ? 'Shield' :
            normCatName.includes('scan') ? 'Scan' :
            normCatName.includes('bind') ? 'BookOpen' :
            normCatName.includes('sim') ? 'Smartphone' :
            normCatName.includes('package') ? 'Package' :
            'FileText';

          const newCat: EstimateCategory = {
            id: newCatId,
            name: catName,
            description: `Professional ${catName} services with live instant estimation`,
            icon,
            active: true,
            sortOrder: 50 + result.length,
          };
          result.push(newCat);
          existingCatIds.add(newCatId);
          existingCatNames.add(normCatName);
        }
      }
    });
  }

  return result;
};

