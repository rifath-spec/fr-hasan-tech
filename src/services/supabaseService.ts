import { supabase, getActiveCredentials } from '../lib/supabase';
import { INITIAL_SETTINGS } from '../data/initialData';
import { 
  ServiceItem, 
  SIMCard, 
  MobilePackage, 
  POSTransaction, 
  ShopSettings,
  EstimateCategory,
  EstimateService,
  EstimateSize,
  EstimateServiceOption,
  OfferItem,
  AdminUser
} from '../types';

// ============================================================================
// DATA MAPPERS (Database snake_case <-> Frontend camelCase)
// ============================================================================

const normalizeCategoryForLegacyConstraint = (category?: string): string => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('photo') || cat.includes('copy') || cat.includes('scan') || cat.includes('laminat')) return 'Photocopy';
  if (cat.includes('sim') || cat.includes('esim')) return 'SIM Cards';
  if (cat.includes('package') || cat.includes('reload') || cat.includes('broadband') || cat.includes('plan')) return 'Packages';
  // Default fallback for Computer Services, Design & Documentation, Visiting Cards, Invitations, CV, Certificates, etc.
  return 'Printing';
};

/**
 * Builds cascading column payloads for services to be compatible with any Supabase schema version.
 */
const buildServicePayloadTiers = (service: Partial<ServiceItem>, forceLegacyCategory = false) => {
  const id = service.id || `serv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const category = forceLegacyCategory ? normalizeCategoryForLegacyConstraint(service.category) : (service.category || 'Printing');
  
  // Tier 1: Full modern schema payload
  const tier1Full = mapServiceToDB({ ...service, id, category });

  // Tier 2: Standard schema (without new packages/gallery/seo columns)
  const tier2Standard: Record<string, any> = {
    id,
    slug: service.slug || `service-${Date.now()}`,
    name: service.name || '',
    category,
    icon: service.icon || 'Printer',
    short_description: service.shortDescription || '',
    full_description: service.fullDescription || service.description || '',
    price_info: service.priceInfo || (service.singlePrice ? `LKR ${service.singlePrice}` : 'Contact for pricing'),
    image: service.image || service.imageUrl || null,
    available_services_list: Array.isArray(service.availableServicesList) ? service.availableServicesList : [],
    important_notes: Array.isArray(service.importantNotes) ? service.importantNotes : [],
    status: service.status || 'Active',
    is_published: service.isPublished ?? true,
  };

  // Tier 3: Core basic schema
  const tier3Core: Record<string, any> = {
    id,
    slug: service.slug || `service-${Date.now()}`,
    name: service.name || '',
    category,
    short_description: service.shortDescription || '',
    full_description: service.fullDescription || service.description || '',
    price_info: service.priceInfo || 'Contact for pricing',
    image: service.image || service.imageUrl || null,
  };

  // Tier 4: Absolute minimum schema
  const tier4Minimal: Record<string, any> = {
    id,
    slug: service.slug || `service-${Date.now()}`,
    name: service.name || '',
    category,
  };

  return [tier1Full, tier2Standard, tier3Core, tier4Minimal];
};

export const mapEstimateCategoryFromDB = (row: any): EstimateCategory => ({
  id: String(row.id),
  name: row.name || '',
  description: row.description || '',
  icon: row.icon || 'Layers',
  active: row.active ?? true,
  sortOrder: Number(row.sort_order) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapEstimateCategoryToDB = (item: Partial<EstimateCategory>) => ({
  ...(item.id ? { id: item.id } : {}),
  ...(item.name !== undefined ? { name: item.name } : {}),
  description: item.description || '',
  icon: item.icon || 'Layers',
  active: item.active !== undefined ? item.active : true,
  sort_order: item.sortOrder !== undefined ? Number(item.sortOrder) : 0,
});

export const mapEstimateSizeFromDB = (row: any): EstimateSize => ({
  id: String(row.id),
  name: row.name || '',
  code: row.code || '',
  sizeGroup: row.size_group || 'ISO_A',
  widthMm: Number(row.width_mm) || 0,
  heightMm: Number(row.height_mm) || 0,
  widthIn: row.width_in ? Number(row.width_in) : undefined,
  heightIn: row.height_in ? Number(row.height_in) : undefined,
  sizeType: row.size_type || 'document',
  pouchWidthMm: row.pouch_width_mm ? Number(row.pouch_width_mm) : undefined,
  pouchHeightMm: row.pouch_height_mm ? Number(row.pouch_height_mm) : undefined,
  priceMultiplier: row.price_multiplier !== undefined ? Number(row.price_multiplier) : 1.0,
  active: row.active ?? true,
  sortOrder: Number(row.sort_order) || 0,
  isCustom: row.is_custom ?? false,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapEstimateSizeToDB = (item: Partial<EstimateSize>) => ({
  ...(item.id ? { id: item.id } : {}),
  ...(item.name !== undefined ? { name: item.name } : {}),
  code: item.code || '',
  size_group: item.sizeGroup || 'ISO_A',
  width_mm: item.widthMm !== undefined ? Number(item.widthMm) : 0,
  height_mm: item.heightMm !== undefined ? Number(item.heightMm) : 0,
  width_in: item.widthIn !== undefined ? Number(item.widthIn) : null,
  height_in: item.heightIn !== undefined ? Number(item.heightIn) : null,
  size_type: item.sizeType || 'document',
  pouch_width_mm: item.pouchWidthMm !== undefined ? Number(item.pouchWidthMm) : null,
  pouch_height_mm: item.pouchHeightMm !== undefined ? Number(item.pouchHeightMm) : null,
  price_multiplier: item.priceMultiplier !== undefined ? Number(item.priceMultiplier) : 1.0,
  active: item.active !== undefined ? item.active : true,
  sort_order: item.sortOrder !== undefined ? Number(item.sortOrder) : 0,
  is_custom: item.isCustom !== undefined ? item.isCustom : false,
});

export const mapEstimateServiceFromDB = (row: any): EstimateService => ({
  id: String(row.id),
  categoryId: row.category_id || '',
  name: row.name || '',
  description: row.description || '',
  unit: row.unit || 'Page',
  basePrice: Number(row.base_price) || 0,
  pricePerUnit: Number(row.price_per_unit || row.base_price) || 0,
  minQuantity: Number(row.min_quantity) || 1,
  maxQuantity: row.max_quantity ? Number(row.max_quantity) : undefined,
  pricingModel: row.pricing_model || 'per_page',
  allowedSizeGroups: Array.isArray(row.allowed_size_groups) ? row.allowed_size_groups : undefined,
  allowedSizeIds: Array.isArray(row.allowed_size_ids) ? row.allowed_size_ids : undefined,
  supportedOptions: row.supported_options || {
    hasSizesOption: true,
    hasColorOption: false,
    hasSidesOption: false,
    hasThicknessOption: false,
    hasBindingOption: false,
  },
  active: row.active ?? true,
  sortOrder: Number(row.sort_order) || 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapEstimateServiceToDB = (item: Partial<EstimateService>) => ({
  ...(item.id ? { id: item.id } : {}),
  category_id: item.categoryId || '',
  ...(item.name !== undefined ? { name: item.name } : {}),
  description: item.description || '',
  unit: item.unit || 'Page',
  base_price: item.basePrice !== undefined ? Number(item.basePrice) : 0,
  price_per_unit: item.pricePerUnit !== undefined ? Number(item.pricePerUnit) : (item.basePrice !== undefined ? Number(item.basePrice) : 0),
  min_quantity: item.minQuantity !== undefined ? Number(item.minQuantity) : 1,
  max_quantity: item.maxQuantity !== undefined ? Number(item.maxQuantity) : null,
  pricing_model: item.pricingModel || 'per_page',
  allowed_size_groups: Array.isArray(item.allowedSizeGroups) ? item.allowedSizeGroups : [],
  allowed_size_ids: Array.isArray(item.allowedSizeIds) ? item.allowedSizeIds : [],
  supported_options: item.supportedOptions || {},
  active: item.active !== undefined ? item.active : true,
  sort_order: item.sortOrder !== undefined ? Number(item.sortOrder) : 0,
});

export const mapServiceFromDB = (row: any): ServiceItem => {
  let packagesList = [];
  if (Array.isArray(row.packages)) {
    packagesList = row.packages;
  } else if (typeof row.packages === 'string') {
    try {
      packagesList = JSON.parse(row.packages);
    } catch {
      packagesList = [];
    }
  }

  let galleryList = [];
  if (Array.isArray(row.gallery_images)) {
    galleryList = row.gallery_images;
  } else if (typeof row.gallery_images === 'string') {
    try {
      galleryList = JSON.parse(row.gallery_images);
    } catch {
      galleryList = [];
    }
  }

  let keywordsList: string[] = [];
  if (Array.isArray(row.seo_keywords)) {
    keywordsList = row.seo_keywords;
  } else if (typeof row.seo_keywords === 'string') {
    try {
      const parsed = JSON.parse(row.seo_keywords);
      if (Array.isArray(parsed)) keywordsList = parsed;
      else keywordsList = row.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    } catch {
      keywordsList = row.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean);
    }
  }

  const isActive = row.active !== undefined 
    ? Boolean(row.active) 
    : (row.status !== 'Inactive' && (row.is_published ?? true));

  return {
    id: String(row.id),
    slug: row.slug || '',
    name: row.name || '',
    category: row.category || 'Printing',
    icon: row.icon || 'Printer',
    shortDescription: row.short_description || row.shortDescription || '',
    fullDescription: row.full_description || row.description || row.fullDescription || '',
    description: row.full_description || row.description || row.fullDescription || '',
    priceInfo: row.price_info || row.priceInfo || '',
    singlePrice: row.single_price !== undefined && row.single_price !== null ? Number(row.single_price) : undefined,
    unit: row.unit || undefined,
    image: row.image || row.image_url || row.imageUrl || undefined,
    imageUrl: row.image_url || row.image || row.imageUrl || undefined,
    galleryImages: galleryList,
    featured: row.featured === true || row.is_featured === true,
    active: isActive,
    status: row.status || (isActive ? 'Active' : 'Inactive'),
    isPublished: row.is_published ?? isActive,
    sortOrder: Number(row.sort_order ?? row.sortOrder ?? 0),
    packages: packagesList,
    availableServicesList: Array.isArray(row.available_services_list) ? row.available_services_list : [],
    importantNotes: Array.isArray(row.important_notes) ? row.important_notes : [],
    seoTitle: row.seo_title || row.seoTitle || undefined,
    seoDescription: row.seo_description || row.seoDescription || undefined,
    seoKeywords: keywordsList,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapServiceToDB = (item: Partial<ServiceItem>) => {
  const payload: Record<string, any> = {};
  if (item.id) payload.id = item.id;
  if (item.slug !== undefined) payload.slug = item.slug;
  if (item.name !== undefined) payload.name = item.name;
  if (item.category !== undefined) payload.category = item.category;
  if (item.icon !== undefined) payload.icon = item.icon;
  if (item.shortDescription !== undefined) payload.short_description = item.shortDescription;
  if (item.fullDescription !== undefined || item.description !== undefined) {
    payload.full_description = item.fullDescription || item.description || '';
  }
  if (item.priceInfo !== undefined) payload.price_info = item.priceInfo;
  if (item.image !== undefined || item.imageUrl !== undefined) {
    payload.image = item.image || item.imageUrl || null;
  }
  if (item.availableServicesList !== undefined) {
    payload.available_services_list = Array.isArray(item.availableServicesList) ? item.availableServicesList : [];
  }
  if (item.importantNotes !== undefined) {
    payload.important_notes = Array.isArray(item.importantNotes) ? item.importantNotes : [];
  }
  if (item.status !== undefined) payload.status = item.status;
  if (item.isPublished !== undefined) payload.is_published = item.isPublished;
  if (item.active !== undefined) payload.active = item.active;
  if (item.featured !== undefined) payload.featured = item.featured;
  if (item.sortOrder !== undefined) payload.sort_order = item.sortOrder;
  if (item.singlePrice !== undefined) payload.single_price = item.singlePrice;
  if (item.unit !== undefined) payload.unit = item.unit;
  if (item.packages !== undefined) payload.packages = item.packages;
  if (item.galleryImages !== undefined) payload.gallery_images = item.galleryImages;
  if (item.seoTitle !== undefined) payload.seo_title = item.seoTitle;
  if (item.seoDescription !== undefined) payload.seo_description = item.seoDescription;
  if (item.seoKeywords !== undefined) payload.seo_keywords = item.seoKeywords;
  return payload;
};

export const mapSIMFromDB = (row: any): SIMCard => ({
  id: String(row.id),
  network: row.network || 'Dialog',
  simType: row.sim_type || 'Standard Prepaid 4G/5G',
  simNumber: row.sim_number || '',
  iccid: row.iccid || '',
  package: row.package || '',
  category: row.category || 'Mobile SIM Plans',
  purchasePrice: Number(row.purchase_price) || 0,
  sellingPrice: Number(row.selling_price) || 0,
  status: row.status || 'Available',
  receivedDate: row.received_date || new Date().toISOString().split('T')[0],
  soldDate: row.sold_date || undefined,
  notes: row.notes || undefined,
});

export const mapSIMToDB = (item: Partial<SIMCard>) => ({
  ...(item.id ? { id: item.id } : {}),
  ...(item.network !== undefined ? { network: item.network } : {}),
  sim_type: item.simType || 'Standard Prepaid 4G/5G',
  ...(item.simNumber !== undefined ? { sim_number: item.simNumber } : {}),
  iccid: item.iccid || null,
  package: item.package || null,
  category: item.category || 'Mobile SIM Plans',
  purchase_price: item.purchasePrice !== undefined ? Number(item.purchasePrice) : 0,
  selling_price: item.sellingPrice !== undefined ? Number(item.sellingPrice) : 0,
  status: item.status || 'Available',
  received_date: item.receivedDate || new Date().toISOString().split('T')[0],
  sold_date: item.soldDate || null,
  notes: item.notes || null,
});

export const mapPackageFromDB = (row: any): MobilePackage => ({
  id: String(row.id),
  network: row.network || 'Dialog',
  category: row.category || 'Mobile SIM Plans',
  name: row.name || '',
  type: row.type || 'Data & Voice',
  description: row.description || '',
  price: Number(row.price) || 0,
  status: row.status || 'Active',
  displayOrder: Number(row.display_order) || 0,
  validity: row.validity || '30 Days',
  quota: row.quota || undefined,
  speed: row.speed || undefined,
  features: Array.isArray(row.features) ? row.features : [],
  badge: row.badge || undefined,
  ussdCode: row.ussd_code || undefined,
  billingType: row.billing_type || 'Prepaid',
});

export const mapPackageToDB = (item: Partial<MobilePackage>) => ({
  ...(item.id ? { id: item.id } : {}),
  ...(item.network !== undefined ? { network: item.network } : {}),
  category: item.category || 'Mobile SIM Plans',
  ...(item.name !== undefined ? { name: item.name } : {}),
  type: item.type || 'Data & Voice',
  description: item.description || '',
  price: item.price !== undefined ? Number(item.price) : 0,
  status: item.status || 'Active',
  display_order: item.displayOrder !== undefined ? Number(item.displayOrder) : 0,
  validity: item.validity || '30 Days',
  quota: item.quota || null,
  speed: item.speed || null,
  features: Array.isArray(item.features) ? item.features : [],
  badge: item.badge || null,
  ussd_code: item.ussdCode || null,
  billing_type: item.billingType || 'Prepaid',
});

export const mapTransactionFromDB = (row: any): POSTransaction => ({
  id: String(row.id),
  type: row.type || 'sale',
  date: row.date || new Date().toISOString().split('T')[0],
  time: row.time || '',
  category: row.category || 'Printing',
  subType: row.sub_type || undefined,
  description: row.description || '',
  quantity: Number(row.quantity) || 1,
  unitPrice: Number(row.unit_price) || 0,
  totalAmount: Number(row.total_amount) || 0,
  paymentMethod: row.payment_method || 'Cash',
  customerName: row.customer_name || undefined,
  vendor: row.vendor || undefined,
  referenceNumber: row.reference_number || undefined,
  simCardId: row.sim_card_id || undefined,
  receiptUrl: row.receipt_url || undefined,
  notes: row.notes || undefined,
  createdBy: row.created_by || 'FR Hasan (CEO)',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

export const mapTransactionToDB = (item: Partial<POSTransaction>) => ({
  ...(item.id ? { id: item.id } : {}),
  ...(item.type !== undefined ? { type: item.type } : {}),
  ...(item.date !== undefined ? { date: item.date } : {}),
  ...(item.time !== undefined ? { time: item.time } : {}),
  ...(item.category !== undefined ? { category: item.category } : {}),
  sub_type: item.subType || null,
  ...(item.description !== undefined ? { description: item.description } : {}),
  quantity: item.quantity !== undefined ? Number(item.quantity) : 1,
  unit_price: item.unitPrice !== undefined ? Number(item.unitPrice) : 0,
  total_amount: item.totalAmount !== undefined ? Number(item.totalAmount) : 0,
  payment_method: item.paymentMethod || 'Cash',
  customer_name: item.customerName || null,
  vendor: item.vendor || null,
  reference_number: item.referenceNumber || null,
  sim_card_id: (item.simCardId && item.simCardId.trim().length > 0) ? item.simCardId : null,
  receipt_url: item.receiptUrl || null,
  notes: item.notes || null,
  created_by: item.createdBy || 'FR Hasan (CEO)',
});

export const mapOfferFromDB = (row: any): OfferItem => {
  let featuresList: string[] = [];
  if (Array.isArray(row.features)) {
    featuresList = row.features;
  } else if (typeof row.features === 'string') {
    try {
      featuresList = JSON.parse(row.features);
    } catch {
      featuresList = row.features.split('\n').map((f: string) => f.trim()).filter(Boolean);
    }
  }

  let termsList: string[] = [];
  if (Array.isArray(row.terms)) {
    termsList = row.terms;
  } else if (typeof row.terms === 'string') {
    try {
      termsList = JSON.parse(row.terms);
    } catch {
      termsList = row.terms.split('\n').map((t: string) => t.trim()).filter(Boolean);
    }
  }

  const isActive = row.active !== undefined ? Boolean(row.active) : (row.status !== 'Expired' && row.status !== 'Draft');

  return {
    id: String(row.id),
    title: row.title || '',
    badge: row.badge || 'Special Deal',
    shortDescription: row.short_description || row.shortDescription || '',
    description: row.description || row.full_description || row.short_description || '',
    image: row.image || row.image_url || row.imageUrl || 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=1200&q=80',
    imageUrl: row.image_url || row.image || undefined,
    originalPrice: row.original_price !== undefined && row.original_price !== null ? Number(row.original_price) : undefined,
    offerPrice: row.offer_price !== undefined && row.offer_price !== null ? Number(row.offer_price) : undefined,
    discountPercentage: row.discount_percentage !== undefined && row.discount_percentage !== null ? Number(row.discount_percentage) : undefined,
    currency: row.currency || 'LKR',
    validUntil: row.valid_until || row.validUntil || 'Limited Time',
    category: row.category || 'General',
    features: featuresList,
    terms: termsList,
    featured: row.featured === true || row.is_featured === true,
    status: (row.status as any) || (isActive ? 'Active' : 'Expired'),
    isPublished: row.is_published !== undefined ? Boolean(row.is_published) : isActive,
    sortOrder: Number(row.sort_order ?? 0),
    ctaText: row.cta_text || 'Claim on WhatsApp',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapOfferToDB = (item: Partial<OfferItem>) => ({
  ...(item.id ? { id: item.id } : {}),
  ...(item.title !== undefined ? { title: item.title } : {}),
  badge: item.badge || 'Special Deal',
  short_description: item.shortDescription || '',
  description: item.description || '',
  image: item.image || item.imageUrl || null,
  image_url: item.imageUrl || item.image || null,
  original_price: item.originalPrice !== undefined ? Number(item.originalPrice) : null,
  offer_price: item.offerPrice !== undefined ? Number(item.offerPrice) : null,
  discount_percentage: item.discountPercentage !== undefined ? Number(item.discountPercentage) : null,
  currency: item.currency || 'LKR',
  valid_until: item.validUntil || 'Limited Time',
  category: item.category || 'General',
  features: Array.isArray(item.features) ? item.features : [],
  terms: Array.isArray(item.terms) ? item.terms : [],
  featured: item.featured !== undefined ? item.featured : false,
  status: item.status || 'Active',
  is_published: item.isPublished !== undefined ? item.isPublished : true,
  sort_order: item.sortOrder !== undefined ? Number(item.sortOrder) : 0,
  cta_text: item.ctaText || 'Claim on WhatsApp',
});

export const mapSettingsFromDB = (row: any): ShopSettings => {
  const rawAbout = (row && typeof row.about_content === 'object' && row.about_content !== null) ? row.about_content : {};
  const rawHero = (row && typeof row.hero_content === 'object' && row.hero_content !== null) ? row.hero_content : {};
  const rawPos = (row && typeof row.pos_settings === 'object' && row.pos_settings !== null) ? row.pos_settings : {};
  const rawHours = (row && typeof row.opening_hours === 'object' && row.opening_hours !== null) ? row.opening_hours : {};
  const rawSocial = (row && typeof row.social_media === 'object' && row.social_media !== null) ? row.social_media : {};

  return {
    shopName: row?.shop_name || INITIAL_SETTINGS.shopName,
    tagline: row?.tagline || INITIAL_SETTINGS.tagline,
    description: row?.description || INITIAL_SETTINGS.description,
    logoUrl: row?.logo_url || INITIAL_SETTINGS.logoUrl,
    heroBackgroundUrl: row?.hero_background_url || INITIAL_SETTINGS.heroBackgroundUrl,
    whatsappNumber: row?.whatsapp_number || INITIAL_SETTINGS.whatsappNumber,
    whatsappGroupUrl: row?.whatsapp_group_url || INITIAL_SETTINGS.whatsappGroupUrl,
    phoneNumber: row?.phone_number || INITIAL_SETTINGS.phoneNumber,
    email: row?.email || INITIAL_SETTINGS.email,
    address: row?.address || INITIAL_SETTINGS.address,
    plusCode: row?.plus_code || INITIAL_SETTINGS.plusCode,
    mapEmbedUrl: row?.map_embed_url || INITIAL_SETTINGS.mapEmbedUrl,
    googleMapsUrl: row?.google_maps_url || INITIAL_SETTINGS.googleMapsUrl,
    openingHours: {
      ...INITIAL_SETTINGS.openingHours,
      ...rawHours,
    },
    socialMedia: {
      ...INITIAL_SETTINGS.socialMedia,
      ...rawSocial,
    },
    heroContent: {
      ...INITIAL_SETTINGS.heroContent,
      ...rawHero,
    },
    aboutContent: {
      ...INITIAL_SETTINGS.aboutContent,
      ...rawAbout,
      ceoName: rawAbout.ceoName || INITIAL_SETTINGS.aboutContent.ceoName,
      ceoTitle: rawAbout.ceoTitle || INITIAL_SETTINGS.aboutContent.ceoTitle,
      ceoPhoto: rawAbout.ceoPhoto || INITIAL_SETTINGS.aboutContent.ceoPhoto,
      ceoBio: rawAbout.ceoBio || INITIAL_SETTINGS.aboutContent.ceoBio,
      ceoQuote: rawAbout.ceoQuote || INITIAL_SETTINGS.aboutContent.ceoQuote,
      title: rawAbout.title || INITIAL_SETTINGS.aboutContent.title,
      subtitle: rawAbout.subtitle || INITIAL_SETTINGS.aboutContent.subtitle,
      story: rawAbout.story || INITIAL_SETTINGS.aboutContent.story,
      mission: rawAbout.mission || INITIAL_SETTINGS.aboutContent.mission,
    },
    posSettings: {
      ...INITIAL_SETTINGS.posSettings,
      ...rawPos,
      currencySymbol: rawPos.currencySymbol || INITIAL_SETTINGS.posSettings.currencySymbol || 'LKR',
      serviceSubTypes: {
        ...INITIAL_SETTINGS.posSettings.serviceSubTypes,
        ...(rawPos.serviceSubTypes || {})
      }
    }
  };
};

export const mapSettingsToDB = (s: ShopSettings) => ({
  id: 'default',
  shop_name: s.shopName,
  tagline: s.tagline || '',
  description: s.description || '',
  logo_url: s.logoUrl || '/fr-hasan-logo.svg',
  hero_background_url: s.heroBackgroundUrl || '',
  whatsapp_number: s.whatsappNumber || '076 859 7800',
  whatsapp_group_url: s.whatsappGroupUrl || '',
  phone_number: s.phoneNumber || '076 859 7800',
  email: s.email || 'contact@frhasantech.com',
  address: s.address || '529, Siraj Nagar, Thampalagamam, Sri Lanka',
  plus_code: s.plusCode || 'F37F+49 Mullipotana',
  map_embed_url: s.mapEmbedUrl || '',
  google_maps_url: s.googleMapsUrl || '',
  opening_hours: s.openingHours || {},
  social_media: s.socialMedia || {},
  hero_content: s.heroContent || {},
  about_content: s.aboutContent || {},
  pos_settings: s.posSettings || {},
});

export const mapAdminUserFromDB = (row: any): AdminUser => ({
  id: String(row.id),
  email: row.email || '',
  name: row.name || 'Staff User',
  role: (row.role as any) || 'Admin',
  password: row.password_hash || '',
  phone: row.phone || '',
  avatarUrl: row.avatar_url || '',
  isActive: row.is_active !== undefined ? Boolean(row.is_active) : true,
  lastLoginAt: row.last_login_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export const mapAdminUserToDB = (user: Partial<AdminUser>) => ({
  ...(user.id ? { id: user.id } : {}),
  ...(user.email !== undefined ? { email: user.email.trim().toLowerCase() } : {}),
  ...(user.password !== undefined ? { password_hash: user.password } : {}),
  ...(user.name !== undefined ? { name: user.name } : {}),
  ...(user.role !== undefined ? { role: user.role } : {}),
  ...(user.isActive !== undefined ? { is_active: user.isActive } : {}),
  phone: user.phone || null,
  avatar_url: user.avatarUrl || null,
  ...(user.lastLoginAt !== undefined ? { last_login_at: user.lastLoginAt } : {}),
});

// Helper to format Supabase errors into human-friendly explanations
export const formatSupabaseError = (err: any): string => {
  if (!err) return 'Unknown database error occurred';
  const msg = typeof err === 'string' ? err : (err.message || JSON.stringify(err));
  
  if (msg.includes('Forbidden use of secret API key') || err?.hint?.includes('Secret API keys')) {
    return 'Invalid Key: Supabase requires the "anon public" JWT key (starts with "eyJ...") from Project Settings > API.';
  }
  if (
    err?.code === 'PGRST205' || 
    msg.includes('schema cache') || 
    msg.includes('Could not find the table') || 
    (msg.includes('relation') && msg.includes('does not exist'))
  ) {
    if (msg.includes('offers')) {
      return 'The "offers" table is not created in Supabase yet. Please run the Special Offers SQL script in Supabase SQL Editor (Admin > Settings > Database).';
    }
    return 'Database table does not exist in Supabase yet. Please run the SQL schema script in Supabase SQL Editor (Admin > Settings > Database).';
  }
  if (msg.includes('permission denied') || msg.includes('violates row-level security policy') || err?.code === '42501') {
    return 'Permission denied by Supabase RLS. Please re-run the updated SQL schema script with permissive GRANTs.';
  }
  if (msg.includes('JWT') || msg.includes('token') || msg.includes('invalid claim')) {
    return `Supabase Auth token issue: ${msg}`;
  }
  if (msg.includes('duplicate key value') || msg.includes('unique constraint')) {
    return `Item with same identifier already exists in database (${err.detail || msg})`;
  }
  return err.hint ? `${msg} (${err.hint})` : msg;
};

// ============================================================================
// SUPABASE API CRUD SERVICES
// ============================================================================

const isConfigured = () => getActiveCredentials().isConfigured;

export const SupabaseService = {
  // Test connection & table verification
  async testConnection(): Promise<{ ok: boolean; message: string; tables?: Record<string, number> }> {
    if (!isConfigured()) {
      return { 
        ok: false, 
        message: 'Supabase credentials are not configured in environment (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required)' 
      };
    }
    try {
      const results: Record<string, number> = {};
      
      const { count: servCount, error: servErr } = await supabase.from('services').select('*', { count: 'exact', head: true });
      if (servErr) throw servErr;
      results['services'] = servCount ?? 0;

      const { count: simCount, error: simErr } = await supabase.from('sim_cards').select('*', { count: 'exact', head: true });
      if (simErr) throw simErr;
      results['sim_cards'] = simCount ?? 0;

      const { count: pkgCount, error: pkgErr } = await supabase.from('mobile_packages').select('*', { count: 'exact', head: true });
      if (pkgErr) throw pkgErr;
      results['mobile_packages'] = pkgCount ?? 0;

      const { count: txCount, error: txErr } = await supabase.from('pos_transactions').select('*', { count: 'exact', head: true });
      if (txErr) throw txErr;
      results['pos_transactions'] = txCount ?? 0;

      // Offers table
      try {
        const { count: offerCount } = await supabase.from('offers').select('*', { count: 'exact', head: true });
        if (offerCount !== null && offerCount !== undefined) results['offers'] = offerCount;
      } catch {}

      const { error: setErr } = await supabase.from('shop_settings').select('id').limit(1);
      if (setErr) throw setErr;
      results['shop_settings'] = 1;

      // Estimate Calculator tables (optional checks)
      try {
        const { count: estCatCount } = await supabase.from('estimate_categories').select('*', { count: 'exact', head: true });
        if (estCatCount !== null && estCatCount !== undefined) results['estimate_categories'] = estCatCount;
      } catch {}

      try {
        const { count: estSizeCount } = await supabase.from('estimate_sizes').select('*', { count: 'exact', head: true });
        if (estSizeCount !== null && estSizeCount !== undefined) results['estimate_sizes'] = estSizeCount;
      } catch {}

      try {
        const { count: estServCount } = await supabase.from('estimate_services').select('*', { count: 'exact', head: true });
        if (estServCount !== null && estServCount !== undefined) results['estimate_services'] = estServCount;
      } catch {}

      const tableNames = Object.keys(results);
      return {
        ok: true,
        message: `Connected successfully to Supabase PostgreSQL database! Verified ${tableNames.length} tables.`,
        tables: results
      };
    } catch (err: any) {
      return {
        ok: false,
        message: formatSupabaseError(err)
      };
    }
  },

  // 1. Settings
  async getSettings(): Promise<ShopSettings | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('shop_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (error || !data) return null;
      return mapSettingsFromDB(data);
    } catch {
      return null;
    }
  },

  async saveSettings(settings: ShopSettings): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials are not configured in environment' };
    }
    try {
      const payload = mapSettingsToDB(settings);
      const { error } = await supabase
        .from('shop_settings')
        .upsert(payload, { onConflict: 'id' });
      
      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error saving settings to Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 2. Services
  async getServices(): Promise<ServiceItem[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map(mapServiceFromDB);
    } catch {
      return null;
    }
  },

  async createService(service: Omit<ServiceItem, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: ServiceItem; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = service.id || `serv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const serviceWithId = { ...service, id };

      // Generate all payload tiers: first with modern category, then with legacy normalized category
      const modernTiers = buildServicePayloadTiers(serviceWithId, false);
      const legacyTiers = buildServicePayloadTiers(serviceWithId, true);
      const allCandidatePayloads = [...modernTiers, ...legacyTiers];

      let lastError: any = null;

      for (const payload of allCandidatePayloads) {
        const { data, error } = await supabase
          .from('services')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          return { ok: true, data: { ...mapServiceFromDB(data), ...service, id } };
        }

        // If error is duplicate slug or key (23505), try updating existing record
        if (error && (error.code === '23505' || error.message?.includes('duplicate key') || error.message?.includes('services_slug_key'))) {
          if (payload.slug) {
            const updateRes = await this.updateService(id, service);
            if (updateRes.ok) {
              return { ok: true, data: { ...service, id } as ServiceItem };
            }
          }
        }

        lastError = error;
      }

      // If all candidate inserts failed, format error
      const msg = formatSupabaseError(lastError);
      console.warn('Supabase service insertion fallback alert:', msg);
      return { ok: false, error: msg };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.warn('Error inserting service into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updateService(id: string, updates: Partial<ServiceItem>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const modernTiers = buildServicePayloadTiers({ ...updates, id }, false);
      const legacyTiers = buildServicePayloadTiers({ ...updates, id }, true);
      const allCandidatePayloads = [...modernTiers, ...legacyTiers];

      let lastError: any = null;

      for (const payload of allCandidatePayloads) {
        // Strip id from update payload
        const { id: _id, ...cleanPayload } = payload;
        
        // Try update by id first
        let { error } = await supabase
          .from('services')
          .update(cleanPayload)
          .eq('id', id);

        // If no rows matched or error, and slug is provided, try by slug
        if ((!error || error.code === 'PGRST116') && updates.slug) {
          const resSlug = await supabase
            .from('services')
            .update(cleanPayload)
            .eq('slug', updates.slug);
          if (!resSlug.error) return { ok: true };
          if (error) error = resSlug.error;
        }

        if (!error) {
          return { ok: true };
        }

        lastError = error;
      }

      const msg = formatSupabaseError(lastError);
      console.warn('Supabase service update fallback alert:', msg);
      return { ok: false, error: msg };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.warn('Error updating service in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deleteService(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting service from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 3. SIM Cards
  async getSIMs(): Promise<SIMCard[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('sim_cards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map(mapSIMFromDB);
    } catch {
      return null;
    }
  },

  async createSIM(sim: Omit<SIMCard, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: SIMCard; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = sim.id || `sim-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = mapSIMToDB({ ...sim, id });
      const { data, error } = await supabase
        .from('sim_cards')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapSIMFromDB(data) };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error inserting SIM into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updateSIM(id: string, updates: Partial<SIMCard>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapSIMToDB(updates);
      const { error } = await supabase
        .from('sim_cards')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error updating SIM in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deleteSIM(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('sim_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting SIM from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 4. Mobile Packages
  async getPackages(): Promise<MobilePackage[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('mobile_packages')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map(mapPackageFromDB);
    } catch {
      return null;
    }
  },

  async createPackage(pkg: Omit<MobilePackage, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: MobilePackage; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = pkg.id || `pkg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = mapPackageToDB({ ...pkg, id });
      const { data, error } = await supabase
        .from('mobile_packages')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapPackageFromDB(data) };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error inserting package into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updatePackage(id: string, updates: Partial<MobilePackage>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapPackageToDB(updates);
      const { error } = await supabase
        .from('mobile_packages')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error updating package in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deletePackage(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('mobile_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting package from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async reorderPackages(packages: MobilePackage[]): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const updates = packages.map((pkg, idx) => ({
        id: pkg.id,
        display_order: idx + 1,
      }));

      for (const item of updates) {
        const { error } = await supabase.from('mobile_packages').update({ display_order: item.display_order }).eq('id', item.id);
        if (error) throw error;
      }
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error reordering packages in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 5. POS Transactions
  async getTransactions(): Promise<POSTransaction[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('pos_transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map(mapTransactionFromDB);
    } catch {
      return null;
    }
  },

  async createTransaction(tx: Omit<POSTransaction, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<{ ok: boolean; data?: POSTransaction; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = tx.id || `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const payload = mapTransactionToDB({ ...tx, id });
      const { data, error } = await supabase
        .from('pos_transactions')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapTransactionFromDB(data) };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error inserting transaction into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updateTransaction(id: string, updates: Partial<POSTransaction>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapTransactionToDB(updates);
      const { error } = await supabase
        .from('pos_transactions')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error updating transaction in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deleteTransaction(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('pos_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting transaction from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 6. Estimate Categories
  async getEstimateCategories(): Promise<EstimateCategory[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('estimate_categories')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error || !data) return null;
      return data.map(mapEstimateCategoryFromDB);
    } catch {
      return null;
    }
  },

  async createEstimateCategory(category: Omit<EstimateCategory, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: EstimateCategory; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = category.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = mapEstimateCategoryToDB({ ...category, id });
      const { data, error } = await supabase
        .from('estimate_categories')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapEstimateCategoryFromDB(data) };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error inserting estimate category into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updateEstimateCategory(id: string, updates: Partial<EstimateCategory>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapEstimateCategoryToDB(updates);
      const { error } = await supabase
        .from('estimate_categories')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error updating estimate category in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deleteEstimateCategory(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('estimate_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting estimate category from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 7. Estimate Sizes
  async getEstimateSizes(): Promise<EstimateSize[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('estimate_sizes')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error || !data) return null;
      return data.map(mapEstimateSizeFromDB);
    } catch (err) {
      console.error('Error loading estimate sizes from Supabase:', err);
      return null;
    }
  },

  async createEstimateSize(size: Omit<EstimateSize, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: EstimateSize; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = size.id || `size-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = mapEstimateSizeToDB({ ...size, id });
      const { data, error } = await supabase
        .from('estimate_sizes')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapEstimateSizeFromDB(data) };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error inserting estimate size into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updateEstimateSize(id: string, updates: Partial<EstimateSize>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapEstimateSizeToDB(updates);
      const { error } = await supabase
        .from('estimate_sizes')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error updating estimate size in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deleteEstimateSize(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('estimate_sizes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting estimate size from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  // 8. Estimate Services
  async getEstimateServices(): Promise<EstimateService[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('estimate_services')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (error || !data) return null;
      return data.map(mapEstimateServiceFromDB);
    } catch (err) {
      console.error('Error loading estimate services from Supabase:', err);
      return null;
    }
  },

  async createEstimateService(service: Omit<EstimateService, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: EstimateService; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = service.id || `est-serv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = mapEstimateServiceToDB({ ...service, id });
      const { data, error } = await supabase
        .from('estimate_services')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapEstimateServiceFromDB(data) };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error inserting estimate service into Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async updateEstimateService(id: string, updates: Partial<EstimateService>): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapEstimateServiceToDB(updates);
      const { error } = await supabase
        .from('estimate_services')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error updating estimate service in Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async deleteEstimateService(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('estimate_services')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const msg = formatSupabaseError(err);
      console.error('Error deleting estimate service from Supabase:', err);
      return { ok: false, error: msg };
    }
  },

  async seedEstimateData(data: {
    categories: EstimateCategory[];
    services: EstimateService[];
    sizes: EstimateSize[];
  }): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) {
      return { ok: false, message: 'Supabase credentials not configured' };
    }
    try {
      if (data.categories.length > 0) {
        const catPayload = data.categories.map(c => mapEstimateCategoryToDB(c));
        const { error: catErr } = await supabase.from('estimate_categories').upsert(catPayload, { onConflict: 'id' });
        if (catErr) throw catErr;
      }

      if (data.sizes.length > 0) {
        const sizePayload = data.sizes.map(s => mapEstimateSizeToDB(s));
        const { error: sizeErr } = await supabase.from('estimate_sizes').upsert(sizePayload, { onConflict: 'id' });
        if (sizeErr) throw sizeErr;
      }

      if (data.services.length > 0) {
        const servPayload = data.services.map(s => mapEstimateServiceToDB(s));
        const { error: servErr } = await supabase.from('estimate_services').upsert(servPayload, { onConflict: 'id' });
        if (servErr) throw servErr;
      }

      return { ok: true, message: 'Estimate Calculator services, categories, and paper/lamination sizes synced to Supabase!' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  // 9. Special Offers
  async getOffers(): Promise<OfferItem[] | null> {
    if (!isConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error || !data) return null;
      return data.map(mapOfferFromDB);
    } catch (err) {
      console.warn('Notice: Could not load offers from Supabase (table may not be created yet):', err);
      return null;
    }
  },

  async createOffer(offer: Omit<OfferItem, 'id'> & { id?: string }): Promise<{ ok: boolean; data?: OfferItem; error?: string; isMissingTable?: boolean }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const id = offer.id || `offer-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const payload = mapOfferToDB({ ...offer, id });
      const { data, error } = await supabase
        .from('offers')
        .insert(payload)
        .select()
        .single();

      if (error || !data) throw error;
      return { ok: true, data: mapOfferFromDB(data) };
    } catch (err: any) {
      const isMissingTable = err?.code === 'PGRST205' || 
        String(err?.message || '').includes('schema cache') || 
        String(err?.message || '').includes('does not exist');
      const msg = formatSupabaseError(err);
      if (!isMissingTable) {
        console.error('Error inserting offer into Supabase:', err);
      } else {
        console.warn('Supabase offers table missing:', msg);
      }
      return { ok: false, error: msg, isMissingTable };
    }
  },

  async updateOffer(id: string, updates: Partial<OfferItem>): Promise<{ ok: boolean; error?: string; isMissingTable?: boolean }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const payload = mapOfferToDB(updates);
      const { error } = await supabase
        .from('offers')
        .update(payload)
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const isMissingTable = err?.code === 'PGRST205' || 
        String(err?.message || '').includes('schema cache') || 
        String(err?.message || '').includes('does not exist');
      const msg = formatSupabaseError(err);
      if (!isMissingTable) {
        console.error('Error updating offer in Supabase:', err);
      } else {
        console.warn('Supabase offers table missing during update:', msg);
      }
      return { ok: false, error: msg, isMissingTable };
    }
  },

  async deleteOffer(id: string): Promise<{ ok: boolean; error?: string; isMissingTable?: boolean }> {
    if (!isConfigured()) {
      return { ok: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      const isMissingTable = err?.code === 'PGRST205' || 
        String(err?.message || '').includes('schema cache') || 
        String(err?.message || '').includes('does not exist');
      const msg = formatSupabaseError(err);
      if (!isMissingTable) {
        console.error('Error deleting offer from Supabase:', err);
      } else {
        console.warn('Supabase offers table missing during delete:', msg);
      }
      return { ok: false, error: msg, isMissingTable };
    }
  },

  // 6. Seed / Bootstrap Supabase with clean initial store data
  async seedInitialDataToSupabase(data: {
    settings: ShopSettings;
    services: ServiceItem[];
    sims: SIMCard[];
    packages: MobilePackage[];
    transactions: POSTransaction[];
    offers?: OfferItem[];
  }): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) {
      return { ok: false, message: 'Supabase credentials not configured in environment' };
    }
    try {
      // 1. Settings
      const { error: setErr } = await supabase.from('shop_settings').upsert(mapSettingsToDB(data.settings), { onConflict: 'id' });
      if (setErr) throw setErr;

      // 2. Services
      if (data.services.length > 0) {
        for (const s of data.services) {
          await this.createService(s);
        }
      }

      // 3. SIMs
      if (data.sims.length > 0) {
        const simPayload = data.sims.map(s => mapSIMToDB(s));
        const { error: simErr } = await supabase.from('sim_cards').upsert(simPayload, { onConflict: 'id' });
        if (simErr) throw simErr;
      }

      // 4. Packages
      if (data.packages.length > 0) {
        const pkgPayload = data.packages.map(p => mapPackageToDB(p));
        const { error: pkgErr } = await supabase.from('mobile_packages').upsert(pkgPayload, { onConflict: 'id' });
        if (pkgErr) throw pkgErr;
      }

      // 5. Offers
      if (data.offers && data.offers.length > 0) {
        const offerPayload = data.offers.map(o => mapOfferToDB(o));
        const { error: offerErr } = await supabase.from('offers').upsert(offerPayload, { onConflict: 'id' });
        if (offerErr) console.warn('Offer sync note:', offerErr);
      }

      // 6. Transactions
      if (data.transactions.length > 0) {
        const txPayload = data.transactions.map(t => mapTransactionToDB(t));
        const { error: txErr } = await supabase.from('pos_transactions').upsert(txPayload, { onConflict: 'id' });
        if (txErr) throw txErr;
      }

      return { ok: true, message: 'All store data successfully synced and seeded into Supabase database!' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  // 7. Clear Database / Wipe catalog and dummy data
  async clearAllCatalogData(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) {
      return { ok: true, message: 'Local catalog cleared (Supabase credentials not configured in environment)' };
    }
    try {
      const { error: err1 } = await supabase.from('pos_transactions').delete().neq('id', '___non_existent___');
      if (err1) throw err1;

      const { error: err2 } = await supabase.from('sim_cards').delete().neq('id', '___non_existent___');
      if (err2) throw err2;

      const { error: err3 } = await supabase.from('mobile_packages').delete().neq('id', '___non_existent___');
      if (err3) throw err3;

      const { error: err4 } = await supabase.from('services').delete().neq('id', '___non_existent___');
      if (err4) throw err4;

      try {
        await supabase.from('offers').delete().neq('id', '___non_existent___');
      } catch {}

      return { ok: true, message: 'All services, packages, SIM cards, offers, and transactions cleared successfully from Supabase database.' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  async clearOffersTable(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) return { ok: true, message: 'Cleared offers locally' };
    try {
      const { error } = await supabase.from('offers').delete().neq('id', '___non_existent___');
      if (error) throw error;
      return { ok: true, message: 'All special offers cleared from Supabase' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  async clearServicesTable(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) return { ok: true, message: 'Cleared services locally' };
    try {
      const { error } = await supabase.from('services').delete().neq('id', '___non_existent___');
      if (error) throw error;
      return { ok: true, message: 'All services cleared from Supabase' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  async clearPackagesTable(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) return { ok: true, message: 'Cleared packages locally' };
    try {
      const { error } = await supabase.from('mobile_packages').delete().neq('id', '___non_existent___');
      if (error) throw error;
      return { ok: true, message: 'All mobile & broadband packages cleared from Supabase' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  async clearSimsTable(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) return { ok: true, message: 'Cleared SIMs locally' };
    try {
      const { error } = await supabase.from('sim_cards').delete().neq('id', '___non_existent___');
      if (error) throw error;
      return { ok: true, message: 'All SIM inventory cleared from Supabase' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  async clearTransactionsTable(): Promise<{ ok: boolean; message: string }> {
    if (!isConfigured()) return { ok: true, message: 'Cleared transactions locally' };
    try {
      const { error } = await supabase.from('pos_transactions').delete().neq('id', '___non_existent___');
      if (error) throw error;
      return { ok: true, message: 'All POS transactions cleared from Supabase' };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  // --------------------------------------------------------------------------
  // ADMIN USERS & AUTHENTICATION TABLE METHODS
  // --------------------------------------------------------------------------
  async testAdminUsersTable(): Promise<{ ok: boolean; message: string; userCount?: number }> {
    if (!isConfigured()) return { ok: false, message: 'Supabase credentials not configured. Using local fallback accounts.' };
    try {
      const { count, error } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });
      if (error) {
        return { ok: false, message: `Table access issue: ${error.message}` };
      }
      return { 
        ok: true, 
        message: `Table "public.admin_users" is verified and active!`,
        userCount: count ?? 0 
      };
    } catch (err: any) {
      return { ok: false, message: formatSupabaseError(err) };
    }
  },

  async getAdminUsers(): Promise<AdminUser[]> {
    if (!isConfigured()) return [];
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        console.warn('admin_users table not found or inaccessible:', error.message);
        return [];
      }
      return (data || []).map(mapAdminUserFromDB);
    } catch (err) {
      console.warn('Failed to load admin users:', err);
      return [];
    }
  },

  async authenticateAdminUser(email: string, password: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isConfigured()) {
      // Local development or unconfigured fallback
      if (normalizedEmail && password) {
        return {
          success: true,
          user: {
            id: 'user-local',
            email: normalizedEmail,
            name: normalizedEmail.includes('admin') ? 'FR Hasan' : 'Staff Admin',
            role: 'Super-Admin',
            isActive: true,
          }
        };
      }
      return { success: false, error: 'Please enter both email and password' };
    }

    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.warn('admin_users lookup failed:', error.message);
        return { success: false, error: 'Authentication table error: ' + error.message };
      }

      if (!data) {
        return { success: false, error: 'No account registered with this email address' };
      }

      if (!data.is_active) {
        return { success: false, error: 'This user account has been deactivated. Contact the Super-Admin.' };
      }

      if (data.password_hash !== password) {
        return { success: false, error: 'Incorrect password. Please verify your credentials.' };
      }

      // Record last login timestamp
      const nowIso = new Date().toISOString();
      try {
        await supabase
          .from('admin_users')
          .update({ last_login_at: nowIso })
          .eq('id', data.id);
      } catch {
        // ignore timestamp update error
      }

      return {
        success: true,
        user: { ...mapAdminUserFromDB(data), lastLoginAt: nowIso }
      };
    } catch (err: any) {
      return { success: false, error: formatSupabaseError(err) };
    }
  },

  async saveAdminUser(user: Partial<AdminUser>): Promise<{ ok: boolean; data?: AdminUser; error?: string }> {
    if (!isConfigured()) return { ok: true, data: user as AdminUser };
    try {
      const payload = mapAdminUserToDB(user);
      const { data, error } = await supabase
        .from('admin_users')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return { ok: true, data: mapAdminUserFromDB(data) };
    } catch (err: any) {
      return { ok: false, error: formatSupabaseError(err) };
    }
  },

  async updateAdminPassword(idOrEmail: string, newPassword: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) return { ok: true };
    try {
      const isEmail = idOrEmail.includes('@');
      const query = supabase.from('admin_users').update({ 
        password_hash: newPassword,
        updated_at: new Date().toISOString()
      });
      const { error } = isEmail 
        ? await query.eq('email', idOrEmail.trim().toLowerCase()) 
        : await query.eq('id', idOrEmail);
      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: formatSupabaseError(err) };
    }
  },

  async deleteAdminUser(id: string): Promise<{ ok: boolean; error?: string }> {
    if (!isConfigured()) return { ok: true };
    try {
      const { error } = await supabase.from('admin_users').delete().eq('id', id);
      if (error) throw error;
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: formatSupabaseError(err) };
    }
  }
};
