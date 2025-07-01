
-- Create profiles table with trigger for automatic creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, organization)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'organization', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Enable RLS on other tables and create basic policies
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own fields" ON public.fields
  FOR SELECT USING (organization_id = auth.uid());

CREATE POLICY "Users can create own fields" ON public.fields
  FOR INSERT WITH CHECK (organization_id = auth.uid());

CREATE POLICY "Users can update own fields" ON public.fields
  FOR UPDATE USING (organization_id = auth.uid());

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view games for their fields" ON public.games
  FOR SELECT USING (
    field_id IN (SELECT id FROM public.fields WHERE organization_id = auth.uid())
  );

CREATE POLICY "Users can create games for their fields" ON public.games
  FOR INSERT WITH CHECK (
    field_id IN (SELECT id FROM public.fields WHERE organization_id = auth.uid())
  );

CREATE POLICY "Users can update games for their fields" ON public.games
  FOR UPDATE USING (
    field_id IN (SELECT id FROM public.fields WHERE organization_id = auth.uid())
  );

-- Public access for spectators (they don't need to be logged in)
CREATE POLICY "Public can view active games" ON public.games
  FOR SELECT USING (game_status = 'active');

ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view ads for their fields" ON public.advertisements
  FOR SELECT USING (
    field_id IN (SELECT id FROM public.fields WHERE organization_id = auth.uid())
  );

CREATE POLICY "Users can manage ads for their fields" ON public.advertisements
  FOR ALL USING (
    field_id IN (SELECT id FROM public.fields WHERE organization_id = auth.uid())
  );
