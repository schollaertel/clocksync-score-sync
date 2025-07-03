
-- Fix all the database functions by setting proper search_path for security
-- This addresses the "Function Search Path Mutable" warnings

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'director' THEN 3
      WHEN 'scorekeeper' THEN 4
      WHEN 'spectator' THEN 5
    END
  LIMIT 1;
$$;

-- Fix get_user_roles function
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS TABLE(role_name app_role)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id;
$$;

-- Fix create_sample_fields_for_user function
CREATE OR REPLACE FUNCTION public.create_sample_fields_for_user(user_id uuid, user_email text)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  field_names TEXT[] := ARRAY['Field A', 'Field B', 'Field C'];
  field_locations TEXT[] := ARRAY['North Complex', 'South Complex', 'East Complex'];
  i INTEGER;
BEGIN
  -- Create 3 sample fields
  FOR i IN 1..3 LOOP
    INSERT INTO fields (organization_id, name, location, qr_code)
    VALUES (
      user_id, 
      field_names[i], 
      field_locations[i], 
      'field_' || user_id::text || '_' || i::text || '_' || extract(epoch from now())::bigint::text
    );
  END LOOP;
END;
$$;

-- Fix update_updated_at_column function if it exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;
