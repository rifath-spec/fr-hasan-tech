import { createClient } from '@supabase/supabase-js';

// Read credentials from Vite environment variables (sanitizing any quotes or trailing slashes)
const metaEnv = (import.meta as unknown as { env?: Record<string, string> })?.env || {};
const rawUrl = String(metaEnv.VITE_SUPABASE_URL || '').trim();
const rawKey = String(metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

const supabaseUrl = rawUrl.replace(/^['"]|['"]$/g, '').replace(/\/+$/, '');
const supabaseAnonKey = rawKey.replace(/^['"]|['"]$/g, '');

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseAnonKey.includes('your-anon-public-key') &&
  !supabaseAnonKey.includes('your-anon-key')
);

// Resilient fallback client to prevent runtime exceptions when keys are not yet configured
const fallbackUrl = 'https://placeholder.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : fallbackUrl,
  isSupabaseConfigured ? supabaseAnonKey : fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export const getSupabaseConfig = () => ({
  url: supabaseUrl,
  isConfigured: isSupabaseConfigured,
  maskedKey: supabaseAnonKey 
    ? `${supabaseAnonKey.slice(0, 10)}...${supabaseAnonKey.slice(-6)}` 
    : 'Not configured'
});
