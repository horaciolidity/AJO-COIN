import { createClient } from '@supabase/supabase-js';
import { SavedGameState } from './StorageAdapter';

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://aiqovbnsnmizoascdxnp.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || '';

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

/**
 * Save user game state to Supabase user_game_state table
 */
export const saveGameStateToSupabase = async (userId: string, state: SavedGameState): Promise<boolean> => {
  if (!userId) return false;
  try {
    const { error } = await supabase
      .from('user_game_state')
      .upsert(
        {
          user_id: userId,
          state_data: state,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );
    if (error) {
      console.warn('Supabase save error (will fall back to localStorage):', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase save exception:', e);
    return false;
  }
};

/**
 * Load user game state from Supabase user_game_state table
 */
export const loadGameStateFromSupabase = async (userId: string): Promise<SavedGameState | null> => {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from('user_game_state')
      .select('state_data')
      .eq('user_id', userId)
      .single();

    if (error || !data || !data.state_data) {
      return null;
    }
    return data.state_data as SavedGameState;
  } catch (e) {
    console.warn('Supabase load exception:', e);
    return null;
  }
};

