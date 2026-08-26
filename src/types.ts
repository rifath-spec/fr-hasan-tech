export type NetworkProvider = 'Dialog' | 'Mobitel' | 'Hutch' | 'Airtel' | 'SLT-Mobitel';

export type ServiceCategory = 'Photocopy' | 'Printing' | 'SIM Cards' | 'Packages';

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

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  category: ServiceCategory;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  priceInfo: string;
  availableServicesList: string[];
  importantNotes: string[];
  status: 'Active' | 'Inactive';
  isPublished: boolean;
  image?: string;
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
