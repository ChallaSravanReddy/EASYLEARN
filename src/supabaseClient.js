import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidHttpUrl = (str) => {
  if (!str || typeof str !== 'string') return false;
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  isValidHttpUrl(rawUrl) &&
  rawKey &&
  rawKey !== 'YOUR_SUPABASE_ANON_KEY'
);

// Fallback to a valid format URL and key to prevent client initialization crashes
const supabaseUrl = isValidHttpUrl(rawUrl)
  ? rawUrl
  : 'https://placeholder.supabase.co';

const supabaseAnonKey = (rawKey && rawKey !== 'YOUR_SUPABASE_ANON_KEY')
  ? rawKey
  : 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

