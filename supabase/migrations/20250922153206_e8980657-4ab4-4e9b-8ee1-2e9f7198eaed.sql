-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.v_users_extended;

-- Instead, let's modify the user_profiles table to cache email from auth.users
-- Add email column to user_profiles if it doesn't exist
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS email text;

-- Create a function to sync email from auth.users to user_profiles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update email in user_profiles when user_profiles is inserted/updated
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Get email from auth.users and update user_profiles
    UPDATE public.user_profiles 
    SET email = (
      SELECT au.email 
      FROM auth.users au 
      WHERE au.id = NEW.user_id
    )
    WHERE user_id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger to automatically sync email
DROP TRIGGER IF EXISTS sync_user_email_trigger ON public.user_profiles;
CREATE TRIGGER sync_user_email_trigger
  AFTER INSERT OR UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_email();

-- Update existing records with email
UPDATE public.user_profiles 
SET email = au.email
FROM auth.users au
WHERE public.user_profiles.user_id = au.id
AND public.user_profiles.email IS NULL;

-- Fix the get_current_user_app_role function search_path issue
CREATE OR REPLACE FUNCTION public.get_current_user_app_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT app_role FROM public.user_profiles WHERE user_id = auth.uid();
$$;