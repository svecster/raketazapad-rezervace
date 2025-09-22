-- Fix security warnings by setting proper search paths for functions

-- Update touch_updated_at function with proper search path
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN 
  NEW.updated_at = now(); 
  RETURN NEW; 
END $$;

-- Update app_role function with proper search path
CREATE OR REPLACE FUNCTION public.app_role()
RETURNS text 
LANGUAGE sql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'app_role')::text,
    'member'
  );
$$;

-- Update handle_new_user_profile function with proper search path
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name, phone, app_role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'app_role', 'member')
  );
  RETURN NEW;
END;
$$;