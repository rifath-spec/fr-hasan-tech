import { EstimateService, EstimateItem, EstimateCalculation, EstimateSize } from '../types';

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
  const minQ = service.minQuantity || 1;
  const maxQ = service.maxQuantity || 99999;
  const quantity = Math.max(minQ, Math.min(maxQ, Math.floor(rawQty || 1)));
  const copies = Math.max(1, Math.min(999, Math.floor(rawCopies || 1)));

  // 2. Base Unit Price
  let unitPrice = service.basePrice || service.pricePerUnit || 0;

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

  // 4. Color Option Adjustment
  if (service.supportedOptions?.hasColorOption && color) {
    if (color === 'Colour') {
      const colorAdj = service.supportedOptions.colorPrices?.colorPriceAdjustment ?? (service.name.toLowerCase().includes('colour') ? 0 : 35);
      unitPrice += colorAdj;
    } else if (color === 'Black & White') {
      const bwAdj = service.supportedOptions.colorPrices?.bwPriceAdjustment ?? 0;
      unitPrice += bwAdj;
    }
  }

  // 5. Sides Option (Single Side vs Double Side)
  if (service.supportedOptions?.hasSidesOption && sides) {
    if (sides === 'Double Side') {
      // Double side is usually 1.8x or +base price minus paper savings
      const doubleAdj = service.supportedOptions.sidesPrices?.doublePriceAdjustment ?? (unitPrice * 0.8);
      unitPrice += doubleAdj;
    }
  }

  // 6. Lamination Thickness Adjustment
  if (service.supportedOptions?.hasThicknessOption && thickness) {
    const thicknessMap = service.supportedOptions.thicknessPrices || {
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
  if (service.supportedOptions?.hasBindingOption && bindingType) {
    const bindingMap = service.supportedOptions.bindingPrices || {
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
    unitPrice: service.basePrice,
    calculatedUnitPrice: unitPrice,
    total,
    quantity,
    copies,
    details,
  };
};

export const calculateEstimateSummary = (items: EstimateItem[]): EstimateCalculation => {
  const subtotal = items.reduce((sum, item) => sum + (item.itemTotal || 0), 0);
  const roundedTotal = Math.round(subtotal * 100) / 100;

  return {
    items,
    itemCount: items.length,
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
  if (!items || items.length === 0) {
    return `Hello ${shopName}, I would like to inquire about your printing and photocopy services.`;
  }

  let text = `*${shopName.toUpperCase()} - INSTANT ESTIMATE*\n`;
  text += `==================================\n\n`;
  text += `*Estimate Items (${items.length}):*\n\n`;

  items.forEach((item, index) => {
    text += `${index + 1}. *${item.serviceName}*\n`;
    
    // Quantity & Unit
    if (item.copies > 1) {
      text += `   • ${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''} × ${item.copies} copies\n`;
    } else {
      text += `   • ${item.quantity} ${item.unit}${item.quantity > 1 ? 's' : ''}\n`;
    }

    // Options breakdown
    const optionList: string[] = [];
    if (item.selectedSize) {
      optionList.push(`Size: ${item.selectedSize.name}`);
    }
    if (item.selectedOptions.color) {
      optionList.push(item.selectedOptions.color);
    }
    if (item.selectedOptions.sides) {
      optionList.push(item.selectedOptions.sides);
    }
    if (item.selectedOptions.thickness) {
      optionList.push(`Thickness: ${item.selectedOptions.thickness}`);
    }
    if (item.selectedOptions.bindingType) {
      optionList.push(`Binding: ${item.selectedOptions.bindingType}`);
    }
    if (item.selectedOptions.notes) {
      optionList.push(`Note: ${item.selectedOptions.notes}`);
    }

    if (optionList.length > 0) {
      text += `   • ${optionList.join(' | ')}\n`;
    }

    text += `   • Rate: ${formatCurrency(item.calculatedUnitPrice)} / ${item.unit}\n`;
    text += `   • *Subtotal: ${formatCurrency(item.itemTotal)}*\n\n`;
  });

  text += `==================================\n`;
  text += `*ESTIMATED TOTAL: ${formatCurrency(calculation.estimatedTotal)}*\n`;
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
