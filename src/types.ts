export type NetworkProvider = 'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel' | 'SLT-Mobitel';

export type ServiceCategory = 
  | 'Printing'
  | 'Visiting Cards'
  | 'Invitation Card'
  | 'Certificate Design'
  | 'CV Creation'
  | 'Microsoft Office Installation'
  | 'Windows Installation'
  | 'Document Printing'
  | 'Packages'
  | 'SIM Cards'
  | 'Photocopy'
  | string;

export type SIMStatus = 'Available' | 'Reserved' | 'Sold' | 'Returned' | 'Damaged';

export type SIMType = 'Standard Prepaid 4G/5G' | 'Postpaid SIM' | 'eSIM' | 'Home Broadband Router SIM' | 'Tourist SIM';

export type PackageCategory = 
  | 'Mobile SIM Plans' 
  | 'Home Broadband (Router / Wi-Fi)' 
  | 'Social & Streaming' 
  | 'Work & Study' 
  | 'DTV & Satellite TV' 
  | 'Special / Tourist';

export type TransactionType = 'sale' | 'expense';

export type PaymentMethod = 'Cash' | 'Card' | 'Bank Transfer' | 'Other';

export interface ServicePackage {
  id?: string;
  name: string; // e.g. "Plus", "Premium", "Pro", "Wedding Invitation"
  price: number;
  currency?: string; // Default "LKR"
  description?: string;
  features?: string[];
  active?: boolean;
}

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  description?: string;
  priceInfo: string;
  singlePrice?: number;
  unit?: string;
  image?: string;
  imageUrl?: string;
  galleryImages?: string[];
  featured?: boolean;
  active?: boolean;
  status: 'Active' | 'Inactive';
  isPublished: boolean;
  sortOrder?: number;
  packages?: ServicePackage[];
  availableServicesList: string[];
  importantNotes: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SIMCard {
  id: string;
  network: NetworkProvider;
  simType?: SIMType;
  simNumber: string;
  iccid: string;
  package: string;
  category?: PackageCategory;
  purchasePrice: number;
  sellingPrice: number;
  status: SIMStatus;
  receivedDate: string;
  soldDate?: string;
  notes?: string;
}

export interface MobilePackage {
  id: string;
  network: NetworkProvider;
  category?: PackageCategory;
  name: string;
  type: string; // 'Data' | 'Voice' | 'Combo' | 'Home Broadband' | 'Social' | 'Unlimited' | 'Work & Study' | 'Reload' | string
  description: string;
  price: number;
  status: 'Active' | 'Inactive';
  displayOrder: number;
  validity?: string;
  quota?: string;
  speed?: string;
  features?: string[];
  badge?: string;
  ussdCode?: string;
  billingType?: 'Prepaid' | 'Postpaid' | 'Both';
}

export interface POSTransaction {
  id: string;
  type: TransactionType;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (e.g. 10:30 AM)
  category: string; // Service category or Expense category
  subType?: string; // e.g. "Black & White (A4)"
  description: string;
  quantity?: number;
  unitPrice?: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  vendor?: string;
  referenceNumber?: string;
  simCardId?: string;
  receiptUrl?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DaySchedule {
  day: string;
  hours: string;
  note?: string;
}

export interface OpeningHours {
  monFri: string;
  sat: string;
  sun: string;
  scheduleList?: DaySchedule[];
  closedDays?: string[];
  note?: string;
}

export interface ShopSettings {
  shopName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  heroBackgroundUrl?: string;
  whatsappNumber: string;
  whatsappGroupUrl?: string;
  phoneNumber: string;
  email: string;
  address: string;
  plusCode?: string;
  mapEmbedUrl?: string;
  googleMapsUrl: string;
  openingHours: OpeningHours;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
  heroContent: {
    title: string;
    tagline: string;
    description: string;
    backgroundImageUrl?: string;
  };
  aboutContent: {
    title: string;
    subtitle: string;
    story: string;
    mission: string;
    ceoName?: string;
    ceoTitle?: string;
    ceoPhoto?: string;
    ceoBio?: string;
    ceoQuote?: string;
  };
  posSettings: {
    defaultPaymentMethod: PaymentMethod;
    currencySymbol: string;
    taxRate: number;
    receiptHeader: string;
    receiptFooter: string;
    enableExpenseTracking: boolean;
    serviceSubTypes: Record<string, string[]>;
  };
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

// ============================================================================
// INSTANT ESTIMATE CALCULATOR DOMAIN TYPES
// ============================================================================

export type UnitOfLength = 'mm' | 'cm' | 'in';

export interface SupportedOptionFlags {
  hasColorOption?: boolean;
  colorPrices?: { bwPriceAdjustment: number; colorPriceAdjustment: number };
  hasSidesOption?: boolean;
  sidesPrices?: { singlePriceAdjustment: number; doublePriceAdjustment: number };
  hasSizesOption?: boolean;
  hasThicknessOption?: boolean;
  thicknessPrices?: Record<string, number>;
  hasBindingOption?: boolean;
  bindingPrices?: Record<string, number>;
  hasPaperWeightOption?: boolean;
  paperWeightPrices?: Record<string, number>;
  hasCustomDimensions?: boolean;
  minWidthMm?: number;
  maxWidthMm?: number;
  minHeightMm?: number;
  maxHeightMm?: number;
}

export type EstimateSizeGroup = 
  | 'ISO_A' 
  | 'ISO_B' 
  | 'ISO_C' 
  | 'US_ANSI' 
  | 'US_COMMON' 
  | 'JIS' 
  | 'ARCHITECTURAL' 
  | 'PHOTO' 
  | 'ID_CARD' 
  | 'LAMINATION' 
  | 'CUSTOM';

export interface EstimateSize {
  id: string;
  name: string;
  code: string;
  sizeGroup: EstimateSizeGroup;
  widthMm: number;
  heightMm: number;
  widthIn?: number;
  heightIn?: number;
  sizeType: 'document' | 'pouch' | 'photo' | 'card' | 'large_format' | 'custom';
  pouchWidthMm?: number; // Pouch size distinct from document size
  pouchHeightMm?: number;
  priceMultiplier?: number;
  active: boolean;
  sortOrder: number;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstimateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstimateServiceOptionValue {
  label: string;
  value: string;
  priceAdjustment: number; // in LKR or modifier
  isDefault?: boolean;
}

export interface EstimateServiceOption {
  id: string;
  serviceId?: string;
  optionName: string;
  optionType: 'select' | 'radio' | 'checkbox';
  optionValues: EstimateServiceOptionValue[];
  active: boolean;
  sortOrder: number;
}

export interface EstimateService {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  unit: string; // e.g. 'Page', 'Copy', 'Document', 'Pouch', 'Book', 'Set'
  basePrice: number; // Unit price in LKR
  pricePerUnit: number;
  minQuantity: number;
  maxQuantity?: number;
  pricingModel: 'per_unit' | 'per_page' | 'per_copy' | 'fixed' | 'tiered' | 'area_based';
  allowedSizeGroups?: EstimateSizeGroup[];
  allowedSizeIds?: string[];
  supportedOptions?: {
    hasColorOption?: boolean;
    colorPrices?: { bwPriceAdjustment: number; colorPriceAdjustment: number };
    hasSidesOption?: boolean;
    sidesPrices?: { singlePriceAdjustment: number; doublePriceAdjustment: number };
    hasSizesOption?: boolean;
    hasThicknessOption?: boolean;
    thicknessPrices?: Record<string, number>; // e.g. { "80 micron": 0, "100 micron": 10, "125 micron": 20, "150 micron": 30, "200 micron": 50 }
    hasBindingOption?: boolean;
    bindingPrices?: Record<string, number>;
    hasPaperWeightOption?: boolean;
    paperWeightPrices?: Record<string, number>;
    hasCustomDimensions?: boolean;
    minWidthMm?: number;
    maxWidthMm?: number;
    minHeightMm?: number;
    maxHeightMm?: number;
  };
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface EstimateItem {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryName: string;
  unit: string;
  baseUnitPrice: number;
  calculatedUnitPrice: number;
  quantity: number; // e.g. pages or items
  copies: number; // default 1
  selectedSize?: {
    id?: string;
    name: string;
    widthMm: number;
    heightMm: number;
    isCustom?: boolean;
    customLabel?: string;
  };
  selectedOptions: {
    color?: 'Black & White' | 'Colour';
    sides?: 'Single Side' | 'Double Side';
    thickness?: string;
    bindingType?: string;
    paperWeight?: string;
    notes?: string;
    [key: string]: any;
  };
  itemTotal: number;
}

export interface EstimateCalculation {
  items: EstimateItem[];
  itemCount: number;
  subtotal: number;
  estimatedTotal: number;
  currency: string;
  disclaimer: string;
}
