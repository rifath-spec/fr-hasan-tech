import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Storage keys for user-configured credentials via UI
const STORAGE_KEY_URL = 'fr_hasan_supabase_url';
const STORAGE_KEY_KEY = 'fr_hasan_supabase_anon_key';

// Built-in Supabase Project Credentials (guarantees all devices, public visitors & phones connect immediately)
export const DEFAULT_SUPABASE_URL = 'https://tvcuhvtoegvfrsfihgfh.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_wc3JbT489MbJQnkDyAlwZw_YuAgvTT2';

// Read credentials with fallback: LocalStorage > Vite Env > Built-in Default
export const getActiveCredentials = () => {
  let storedUrl = '';
  let storedKey = '';
  
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      storedUrl = window.localStorage.getItem(STORAGE_KEY_URL) || '';
      storedKey = window.localStorage.getItem(STORAGE_KEY_KEY) || '';
    }
  } catch (e) {
    console.warn('LocalStorage not accessible:', e);
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env || {};
  const envUrl = String(metaEnv.VITE_SUPABASE_URL || '').trim();
  const envKey = String(metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

  const finalUrl = (storedUrl || envUrl || DEFAULT_SUPABASE_URL)
    .replace(/^['"]|['"]$/g, '')
    .replace(/\/+$/, '')
    .trim();

  const finalKey = (storedKey || envKey || DEFAULT_SUPABASE_ANON_KEY)
    .replace(/^['"]|['"]$/g, '')
    .trim();

  const configured = Boolean(
    finalUrl && 
    finalKey && 
    finalUrl.startsWith('http') &&
    !finalUrl.includes('your-project-id') &&
    !finalKey.includes('your-anon-public-key') &&
    !finalKey.includes('your-anon-key')
  );

  return {
    url: finalUrl,
    key: finalKey,
    isConfigured: configured,
    isCustomStored: Boolean(storedUrl && storedKey),
  };
};

const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

let activeSupabaseClient: SupabaseClient = (() => {
  const { url, key, isConfigured: configured } = getActiveCredentials();
  return createClient(
    configured ? url : fallbackUrl,
    configured ? key : fallbackKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );
})();

// Dynamic Proxy ensures any import of `supabase` forwards to the current active client instance
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (activeSupabaseClient as any)[prop];
  }
});

// Getter and export for reactive checks
export const isSupabaseConfigured = getActiveCredentials().isConfigured;

export const reinitializeSupabase = (customUrl?: string, customKey?: string) => {
  if (customUrl !== undefined && customKey !== undefined) {
    try {
      if (customUrl && customKey) {
        window.localStorage.setItem(STORAGE_KEY_URL, customUrl.trim());
        window.localStorage.setItem(STORAGE_KEY_KEY, customKey.trim());
      } else {
        window.localStorage.removeItem(STORAGE_KEY_URL);
        window.localStorage.removeItem(STORAGE_KEY_KEY);
      }
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  }

  const { url, key, isConfigured: configured } = getActiveCredentials();

  activeSupabaseClient = createClient(
    configured ? url : fallbackUrl,
    configured ? key : fallbackKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    }
  );

  return {
    url,
    isConfigured: configured,
    client: activeSupabaseClient
  };
};

export const getSupabaseConfig = () => {
  const { url, key, isConfigured: configured, isCustomStored } = getActiveCredentials();
  return {
    url,
    isConfigured: configured,
    isCustomStored,
    maskedKey: key 
      ? (key.length > 16 ? `${key.slice(0, 10)}...${key.slice(-6)}` : `${key.slice(0, 4)}***`)
      : 'Not configured'
  };
};
