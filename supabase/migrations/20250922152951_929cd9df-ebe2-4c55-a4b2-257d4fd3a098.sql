-- Drop the problematic view that exposes auth.users
DROP VIEW IF EXISTS public.v_users_extended;

-- Instead, we'll use a security definer function to safely get email
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = user_uuid;
$$;

-- Fix the remaining functions with proper search_path
CREATE OR REPLACE FUNCTION public.calculate_checkout_totals(checkout_uuid uuid)
RETURNS void
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

CREATE OR REPLACE FUNCTION public.process_sale_stock_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record RECORD;
  recipe_record RECORD;
BEGIN
  -- Process each sale item
  FOR item_record IN 
    SELECT * FROM public.sale_items WHERE sale_id = NEW.id
  LOOP
    -- Update stock for the sold product if it tracks stock
    UPDATE public.products 
    SET stock_qty = stock_qty - item_record.qty
    WHERE id = item_record.product_id AND track_stock = true;
    
    -- Create stock movement for the sale
    INSERT INTO public.stock_movements (product_id, delta, reason, ref_table, ref_id, created_by)
    VALUES (item_record.product_id, -item_record.qty, 'sale', 'sales', NEW.id, NEW.user_id);
    
    -- Process recipes if any
    FOR recipe_record IN 
      SELECT * FROM public.recipes WHERE product_id = item_record.product_id
    LOOP
      -- Update component stock
      UPDATE public.products 
      SET stock_qty = stock_qty - (recipe_record.qty * item_record.qty)
      WHERE id = recipe_record.component_id AND track_stock = true;
      
      -- Create stock movement for component
      INSERT INTO public.stock_movements (product_id, delta, reason, ref_table, ref_id, created_by)
      VALUES (recipe_record.component_id, -(recipe_record.qty * item_record.qty), 'recipe', 'sales', NEW.id, NEW.user_id);
    END LOOP;
  END LOOP;
  
  RETURN NEW;
END;
$$;