
-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'director', 'scorekeeper', 'spectator');

-- Create user roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    organization_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, role, organization_id)
);

-- Create field assignments for scorekeepers
CREATE TABLE public.field_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scorekeeper_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    field_id UUID REFERENCES public.fields(id) ON DELETE CASCADE NOT NULL,
    assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (scorekeeper_id, field_id)
);

-- Add team logo columns to games table
ALTER TABLE public.games 
ADD COLUMN IF NOT EXISTS home_team_logo_url TEXT,
ADD COLUMN IF NOT EXISTS away_team_logo_url TEXT;

-- Update profiles table to include organization hierarchy
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS parent_organization_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS organization_type TEXT DEFAULT 'individual';

-- Create spectator registrations table
CREATE TABLE public.spectator_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id)
);

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spectator_registrations ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage roles in their organization" ON public.user_roles
    FOR ALL USING (
        organization_id IN (
            SELECT ur.organization_id FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role IN ('super_admin', 'admin')
        )
    );

-- RLS policies for field_assignments
CREATE POLICY "Scorekeepers can view their assignments" ON public.field_assignments
    FOR SELECT USING (auth.uid() = scorekeeper_id);

CREATE POLICY "Directors and admins can manage assignments" ON public.field_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() 
            AND ur.role IN ('super_admin', 'admin', 'director')
        )
    );

-- RLS policies for spectator_registrations
CREATE POLICY "Users can manage their own registration" ON public.spectator_registrations
    FOR ALL USING (auth.uid() = user_id);

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
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

-- Enable real-time for games table
ALTER TABLE public.games REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.games;

-- Enable real-time for advertisements table
ALTER TABLE public.advertisements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.advertisements;
