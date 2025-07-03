
-- Ensure the current user has scorekeeper and admin roles
-- This will allow testing of scorekeeper functionality

-- First, let's check if roles exist for the current user
DO $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Get the current authenticated user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Only proceed if we have a user ID
    IF current_user_id IS NOT NULL THEN
        -- Insert scorekeeper role if it doesn't exist
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (current_user_id, 'scorekeeper'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        -- Insert admin role if it doesn't exist
        INSERT INTO public.user_roles (user_id, role) 
        VALUES (current_user_id, 'admin'::app_role)
        ON CONFLICT (user_id, role) DO NOTHING;
        
        RAISE NOTICE 'Roles assigned to user: %', current_user_id;
    ELSE
        RAISE NOTICE 'No authenticated user found';
    END IF;
END $$;

-- Also create a function to manually assign roles for any user (for admin use)
CREATE OR REPLACE FUNCTION public.assign_user_role(target_user_id uuid, user_role app_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;
