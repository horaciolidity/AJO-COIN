import { createClient } from '@supabase/supabase-js';
import { SavedGameState } from './StorageAdapter';

const metaEnv = (import.meta as any).env || {};
const SUPABASE_URL = metaEnv.VITE_SUPABASE_URL || 'https://aiqovbnsnmizoascdxnp.supabase.co';
const SUPABASE_ANON_KEY = metaEnv.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let isTableAvailable: boolean | null = null;

/**
 * Check if user_game_state table exists in Supabase schema to avoid repeated 404 logs
 */
const checkTableAvailability = async (): Promise<boolean> => {
  if (isTableAvailable !== null) return isTableAvailable;
  try {
    const { error } = await supabase.from('user_game_state').select('user_id').limit(1);
    if (error && (error.code === 'PGRST301' || error.message.includes('404') || error.message.includes('user_game_state'))) {
      isTableAvailable = false;
      return false;
    }
    isTableAvailable = true;
    return true;
  } catch (e) {
    isTableAvailable = false;
    return false;
  }
};

/**
 * Helper to check if Supabase Client is initialized & operational
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('User').select('count', { count: 'exact', head: true });
    return !error;
  } catch (e) {
    return false;
  }
};

/**
 * Save user game state to Supabase table safely without spamming requests
 */
export const saveGameStateToSupabase = async (userId: string, state: SavedGameState): Promise<boolean> => {
  if (!userId) return false;

  const canUseTable = await checkTableAvailability();
  if (!canUseTable) {
    // Table user_game_state is not created in Supabase yet — silently skip to prevent console error spam
    return false;
  }

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
    return !error;
  } catch (e) {
    return false;
  }
};

/**
 * Load user game state from Supabase user_game_state table
 */
export const loadGameStateFromSupabase = async (userId: string): Promise<SavedGameState | null> => {
  if (!userId) return null;

  const canUseTable = await checkTableAvailability();
  if (!canUseTable) return null;

  try {
    const { data, error } = await supabase
      .from('user_game_state')
      .select('state_data')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data || !data.state_data) {
      return null;
    }
    return data.state_data as SavedGameState;
  } catch (e) {
    return null;
  }
};


