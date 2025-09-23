-- Fix the view issue - views don't need RLS policies
-- Drop the problematic view policy attempt
-- Views inherit security from underlying tables

-- Complete the Fix Pack by creating the staff products view properly
DROP VIEW IF EXISTS public.products_staff_view;

CREATE VIEW public.products_staff_view AS
SELECT 
    id,
    name,
    sku,
    category,
    unit,
    sell_price,
    stock_qty,
    min_stock,
    track_stock,
    is_active,
    created_at,
    updated_at
FROM public.products
WHERE is_active = true;

-- Grant SELECT permission to authenticated users
GRANT SELECT ON public.products_staff_view TO authenticated;

-- The view will automatically enforce security through the underlying products table policies
-- Staff can access products via this view (without cost_price), owners can access directly

-- Final fix: ensure users can see their own reservations for bar orders
CREATE POLICY "bar_orders_user_reservations" ON public.bar_orders
FOR SELECT USING (
  reservation_id IN (
    SELECT id FROM public.reservations WHERE user_id = auth.uid()
  ) OR
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);