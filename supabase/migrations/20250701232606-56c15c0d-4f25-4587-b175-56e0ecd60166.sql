
-- Add missing columns to profiles table for subscription system
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan_tier text DEFAULT 'covered_game',
ADD COLUMN IF NOT EXISTS commission_pct integer DEFAULT 60,
ADD COLUMN IF NOT EXISTS total_games_played integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_ads_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS fields_count integer DEFAULT 0;

-- Add check constraint for plan_tier
ALTER TABLE public.profiles 
ADD CONSTRAINT plan_tier_check 
CHECK (plan_tier IN ('covered_game', 'game_day', 'season_pass'));
