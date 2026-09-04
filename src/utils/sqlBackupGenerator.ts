import { 
  ShopSettings, 
  ServiceItem, 
  SIMCard, 
  MobilePackage, 
  OfferItem, 
  POSTransaction,
  EstimateCategory,
  EstimateSize,
  EstimateService,
  AdminUser
} from '../types';

export interface DatabaseBackupPayload {
  settings: ShopSettings;
  services: ServiceItem[];
  sims: SIMCard[];
  packages: MobilePackage[];
  offers: OfferItem[];
  transactions: POSTransaction[];
  estimateCategories: EstimateCategory[];
  estimateSizes: EstimateSize[];
  estimateServices: EstimateService[];
  adminUsers?: AdminUser[];
}

export interface BackupStats {
  settingsCount: number;
  servicesCount: number;
  simsCount: number;
  packagesCount: number;
  offersCount: number;
  transactionsCount: number;
  estimateCategoriesCount: number;
  estimateSizesCount: number;
  estimateServicesCount: number;
  adminUsersCount: number;
  totalRecords: number;
  generatedAt: string;
}

/**
 * Escapes a string value for safe PostgreSQL string literal.
 */
const escapeSqlStr = (val: string | null | undefined): string => {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
};

/**
 * Formats a numeric value for PostgreSQL.
 */
const formatSqlNum = (val: number | string | null | undefined, defaultVal: number | null = 0): string => {
  if (val === null || val === undefined || val === '') {
    return defaultVal === null ? 'NULL' : String(defaultVal);
  }
  const n = Number(val);
  return isNaN(n) ? (defaultVal === null ? 'NULL' : String(defaultVal)) : String(n);
};

/**
 * Formats a boolean for PostgreSQL.
 */
const formatSqlBool = (val: boolean | null | undefined, defaultVal: boolean = false): string => {
  if (val === null || val === undefined) return defaultVal ? 'TRUE' : 'FALSE';
  return val ? 'TRUE' : 'FALSE';
};

/**
 * Formats an object or array as JSONB with proper escaping.
 */
const formatSqlJsonb = (val: any, defaultVal: any = []): string => {
  const obj = val !== undefined && val !== null ? val : defaultVal;
  const jsonStr = JSON.stringify(obj);
  return `'${jsonStr.replace(/'/g, "''")}'::jsonb`;
};

/**
 * Generates summary stats of the backup data.
 */
export const getBackupStats = (data: DatabaseBackupPayload): BackupStats => {
  const total = 1 + 
    (data.services?.length || 0) +
    (data.sims?.length || 0) +
    (data.packages?.length || 0) +
    (data.offers?.length || 0) +
    (data.transactions?.length || 0) +
    (data.estimateCategories?.length || 0) +
    (data.estimateSizes?.length || 0) +
    (data.estimateServices?.length || 0) +
    (data.adminUsers?.length || 0);

  return {
    settingsCount: 1,
    servicesCount: data.services?.length || 0,
    simsCount: data.sims?.length || 0,
    packagesCount: data.packages?.length || 0,
    offersCount: data.offers?.length || 0,
    transactionsCount: data.transactions?.length || 0,
    estimateCategoriesCount: data.estimateCategories?.length || 0,
    estimateSizesCount: data.estimateSizes?.length || 0,
    estimateServicesCount: data.estimateServices?.length || 0,
    adminUsersCount: data.adminUsers?.length || 0,
    totalRecords: total,
    generatedAt: new Date().toISOString()
  };
};

/**
 * Generates an idempotent, comprehensive PostgreSQL / Supabase SQL backup script.
 */
export const generateSqlBackup = (data: DatabaseBackupPayload): string => {
  const stats = getBackupStats(data);
  const nowIso = new Date().toISOString();
  const dateStr = nowIso.split('T')[0];

  const lines: string[] = [];

  // 1. HEADER
  lines.push(`-- ======================================================================================`);
  lines.push(`-- FR.HASAN TECH - Complete Database SQL Backup (PostgreSQL / Supabase Compatible)`);
  lines.push(`-- Generated At: ${nowIso}`);
  lines.push(`-- Store Name: ${data.settings.shopName || 'FR.HASAN TECH'}`);
  lines.push(`-- Contact: ${data.settings.phoneNumber || '076 859 7800'} | ${data.settings.email || 'contact@frhasantech.com'}`);
  lines.push(`--`);
  lines.push(`-- SUMMARY OF DATA INCLUDED IN THIS BACKUP:`);
  lines.push(`--   - Store Profile & POS Settings: 1 record`);
  lines.push(`--   - Services Catalog: ${stats.servicesCount} records`);
  lines.push(`--   - SIM Cards Inventory: ${stats.simsCount} records`);
  lines.push(`--   - Mobile & Broadband Packages: ${stats.packagesCount} records`);
  lines.push(`--   - Special Offers & Deals: ${stats.offersCount} records`);
  lines.push(`--   - POS Sales & Expenses: ${stats.transactionsCount} records`);
  lines.push(`--   - Estimate Categories: ${stats.estimateCategoriesCount} records`);
  lines.push(`--   - Estimate Paper & Print Sizes: ${stats.estimateSizesCount} records`);
  lines.push(`--   - Estimate Services & Rates: ${stats.estimateServicesCount} records`);
  lines.push(`--   - Admin Users & Accounts: ${stats.adminUsersCount} records`);
  lines.push(`--   - TOTAL RECORDS: ${stats.totalRecords}`);
  lines.push(`-- ======================================================================================`);
  lines.push(``);
  lines.push(`BEGIN;`);
  lines.push(``);
  lines.push(`-- Ensure standard UUID extension`);
  lines.push(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
  lines.push(``);

  // 2. DDL: ENSURE TABLES EXIST
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 1. ENSURE SCHEMAS & TABLES EXIST`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    shop_name TEXT NOT NULL DEFAULT 'FR.HASAN TECH',
    tagline TEXT,
    description TEXT,
    logo_url TEXT DEFAULT '/fr-hasan-logo.svg',
    hero_background_url TEXT,
    whatsapp_number TEXT NOT NULL DEFAULT '076 859 7800',
    whatsapp_group_url TEXT DEFAULT '',
    phone_number TEXT NOT NULL DEFAULT '076 859 7800',
    email TEXT NOT NULL DEFAULT 'contact@frhasantech.com',
    address TEXT NOT NULL DEFAULT '529, Siraj Nagar, Thampalagamam, Sri Lanka',
    plus_code TEXT DEFAULT 'F37F+49 Mullipotana',
    map_embed_url TEXT,
    google_maps_url TEXT,
    opening_hours JSONB DEFAULT '{}'::jsonb,
    social_media JSONB DEFAULT '{}'::jsonb,
    hero_content JSONB DEFAULT '{}'::jsonb,
    about_content JSONB DEFAULT '{}'::jsonb,
    pos_settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Printer',
    short_description TEXT,
    full_description TEXT,
    price_info TEXT,
    single_price NUMERIC(10, 2),
    unit TEXT,
    image TEXT,
    packages JSONB DEFAULT '[]'::jsonb,
    gallery_images JSONB DEFAULT '[]'::jsonb,
    available_services_list JSONB DEFAULT '[]'::jsonb,
    important_notes JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'Active',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    seo_title TEXT,
    seo_description TEXT,
    seo_keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sim_cards (
    id TEXT PRIMARY KEY,
    network TEXT NOT NULL,
    sim_type TEXT DEFAULT 'Standard Prepaid 4G/5G',
    sim_number TEXT NOT NULL,
    iccid TEXT,
    package TEXT,
    category TEXT DEFAULT 'Mobile SIM Plans',
    purchase_price NUMERIC(10, 2) DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Available',
    received_date DATE DEFAULT CURRENT_DATE,
    sold_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.mobile_packages (
    id TEXT PRIMARY KEY,
    network TEXT NOT NULL,
    category TEXT DEFAULT 'Mobile SIM Plans',
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Data & Voice',
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Active',
    display_order INTEGER DEFAULT 0,
    validity TEXT DEFAULT '30 Days',
    quota TEXT,
    speed TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    badge TEXT,
    ussd_code TEXT,
    billing_type TEXT DEFAULT 'Prepaid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    badge TEXT NOT NULL DEFAULT 'Special Deal',
    short_description TEXT,
    description TEXT,
    image TEXT,
    image_url TEXT,
    original_price NUMERIC(10, 2),
    offer_price NUMERIC(10, 2),
    discount_percentage NUMERIC(5, 2),
    currency TEXT NOT NULL DEFAULT 'LKR',
    valid_until TEXT DEFAULT 'Limited Time',
    category TEXT DEFAULT 'General',
    features JSONB DEFAULT '[]'::jsonb,
    terms JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    status TEXT NOT NULL DEFAULT 'Active',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    cta_text TEXT DEFAULT 'Claim on WhatsApp',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT NOT NULL DEFAULT to_char(now(), 'HH12:MI AM'),
    category TEXT NOT NULL,
    sub_type TEXT,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    customer_name TEXT,
    vendor TEXT,
    reference_number TEXT,
    sim_card_id TEXT,
    receipt_url TEXT,
    notes TEXT,
    created_by TEXT DEFAULT 'FR Hasan (CEO)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.estimate_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'Layers',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.estimate_sizes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    size_group TEXT NOT NULL DEFAULT 'ISO_A',
    width_mm NUMERIC(10, 2) NOT NULL,
    height_mm NUMERIC(10, 2) NOT NULL,
    width_in NUMERIC(10, 2),
    height_in NUMERIC(10, 2),
    size_type TEXT NOT NULL DEFAULT 'document',
    pouch_width_mm NUMERIC(10, 2),
    pouch_height_mm NUMERIC(10, 2),
    price_multiplier NUMERIC(10, 2) DEFAULT 1.0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_custom BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.estimate_services (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL DEFAULT 'Page',
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    price_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 10.00,
    min_quantity INTEGER NOT NULL DEFAULT 1,
    max_quantity INTEGER DEFAULT 5000,
    pricing_model TEXT NOT NULL DEFAULT 'per_page',
    allowed_size_groups JSONB DEFAULT '["ISO_A"]'::jsonb,
    allowed_size_ids JSONB DEFAULT '[]'::jsonb,
    supported_options JSONB DEFAULT '{}'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Admin',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone TEXT,
    avatar_url TEXT,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`);

  // 3. SHOP SETTINGS BACKUP
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 2. SHOP SETTINGS & PROFILE BACKUP`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  const s = data.settings;
  lines.push(`INSERT INTO public.shop_settings (
    id, shop_name, tagline, description, logo_url, hero_background_url,
    whatsapp_number, whatsapp_group_url, phone_number, email, address,
    plus_code, map_embed_url, google_maps_url, opening_hours, social_media,
    hero_content, about_content, pos_settings, updated_at
) VALUES (
    'default',
    ${escapeSqlStr(s.shopName)},
    ${escapeSqlStr(s.tagline)},
    ${escapeSqlStr(s.description)},
    ${escapeSqlStr(s.logoUrl)},
    ${escapeSqlStr(s.heroBackgroundUrl)},
    ${escapeSqlStr(s.whatsappNumber)},
    ${escapeSqlStr(s.whatsappGroupUrl)},
    ${escapeSqlStr(s.phoneNumber)},
    ${escapeSqlStr(s.email)},
    ${escapeSqlStr(s.address)},
    ${escapeSqlStr(s.plusCode)},
    ${escapeSqlStr(s.mapEmbedUrl)},
    ${escapeSqlStr(s.googleMapsUrl)},
    ${formatSqlJsonb(s.openingHours, {})},
    ${formatSqlJsonb(s.socialMedia, {})},
    ${formatSqlJsonb(s.heroContent, {})},
    ${formatSqlJsonb(s.aboutContent, {})},
    ${formatSqlJsonb(s.posSettings, {})},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    logo_url = EXCLUDED.logo_url,
    hero_background_url = EXCLUDED.hero_background_url,
    whatsapp_number = EXCLUDED.whatsapp_number,
    whatsapp_group_url = EXCLUDED.whatsapp_group_url,
    phone_number = EXCLUDED.phone_number,
    email = EXCLUDED.email,
    address = EXCLUDED.address,
    plus_code = EXCLUDED.plus_code,
    map_embed_url = EXCLUDED.map_embed_url,
    google_maps_url = EXCLUDED.google_maps_url,
    opening_hours = EXCLUDED.opening_hours,
    social_media = EXCLUDED.social_media,
    hero_content = EXCLUDED.hero_content,
    about_content = EXCLUDED.about_content,
    pos_settings = EXCLUDED.pos_settings,
    updated_at = NOW();
`);

  // 4. SERVICES CATALOG
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 3. SERVICES CATALOG BACKUP (${data.services?.length || 0} ITEMS)`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  if (data.services && data.services.length > 0) {
    for (const item of data.services) {
      lines.push(`INSERT INTO public.services (
    id, slug, name, category, icon, short_description, full_description,
    price_info, single_price, unit, image, packages, gallery_images,
    available_services_list, important_notes, featured, active, status,
    is_published, sort_order, seo_title, seo_description, seo_keywords, updated_at
) VALUES (
    ${escapeSqlStr(item.id)},
    ${escapeSqlStr(item.slug || `service-${Date.now()}`)},
    ${escapeSqlStr(item.name)},
    ${escapeSqlStr(item.category)},
    ${escapeSqlStr(item.icon || 'Printer')},
    ${escapeSqlStr(item.shortDescription)},
    ${escapeSqlStr(item.fullDescription || item.description || '')},
    ${escapeSqlStr(item.priceInfo)},
    ${formatSqlNum(item.singlePrice, null)},
    ${escapeSqlStr(item.unit)},
    ${escapeSqlStr(item.image || item.imageUrl)},
    ${formatSqlJsonb(item.packages, [])},
    ${formatSqlJsonb(item.galleryImages, [])},
    ${formatSqlJsonb(item.availableServicesList, [])},
    ${formatSqlJsonb(item.importantNotes, [])},
    ${formatSqlBool(item.featured, false)},
    ${formatSqlBool(item.active, true)},
    ${escapeSqlStr(item.status || 'Active')},
    ${formatSqlBool(item.isPublished, true)},
    ${formatSqlNum(item.sortOrder, 0)},
    ${escapeSqlStr(item.seoTitle)},
    ${escapeSqlStr(item.seoDescription)},
    ${formatSqlJsonb(item.seoKeywords, [])},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    category = EXCLUDED.category,
    icon = EXCLUDED.icon,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    price_info = EXCLUDED.price_info,
    single_price = EXCLUDED.single_price,
    unit = EXCLUDED.unit,
    image = EXCLUDED.image,
    packages = EXCLUDED.packages,
    gallery_images = EXCLUDED.gallery_images,
    available_services_list = EXCLUDED.available_services_list,
    important_notes = EXCLUDED.important_notes,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active,
    status = EXCLUDED.status,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    seo_title = EXCLUDED.seo_title,
    seo_description = EXCLUDED.seo_description,
    seo_keywords = EXCLUDED.seo_keywords,
    updated_at = NOW();`);
    }
  } else {
    lines.push(`-- (No services in database to export)`);
  }
  lines.push(``);

  // 5. SIM CARDS
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 4. SIM CARDS INVENTORY BACKUP (${data.sims?.length || 0} ITEMS)`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  if (data.sims && data.sims.length > 0) {
    for (const sim of data.sims) {
      lines.push(`INSERT INTO public.sim_cards (
    id, network, sim_type, sim_number, iccid, package, category,
    purchase_price, selling_price, status, received_date, sold_date, notes, updated_at
) VALUES (
    ${escapeSqlStr(sim.id)},
    ${escapeSqlStr(sim.network)},
    ${escapeSqlStr(sim.simType || 'Standard Prepaid 4G/5G')},
    ${escapeSqlStr(sim.simNumber)},
    ${escapeSqlStr(sim.iccid)},
    ${escapeSqlStr(sim.package)},
    ${escapeSqlStr(sim.category || 'Mobile SIM Plans')},
    ${formatSqlNum(sim.purchasePrice, 0)},
    ${formatSqlNum(sim.sellingPrice, 0)},
    ${escapeSqlStr(sim.status || 'Available')},
    ${sim.receivedDate ? escapeSqlStr(sim.receivedDate) : 'CURRENT_DATE'},
    ${sim.soldDate ? escapeSqlStr(sim.soldDate) : 'NULL'},
    ${escapeSqlStr(sim.notes)},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    network = EXCLUDED.network,
    sim_type = EXCLUDED.sim_type,
    sim_number = EXCLUDED.sim_number,
    iccid = EXCLUDED.iccid,
    package = EXCLUDED.package,
    category = EXCLUDED.category,
    purchase_price = EXCLUDED.purchase_price,
    selling_price = EXCLUDED.selling_price,
    status = EXCLUDED.status,
    received_date = EXCLUDED.received_date,
    sold_date = EXCLUDED.sold_date,
    notes = EXCLUDED.notes,
    updated_at = NOW();`);
    }
  } else {
    lines.push(`-- (No SIM cards in database to export)`);
  }
  lines.push(``);

  // 6. MOBILE PACKAGES
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 5. MOBILE & BROADBAND PACKAGES BACKUP (${data.packages?.length || 0} ITEMS)`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  if (data.packages && data.packages.length > 0) {
    for (const pkg of data.packages) {
      lines.push(`INSERT INTO public.mobile_packages (
    id, network, category, name, type, description, price, status,
    display_order, validity, quota, speed, features, badge, ussd_code,
    billing_type, updated_at
) VALUES (
    ${escapeSqlStr(pkg.id)},
    ${escapeSqlStr(pkg.network)},
    ${escapeSqlStr(pkg.category || 'Mobile SIM Plans')},
    ${escapeSqlStr(pkg.name)},
    ${escapeSqlStr(pkg.type || 'Data & Voice')},
    ${escapeSqlStr(pkg.description)},
    ${formatSqlNum(pkg.price, 0)},
    ${escapeSqlStr(pkg.status || 'Active')},
    ${formatSqlNum(pkg.displayOrder, 0)},
    ${escapeSqlStr(pkg.validity || '30 Days')},
    ${escapeSqlStr(pkg.quota)},
    ${escapeSqlStr(pkg.speed)},
    ${formatSqlJsonb(pkg.features, [])},
    ${escapeSqlStr(pkg.badge)},
    ${escapeSqlStr(pkg.ussdCode)},
    ${escapeSqlStr(pkg.billingType || 'Prepaid')},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    network = EXCLUDED.network,
    category = EXCLUDED.category,
    name = EXCLUDED.name,
    type = EXCLUDED.type,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    display_order = EXCLUDED.display_order,
    validity = EXCLUDED.validity,
    quota = EXCLUDED.quota,
    speed = EXCLUDED.speed,
    features = EXCLUDED.features,
    badge = EXCLUDED.badge,
    ussd_code = EXCLUDED.ussd_code,
    billing_type = EXCLUDED.billing_type,
    updated_at = NOW();`);
    }
  } else {
    lines.push(`-- (No packages in database to export)`);
  }
  lines.push(``);

  // 7. SPECIAL OFFERS
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 6. SPECIAL OFFERS & PROMOTIONS BACKUP (${data.offers?.length || 0} ITEMS)`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  if (data.offers && data.offers.length > 0) {
    for (const off of data.offers) {
      lines.push(`INSERT INTO public.offers (
    id, title, badge, short_description, description, image, image_url,
    original_price, offer_price, discount_percentage, currency, valid_until,
    category, features, terms, featured, active, status, is_published,
    sort_order, cta_text, updated_at
) VALUES (
    ${escapeSqlStr(off.id)},
    ${escapeSqlStr(off.title)},
    ${escapeSqlStr(off.badge || 'Special Deal')},
    ${escapeSqlStr(off.shortDescription)},
    ${escapeSqlStr(off.description)},
    ${escapeSqlStr(off.image || off.imageUrl)},
    ${escapeSqlStr(off.imageUrl || off.image)},
    ${formatSqlNum(off.originalPrice, null)},
    ${formatSqlNum(off.offerPrice, null)},
    ${formatSqlNum(off.discountPercentage, null)},
    ${escapeSqlStr(off.currency || 'LKR')},
    ${escapeSqlStr(off.validUntil || 'Limited Time')},
    ${escapeSqlStr(off.category || 'General')},
    ${formatSqlJsonb(off.features, [])},
    ${formatSqlJsonb(off.terms, [])},
    ${formatSqlBool(off.featured, false)},
    ${formatSqlBool(off.status === 'Active' || off.isPublished, true)},
    ${escapeSqlStr(off.status || 'Active')},
    ${formatSqlBool(off.isPublished, true)},
    ${formatSqlNum(off.sortOrder, 0)},
    ${escapeSqlStr(off.ctaText || 'Claim on WhatsApp')},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    badge = EXCLUDED.badge,
    short_description = EXCLUDED.short_description,
    description = EXCLUDED.description,
    image = EXCLUDED.image,
    image_url = EXCLUDED.image_url,
    original_price = EXCLUDED.original_price,
    offer_price = EXCLUDED.offer_price,
    discount_percentage = EXCLUDED.discount_percentage,
    currency = EXCLUDED.currency,
    valid_until = EXCLUDED.valid_until,
    category = EXCLUDED.category,
    features = EXCLUDED.features,
    terms = EXCLUDED.terms,
    featured = EXCLUDED.featured,
    active = EXCLUDED.active,
    status = EXCLUDED.status,
    is_published = EXCLUDED.is_published,
    sort_order = EXCLUDED.sort_order,
    cta_text = EXCLUDED.cta_text,
    updated_at = NOW();`);
    }
  } else {
    lines.push(`-- (No active offers to export)`);
  }
  lines.push(``);

  // 8. POS TRANSACTIONS
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 7. POS TRANSACTIONS (SALES & EXPENSES) BACKUP (${data.transactions?.length || 0} RECORDS)`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  if (data.transactions && data.transactions.length > 0) {
    for (const tx of data.transactions) {
      lines.push(`INSERT INTO public.pos_transactions (
    id, type, date, time, category, sub_type, description, quantity,
    unit_price, total_amount, payment_method, customer_name, vendor,
    reference_number, sim_card_id, receipt_url, notes, created_by, updated_at
) VALUES (
    ${escapeSqlStr(tx.id)},
    ${escapeSqlStr(tx.type || 'sale')},
    ${tx.date ? escapeSqlStr(tx.date) : 'CURRENT_DATE'},
    ${escapeSqlStr(tx.time || '')},
    ${escapeSqlStr(tx.category || 'Printing')},
    ${escapeSqlStr(tx.subType)},
    ${escapeSqlStr(tx.description)},
    ${formatSqlNum(tx.quantity, 1)},
    ${formatSqlNum(tx.unitPrice, 0)},
    ${formatSqlNum(tx.totalAmount, 0)},
    ${escapeSqlStr(tx.paymentMethod || 'Cash')},
    ${escapeSqlStr(tx.customerName)},
    ${escapeSqlStr(tx.vendor)},
    ${escapeSqlStr(tx.referenceNumber)},
    ${escapeSqlStr(tx.simCardId)},
    ${escapeSqlStr(tx.receiptUrl)},
    ${escapeSqlStr(tx.notes)},
    ${escapeSqlStr(tx.createdBy || 'FR Hasan (CEO)')},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    type = EXCLUDED.type,
    date = EXCLUDED.date,
    time = EXCLUDED.time,
    category = EXCLUDED.category,
    sub_type = EXCLUDED.sub_type,
    description = EXCLUDED.description,
    quantity = EXCLUDED.quantity,
    unit_price = EXCLUDED.unit_price,
    total_amount = EXCLUDED.total_amount,
    payment_method = EXCLUDED.payment_method,
    customer_name = EXCLUDED.customer_name,
    vendor = EXCLUDED.vendor,
    reference_number = EXCLUDED.reference_number,
    sim_card_id = EXCLUDED.sim_card_id,
    receipt_url = EXCLUDED.receipt_url,
    notes = EXCLUDED.notes,
    created_by = EXCLUDED.created_by,
    updated_at = NOW();`);
    }
  } else {
    lines.push(`-- (No POS transactions to export)`);
  }
  lines.push(``);

  // 9. ESTIMATE CATEGORIES, SIZES, SERVICES
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 8. ESTIMATE CALCULATOR CONFIGURATIONS BACKUP`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  
  // Categories
  if (data.estimateCategories && data.estimateCategories.length > 0) {
    for (const cat of data.estimateCategories) {
      lines.push(`INSERT INTO public.estimate_categories (
    id, name, description, icon, active, sort_order, updated_at
) VALUES (
    ${escapeSqlStr(cat.id)},
    ${escapeSqlStr(cat.name)},
    ${escapeSqlStr(cat.description)},
    ${escapeSqlStr(cat.icon || 'Layers')},
    ${formatSqlBool(cat.active, true)},
    ${formatSqlNum(cat.sortOrder, 0)},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();`);
    }
  }

  // Sizes
  if (data.estimateSizes && data.estimateSizes.length > 0) {
    for (const sz of data.estimateSizes) {
      lines.push(`INSERT INTO public.estimate_sizes (
    id, name, code, size_group, width_mm, height_mm, width_in, height_in,
    size_type, pouch_width_mm, pouch_height_mm, price_multiplier, active,
    sort_order, is_custom, updated_at
) VALUES (
    ${escapeSqlStr(sz.id)},
    ${escapeSqlStr(sz.name)},
    ${escapeSqlStr(sz.code)},
    ${escapeSqlStr(sz.sizeGroup || 'ISO_A')},
    ${formatSqlNum(sz.widthMm, 0)},
    ${formatSqlNum(sz.heightMm, 0)},
    ${formatSqlNum(sz.widthIn, null)},
    ${formatSqlNum(sz.heightIn, null)},
    ${escapeSqlStr(sz.sizeType || 'document')},
    ${formatSqlNum(sz.pouchWidthMm, null)},
    ${formatSqlNum(sz.pouchHeightMm, null)},
    ${formatSqlNum(sz.priceMultiplier, 1.0)},
    ${formatSqlBool(sz.active, true)},
    ${formatSqlNum(sz.sortOrder, 0)},
    ${formatSqlBool(sz.isCustom, false)},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    size_group = EXCLUDED.size_group,
    width_mm = EXCLUDED.width_mm,
    height_mm = EXCLUDED.height_mm,
    width_in = EXCLUDED.width_in,
    height_in = EXCLUDED.height_in,
    size_type = EXCLUDED.size_type,
    pouch_width_mm = EXCLUDED.pouch_width_mm,
    pouch_height_mm = EXCLUDED.pouch_height_mm,
    price_multiplier = EXCLUDED.price_multiplier,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    is_custom = EXCLUDED.is_custom,
    updated_at = NOW();`);
    }
  }

  // Services
  if (data.estimateServices && data.estimateServices.length > 0) {
    for (const es of data.estimateServices) {
      lines.push(`INSERT INTO public.estimate_services (
    id, category_id, name, description, unit, base_price, price_per_unit,
    min_quantity, max_quantity, pricing_model, allowed_size_groups,
    allowed_size_ids, supported_options, active, sort_order, updated_at
) VALUES (
    ${escapeSqlStr(es.id)},
    ${escapeSqlStr(es.categoryId)},
    ${escapeSqlStr(es.name)},
    ${escapeSqlStr(es.description)},
    ${escapeSqlStr(es.unit || 'Page')},
    ${formatSqlNum(es.basePrice, 10)},
    ${formatSqlNum(es.pricePerUnit || es.basePrice, 10)},
    ${formatSqlNum(es.minQuantity, 1)},
    ${formatSqlNum(es.maxQuantity, 5000)},
    ${escapeSqlStr(es.pricingModel || 'per_page')},
    ${formatSqlJsonb(es.allowedSizeGroups, ['ISO_A'])},
    ${formatSqlJsonb(es.allowedSizeIds, [])},
    ${formatSqlJsonb(es.supportedOptions, {})},
    ${formatSqlBool(es.active, true)},
    ${formatSqlNum(es.sortOrder, 0)},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    unit = EXCLUDED.unit,
    base_price = EXCLUDED.base_price,
    price_per_unit = EXCLUDED.price_per_unit,
    min_quantity = EXCLUDED.min_quantity,
    max_quantity = EXCLUDED.max_quantity,
    pricing_model = EXCLUDED.pricing_model,
    allowed_size_groups = EXCLUDED.allowed_size_groups,
    allowed_size_ids = EXCLUDED.allowed_size_ids,
    supported_options = EXCLUDED.supported_options,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();`);
    }
  }
  lines.push(``);

  // 10. ADMIN USERS & ACCOUNTS BACKUP
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 10. ADMIN USERS & AUTHENTICATION CREDENTIALS BACKUP`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  if (data.adminUsers && data.adminUsers.length > 0) {
    for (const u of data.adminUsers) {
      lines.push(`INSERT INTO public.admin_users (
    id, email, password_hash, name, role, is_active, phone, avatar_url, last_login_at, updated_at
) VALUES (
    ${escapeSqlStr(u.id)},
    ${escapeSqlStr(u.email)},
    ${escapeSqlStr(u.password || '')},
    ${escapeSqlStr(u.name)},
    ${escapeSqlStr(u.role || 'Admin')},
    ${formatSqlBool(u.isActive, true)},
    ${escapeSqlStr(u.phone)},
    ${escapeSqlStr(u.avatarUrl)},
    ${u.lastLoginAt ? escapeSqlStr(u.lastLoginAt) : 'NULL'},
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url,
    last_login_at = EXCLUDED.last_login_at,
    updated_at = NOW();`);
    }
  } else {
    // Default fallback superadmin if no users passed
    lines.push(`INSERT INTO public.admin_users (
    id, email, password_hash, name, role, is_active, phone, created_at
) VALUES (
    'user-founder-001', 'admin@frhasantech.com', 'admin123', 'FR Hasan', 'Super-Admin', true, '076 859 7800', NOW()
)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    phone = EXCLUDED.phone,
    updated_at = NOW();`);
  }
  lines.push(``);

  // 11. ROW LEVEL SECURITY (RLS) POLICIES
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`-- 11. ROW LEVEL SECURITY (RLS) & ACCESS PERMISSIONS`);
  lines.push(`-- --------------------------------------------------------------------------------------`);
  lines.push(`
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Allow full access for anon & authenticated roles for smooth store operation
DROP POLICY IF EXISTS "Public full access shop_settings" ON public.shop_settings;
CREATE POLICY "Public full access shop_settings" ON public.shop_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access services" ON public.services;
CREATE POLICY "Public full access services" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access sim_cards" ON public.sim_cards;
CREATE POLICY "Public full access sim_cards" ON public.sim_cards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access mobile_packages" ON public.mobile_packages;
CREATE POLICY "Public full access mobile_packages" ON public.mobile_packages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access offers" ON public.offers;
CREATE POLICY "Public full access offers" ON public.offers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access pos_transactions" ON public.pos_transactions;
CREATE POLICY "Public full access pos_transactions" ON public.pos_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access estimate_categories" ON public.estimate_categories;
CREATE POLICY "Public full access estimate_categories" ON public.estimate_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access estimate_sizes" ON public.estimate_sizes;
CREATE POLICY "Public full access estimate_sizes" ON public.estimate_sizes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access estimate_services" ON public.estimate_services;
CREATE POLICY "Public full access estimate_services" ON public.estimate_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public full access admin_users" ON public.admin_users;
CREATE POLICY "Public full access admin_users" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
`);

  lines.push(`COMMIT;`);
  lines.push(``);
  lines.push(`-- ======================================================================================`);
  lines.push(`-- RESTORATION COMPLETED SUCCESSFULLY`);
  lines.push(`-- Total Records Processed: ${stats.totalRecords}`);
  lines.push(`-- ======================================================================================`);

  return lines.join('\n');
};

/**
 * Downloads text/string content as a file to the client browser.
 */
export const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
