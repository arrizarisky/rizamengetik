-- =====================================================
-- BLINDTYPE V2 - SUPABASE DATABASE SETUP
-- =====================================================
-- This script creates the leaderboard table and sets up
-- proper Row Level Security (RLS) policies for public access
-- =====================================================

-- 1. Create the leaderboard table
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  accuracy NUMERIC(5,2) NOT NULL CHECK (accuracy >= 0 AND accuracy <= 100),
  score INTEGER NOT NULL CHECK (score >= 0),
  mode TEXT NOT NULL CHECK (mode IN ('blind', 'precision', 'drills')),
  language TEXT NOT NULL CHECK (language IN ('id', 'en')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'code')),
  backspaces INTEGER NOT NULL DEFAULT 0 CHECK (backspaces >= 0),
  wpm INTEGER NOT NULL DEFAULT 0 CHECK (wpm >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_leaderboard_accuracy ON public.leaderboard(accuracy DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_mode ON public.leaderboard(mode);
CREATE INDEX IF NOT EXISTS idx_leaderboard_created_at ON public.leaderboard(created_at DESC);

-- Composite index for common queries (mode + accuracy + score)
CREATE INDEX IF NOT EXISTS idx_leaderboard_mode_accuracy_score 
ON public.leaderboard(mode, accuracy DESC, score DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies

-- Allow anyone to READ all leaderboard entries (public leaderboard)
CREATE POLICY "Anyone can read leaderboard" 
ON public.leaderboard 
FOR SELECT 
USING (true);

-- Allow anyone to INSERT new scores (for anonymous users)
CREATE POLICY "Anyone can insert scores" 
ON public.leaderboard 
FOR INSERT 
WITH CHECK (true);

-- Prevent UPDATE and DELETE operations (leaderboard entries are immutable)
-- Only admin can delete if needed (using service role)

-- 5. Insert seed data (default leaderboard champions)
INSERT INTO public.leaderboard (id, user_name, avatar, accuracy, score, mode, language, difficulty, backspaces, wpm, created_at)
VALUES
  ('seed-1', 'Dewi Sartika', '🦉', 100.0, 9850, 'blind', 'id', 'medium', 0, 64, NOW() - INTERVAL '4 hours'),
  ('seed-2', 'Alex Chen', '⚡', 99.6, 9420, 'precision', 'en', 'hard', 1, 78, NOW() - INTERVAL '12 hours'),
  ('seed-3', 'Budi Santoso', '🎯', 99.2, 9180, 'precision', 'id', 'code', 2, 58, NOW() - INTERVAL '24 hours'),
  ('seed-4', 'Sophia Vance', '🧘‍♀️', 98.9, 8940, 'blind', 'en', 'easy', 0, 52, NOW() - INTERVAL '36 hours'),
  ('seed-5', 'Rian Pratama', '🦾', 98.4, 8710, 'precision', 'id', 'medium', 3, 72, NOW() - INTERVAL '48 hours'),
  ('seed-6', 'Maya Lin', '🐱', 97.8, 8450, 'blind', 'en', 'medium', 2, 60, NOW() - INTERVAL '60 hours')
ON CONFLICT (id) DO NOTHING;

-- 6. Create a function to get top players by mode (optional, for future use)
CREATE OR REPLACE FUNCTION get_top_players(
  p_mode TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  id TEXT,
  user_name TEXT,
  avatar TEXT,
  accuracy NUMERIC,
  score INTEGER,
  mode TEXT,
  language TEXT,
  difficulty TEXT,
  backspaces INTEGER,
  wpm INTEGER,
  created_at TIMESTAMPTZ
) 
LANGUAGE sql
STABLE
AS $$
  SELECT 
    id, user_name, avatar, accuracy, score, 
    mode, language, difficulty, backspaces, wpm, created_at
  FROM public.leaderboard
  WHERE (p_mode IS NULL OR mode = p_mode)
  ORDER BY accuracy DESC, score DESC, created_at DESC
  LIMIT p_limit;
$$;

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
-- Next steps:
-- 1. Go to your Supabase project SQL Editor
-- 2. Copy and paste this entire script
-- 3. Click "Run" to execute
-- 4. Verify the table was created in the Table Editor
-- 5. Test by running: SELECT * FROM public.leaderboard;
-- =====================================================
