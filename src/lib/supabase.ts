import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '../types';

// Get Supabase credentials from environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate that environment variables are set
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '⚠️ Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.'
  );
}

export const supabase = createClient(
  SUPABASE_URL || 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY || 'placeholder-key'
);

const LOCAL_LEADERBOARD_KEY = 'blindtype_local_leaderboard';

// Default curated leaderboard data with high accuracy records
const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'seed-1',
    user_name: 'Dewi Sartika',
    avatar: '🦉',
    accuracy: 100.0,
    score: 9850,
    mode: 'blind',
    language: 'id',
    difficulty: 'medium',
    backspaces: 0,
    wpm: 64,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'seed-2',
    user_name: 'Alex Chen',
    avatar: '⚡',
    accuracy: 99.6,
    score: 9420,
    mode: 'precision',
    language: 'en',
    difficulty: 'hard',
    backspaces: 1,
    wpm: 78,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'seed-3',
    user_name: 'Budi Santoso',
    avatar: '🎯',
    accuracy: 99.2,
    score: 9180,
    mode: 'precision',
    language: 'id',
    difficulty: 'code',
    backspaces: 2,
    wpm: 58,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'seed-4',
    user_name: 'Sophia Vance',
    avatar: '🧘‍♀️',
    accuracy: 98.9,
    score: 8940,
    mode: 'blind',
    language: 'en',
    difficulty: 'easy',
    backspaces: 0,
    wpm: 52,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'seed-5',
    user_name: 'Rian Pratama',
    avatar: '🦾',
    accuracy: 98.4,
    score: 8710,
    mode: 'precision',
    language: 'id',
    difficulty: 'medium',
    backspaces: 3,
    wpm: 72,
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'seed-6',
    user_name: 'Maya Lin',
    avatar: '🐱',
    accuracy: 97.8,
    score: 8450,
    mode: 'blind',
    language: 'en',
    difficulty: 'medium',
    backspaces: 2,
    wpm: 60,
    created_at: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
];

// Get RAW unprocessed data from localStorage
function getRawLocalData(): LeaderboardEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    let list: LeaderboardEntry[] = raw ? JSON.parse(raw) : [];
    
    // Only use DEFAULT_LEADERBOARD if no local data exists at all
    if (list.length === 0) {
      list = [...DEFAULT_LEADERBOARD]; // Clone to avoid mutation
    }
    
    return list;
  } catch (e) {
    // If corrupted, return empty and clear
    try {
      localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
    } catch {}
    return [...DEFAULT_LEADERBOARD];
  }
}

// Clean up local storage by removing entries that are already in Supabase
function cleanupLocalStorage(supabaseEntries: LeaderboardEntry[]) {
  if (typeof window === 'undefined') return;
  try {
    const supabaseIds = new Set(supabaseEntries.map(e => e.id));
    const localRaw = getRawLocalData();
    
    // Keep only entries that are NOT in Supabase (pending sync)
    const pendingEntries = localRaw.filter(e => !supabaseIds.has(e.id) && !e.id.startsWith('seed-'));
    
    if (pendingEntries.length < localRaw.length) {
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(pendingEntries.slice(0, 50)));
    }
  } catch (e) {
    // Silently handle cleanup errors
  }
}

export async function fetchLeaderboardScores(
  modeFilter?: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('created_at', { ascending: false }); // Get latest entries first

    // Don't filter by mode in the query - we need ALL entries to calculate cumulative scores
    // Filtering will be done in processLeaderboardData
    
    const { data, error } = await query;

    if (error) {
      const localRaw = getRawLocalData();
      return processLeaderboardData(localRaw, modeFilter, limit);
    }

    // If data exists from Supabase, use it
    if (data && data.length > 0) {
      // Clean up localStorage - remove entries already in Supabase
      cleanupLocalStorage(data as LeaderboardEntry[]);
      
      // Merge Supabase data with local RAW data (de-duplicate by id)
      const localRaw = getRawLocalData();
      const mergedMap = new Map<string, LeaderboardEntry>();
      
      // Add Supabase entries first (priority)
      data.forEach((entry) => mergedMap.set(entry.id, entry as LeaderboardEntry));
      
      // Add local entries that aren't in Supabase yet
      localRaw.forEach((entry) => {
        if (!mergedMap.has(entry.id)) {
          mergedMap.set(entry.id, entry);
        }
      });
      
      const allRawEntries = Array.from(mergedMap.values());
      
      // Process and sort based on mode filter
      const result = processLeaderboardData(allRawEntries, modeFilter, limit);
      
      return result;
    }

    // Supabase is empty, use local data
    const localRaw = getRawLocalData();
    return processLeaderboardData(localRaw, modeFilter, limit);
  } catch (err) {
    const localRaw = getRawLocalData();
    return processLeaderboardData(localRaw, modeFilter, limit);
  }
}

// Process leaderboard data based on mode filter
function processLeaderboardData(
  entries: LeaderboardEntry[],
  modeFilter?: string,
  limit: number = 50
): LeaderboardEntry[] {
  if (!modeFilter || modeFilter === 'all') {
    // For "All Modes": Show cumulative total points from ALL sessions (blind + precision)
    const userTotals = new Map<string, {
      user_name: string;
      avatar: string;
      totalScore: number;
      bestAccuracy: number;
      totalWpm: number;
      totalBackspaces: number;
      sessionCount: number;
      latestEntry: LeaderboardEntry;
      latestDate: string;
    }>();

    entries.forEach((entry) => {
      const existing = userTotals.get(entry.user_name);
      if (existing) {
        // Accumulate ALL scores from ALL sessions
        existing.totalScore += entry.score;
        existing.bestAccuracy = Math.max(existing.bestAccuracy, entry.accuracy);
        existing.totalWpm += entry.wpm || 0;
        existing.totalBackspaces += entry.backspaces || 0;
        existing.sessionCount += 1;
        
        // Keep the latest entry as representative
        if (new Date(entry.created_at) > new Date(existing.latestDate)) {
          existing.latestEntry = entry;
          existing.latestDate = entry.created_at;
        }
      } else {
        userTotals.set(entry.user_name, {
          user_name: entry.user_name,
          avatar: entry.avatar,
          totalScore: entry.score,
          bestAccuracy: entry.accuracy,
          totalWpm: entry.wpm || 0,
          totalBackspaces: entry.backspaces || 0,
          sessionCount: 1,
          latestEntry: entry,
          latestDate: entry.created_at,
        });
      }
    });

    // Convert to leaderboard entries and sort by cumulative total score
    return Array.from(userTotals.values())
      .sort((a, b) => {
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.bestAccuracy - a.bestAccuracy;
      })
      .map((user) => {
        return {
          ...user.latestEntry,
          score: user.totalScore, // Show cumulative total from ALL sessions
          accuracy: user.bestAccuracy, // Show best accuracy achieved
          wpm: Math.round(user.totalWpm / user.sessionCount), // Average WPM
          backspaces: user.totalBackspaces, // Total backspaces across all sessions
          mode: 'all', // Indicate this is aggregated from all modes
        };
      })
      .slice(0, limit);
  } else {
    // For specific mode (blind/precision): Show highest single score in that mode
    // First, filter entries by mode
    const filteredEntries = entries.filter(entry => entry.mode === modeFilter);
    
    const userBestScores = new Map<string, LeaderboardEntry>();

    filteredEntries.forEach((entry) => {
      const existing = userBestScores.get(entry.user_name);
      if (existing) {
        // Compare by score first (highest single score wins), then accuracy
        if (
          entry.score > existing.score ||
          (entry.score === existing.score && entry.accuracy > existing.accuracy)
        ) {
          userBestScores.set(entry.user_name, entry);
        }
      } else {
        userBestScores.set(entry.user_name, entry);
      }
    });

    // Sort by highest single score, then accuracy
    return Array.from(userBestScores.values())
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return b.accuracy - a.accuracy;
      })
      .slice(0, limit);
  }
}

// Check if Supabase connection is working
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('leaderboard')
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

// Clear local leaderboard cache (useful for debugging or when corrupted)
export function clearLocalLeaderboard(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCAL_LEADERBOARD_KEY);
  } catch (e) {
    // Silently handle errors
  }
}

export async function submitScoreToLeaderboard(entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<LeaderboardEntry> {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'user-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  // Always save to local storage as backup
  saveToLocalLeaderboard(newEntry);

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([newEntry])
      .select()
      .single();

    if (error) {
      return newEntry; // Return local entry if insert fails
    }

    if (data) {
      return data as LeaderboardEntry;
    }
  } catch (err) {
    // Silently handle insert errors, already saved locally
  }

  return newEntry;
}

function saveToLocalLeaderboard(entry: LeaderboardEntry) {
  if (typeof window === 'undefined') return;
  try {
    // Get RAW data, not processed
    const currentRaw = getRawLocalData();
    
    // Check if entry with same id already exists (to avoid duplicates)
    const exists = currentRaw.some(e => e.id === entry.id);
    if (!exists) {
      const updated = [entry, ...currentRaw];
      // Keep max 50 entries only to avoid quota issues (reduced from 200)
      const trimmed = updated.slice(0, 50);
      
      // Try to save, if quota exceeded, reduce further
      try {
        localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(trimmed));
      } catch (quotaError) {
        // If still quota exceeded, keep only 20 most recent entries
        const minimal = updated.slice(0, 20);
        localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(minimal));
      }
    }
  } catch (e) {
    // Last resort: clear local leaderboard and save only this entry
    try {
      localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify([entry]));
    } catch (finalError) {
      // Silently fail if localStorage is completely unavailable
    }
  }
}
