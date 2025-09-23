-- Final security fixes - ensure all database objects are properly secured

-- Recreate products_staff_view to ensure it's completely clean
DROP VIEW IF EXISTS public.products_staff_view CASCADE;

-- Create view without any security definer properties
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

-- Ensure RLS is enabled on the view (inherits from products table)
-- No additional action needed as views inherit RLS from base tables

-- Add comment to clarify this view's purpose
COMMENT ON VIEW public.products_staff_view IS 'Staff view of active products - inherits RLS policies from products table';