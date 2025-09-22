-- Create products table with inventory tracking
CREATE TABLE IF NOT EXISTS public.products (
  id bigserial PRIMARY KEY,
  sku text UNIQUE,
  name text NOT NULL,
  category text NOT NULL, -- "Bar", "Jídlo", "Půjčovna", "Míčky", "Kurt/Hala"
  unit text NOT NULL DEFAULT 'ks', -- 'ks', 'l', 'ml', atd.
  sell_price numeric NOT NULL, -- prodejní cena s DPH
  cost_price numeric, -- nákupní (vidí jen owner/admin)
  track_stock boolean NOT NULL DEFAULT true,
  stock_qty numeric NOT NULL DEFAULT 0, -- aktuální stav
  min_stock numeric DEFAULT 0, -- hlídání minima
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create recipes table for compound products
CREATE TABLE IF NOT EXISTS public.recipes (
  id bigserial PRIMARY KEY,
  product_id bigint REFERENCES public.products(id) ON DELETE CASCADE,
  component_id bigint REFERENCES public.products(id) ON DELETE RESTRICT,
  qty numeric NOT NULL CHECK (qty > 0) -- např. pivo 0.5 l = -0.5 ze sudu
);

-- Create sales table for transactions
CREATE TABLE IF NOT EXISTS public.sales (
  id bigserial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- kdo markoval
  reservation_id uuid, -- volitelně vazba na rezervaci kurtu
  total_amount numeric NOT NULL,
  payment_method text NOT NULL CHECK (payment_method IN ('cash','qr')),
  status text NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','void','refunded')),
  note text,
  created_at timestamptz DEFAULT now()
);

-- Create sale items table
CREATE TABLE IF NOT EXISTS public.sale_items (
  id bigserial PRIMARY KEY,
  sale_id bigint REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products(id),
  qty numeric NOT NULL CHECK (qty > 0),
  unit_price numeric NOT NULL, -- sell_price v čase prodeje
  discount numeric DEFAULT 0, -- částka slevy
  total numeric NOT NULL
);

-- Create stock movements table for tracking inventory changes
CREATE TABLE IF NOT EXISTS public.stock_movements (
  id bigserial PRIMARY KEY,
  product_id bigint REFERENCES public.products(id),
  delta numeric NOT NULL, -- +naskladnění / -výdej
  reason text NOT NULL, -- 'sale','recipe','manual_in','manual_out','inventory_adjust'
  ref_table text, 
  ref_id bigint, -- volitelně odkaz na sale nebo inventuru
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create inventory sessions table
CREATE TABLE IF NOT EXISTS public.inventory_sessions (
  id bigserial PRIMARY KEY,
  started_by uuid REFERENCES auth.users(id),
  started_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

-- Create inventory counts table
CREATE TABLE IF NOT EXISTS public.inventory_counts (
  id bigserial PRIMARY KEY,
  session_id bigint REFERENCES public.inventory_sessions(id) ON DELETE CASCADE,
  product_id bigint REFERENCES public.products(id),
  counted_qty numeric NOT NULL,
  note text
);

-- Create POS settings table
CREATE TABLE IF NOT EXISTS public.pos_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qr_bank_account text,
  qr_bank_code text,
  qr_recipient_name text DEFAULT 'Tenisový klub',
  qr_default_message text DEFAULT 'Platba za nákup',
  alert_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pos_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products
CREATE POLICY "Staff can read products basic info" ON public.products
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can read product names and prices" ON public.products
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage products" ON public.products
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for recipes
CREATE POLICY "Staff can read recipes" ON public.recipes
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage recipes" ON public.recipes
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for sales
CREATE POLICY "Staff can read sales" ON public.sales
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can create sales" ON public.sales
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage sales" ON public.sales
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for sale_items
CREATE POLICY "Staff can read sale items" ON public.sale_items
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can create sale items" ON public.sale_items
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage sale items" ON public.sale_items
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for stock_movements
CREATE POLICY "Staff can read stock movements" ON public.stock_movements
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Staff can create stock movements" ON public.stock_movements
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage stock movements" ON public.stock_movements
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for inventory_sessions
CREATE POLICY "Staff can read inventory sessions" ON public.inventory_sessions
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage inventory sessions" ON public.inventory_sessions
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for inventory_counts
CREATE POLICY "Staff can read inventory counts" ON public.inventory_counts
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage inventory counts" ON public.inventory_counts
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- RLS Policies for pos_settings
CREATE POLICY "Staff can read POS settings" ON public.pos_settings
  FOR SELECT TO authenticated
  USING (get_user_role(auth.uid()) = ANY (ARRAY['staff'::user_role, 'owner'::user_role]));

CREATE POLICY "Owner can manage POS settings" ON public.pos_settings
  FOR ALL TO authenticated
  USING (get_user_role(auth.uid()) = 'owner'::user_role);

-- Create function to process sale and update stock
CREATE OR REPLACE FUNCTION public.process_sale_stock_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for automatic stock updates on sales
CREATE TRIGGER trigger_process_sale_stock_update
  AFTER INSERT ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.process_sale_stock_update();

-- Create function to update product timestamps
CREATE OR REPLACE FUNCTION public.update_product_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger for product updates
CREATE TRIGGER trigger_update_product_timestamp
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_product_timestamp();

-- Insert default POS settings
INSERT INTO public.pos_settings (qr_recipient_name, qr_default_message, alert_email)
VALUES ('Tenis Nisa', 'Platba za nákup - Tenis Nisa', 'info@tenisnisa.cz')
ON CONFLICT DO NOTHING;

-- Insert some sample products
INSERT INTO public.products (sku, name, category, unit, sell_price, cost_price, track_stock, stock_qty, min_stock) VALUES
('BAR001', 'Pivo 0.5l', 'Bar', 'ks', 45, 25, true, 50, 10),
('BAR002', 'Coca Cola 0.33l', 'Bar', 'ks', 35, 18, true, 30, 5),
('BAR003', 'Voda 0.5l', 'Bar', 'ks', 25, 12, true, 40, 8),
('FOOD001', 'Párek v rohlíku', 'Jídlo', 'ks', 65, 35, true, 20, 5),
('FOOD002', 'Hamburger', 'Jídlo', 'ks', 120, 70, true, 15, 3),
('RENT001', 'Raketa půjčení', 'Půjčovna', 'ks', 50, 0, false, 0, 0),
('BALLS001', 'Tenisové míčky - 3ks', 'Míčky', 'ks', 150, 80, true, 25, 5);