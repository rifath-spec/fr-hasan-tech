export const SUPABASE_SQL_SCHEMA = `-- ======================================================================================
-- FR.HASAN TECH - Complete Supabase PostgreSQL Database Schema & Master Seed Setup
-- ======================================================================================

-- 1. EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Function to automatically refresh updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. TABLE DEFINITIONS

-- A. SHOP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    shop_name TEXT NOT NULL DEFAULT 'FR.HASAN TECH',
    tagline TEXT DEFAULT 'Your Premier Partner for Technology, Digital Printing & Mobile Services',
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
    google_maps_url TEXT DEFAULT 'https://maps.google.com/?q=FR+HASAN+TECH+Mullipotana+F37F%2B49',
    opening_hours JSONB DEFAULT '{"monFri": "7:00 AM – 10:00 PM", "sat": "7:00 AM – 10:00 PM", "sun": "7:00 AM – 10:00 PM"}'::jsonb,
    social_media JSONB DEFAULT '{"facebook": "", "instagram": "", "twitter": ""}'::jsonb,
    hero_content JSONB DEFAULT '{}'::jsonb,
    about_content JSONB DEFAULT '{}'::jsonb,
    pos_settings JSONB DEFAULT '{"currencySymbol": "LKR", "taxRate": 0, "defaultPaymentMethod": "Cash"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_shop_settings_updated_at ON public.shop_settings;
CREATE TRIGGER tr_shop_settings_updated_at
BEFORE UPDATE ON public.shop_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- B. SERVICES CATALOG TABLE (All 11 Core Store Services)
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT ('serv-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

-- Ensure all columns exist and remove any restrictive legacy check constraints
ALTER TABLE IF EXISTS public.services DROP CONSTRAINT IF EXISTS services_category_check;
ALTER TABLE IF EXISTS public.sim_cards DROP CONSTRAINT IF EXISTS sim_cards_network_check;
ALTER TABLE IF EXISTS public.sim_cards DROP CONSTRAINT IF EXISTS sim_cards_status_check;
ALTER TABLE IF EXISTS public.mobile_packages DROP CONSTRAINT IF EXISTS mobile_packages_network_check;
ALTER TABLE IF EXISTS public.pos_transactions DROP CONSTRAINT IF EXISTS pos_transactions_category_check;

ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS single_price NUMERIC(10, 2);
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS packages JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS gallery_images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS seo_title TEXT;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS seo_description TEXT;
ALTER TABLE IF EXISTS public.services ADD COLUMN IF NOT EXISTS seo_keywords JSONB DEFAULT '[]'::jsonb;

DROP TRIGGER IF EXISTS tr_services_updated_at ON public.services;
CREATE TRIGGER tr_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- C. SIM CARDS INVENTORY TABLE
CREATE TABLE IF NOT EXISTS public.sim_cards (
    id TEXT PRIMARY KEY DEFAULT ('sim-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

DROP TRIGGER IF EXISTS tr_sim_cards_updated_at ON public.sim_cards;
CREATE TRIGGER tr_sim_cards_updated_at
BEFORE UPDATE ON public.sim_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- D. MOBILE & BROADBAND PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.mobile_packages (
    id TEXT PRIMARY KEY DEFAULT ('pkg-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

DROP TRIGGER IF EXISTS tr_mobile_packages_updated_at ON public.mobile_packages;
CREATE TRIGGER tr_mobile_packages_updated_at
BEFORE UPDATE ON public.mobile_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- E. POS TRANSACTIONS (SALES & EXPENSES) TABLE
CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 8)),
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

DROP TRIGGER IF EXISTS tr_pos_transactions_updated_at ON public.pos_transactions;
CREATE TRIGGER tr_pos_transactions_updated_at
BEFORE UPDATE ON public.pos_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- F. ESTIMATE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.estimate_categories (
    id TEXT PRIMARY KEY DEFAULT ('cat-' || substr(md5(random()::text), 1, 8)),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL DEFAULT 'Layers',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_estimate_categories_updated_at ON public.estimate_categories;
CREATE TRIGGER tr_estimate_categories_updated_at
BEFORE UPDATE ON public.estimate_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- G. ESTIMATE SIZES TABLE
CREATE TABLE IF NOT EXISTS public.estimate_sizes (
    id TEXT PRIMARY KEY DEFAULT ('size-' || substr(md5(random()::text), 1, 8)),
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

DROP TRIGGER IF EXISTS tr_estimate_sizes_updated_at ON public.estimate_sizes;
CREATE TRIGGER tr_estimate_sizes_updated_at
BEFORE UPDATE ON public.estimate_sizes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- H. ESTIMATE SERVICES & PRICING TABLE
CREATE TABLE IF NOT EXISTS public.estimate_services (
    id TEXT PRIMARY KEY DEFAULT ('est-serv-' || substr(md5(random()::text), 1, 8)),
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

DROP TRIGGER IF EXISTS tr_estimate_services_updated_at ON public.estimate_services;
CREATE TRIGGER tr_estimate_services_updated_at
BEFORE UPDATE ON public.estimate_services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- I. SPECIAL OFFERS & PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT ('offer-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

DROP TRIGGER IF EXISTS tr_offers_updated_at ON public.offers;
CREATE TRIGGER tr_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- J. ADMIN USERS & AUTHENTICATION TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

DROP TRIGGER IF EXISTS tr_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER tr_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. INDEXES FOR HIGH-SPEED QUERIES
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services(is_published);
CREATE INDEX IF NOT EXISTS idx_sim_cards_network ON public.sim_cards(network);
CREATE INDEX IF NOT EXISTS idx_sim_cards_status ON public.sim_cards(status);
CREATE INDEX IF NOT EXISTS idx_mobile_packages_network ON public.mobile_packages(network);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON public.pos_transactions(date);
CREATE INDEX IF NOT EXISTS idx_est_services_category ON public.estimate_services(category_id);
CREATE INDEX IF NOT EXISTS idx_est_services_active ON public.estimate_services(active);
CREATE INDEX IF NOT EXISTS idx_est_categories_active ON public.estimate_categories(active);
CREATE INDEX IF NOT EXISTS idx_est_sizes_group ON public.estimate_sizes(size_group);
CREATE INDEX IF NOT EXISTS idx_est_sizes_active ON public.estimate_sizes(active);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_published ON public.offers(is_published);
CREATE INDEX IF NOT EXISTS idx_offers_category ON public.offers(category);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);

-- 4. GRANTS & ROLES ACCESS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public shop settings access" ON public.shop_settings;
CREATE POLICY "Public shop settings access" ON public.shop_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public services access" ON public.services;
CREATE POLICY "Public services access" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public SIM access" ON public.sim_cards;
CREATE POLICY "Public SIM access" ON public.sim_cards FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public packages access" ON public.mobile_packages;
CREATE POLICY "Public packages access" ON public.mobile_packages FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public transactions access" ON public.pos_transactions;
CREATE POLICY "Public transactions access" ON public.pos_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public estimate categories access" ON public.estimate_categories;
CREATE POLICY "Public estimate categories access" ON public.estimate_categories FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public estimate sizes access" ON public.estimate_sizes;
CREATE POLICY "Public estimate sizes access" ON public.estimate_sizes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public estimate services access" ON public.estimate_services;
CREATE POLICY "Public estimate services access" ON public.estimate_services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public offers access" ON public.offers;
CREATE POLICY "Public offers access" ON public.offers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public admin users access" ON public.admin_users;
CREATE POLICY "Public admin users access" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- 6. REALTIME BROADCASTING
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'shop_settings') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_settings;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'services') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sim_cards') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sim_cards;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'mobile_packages') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mobile_packages;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'pos_transactions') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_transactions;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'offers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_users') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_users;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- ======================================================================================
-- 7. MASTER SEED DATA INSERTION (UPSERT ALL 11 SERVICES, SETTINGS, SIMS & PACKAGES)
-- ======================================================================================

-- A. SHOP SETTINGS SEED
INSERT INTO public.shop_settings (
    id, shop_name, tagline, description, logo_url, whatsapp_number, whatsapp_group_url,
    phone_number, email, address, plus_code, map_embed_url, google_maps_url,
    opening_hours, hero_content, about_content, pos_settings
) VALUES (
    'default',
    'FR.HASAN TECH',
    'Your Premier Partner for Technology, Digital Printing & Mobile Services',
    'Specializing in high-speed digital printing, laser photocopy, authorized SIM card solutions (Dialog, Mobitel, Hutch, Airtel), network package reloads, and modern IT & digital tech services.',
    '/fr-hasan-logo.svg',
    '076 859 7800',
    'https://chat.whatsapp.com/Gn3gKNe98zeLMzwVYsETNn?s=cl&p=a&ilr=4',
    '076 859 7800',
    'contact@frhasantech.com',
    '529, Siraj Nagar, Thampalagamam, Sri Lanka',
    'F37F+49 Mullipotana',
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4717.1525016404!2d81.07080359098511!3d8.462772799999998!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3afb9f006b19d3a5%3A0x330171f2b7208671!2sFR%20HASAN%20TECH!5e1!3m2!1sen!2slk!4v1787638607633!5m2!1sen!2slk',
    'https://maps.google.com/?q=FR+HASAN+TECH+Mullipotana+F37F%2B49',
    '{"monFri": "Mon–Thu, Sat–Sun: 7:00 AM – 10:00 PM | Fri: 3:00 PM – 9:00 PM", "sat": "7:00 AM – 10:00 PM", "sun": "7:00 AM – 10:00 PM", "scheduleList": [{"day": "Monday", "hours": "7 AM – 10 PM"}, {"day": "Tuesday", "hours": "7 AM – 10 PM"}, {"day": "Wednesday", "hours": "7 AM – 10 PM"}, {"day": "Thursday", "hours": "7 AM – 10 PM"}, {"day": "Friday", "hours": "3 PM – 9 PM"}, {"day": "Saturday", "hours": "7 AM – 10 PM"}, {"day": "Sunday", "hours": "7 AM – 10 PM"}], "note": "Open Daily 7:00 AM – 10:00 PM (Friday: 3:00 PM – 9:00 PM)"}'::jsonb,
    '{"title": "FR.HASAN TECH", "tagline": "Your Premier Partner for Technology, Digital Printing & Mobile Services", "description": "Quality printing, photocopying, telecom SIM cards, package reloads, and IT services right in your neighborhood. Fast, reliable, and led with dedicated tech expertise.", "backgroundImageUrl": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1920&q=80"}'::jsonb,
    '{"title": "About FR.HASAN TECH", "subtitle": "Innovation, Connectivity & Precision Document Services", "story": "Founded by FR Hasan with a vision for modern technology solutions and community service excellence, FR.HASAN TECH is a premier one-stop center for document reproduction, color printing, mobile telecommunications connectivity, and digital package reloads. Located at 529, Siraj Nagar, Thampalagamam, Sri Lanka, we provide students, professionals, and enterprise clients with rapid turnaround and high quality.", "mission": "To deliver fast, reliable, state-of-the-art printing, telecommunications connectivity, and IT services with honest local care and cutting-edge standards.", "ceoName": "FR Hasan", "ceoTitle": "Founder & Chief Executive Officer (CEO)", "ceoPhoto": "https://res.cloudinary.com/dut2fzqdd/image/upload/v1787850870/WhatsApp_Image_2026-08-27_at_7.46.48_PM.jpg", "ceoBio": "FR Hasan is the founder and visionary leader of FR.HASAN TECH. Managing direct tech operations, telecommunication network reloads, and high-speed digital print services from our Thampalagamam center, he oversees the company''s continuous commitment to customer satisfaction, fast turnaround times, and friendly neighborhood service.", "ceoQuote": "Empowering individuals and local businesses through reliable technology, seamless telecommunication connectivity, and precision digital print solutions."}'::jsonb,
    '{"currencySymbol": "LKR", "taxRate": 0, "defaultPaymentMethod": "Cash", "receiptHeader": "FR.HASAN TECH\\n529, Siraj Nagar, Thampalagamam\\nWhatsApp / Tel: 076 859 7800", "receiptFooter": "Thank you for choosing FR.HASAN TECH!\\nPlease visit us again.", "enableExpenseTracking": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    shop_name = EXCLUDED.shop_name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    whatsapp_number = EXCLUDED.whatsapp_number,
    phone_number = EXCLUDED.phone_number,
    address = EXCLUDED.address,
    opening_hours = EXCLUDED.opening_hours,
    about_content = EXCLUDED.about_content,
    pos_settings = EXCLUDED.pos_settings,
    updated_at = NOW();

-- B. ALL 11 CORE STORE SERVICES SEED
INSERT INTO public.services (
    id, slug, name, category, icon, short_description, full_description,
    price_info, single_price, unit, image, packages, available_services_list,
    important_notes, featured, active, status, is_published, sort_order,
    seo_title, seo_description, seo_keywords
) VALUES
(
    'serv-printing-1', 'printing', 'Color & A3 Printing', 'Printing', 'Printer',
    'Large-format vivid color prints, photo paper printing, and high-resolution color sheets.',
    'High-definition vibrant colour printing for posters, blueprints, architectural drawings, photo collages, certificates, and presentation sheets.',
    'From LKR 100', 100, 'Sheet',
    'https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?auto=format&fit=crop&w=1200&q=80',
    '[{"id": "a3-pkg-normal", "name": "A3 Normal Sheet", "price": 100, "currency": "LKR", "description": "Standard 80gsm A3 paper full-colour laser printing.", "active": true}, {"id": "a3-pkg-photo", "name": "A3 Photo Print", "price": 500, "currency": "LKR", "description": "Ultra-high-gloss 230gsm photo paper archival studio color print.", "active": true}]'::jsonb,
    '["A3 & A4 Full-Color Presentation & Project Sheets", "Architectural & Engineering Drawings", "High-Gloss Studio Photo Enlargements", "Event Posters & Notice Announcements", "Protective Lamination Available"]'::jsonb,
    '["For maximum photographic clarity, submit files at 300 DPI.", "Laser toner provides water-resistant and smudge-free results."]'::jsonb,
    true, true, 'Active', true, 1,
    'High-Definition Color & A3 Printing | FR.HASAN TECH',
    'Vibrant color and A3 printing for architectural plans, posters, and studio photo prints on premium paper stocks.',
    '["printing", "A3 color printing", "poster printing", "photo print A3", "laser printing Sri Lanka"]'::jsonb
),
(
    'serv-vis-cards', 'visiting-cards', 'Visiting Cards', 'Visiting Cards', 'CreditCard',
    'Make a lasting first impression with sharp, high-grade business and visiting cards.',
    'Premium visiting & business card design and crisp high-speed digital printing with single/double-sided options.',
    'From LKR 500', 500, 'Pack',
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80',
    '[{"id": "vc-pkg-plus", "name": "Plus", "price": 500, "currency": "LKR", "description": "Single-sided standard matte 300gsm visiting cards design & print pack.", "active": true}, {"id": "vc-pkg-premium", "name": "Premium", "price": 750, "currency": "LKR", "description": "Double-sided glossy / soft-touch laminated business cards with sharp color fidelity.", "active": true}, {"id": "vc-pkg-pro", "name": "Pro", "price": 1000, "currency": "LKR", "description": "Executive luxury card pack with rounded corners, premium textured cardstock, and bespoke styling.", "active": true}]'::jsonb,
    '["Single & Double-Sided Precision Layouts", "Matte, Gloss, and Soft-Touch Protective Coating", "Executive Textured & Heavyweight Cardstocks", "QR Code & Social Links Integration", "Fast Turnaround Printing & Reprints"]'::jsonb,
    '["Standard pack sizes available from 50 to 500+ cards upon request.", "Corporate bulk discounts applied for team orders."]'::jsonb,
    true, true, 'Active', true, 2,
    'Premium Visiting Cards & Business Cards | FR.HASAN TECH',
    'Visiting cards design and printing with Plus (LKR 500), Premium (LKR 750), and Pro (LKR 1,000) packages.',
    '["visiting cards", "business card printing", "business cards Sri Lanka", "visiting card design"]'::jsonb
),
(
    'serv-inv-cards', 'invitation-card', 'Invitation Card', 'Invitation Card', 'Mail',
    'Custom wedding and cultural celebration cards designed to make your special moments memorable.',
    'Elegant and bespoke invitation card design and printing for weddings, cultural festivals, parties, and corporate ceremonies.',
    'From LKR 500', 500, 'Design',
    'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=1200&q=80',
    '[{"id": "inv-pkg-wedding", "name": "Wedding Invitation", "price": 500, "currency": "LKR", "description": "Bespoke floral and contemporary wedding invitation card design.", "active": true}, {"id": "inv-pkg-cultural", "name": "Cultural Invitation", "price": 1000, "currency": "LKR", "description": "Traditional and cultural ceremonies, temple functions, and festival invitation design.", "active": true}]'::jsonb,
    '["Wedding Invitations (Floral, Vintage & Modern)", "Temple & Cultural Ceremony Event Cards", "Birthday, Anniversary & Party Invitations", "Envelope Design & Matching Custom Inserts", "Digital E-Invitations & High-Res Print Copies"]'::jsonb,
    '["Preview drafts are sent via WhatsApp for review before final bulk production.", "Paper cardstock upgrades available on request."]'::jsonb,
    true, true, 'Active', true, 3,
    'Wedding & Cultural Invitation Card Design | FR.HASAN TECH',
    'Custom invitation cards for weddings, cultural ceremonies, and corporate events with high-definition digital printing.',
    '["invitation card", "invitation cards", "wedding card design", "cultural invitation", "invitation printing Sri Lanka"]'::jsonb
),
(
    'serv-cert-design', 'certificate-design', 'Certificate Design', 'Certificate Design', 'Award',
    'Custom appreciation, achievement, and workshop certificate templates tailored for your organization.',
    'High-quality custom certificate design for academic institutions, sports events, workshops, and corporate awards.',
    'From LKR 200', 200, 'Design',
    'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&w=1200&q=80',
    '[{"id": "cert-pkg-plus", "name": "Plus", "price": 200, "currency": "LKR", "description": "Single custom certificate template design with standard border and typography.", "active": true}, {"id": "cert-pkg-premium", "name": "Premium", "price": 450, "currency": "LKR", "description": "Advanced multi-tier certificate design with custom emblem and signatures layout.", "active": true}, {"id": "cert-pkg-pro", "name": "Pro", "price": 750, "currency": "LKR", "description": "Bespoke commemorative certificate suite with bulk recipient name merging.", "active": true}]'::jsonb,
    '["Sports & Academic Award Certificates", "Corporate Recognition & Achievement Templates", "Bulk Recipient Name Merging", "High-Resolution Vector Printing Layouts", "Gold/Silver Border & Official Seal Styling"]'::jsonb,
    '["Vector logos and signatory details should be provided in high resolution.", "Bulk name data can be accepted via Excel or WhatsApp text."]'::jsonb,
    false, true, 'Active', true, 4,
    'Custom Certificate Design & Printing | FR.HASAN TECH',
    'High quality custom certificate design for schools, sports, and corporate events with Plus, Premium, and Pro tiers.',
    '["certificate design", "award certificates", "sports certificates", "event printing"]'::jsonb
),
(
    'serv-cv-creation', 'cv-creation', 'CV Creation', 'CV Creation', 'FileCheck',
    'High-impact resume and CV writing & layout designed to help you stand out to employers.',
    'Professional CV & resume creation service tailored for corporate, technical, academic, and overseas career profiles.',
    'From LKR 350', 350, 'CV',
    'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80',
    '[{"id": "cv-pkg-plus", "name": "Plus", "price": 350, "currency": "LKR", "description": "Standard single-page professional resume layout with modern typography and clean formatting.", "active": true}, {"id": "cv-pkg-premium", "name": "Premium", "price": 600, "currency": "LKR", "description": "Comprehensive multi-page tailored resume design with cover letter template and editable source format.", "active": true}, {"id": "cv-pkg-pro", "name": "Pro", "price": 1000, "currency": "LKR", "description": "Executive multi-format CV design, ATS-optimized formatting, custom portfolio summary, and priority revisions.", "active": true}]'::jsonb,
    '["Modern & Executive CV Layouts", "ATS-Friendly Formatting & Styling", "Professional Cover Letter Drafting", "Bilingual Support (Tamil / English)", "Print-Ready PDF & Editable Source Files"]'::jsonb,
    '["Provide accurate employment history, education, and contact details for fast turnaround.", "Includes up to 2 complimentary revision rounds."]'::jsonb,
    true, true, 'Active', true, 5,
    'Professional CV & Resume Creation Service | FR.HASAN TECH',
    'Create a professional CV with our affordable CV design service. Choose from Plus (LKR 350), Premium (LKR 600), and Pro (LKR 1,000) packages.',
    '["cv creation", "CV creation", "resume design", "professional CV Sri Lanka", "job application", "ATS resume"]'::jsonb
),
(
    'serv-office-install', 'microsoft-office-installation', 'Microsoft Office Installation', 'Microsoft Office Installation', 'FileText',
    'Word, Excel, PowerPoint, and Outlook office productivity suite setup and configuration.',
    'Microsoft Office installation and basic setup service for computers and laptops.',
    'LKR 1,000', 1000, 'PC / Laptop',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    '[]'::jsonb,
    '["Word, Excel, PowerPoint, and Outlook Setup", "Font & Language Proofing Tools Configuration", "Cloud & Local Document Storage Setup", "Basic Workflow & Formatting Setup"]'::jsonb,
    '["Installation and setup assistance only; official license keys are entered by administrator/client.", "Configured for optimal stability and smooth performance."]'::jsonb,
    false, true, 'Active', true, 6,
    'Microsoft Office Installation & Setup | FR.HASAN TECH',
    'Professional Microsoft Office configuration and productivity tools setup for desktop and laptops.',
    '["microsoft office installation", "Microsoft Office installation", "Office suite setup", "Word Excel PowerPoint", "computer setup"]'::jsonb
),
(
    'serv-win-install', 'windows-installation', 'Windows Installation', 'Windows Installation', 'Laptop',
    'Clean OS installation, driver setup, and performance configuration for desktop PC and laptops.',
    'Professional Windows installation service for computers and laptops, including system setup and basic configuration.',
    'Starting from LKR 1,500', 1500, 'System',
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
    '[]'::jsonb,
    '["Windows 10 & Windows 11 Fresh Installation", "Motherboard, GPU & Network Driver Setup", "Essential Productivity Software Configuration", "Security & Antivirus Configuration", "Data Backup & Migration Assistance", "System Speed & Storage Optimization"]'::jsonb,
    '["Please back up critical files before full drive formatting.", "Genuine activation licenses can be configured upon customer request."]'::jsonb,
    true, true, 'Active', true, 7,
    'Professional Windows Installation & Laptop Setup | FR.HASAN TECH',
    'Expert Windows 10 & 11 operating system installation, driver configuration, and laptop setup services in Thampalagamam.',
    '["windows installation", "Windows installation", "laptop repair", "OS setup", "computer services", "Thampalagamam", "Sri Lanka"]'::jsonb
),
(
    'serv-doc-print', 'document-printing', 'Document Printing', 'Document Printing', 'Printer',
    'Sharp digital document printing directly from WhatsApp, USB drives, email, or Google Drive.',
    'Digital laser document printing for assignments, official forms, legal briefs, e-tickets, and exam papers.',
    'From LKR 10 / page', 10, 'page',
    'https://images.unsplash.com/photo-1589330694653-dad6bc01cf0f?auto=format&fit=crop&w=1200&q=80',
    '[]'::jsonb,
    '["Direct WhatsApp & Email Document Printing", "A4 Black & White High-Speed Laser Prints", "Full-Colour Report & Thesis Printing", "Official Application & Form Printing", "Instant Online Exam Slip & Ticket Printouts"]'::jsonb,
    '["Documents can be forwarded directly via WhatsApp for instant print and pickup."]'::jsonb,
    false, true, 'Active', true, 8,
    'Laser Document Printing & Printout Service | FR.HASAN TECH',
    'Print assignments, documents, reports, and tickets from WhatsApp, USB, or Email instantly with crisp laser clarity.',
    '["document printing", "printout service", "laser print", "WhatsApp print", "Thampalagamam"]'::jsonb
),
(
    'serv-pkg-1', 'packages', 'Mobile & Broadband Packages', 'Packages', 'Package',
    'Explore, activate, and reload high-speed unlimited internet bundles, social packs, and router plans.',
    'Explore and activate high-speed data bundles, unlimited YouTube/TikTok/Social media packs, voice combos, and home Wi-Fi broadband plans.',
    'Official Network Rates', NULL, NULL,
    'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80',
    '[]'::jsonb,
    '["Anytime & Night-Time 4G/5G Data Add-ons", "Unlimited Social Media & Streaming Packs", "Unlimited Voice & Any-Net Call Plans", "Home Broadband 4G Wi-Fi Router Packages", "Instant Over-The-Air Digital Bill Reloads"]'::jsonb,
    '["Instant activation upon phone number confirmation."]'::jsonb,
    false, true, 'Active', true, 9,
    'Mobile Data & Broadband Router Packages | FR.HASAN TECH',
    'Compare and activate the best Dialog, Mobitel, Hutch, and Airtel data bundles, social packs, and router plans.',
    '["packages", "data packages", "broadband packages", "unlimited data Sri Lanka", "Dialog packages", "Mobitel packages"]'::jsonb
),
(
    'serv-sim-1', 'sim-cards', 'SIM Card Solutions', 'SIM Cards', 'Smartphone',
    'Official Dialog, Mobitel, Hutch, and Airtel 4G/5G SIM card registration and replacements.',
    'Authorized telecom partner providing instant biometric NIC SIM registration, e-SIM setup, ownership transfers, and tourist SIMs.',
    'Official Telco Rates', 200, 'SIM',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=80',
    '[]'::jsonb,
    '["New 4G / 5G Prepaid SIM Activation", "Dialog, Mobitel, Hutch & Airtel Provider Cards", "Instant NIC Biometric SIM Registration", "Micro, Nano & Standard Triple-Cut SIMs", "Tourist SIM Cards & Special Data SIMs"]'::jsonb,
    '["Original National Identity Card (NIC), Passport, or Driving License is mandatory for activation."]'::jsonb,
    true, true, 'Active', true, 10,
    'Official SIM Cards & 4G/5G Activation | FR.HASAN TECH',
    'Authorized Dialog, Mobitel, Hutch, and Airtel SIM cards in Thampalagamam with instant registration.',
    '["sim cards", "SIM cards", "Dialog SIM", "Mobitel SIM", "Hutch SIM", "Airtel SIM", "SIM registration"]'::jsonb
),
(
    'serv-photocopy-1', 'photocopy', 'Photocopy Services', 'Photocopy', 'Copy',
    'High-speed black & white and crisp colour laser photocopying for all document sizes.',
    'High-speed black & white and colour photocopying in A4, Legal, and A3 formats with double-sided and book copy capabilities.',
    'From LKR 5 / page', 5, 'page',
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
    '[]'::jsonb,
    '["A4 Single / Double-Sided B&W Copy", "Legal Size Document Photocopying", "Vibrant Full-Colour Laser Copies", "Book & Certificate ID Duplication", "Bulk Student & Corporate Rates"]'::jsonb,
    '["Special discounted bulk pricing applies for orders exceeding 100 pages."]'::jsonb,
    false, true, 'Active', true, 11,
    'Fast Laser Photocopy Services | FR.HASAN TECH',
    'Fast, high-quality B&W and color photocopying in A4, Legal, and A3 sizes with student and corporate rates.',
    '["photocopy", "laser copy", "black and white photocopy", "color photocopy", "Thampalagamam"]'::jsonb
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
    updated_at = NOW();

-- C. SIM CARDS INVENTORY SEED
INSERT INTO public.sim_cards (
    id, network, sim_type, sim_number, iccid, package, category,
    purchase_price, selling_price, status, received_date, notes
) VALUES
('sim-d-001', 'Dialog', 'Standard Prepaid 4G/5G', '077 412 8901', '8994020010045239101', 'Prepaid 4G Triple-Cut SIM', 'Mobile SIM Plans', 150.00, 200.00, 'Available', '2026-08-15', 'Official Dialog authorized stock'),
('sim-d-002', 'Dialog', 'Standard Prepaid 4G/5G', '077 829 4502', '8994020010045239102', 'Prepaid 4G Triple-Cut SIM', 'Mobile SIM Plans', 150.00, 200.00, 'Available', '2026-08-15', 'Official Dialog authorized stock'),
('sim-m-001', 'Mobitel', 'Standard Prepaid 4G/5G', '071 632 9912', '8994010020056123401', 'Mobitel 4G/5G Prepaid SIM', 'Mobile SIM Plans', 150.00, 200.00, 'Available', '2026-08-16', 'SLT-Mobitel authorized dealer stock'),
('sim-m-002', 'Mobitel', 'Standard Prepaid 4G/5G', '070 415 8823', '8994010020056123402', 'Mobitel 4G/5G Prepaid SIM', 'Mobile SIM Plans', 150.00, 200.00, 'Available', '2026-08-16', 'SLT-Mobitel authorized dealer stock'),
('sim-h-001', 'Hutch', 'Standard Prepaid 4G/5G', '078 521 7734', '8994080030078912301', 'Hutch 078 Mega Data SIM', 'Mobile SIM Plans', 120.00, 200.00, 'Available', '2026-08-18', 'Hutch nationwide 4G coverage'),
('sim-h-002', 'Hutch', 'Standard Prepaid 4G/5G', '072 901 3341', '8994080030078912302', 'Hutch 072 Mega Data SIM', 'Mobile SIM Plans', 120.00, 200.00, 'Available', '2026-08-18', 'Hutch nationwide 4G coverage'),
('sim-a-001', 'Airtel', 'Standard Prepaid 4G/5G', '075 229 1184', '8994050040089123401', 'Airtel 4G Freedom SIM', 'Mobile SIM Plans', 120.00, 200.00, 'Available', '2026-08-20', 'Airtel 5G Ready SIM'),
('sim-a-002', 'Airtel', 'Standard Prepaid 4G/5G', '075 640 9921', '8994050040089123402', 'Airtel 4G Freedom SIM', 'Mobile SIM Plans', 120.00, 200.00, 'Available', '2026-08-20', 'Airtel 5G Ready SIM')
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
    notes = EXCLUDED.notes,
    updated_at = NOW();

-- D. MOBILE & BROADBAND PACKAGES SEED
INSERT INTO public.mobile_packages (
    id, network, category, name, type, description, price, status,
    display_order, validity, quota, speed, features, badge, ussd_code, billing_type
) VALUES
('pkg-d-unlimited', 'Dialog', 'Social & Streaming', 'Unlimited Flash 30-Day', 'Unlimited', 'Unlimited high-speed YouTube, TikTok, Facebook, WhatsApp, Instagram & Spotify with bonus anytime data.', 1190.00, 'Active', 1, '30 Days', 'Unlimited Social + 10GB Data', 'High-speed 4G/5G', '["Unlimited YouTube & TikTok", "Unlimited FB & WhatsApp", "10GB Extra Anytime Data", "Valid 30 Days"]'::jsonb, 'Popular', '#678#', 'Prepaid'),
('pkg-d-worklearn', 'Dialog', 'Work & Study', 'Work & Learn Plus', 'Work & Study', 'Dedicated high-speed bandwidth for Zoom, MS Teams, Google Meet, and Office 365.', 595.00, 'Active', 2, '30 Days', '30GB Work Quota', 'Priority Speed', '["Zoom & MS Teams Unlimited", "Google Classroom & Meet", "Office 365 Cloud Access", "30 Days Validity"]'::jsonb, 'Student Choice', '#678#', 'Prepaid'),
('pkg-m-streaming', 'Mobitel', 'Social & Streaming', 'Unlimited Social & Streaming', 'Unlimited', 'Non-stop video streaming and social connectivity on SLT-Mobitel high-speed network.', 840.00, 'Active', 3, '30 Days', 'Unlimited HD Streaming', '4G LTE', '["YouTube Unlimited", "Facebook & WhatsApp Unlimited", "Instagram & Messenger", "HD Video Quality"]'::jsonb, 'Best Value', '#170#', 'Prepaid'),
('pkg-m-anynet', 'Mobitel', 'Mobile SIM Plans', 'AnyNet Voice & 10GB Data', 'Combo', 'Unlimited calls to all local Sri Lankan mobile and landline networks + 10GB anytime data.', 999.00, 'Active', 4, '30 Days', '10GB Anytime + Unlimited Calls', 'Standard 4G', '["Unlimited AnyNet Voice Calls", "1000 SMS to Any Network", "10GB Anytime 4G Data", "No Peak/Off-peak Limits"]'::jsonb, 'Voice Combo', '#170#', 'Prepaid'),
('pkg-h-social', 'Hutch', 'Social & Streaming', 'Unlimited Social & YouTube 30D', 'Unlimited', 'Ultimate affordable unlimited social media package for budget-conscious users.', 499.00, 'Active', 5, '30 Days', 'Unlimited Socials', 'High-speed 4G', '["YouTube Unlimited", "Facebook & WhatsApp", "TikTok & Instagram", "30 Days Duration"]'::jsonb, 'Budget Pick', '*123#', 'Prepaid'),
('pkg-h-mega', 'Hutch', 'Mobile SIM Plans', 'Mega Data 50GB Anytime', 'Data', 'Heavy download and gaming data package with 50GB anytime data without daytime restrictions.', 1290.00, 'Active', 6, '30 Days', '50GB Anytime Data', 'Max 4G Speed', '["50GB 24/7 Any-time Data", "No daily speed caps", "Perfect for hotspot & tethering", "30 Days Validity"]'::jsonb, 'Heavy Data', '*123#', 'Prepaid'),
('pkg-a-freedom', 'Airtel', 'Mobile SIM Plans', 'Airtel Freedom Unlimited 30D', 'Combo', 'Unlimited AnyNet calls, unlimited SMS, plus 40GB high-speed 4G data allowance.', 998.00, 'Active', 7, '30 Days', '40GB Data + Unlimited Calls', '4G LTE / 5G Ready', '["Unlimited Any-Net Voice Calls", "Unlimited SMS", "40GB Total 4G Data (1.3GB/day)", "Valid 30 Days"]'::jsonb, 'All-In-One', '*555#', 'Prepaid'),
('pkg-a-voice', 'Airtel', 'Mobile SIM Plans', 'Airtel Any-Net Voice Plan', 'Voice', 'Affordable unlimited voice calling plan for seamless calling across Sri Lanka.', 499.00, 'Active', 8, '30 Days', 'Unlimited Calls + 2GB Data', 'Standard 4G', '["Unlimited Voice to All Networks", "500 SMS to Any Network", "2GB Bonus Data", "30 Days Validity"]'::jsonb, 'Saver Plan', '*555#', 'Prepaid')
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
    updated_at = NOW();

-- E. SAMPLE POS TRANSACTIONS SEED
INSERT INTO public.pos_transactions (
    id, type, date, time, category, sub_type, description, quantity,
    unit_price, total_amount, payment_method, customer_name, vendor, created_by
) VALUES
('tx-20260901-001', 'sale', '2026-09-01', '09:30 AM', 'Printing', 'Document B&W', 'Document Laser Printing (45 Pages)', 45, 10.00, 450.00, 'Cash', 'Mohamed Rizwan', NULL, 'FR Hasan (CEO)'),
('tx-20260901-002', 'sale', '2026-09-01', '11:15 AM', 'SIM Cards', 'Dialog 4G/5G SIM', 'Dialog 4G Prepaid Triple-Cut SIM Card Activation', 1, 200.00, 200.00, 'Cash', 'A. K. Thilakaratne', NULL, 'FR Hasan (CEO)'),
('tx-20260901-003', 'sale', '2026-09-01', '02:00 PM', 'Visiting Cards', 'Invitation / Card Printing', 'Visiting Cards Plus Pack (Single-Sided Matte 300gsm)', 1, 500.00, 500.00, 'Cash', 'Siraj Super Market', NULL, 'FR Hasan (CEO)'),
('tx-20260901-004', 'expense', '2026-09-01', '04:20 PM', 'Office Supplies', NULL, 'A4 80gsm Copier Paper 5-Ream Box Restock', 1, 4200.00, 4200.00, 'Cash', NULL, 'Trincomalee Stationers', 'FR Hasan (CEO)')
ON CONFLICT (id) DO NOTHING;

-- F. ESTIMATE CATEGORIES SEED
INSERT INTO public.estimate_categories (id, name, description, icon, active, sort_order) VALUES
('cat-photocopy', 'Photocopy', 'Black & White and Colour high-speed laser photocopies in all standard sizes', 'Copy', true, 1),
('cat-printing', 'Printing', 'Crisp black & white laser and inkjet document printing from digital files', 'Printer', true, 2),
('cat-colour-printing', 'Colour Printing', 'High-definition full-color prints for presentations, certificates, and reports', 'Palette', true, 3),
('cat-lamination', 'Lamination', 'Thermal protective pouch lamination from ID card size up to A3 and banners', 'Shield', true, 4),
('cat-scanning', 'Scanning', 'Ultra-clear digital scanning of documents, certificates & photos to PDF or JPG', 'Scan', true, 5),
('cat-binding', 'Binding', 'Plastic comb, spiral, wire-o, tape, and hardcover book binding', 'BookOpen', true, 6),
('cat-photo-printing', 'Photo Printing', 'Lab-grade glossy photo printing, studio portraits, and passport photos', 'Camera', true, 7),
('cat-id-services', 'ID & Document Services', 'National ID card, driving license photocopies, laminations, and typing', 'FileBadge', true, 8),
('cat-other-services', 'Other Services', 'Document formatting, graphic touch-up, email submission, and digital assistance', 'Layers', true, 9)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- G. ESTIMATE SIZES SEED (Standard ISO & Document Sizes)
INSERT INTO public.estimate_sizes (id, name, code, size_group, width_mm, height_mm, width_in, height_in, size_type, price_multiplier, active, sort_order) VALUES
('size-iso-a4', 'A4 (Standard Document)', 'A4', 'ISO_A', 210, 297, 8.27, 11.69, 'document', 1.0, true, 1),
('size-iso-a3', 'A3 (Large Document / Ledger)', 'A3', 'ISO_A', 297, 420, 11.69, 16.54, 'document', 2.0, true, 2),
('size-iso-a5', 'A5 (Half A4 / Booklet)', 'A5', 'ISO_A', 148, 210, 5.83, 8.27, 'document', 0.75, true, 3),
('size-iso-a6', 'A6 (Postcard / Flyer)', 'A6', 'ISO_A', 105, 148, 4.13, 5.83, 'document', 0.5, true, 4),
('size-iso-a2', 'A2 (Poster / Drawing)', 'A2', 'ISO_A', 420, 594, 16.54, 23.39, 'document', 4.0, true, 5),
('size-us-legal', 'US Legal (8.5 x 14 in)', 'Legal', 'US_STANDARD', 216, 356, 8.5, 14.0, 'document', 1.25, true, 6),
('size-card-id', 'Standard ID Card Size', 'ID_CARD', 'CARD_ID', 54, 86, 2.13, 3.39, 'card', 0.4, true, 7),
('size-card-business', 'Standard Visiting Card', 'BIZ_CARD', 'CARD_ID', 55, 90, 2.17, 3.54, 'card', 0.4, true, 8)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    size_group = EXCLUDED.size_group,
    width_mm = EXCLUDED.width_mm,
    height_mm = EXCLUDED.height_mm,
    price_multiplier = EXCLUDED.price_multiplier,
    active = EXCLUDED.active,
    sort_order = EXCLUDED.sort_order,
    updated_at = NOW();

-- H. ADMIN USERS & CREDENTIALS SEED
INSERT INTO public.admin_users (id, email, password_hash, name, role, is_active, phone, created_at) VALUES
('user-founder-001', 'admin@frhasantech.com', 'admin123', 'FR Hasan', 'Super-Admin', true, '076 859 7800', NOW()),
('user-founder-002', 'ceo@frhasantech.com', 'admin123', 'FR Hasan (Founder & CEO)', 'Super-Admin', true, '076 859 7800', NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    phone = EXCLUDED.phone,
    updated_at = NOW();
`;

// Standalone migration script for adding JUST the Special Offers & Promotions table to an existing Supabase instance
export const SUPABASE_OFFERS_SQL_MIGRATION = `-- ======================================================================================
-- FR.HASAN TECH - Standalone Special Offers Table Migration
-- Run this in your Supabase SQL Editor if you already initialized the database earlier
-- ======================================================================================

-- 1. CREATE OFFERS TABLE
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY DEFAULT ('offer-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

-- 2. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_offers_updated_at ON public.offers;
CREATE TRIGGER tr_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_published ON public.offers(is_published);
CREATE INDEX IF NOT EXISTS idx_offers_category ON public.offers(category);

-- 4. PERMISSIONS & ROW LEVEL SECURITY
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.offers TO anon, authenticated, service_role;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public offers access" ON public.offers;
CREATE POLICY "Public offers access" ON public.offers FOR ALL USING (true) WITH CHECK (true);

-- 5. REALTIME REPLICATION
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'offers') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.offers;
    END IF;
END $$;
`;

// Standalone migration script for adding JUST the Admin Users & Authentication table to an existing Supabase instance
export const SUPABASE_ADMIN_USERS_SQL_MIGRATION = `-- ======================================================================================
-- FR.HASAN TECH - Standalone Admin Users & Authentication Table Migration
-- Run this in your Supabase SQL Editor to enable database-backed staff & admin accounts
-- ======================================================================================

-- 1. CREATE ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS public.admin_users (
    id TEXT PRIMARY KEY DEFAULT ('user-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
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

-- 2. TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER tr_admin_users_updated_at
BEFORE UPDATE ON public.admin_users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users(is_active);

-- 4. PERMISSIONS & ROW LEVEL SECURITY
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admin_users TO anon, authenticated, service_role;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public admin users access" ON public.admin_users;
CREATE POLICY "Public admin users access" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);

-- 5. SEED INITIAL SUPER-ADMIN ACCOUNTS
INSERT INTO public.admin_users (id, email, password_hash, name, role, is_active, phone, created_at) VALUES
('user-founder-001', 'admin@frhasantech.com', 'admin123', 'FR Hasan', 'Super-Admin', true, '076 859 7800', NOW()),
('user-founder-002', 'ceo@frhasantech.com', 'admin123', 'FR Hasan (Founder & CEO)', 'Super-Admin', true, '076 859 7800', NOW())
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    phone = EXCLUDED.phone,
    updated_at = NOW();

-- 6. REALTIME REPLICATION
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'admin_users') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_users;
    END IF;
END $$;
`;


