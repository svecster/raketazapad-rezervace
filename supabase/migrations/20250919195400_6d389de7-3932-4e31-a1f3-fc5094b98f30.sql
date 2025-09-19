-- Fix security warnings from checkout tables migration

-- Fix search_path for existing functions
CREATE OR REPLACE FUNCTION public.calculate_checkout_totals(checkout_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_amount NUMERIC := 0;
  account_record RECORD;
  account_total NUMERIC;
BEGIN
  -- Calculate total for each account
  FOR account_record IN 
    SELECT id FROM public.checkout_accounts WHERE checkout_id = checkout_uuid
  LOOP
    SELECT COALESCE(SUM(total_price), 0) INTO account_total
    FROM public.checkout_items 
    WHERE checkout_account_id = account_record.id;
    
    UPDATE public.checkout_accounts 
    SET total_amount = account_total
    WHERE id = account_record.id;
    
    total_amount := total_amount + account_total;
  END LOOP;
  
  -- Update checkout total
  UPDATE public.checkouts 
  SET total_amount = total_amount
  WHERE id = checkout_uuid;
END;
$$;