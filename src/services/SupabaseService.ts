import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aiqovbnsnmizoascdxnp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Helper to check if Supabase Client is initialized & operational
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('User').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    console.warn('Supabase connection check:', e);
    return false;
  }
};
