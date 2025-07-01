
-- Extend profiles table to support the new subscription model
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'covered_game';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS commission_pct INTEGER DEFAULT 60;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_games_played INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_ads_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fields_count INTEGER DEFAULT 0;

-- Create an enum for plan tiers to ensure data consistency
CREATE TYPE public.plan_tier_enum AS ENUM ('covered_game', 'game_day', 'season_pass');

-- Update the plan_tier column to use the enum (after adding the enum values)
ALTER TABLE public.profiles ALTER COLUMN plan_tier TYPE plan_tier_enum USING plan_tier::plan_tier_enum;

-- Add constraints to ensure valid commission percentages
ALTER TABLE public.profiles ADD CONSTRAINT valid_commission_pct CHECK (commission_pct >= 0 AND commission_pct <= 100);

-- Create function to update user plan tier and commission
CREATE OR REPLACE FUNCTION public.update_user_plan(
  user_id UUID,
  new_plan_tier plan_tier_enum,
  new_commission_pct INTEGER DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    plan_tier = new_plan_tier,
    commission_pct = COALESCE(new_commission_pct, 
      CASE 
        WHEN new_plan_tier = 'covered_game' THEN 60
        WHEN new_plan_tier = 'game_day' THEN 20
        WHEN new_plan_tier = 'season_pass' THEN 10
        ELSE commission_pct
      END
    ),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Create function to increment games played
CREATE OR REPLACE FUNCTION public.increment_games_played(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    total_games_played = total_games_played + 1,
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Create function to update field and ad counts
CREATE OR REPLACE FUNCTION public.update_user_counts(user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    fields_count = (
      SELECT COUNT(*)
      FROM public.fields 
      WHERE organization_id = user_id
    ),
    active_ads_count = (
      SELECT COUNT(*)
      FROM public.advertisements a
      JOIN public.fields f ON a.field_id = f.id
      WHERE f.organization_id = user_id AND a.is_active = true
    ),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$;

-- Update RLS policies for scoreboards and advertisements based on plan tiers
-- First, let's create policies for the games table (scoreboards)
DROP POLICY IF EXISTS "games_public_select" ON public.games;
DROP POLICY IF EXISTS "games_select_own" ON public.games;
DROP POLICY IF EXISTS "games_all_own" ON public.games;

-- New RLS policy for games that respects plan tiers
CREATE POLICY "games_select_by_plan" ON public.games
FOR SELECT
USING (
  -- Public access for spectators (existing functionality)
  game_status = 'active' 
  OR 
  -- Field owners can view their games based on plan tier
  (
    field_id IN (
      SELECT f.id 
      FROM public.fields f 
      JOIN public.profiles p ON f.organization_id = p.id 
      WHERE p.id = auth.uid()
      AND (
        -- Game Day and Season Pass users have unlimited access
        p.plan_tier IN ('game_day', 'season_pass')
        OR 
        -- Covered Game users need ads or are within trial limit
        (
          p.plan_tier = 'covered_game' 
          AND (
            p.total_games_played < 2 
            OR p.active_ads_count >= p.fields_count
          )
        )
      )
    )
  )
);

CREATE POLICY "games_insert_by_plan" ON public.games
FOR INSERT
WITH CHECK (
  field_id IN (
    SELECT f.id 
    FROM public.fields f 
    JOIN public.profiles p ON f.organization_id = p.id 
    WHERE p.id = auth.uid()
    AND (
      p.plan_tier IN ('game_day', 'season_pass')
      OR 
      (
        p.plan_tier = 'covered_game' 
        AND (
          p.total_games_played < 2 
          OR p.active_ads_count >= p.fields_count
        )
      )
    )
  )
);

CREATE POLICY "games_update_by_plan" ON public.games
FOR UPDATE
USING (
  field_id IN (
    SELECT f.id 
    FROM public.fields f 
    JOIN public.profiles p ON f.organization_id = p.id 
    WHERE p.id = auth.uid()
    AND (
      p.plan_tier IN ('game_day', 'season_pass')
      OR 
      (
        p.plan_tier = 'covered_game' 
        AND (
          p.total_games_played < 2 
          OR p.active_ads_count >= p.fields_count
        )
      )
    )
  )
);

-- Create trigger to automatically update counts when fields or ads change
CREATE OR REPLACE FUNCTION public.trigger_update_user_counts()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Handle fields table changes
  IF TG_TABLE_NAME = 'fields' THEN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      PERFORM public.update_user_counts(NEW.organization_id);
    END IF;
    IF TG_OP = 'DELETE' THEN
      PERFORM public.update_user_counts(OLD.organization_id);
    END IF;
  END IF;

  -- Handle advertisements table changes
  IF TG_TABLE_NAME = 'advertisements' THEN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
      PERFORM public.update_user_counts((
        SELECT f.organization_id 
        FROM public.fields f 
        WHERE f.id = NEW.field_id
      ));
    END IF;
    IF TG_OP = 'DELETE' THEN
      PERFORM public.update_user_counts((
        SELECT f.organization_id 
        FROM public.fields f 
        WHERE f.id = OLD.field_id
      ));
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS update_counts_on_fields_change ON public.fields;
CREATE TRIGGER update_counts_on_fields_change
  AFTER INSERT OR UPDATE OR DELETE ON public.fields
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_user_counts();

DROP TRIGGER IF EXISTS update_counts_on_ads_change ON public.advertisements;
CREATE TRIGGER update_counts_on_ads_change
  AFTER INSERT OR UPDATE OR DELETE ON public.advertisements
  FOR EACH ROW EXECUTE FUNCTION public.trigger_update_user_counts();
