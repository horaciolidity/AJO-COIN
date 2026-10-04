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
  if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY.trim() === '') {
    isTableAvailable = false;
    return false;
  }
  try {
    const { error } = await supabase.from('user_game_state').select('user_id').limit(1);
    if (error) {
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
export const saveGameStateToSupabase = async (
  userId: string,
  state: SavedGameState,
  username?: string,
  photoUrl?: string,
): Promise<boolean> => {
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
          username: username || null,
          photo_url: photoUrl || null,
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

/**
 * Fetch top real player game states from Supabase for the real Leaderboard.
 * Returns all available users sorted by most recently active.
 * Client-side sorting by XP/boxes is done in the component.
 */
export const fetchRealLeaderboardFromSupabase = async (): Promise<{ user_id: string; username?: string; photo_url?: string; state_data: SavedGameState; updated_at: string }[] | null> => {
  const canUseTable = await checkTableAvailability();
  if (!canUseTable) return null;

  try {
    const { data, error } = await supabase
      .from('user_game_state')
      .select('user_id, username, photo_url, state_data, updated_at')
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error || !data) return null;
    return data as { user_id: string; username?: string; photo_url?: string; state_data: SavedGameState; updated_at: string }[];
  } catch (e) {
    return null;
  }
};



