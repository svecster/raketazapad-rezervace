-- Drop and recreate the products_staff_view without SECURITY DEFINER
DROP VIEW IF EXISTS public.products_staff_view;

-- Create the view without SECURITY DEFINER to rely on RLS policies
CREATE VIEW public.products_staff_view AS 
SELECT 
    id,
    name,
    category,
    sku,
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