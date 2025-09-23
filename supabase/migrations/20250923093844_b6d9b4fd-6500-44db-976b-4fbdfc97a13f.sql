-- Fix Security Definer View issue
-- Drop the problematic security definer view
DROP VIEW IF EXISTS public.products_staff_view;

-- Add proper RLS policy for staff to read products (without cost_price)
-- Staff should be able to read products but not sensitive cost information
CREATE POLICY "products_staff_read" 
ON public.products 
FOR SELECT 
USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

-- Create a regular view (not security definer) for staff with limited columns
-- This excludes sensitive cost_price information
CREATE VIEW public.products_staff_view AS
SELECT 
  id,
  name,
  category,
  sku,
  unit,
  sell_price,  -- Staff can see selling price but not cost price
  stock_qty,
  min_stock,
  track_stock,
  is_active,
  created_at,
  updated_at
FROM public.products
WHERE is_active = true;

-- Grant SELECT on the view to authenticated users (RLS will handle access control)
GRANT SELECT ON public.products_staff_view TO authenticated;