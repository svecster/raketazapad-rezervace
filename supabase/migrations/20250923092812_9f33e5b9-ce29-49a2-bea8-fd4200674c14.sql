-- Simple targeted fix - just update the function and add missing enum values
-- This won't conflict with existing policies

-- Add missing enum values to user_role
DO $$
BEGIN
    BEGIN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'member';  
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coach';
    EXCEPTION WHEN duplicate_object THEN
        -- Values already exist
    END;
END $$;

-- Create optimized get_user_role function (will replace existing one)
CREATE OR REPLACE FUNCTION public.get_user_role(uid uuid)
RETURNS user_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  claim text; meta text; prof text; resolved text;
BEGIN
  -- Try to get from JWT claim first (fastest)
  BEGIN
    SELECT auth.jwt() ->> 'app_role' INTO claim;
  EXCEPTION WHEN OTHERS THEN 
    claim := NULL;
  END;

  -- Get from auth.users metadata if no JWT claim
  IF claim IS NULL THEN
    SELECT raw_user_meta_data->>'app_role'
    INTO meta
    FROM auth.users
    WHERE id = uid;
  END IF;

  -- Get from user_profiles if still null
  IF claim IS NULL AND meta IS NULL THEN
    SELECT app_role
    INTO prof
    FROM public.user_profiles
    WHERE user_id = uid;
  END IF;

  -- Resolve priority: JWT claim > auth metadata > profile > fallback
  resolved := COALESCE(claim, meta, prof, 'member');
  
  -- Map to valid enum values (backward compatibility)
  CASE 
    WHEN resolved IN ('guest','member','coach','player','staff','owner') THEN
      -- Valid enum value
    WHEN resolved = 'admin' THEN
      resolved := 'owner'; -- Map admin to owner
    ELSE
      resolved := 'member'; -- Default fallback
  END CASE;
  
  RETURN resolved::user_role;
END;
$$;

-- Add essential performance indexes only
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON public.stock_movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);

-- Create products staff view (excludes cost_price)
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

GRANT SELECT ON public.products_staff_view TO authenticated;