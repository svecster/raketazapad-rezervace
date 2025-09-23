-- ======================================
-- SUPABASE SCHEMA FIX PACK - FINAL
-- ======================================

-- Step 1: Drop existing function with CASCADE to remove all dependent policies
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;

-- Update user_role enum to include all required values (using existing + new ones)
DO $$
BEGIN
    -- Add missing values if they don't exist (keeping existing player, staff, owner)
    BEGIN
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'guest';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'member';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'coach';
    EXCEPTION WHEN OTHERS THEN
        -- Values already exist or other error
    END;
END $$;

-- Create the new optimized function (using correct enum values)
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
  
  -- Validate and return (using correct enum values)
  IF resolved = ANY (ARRAY['guest','member','coach','player','staff','owner']) THEN
    RETURN resolved::user_role;
  END IF;
  
  RETURN 'member'::user_role;
END;
$$;

-- Step 2: Create consolidated RLS policies (using staff/owner instead of admin)

-- Users table
CREATE POLICY "users_select" ON public.users
FOR SELECT USING (
  auth.uid() = id OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "users_update_self" ON public.users
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "users_manage_owner" ON public.users
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Courts table (public read, owner modify)
CREATE POLICY "courts_public_select" ON public.courts
FOR SELECT USING (true);

CREATE POLICY "courts_modify" ON public.courts
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Reservations table
CREATE POLICY "reservations_select" ON public.reservations
FOR SELECT USING (
  auth.uid() = user_id OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "reservations_insert" ON public.reservations
FOR INSERT WITH CHECK (
  (guest_token IS NOT NULL) OR 
  (auth.uid() = user_id) OR
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "reservations_update" ON public.reservations
FOR UPDATE USING (
  (auth.uid() = user_id) OR 
  (public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])) OR
  ((guest_token IS NOT NULL) AND (user_id IS NULL))
);

-- Products table (only owner can see cost_price via direct access)
CREATE POLICY "products_select_owner" ON public.products
FOR SELECT USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

CREATE POLICY "products_modify" ON public.products
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Sales table
CREATE POLICY "sales_select" ON public.sales
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "sales_modify" ON public.sales
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

-- Sale items table
CREATE POLICY "sale_items_select" ON public.sale_items
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "sale_items_modify" ON public.sale_items
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

-- Stock movements table
CREATE POLICY "stock_movements_select" ON public.stock_movements
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "stock_movements_modify" ON public.stock_movements
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

-- Recipes table
CREATE POLICY "recipes_select" ON public.recipes
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "recipes_modify" ON public.recipes
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Price rules table (public read)
CREATE POLICY "price_rules_public_select" ON public.price_rules
FOR SELECT USING (true);

CREATE POLICY "price_rules_modify" ON public.price_rules
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Bookings table
CREATE POLICY "bookings_select" ON public.bookings
FOR SELECT USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "bookings_insert" ON public.bookings
FOR INSERT WITH CHECK (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "bookings_update" ON public.bookings
FOR UPDATE USING (
  user_id = auth.uid() OR 
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "bookings_delete" ON public.bookings
FOR DELETE USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Essential operational tables
CREATE POLICY "bar_orders_staff" ON public.bar_orders
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "cash_register_staff" ON public.cash_register
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "inventory_staff" ON public.inventory
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "audit_logs_staff_read" ON public.audit_logs
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "audit_logs_staff_create" ON public.audit_logs
FOR INSERT WITH CHECK (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

-- Additional missing policies for other tables
CREATE POLICY "cash_ledger_staff" ON public.cash_ledger
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "shifts_staff" ON public.shifts
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "payment_settings_read" ON public.payment_settings
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "payment_settings_manage" ON public.payment_settings
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

CREATE POLICY "checkouts_staff" ON public.checkouts
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "checkout_accounts_staff" ON public.checkout_accounts
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "checkout_items_staff" ON public.checkout_items
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "checkout_payments_staff" ON public.checkout_payments
FOR ALL USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "inventory_sessions_read" ON public.inventory_sessions
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "inventory_sessions_manage" ON public.inventory_sessions
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

CREATE POLICY "inventory_counts_read" ON public.inventory_counts
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "inventory_counts_manage" ON public.inventory_counts
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

CREATE POLICY "pos_settings_read" ON public.pos_settings
FOR SELECT USING (
  public.get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role])
);

CREATE POLICY "pos_settings_manage" ON public.pos_settings
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'owner'::user_role
);

-- Step 3: Performance indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON public.sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON public.sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_created ON public.stock_movements(product_id, created_at);
CREATE INDEX IF NOT EXISTS idx_recipes_product_id ON public.recipes(product_id);
CREATE INDEX IF NOT EXISTS idx_recipes_component_id ON public.recipes(component_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);

-- Step 4: Type matching and foreign keys
DO $$
BEGIN
    -- Fix sales.reservation_id type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' 
        AND column_name = 'reservation_id' 
        AND table_schema = 'public'
        AND data_type != 'bigint'
    ) THEN
        ALTER TABLE public.sales ALTER COLUMN reservation_id TYPE BIGINT;
    END IF;
    
    -- Add foreign key if bookings.id is BIGINT
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'id' 
        AND table_schema = 'public'
        AND data_type = 'bigint'
    ) THEN
        ALTER TABLE public.sales DROP CONSTRAINT IF EXISTS fk_sales_reservation_id;
        ALTER TABLE public.sales 
        ADD CONSTRAINT fk_sales_reservation_id 
        FOREIGN KEY (reservation_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Step 5: Staff view for products (excludes cost_price)
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

-- Grant access to the view (no RLS needed on views - they inherit from underlying tables)
GRANT SELECT ON public.products_staff_view TO authenticated;