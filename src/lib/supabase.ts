import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '../types';

const SUPABASE_URL = 'https://wiiesgwqyoezijnhuxaq.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpaWVzZ3dxeW9lemlqbmh1eGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY4NDkyMjUsImV4cCI6MjEwMjQyNTIyNX0.CIRRj7tWMf13HDeqTyHLJ4YIzzzookLHLqbQk5dO_rE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

export async function fetchLeaderboardScores(
  modeFilter?: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  try {
    let query = supabase
      .from('leaderboard')
      .select('*')
      .order('accuracy', { ascending: false })
      .order('score', { ascending: false })
      .limit(limit);

    if (modeFilter && modeFilter !== 'all') {
      query = query.eq('mode', modeFilter);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return getLocalLeaderboard(modeFilter);
    }

    // Merge with local fallback if user just submitted
    return data as LeaderboardEntry[];
  } catch (err) {
    console.warn('Supabase fetch fallback to local:', err);
    return getLocalLeaderboard(modeFilter);
  }
}

export async function submitScoreToLeaderboard(entry: Omit<LeaderboardEntry, 'id' | 'created_at'>): Promise<LeaderboardEntry> {
  const newEntry: LeaderboardEntry = {
    ...entry,
    id: 'entry-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    created_at: new Date().toISOString(),
  };

  // Always save to local storage
  saveToLocalLeaderboard(newEntry);

  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([newEntry])
      .select()
      .single();

    if (!error && data) {
      return data as LeaderboardEntry;
    }
  } catch (err) {
    console.warn('Supabase insert note: saved locally', err);
  }

  return newEntry;
}

function getLocalLeaderboard(modeFilter?: string): LeaderboardEntry[] {
  if (typeof window === 'undefined') return DEFAULT_LEADERBOARD;
  try {
    const raw = localStorage.getItem(LOCAL_LEADERBOARD_KEY);
    const list: LeaderboardEntry[] = raw ? JSON.parse(raw) : DEFAULT_LEADERBOARD;
    
    // Sort by accuracy first, then score
    let sorted = [...list].sort((a, b) => {
      if (b.accuracy !== a.accuracy) {
        return b.accuracy - a.accuracy;
      }
      return b.score - a.score;
    });

    if (modeFilter && modeFilter !== 'all') {
      sorted = sorted.filter((e) => e.mode === modeFilter);
    }
    return sorted;
  } catch {
    return DEFAULT_LEADERBOARD;
  }
}

function saveToLocalLeaderboard(entry: LeaderboardEntry) {
  if (typeof window === 'undefined') return;
  try {
    const current = getLocalLeaderboard('all');
    const updated = [entry, ...current];
    // Keep max 100
    localStorage.setItem(LOCAL_LEADERBOARD_KEY, JSON.stringify(updated.slice(0, 100)));
  } catch (e) {
    console.error('Failed to save to local leaderboard', e);
  }
}
