-- ======================================
-- SUPABASE SCHEMA FIX PACK
-- ======================================

-- Step 1: Role + Helper
-- Update user_role enum to include all required values
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('guest','member','coach','staff','admin','owner');
    ELSE
        -- Add missing values if they don't exist
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'member';
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coach';
        EXCEPTION WHEN OTHERS THEN
            -- Values already exist
        END;
    END IF;
END $$;

-- Create or replace the main user role function
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
  -- Try to get from JWT claim first
  BEGIN
    SELECT auth.jwt() ->> 'app_role' INTO claim;
  EXCEPTION WHEN OTHERS THEN 
    claim := NULL;
  END;

  -- Get from auth.users metadata
  SELECT raw_user_meta_data->>'app_role'
  INTO meta
  FROM auth.users
  WHERE id = uid;

  -- Get from user_profiles
  SELECT app_role
  INTO prof
  FROM public.user_profiles
  WHERE user_id = uid;

  -- Resolve priority: JWT claim > auth metadata > profile > fallback
  resolved := COALESCE(claim, meta, prof, 'member');
  
  -- Validate and return
  IF resolved = ANY (ARRAY['guest','member','coach','staff','admin','owner']) THEN
    RETURN resolved::user_role;
  END IF;
  
  RETURN 'member'::user_role;
END;
$$;

-- Step 2: Consolidate RLS Policies
-- Clean up and consolidate policies for each table

-- Products table
DROP POLICY IF EXISTS "Owner can manage products" ON public.products;
DROP POLICY IF EXISTS "Staff can read product names and prices" ON public.products;
DROP POLICY IF EXISTS "Staff can read products basic info" ON public.products;

CREATE POLICY "products_select" ON public.products
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "products_modify" ON public.products
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'owner'::user_role])
);

-- Sales table
DROP POLICY IF EXISTS "Owner can manage sales" ON public.sales;
DROP POLICY IF EXISTS "Staff can create sales" ON public.sales;
DROP POLICY IF EXISTS "Staff can read sales" ON public.sales;

CREATE POLICY "sales_select" ON public.sales
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "sales_modify" ON public.sales
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

-- Sale items table
DROP POLICY IF EXISTS "Owner can manage sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Staff can create sale items" ON public.sale_items;
DROP POLICY IF EXISTS "Staff can read sale items" ON public.sale_items;

CREATE POLICY "sale_items_select" ON public.sale_items
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "sale_items_modify" ON public.sale_items
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

-- Stock movements table
DROP POLICY IF EXISTS "Owner can manage stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Staff can create stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Staff can read stock movements" ON public.stock_movements;

CREATE POLICY "stock_movements_select" ON public.stock_movements
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "stock_movements_modify" ON public.stock_movements
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

-- Courts table (public read access)
DROP POLICY IF EXISTS "Everyone can read courts" ON public.courts;
DROP POLICY IF EXISTS "Staff can manage courts" ON public.courts;

CREATE POLICY "courts_public_select" ON public.courts
FOR SELECT USING (true);

CREATE POLICY "courts_modify" ON public.courts
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'owner'::user_role])
);

-- Price rules table (public read access)
DROP POLICY IF EXISTS "Everyone can read price rules" ON public.price_rules;
DROP POLICY IF EXISTS "Owners can manage price rules" ON public.price_rules;

CREATE POLICY "price_rules_public_select" ON public.price_rules
FOR SELECT USING (true);

CREATE POLICY "price_rules_modify" ON public.price_rules
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'owner'::user_role])
);

-- Bookings table
DROP POLICY IF EXISTS "bookings_member_no_delete" ON public.bookings;
DROP POLICY IF EXISTS "bookings_member_read" ON public.bookings;
DROP POLICY IF EXISTS "bookings_member_update" ON public.bookings;
DROP POLICY IF EXISTS "bookings_member_write" ON public.bookings;
DROP POLICY IF EXISTS "bookings_staff_delete" ON public.bookings;

CREATE POLICY "bookings_select" ON public.bookings
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "bookings_insert" ON public.bookings
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "bookings_update" ON public.bookings
FOR UPDATE USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'admin'::user_role, 'owner'::user_role])
);

CREATE POLICY "bookings_delete" ON public.bookings
FOR DELETE USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'owner'::user_role])
);

-- Step 3: Performance - Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON public.stock_movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON public.recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipes_component_id ON public.recipes(component_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Step 4: Type matching
-- Check and fix sales.reservation_id type
DO $$
BEGIN
    -- Check if column exists and convert to BIGINT if needed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'reservation_id' 
        AND table_schema = 'public'
        AND data_type != 'bigint'
    ) THEN
        ALTER TABLE public.sales ALTER COLUMN reservation_id TYPE BIGINT;
    END IF;
    
    -- Add foreign key constraint if bookings.id is BIGINT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'id' 
        AND table_schema = 'public'
        AND data_type = 'bigint'
    ) THEN
        -- Drop existing constraint if it exists
        ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS fk_sales_reservation_id;
        
        -- Add new constraint
        ALTER TABLE public.sales 
        ADD CONSTRAINT fk_sales_reservation_id 
        FOREIGN KEY (reservation_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 5: View for staff (exclude cost_price from products)
DROP VIEW IF EXISTS public.products_staff_view;

CREATE VIEW public.products_staff_view AS
SELECT 
    id,
    name,
    sku,
    category,
    unit,
    sell_price,
    -- cost_price excluded for staff
    stock_qty,
    min_stock,
    track_stock,
    is_active,
    created_at,
    updated_at
FROM public.products
WHERE is_active = true;

-- Grant access to the view for staff
GRANT SELECT ON public.products_staff_view TO authenticated;

-- Create RLS policy for the view
ALTER VIEW public.products_staff_view SET (security_invoker = true);

-- Update products table policy to restrict staff from seeing cost_price directly
DROP POLICY IF EXISTS "products_select" ON public.products;

CREATE POLICY "products_select_admin_owner" ON public.products
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['admin'::user_role, 'owner'::user_role])
);

-- Staff can only access through the view, not the table directly
-- The view access is controlled by the authenticated role grant above

-- Update trigger to work with new schema
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_product_timestamp();