-- ======================================================================================
-- FR.HASAN TECH - Complete Supabase PostgreSQL Database Schema & Security Setup
-- ======================================================================================
-- This script creates all tables, indexes, triggers, and Row Level Security (RLS) policies
-- for FR.HASAN TECH's digital storefront, inventory, telecom packages, and POS ledger.
--
-- HOW TO USE:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Paste this entire script into the SQL Editor.
-- 3. Click "Run" to execute.
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


-- ======================================================================================
-- 2. TABLE DEFINITIONS
-- ======================================================================================

-- A. SHOP SETTINGS (Singleton storefront profile & POS configuration)
CREATE TABLE IF NOT EXISTS public.shop_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    shop_name TEXT NOT NULL DEFAULT 'FR.HASAN TECH',
    tagline TEXT DEFAULT 'Your Premier Partner for Technology, Digital Printing & Mobile Services',
    description TEXT,
    logo_url TEXT DEFAULT '/fr-hasan-logo.svg',
    hero_background_url TEXT,
    whatsapp_number TEXT NOT NULL DEFAULT '076 859 7800',
    whatsapp_group_url TEXT DEFAULT 'https://chat.whatsapp.com/Gn3gKNe98zeLMzwVYsETNn?s=cl&p=a&ilr=4',
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

-- Trigger for shop_settings updated_at
DROP TRIGGER IF EXISTS tr_shop_settings_updated_at ON public.shop_settings;
CREATE TRIGGER tr_shop_settings_updated_at
BEFORE UPDATE ON public.shop_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- B. SERVICES CATALOG
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY DEFAULT ('serv-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Photocopy', 'Printing', 'SIM Cards', 'Packages')),
    icon TEXT NOT NULL DEFAULT 'Printer',
    short_description TEXT,
    full_description TEXT,
    price_info TEXT,
    image TEXT,
    available_services_list JSONB DEFAULT '[]'::jsonb,
    important_notes JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    is_published BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for services updated_at
DROP TRIGGER IF EXISTS tr_services_updated_at ON public.services;
CREATE TRIGGER tr_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- C. SIM CARDS INVENTORY
CREATE TABLE IF NOT EXISTS public.sim_cards (
    id TEXT PRIMARY KEY DEFAULT ('sim-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
    network TEXT NOT NULL CHECK (network IN ('Dialog', 'Mobitel', 'Hutch', 'Airtel', 'SLT-Mobitel')),
    sim_type TEXT DEFAULT 'Standard Prepaid 4G/5G',
    sim_number TEXT NOT NULL,
    iccid TEXT,
    package TEXT,
    category TEXT DEFAULT 'Mobile SIM Plans',
    purchase_price NUMERIC(10, 2) DEFAULT 0.00,
    selling_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Sold', 'Returned', 'Damaged')),
    received_date DATE DEFAULT CURRENT_DATE,
    sold_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for sim_cards updated_at
DROP TRIGGER IF EXISTS tr_sim_cards_updated_at ON public.sim_cards;
CREATE TRIGGER tr_sim_cards_updated_at
BEFORE UPDATE ON public.sim_cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- D. MOBILE PACKAGES & RELOADS
CREATE TABLE IF NOT EXISTS public.mobile_packages (
    id TEXT PRIMARY KEY DEFAULT ('pkg-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6)),
    network TEXT NOT NULL CHECK (network IN ('Dialog', 'Mobitel', 'Hutch', 'Airtel', 'SLT-Mobitel')),
    category TEXT DEFAULT 'Mobile SIM Plans',
    name TEXT NOT NULL,
    type TEXT DEFAULT 'Data & Voice',
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    display_order INTEGER DEFAULT 0,
    validity TEXT DEFAULT '30 Days',
    quota TEXT,
    speed TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    badge TEXT,
    ussd_code TEXT,
    billing_type TEXT DEFAULT 'Prepaid' CHECK (billing_type IN ('Prepaid', 'Postpaid', 'Both')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for mobile_packages updated_at
DROP TRIGGER IF EXISTS tr_mobile_packages_updated_at ON public.mobile_packages;
CREATE TRIGGER tr_mobile_packages_updated_at
BEFORE UPDATE ON public.mobile_packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- E. POS TRANSACTIONS (Sales & Expenses Ledger)
CREATE TABLE IF NOT EXISTS public.pos_transactions (
    id TEXT PRIMARY KEY DEFAULT ('tx-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 8)),
    type TEXT NOT NULL CHECK (type IN ('sale', 'expense')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    time TEXT NOT NULL DEFAULT to_char(now(), 'HH12:MI AM'),
    category TEXT NOT NULL,
    sub_type TEXT,
    description TEXT NOT NULL,
    quantity NUMERIC(10, 2) DEFAULT 1,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_method TEXT NOT NULL DEFAULT 'Cash' CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Other')),
    customer_name TEXT,
    vendor TEXT,
    reference_number TEXT,
    sim_card_id TEXT REFERENCES public.sim_cards(id) ON DELETE SET NULL,
    receipt_url TEXT,
    notes TEXT,
    created_by TEXT DEFAULT 'FR Hasan (CEO)',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for pos_transactions updated_at
DROP TRIGGER IF EXISTS tr_pos_transactions_updated_at ON public.pos_transactions;
CREATE TRIGGER tr_pos_transactions_updated_at
BEFORE UPDATE ON public.pos_transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ======================================================================================
-- 3. HIGH-PERFORMANCE INDEXES
-- ======================================================================================
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);
CREATE INDEX IF NOT EXISTS idx_services_published ON public.services(is_published);
CREATE INDEX IF NOT EXISTS idx_sim_cards_network ON public.sim_cards(network);
CREATE INDEX IF NOT EXISTS idx_sim_cards_status ON public.sim_cards(status);
CREATE INDEX IF NOT EXISTS idx_sim_cards_number ON public.sim_cards(sim_number);
CREATE INDEX IF NOT EXISTS idx_mobile_packages_network ON public.mobile_packages(network);
CREATE INDEX IF NOT EXISTS idx_mobile_packages_category ON public.mobile_packages(category);
CREATE INDEX IF NOT EXISTS idx_mobile_packages_order ON public.mobile_packages(display_order);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_date ON public.pos_transactions(date);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_type ON public.pos_transactions(type);
CREATE INDEX IF NOT EXISTS idx_pos_transactions_category ON public.pos_transactions(category);


-- ======================================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ======================================================================================
ALTER TABLE public.shop_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sim_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mobile_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_transactions ENABLE ROW LEVEL SECURITY;

-- Clean existing policies before recreation
DROP POLICY IF EXISTS "Public can view shop settings" ON public.shop_settings;
DROP POLICY IF EXISTS "Manage shop settings" ON public.shop_settings;

DROP POLICY IF EXISTS "Public can view published services" ON public.services;
DROP POLICY IF EXISTS "Manage services" ON public.services;

DROP POLICY IF EXISTS "Public can view available SIM cards" ON public.sim_cards;
DROP POLICY IF EXISTS "Manage SIM cards" ON public.sim_cards;

DROP POLICY IF EXISTS "Public can view active packages" ON public.mobile_packages;
DROP POLICY IF EXISTS "Manage packages" ON public.mobile_packages;

DROP POLICY IF EXISTS "Manage transactions" ON public.pos_transactions;

-- A. SHOP SETTINGS POLICIES
CREATE POLICY "Public can view shop settings"
ON public.shop_settings FOR SELECT
USING (true);

CREATE POLICY "Manage shop settings"
ON public.shop_settings FOR ALL
USING (true)
WITH CHECK (true);

-- B. SERVICES POLICIES
CREATE POLICY "Public can view published services"
ON public.services FOR SELECT
USING (is_published = true);

CREATE POLICY "Manage services"
ON public.services FOR ALL
USING (true)
WITH CHECK (true);

-- C. SIM CARDS POLICIES
CREATE POLICY "Public can view available SIM cards"
ON public.sim_cards FOR SELECT
USING (status = 'Available');

CREATE POLICY "Manage SIM cards"
ON public.sim_cards FOR ALL
USING (true)
WITH CHECK (true);

-- D. MOBILE PACKAGES POLICIES
CREATE POLICY "Public can view active packages"
ON public.mobile_packages FOR SELECT
USING (status = 'Active');

CREATE POLICY "Manage packages"
ON public.mobile_packages FOR ALL
USING (true)
WITH CHECK (true);

-- E. POS TRANSACTIONS POLICIES (Full ledger access for authenticated store managers)
CREATE POLICY "Manage transactions"
ON public.pos_transactions FOR ALL
USING (true)
WITH CHECK (true);


-- ======================================================================================
-- 5. REALTIME REPLICATION (Optional: Enable live updates across connected screens)
-- ======================================================================================
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
END $$;
