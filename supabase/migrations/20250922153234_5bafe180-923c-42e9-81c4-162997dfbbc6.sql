-- Fix the remaining function with missing search_path
CREATE OR REPLACE FUNCTION public.update_product_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;