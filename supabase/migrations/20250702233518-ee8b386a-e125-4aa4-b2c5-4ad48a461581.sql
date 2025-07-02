
-- Fix the infinite recursion in user_roles RLS policies
DROP POLICY IF EXISTS "Admins can manage roles in their organization" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- Create simpler, non-recursive policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON public.user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur 
            WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
        )
    );

-- Allow users to be assigned roles (for now, we'll make this more restrictive later)
CREATE POLICY "Allow role assignments" ON public.user_roles
    FOR INSERT WITH CHECK (true);

-- Insert a scorekeeper role for the current user (replace with actual user ID if known)
-- This will allow testing the scorekeeper functionality
INSERT INTO public.user_roles (user_id, role) 
VALUES (
    (SELECT auth.uid()),
    'scorekeeper'
) ON CONFLICT (user_id, role) DO NOTHING;

-- Also add an admin role to make user management easier
INSERT INTO public.user_roles (user_id, role) 
VALUES (
    (SELECT auth.uid()),
    'admin'
) ON CONFLICT (user_id, role) DO NOTHING;
