-- Update the handle_new_user function to ensure proper profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert into profiles with proper null handling
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    organization, 
    organization_type,
    plan_tier,
    commission_pct,
    total_games_played,
    active_ads_count,
    fields_count
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'organization', ''),
    COALESCE(new.raw_user_meta_data->>'organization_type', 'individual'),
    'covered_game',
    60,
    0,
    0,
    0
  );
  
  -- Create user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'spectator')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();