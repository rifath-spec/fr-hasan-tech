export const SUPABASE_SQL_SCHEMA = `-- ======================================================================================
-- FR.HASAN TECH - Complete Supabase PostgreSQL Database Schema & Security Setup
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

-- A. SHOP SETTINGS
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

-- B. SERVICES CATALOG
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT ('serv-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Printer',
    short_description TEXT,
    full_description TEXT,
    price_info TEXT,
    image TEXT,
    available_services_list JSONB DEFAULT '[]'::jsonb,
    important_notes JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Active',
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_services_updated_at ON public.services;
CREATE TRIGGER tr_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- C. SIM CARDS INVENTORY
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

-- D. MOBILE PACKAGES & RELOADS
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

-- E. POS TRANSACTIONS
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

-- F. ESTIMATE CATEGORIES
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

-- G. ESTIMATE SIZES (Paper, Lamination & Custom Dimensions)
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

-- H. ESTIMATE SERVICES & PRICING
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

-- I. ESTIMATE SERVICE OPTIONS
CREATE TABLE IF NOT EXISTS public.estimate_service_options (
    id TEXT PRIMARY KEY DEFAULT ('opt-' || substr(md5(random()::text), 1, 8)),
    service_id TEXT,
    option_name TEXT NOT NULL,
    option_type TEXT NOT NULL DEFAULT 'select',
    option_values JSONB NOT NULL DEFAULT '[]'::jsonb,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_estimate_service_options_updated_at ON public.estimate_service_options;
CREATE TRIGGER tr_estimate_service_options_updated_at
BEFORE UPDATE ON public.estimate_service_options
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
ALTER TABLE public.estimate_service_options ENABLE ROW LEVEL SECURITY;

-- Idempotent Policy Creation (Drops old policies if exist)
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

-- 6. ENABLE REALTIME BROADCASTING FOR ALL TABLES
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'shop_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_settings;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'services'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'sim_cards'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.sim_cards;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'mobile_packages'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mobile_packages;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'pos_transactions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pos_transactions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'estimate_categories'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.estimate_categories;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'estimate_sizes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.estimate_sizes;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'estimate_services'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.estimate_services;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'estimate_service_options'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.estimate_service_options;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL; -- Continue if publication is already configured
END $$;
`;
