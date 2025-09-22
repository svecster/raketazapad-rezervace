-- Fix function search path security issues

-- Update functions that don't have search_path set
CREATE OR REPLACE FUNCTION public.generate_guest_token()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gen_random_uuid();
$$;

CREATE OR REPLACE FUNCTION public.update_last_update_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
    NEW.last_update = now();
    RETURN NEW;
END;
$$;