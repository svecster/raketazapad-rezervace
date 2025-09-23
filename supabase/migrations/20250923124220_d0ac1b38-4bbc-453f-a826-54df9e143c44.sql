-- Create comprehensive data model for tennis facility MVP

-- First, ensure user_profiles table has correct structure
ALTER TABLE user_profiles ALTER COLUMN app_role TYPE text;
ALTER TABLE user_profiles ADD CONSTRAINT check_app_role CHECK (app_role IN ('guest','player','trainer','staff','owner','admin'));

-- Courts table (update existing if needed)
ALTER TABLE courts ALTER COLUMN type TYPE text;
ALTER TABLE courts ADD CONSTRAINT check_court_type CHECK (type IN ('inside','outside'));
ALTER TABLE courts ALTER COLUMN status TYPE text;
ALTER TABLE courts ADD CONSTRAINT check_court_status CHECK (status IN ('available','maintenance','hidden'));
ALTER TABLE courts ALTER COLUMN status SET DEFAULT 'available';

-- Update reservations table structure
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS price_czk numeric(10,2) DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS note text;
ALTER TABLE reservations ALTER COLUMN status TYPE text;
ALTER TABLE reservations ADD CONSTRAINT check_reservation_status CHECK (status IN ('new','confirmed','checked_in','completed','no_show','canceled'));
ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'new';

-- Price rules table for dynamic pricing
CREATE TABLE IF NOT EXISTS price_rules (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  court_type text CHECK (court_type IN ('inside','outside')) NOT NULL,
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6), -- 0 Sunday
  start_hour int CHECK (start_hour BETWEEN 0 AND 23),
  end_hour int CHECK (end_hour BETWEEN 1 AND 24),
  price_per_hour_czk numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bar/Pokladna system
CREATE TABLE IF NOT EXISTS bar_tabs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id uuid REFERENCES reservations(id) ON DELETE CASCADE,
  status text CHECK (status IN ('open','closed')) DEFAULT 'open',
  opened_by uuid REFERENCES auth.users(id),
  closed_by uuid REFERENCES auth.users(id),
  opened_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Update products table if needed, or create new one
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  sku text UNIQUE,
  price_czk numeric(10,2) NOT NULL,
  vat numeric(4,2) DEFAULT 21,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bar_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tab_id bigint REFERENCES bar_tabs(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id),
  qty numeric(10,3) NOT NULL DEFAULT 1,
  unit_price_czk numeric(10,2) NOT NULL,
  total_czk numeric(10,2) GENERATED ALWAYS AS (qty * unit_price_czk) STORED,
  created_at timestamp with time zone DEFAULT now()
);

-- Cash register system
CREATE TABLE IF NOT EXISTS cash_registers (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  opened_by uuid REFERENCES auth.users(id),
  closed_by uuid REFERENCES auth.users(id),
  opened_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  opening_balance_czk numeric(10,2) DEFAULT 0,
  closing_balance_czk numeric(10,2),
  notes text
);

-- Payments system
DROP TABLE IF EXISTS payments CASCADE;
CREATE TABLE payments (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reservation_id uuid REFERENCES reservations(id),
  tab_id bigint REFERENCES bar_tabs(id),
  method text CHECK (method IN ('cash','card','bank')) NOT NULL,
  amount_czk numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  notes text
);

-- Shifts system for staff scheduling
CREATE TABLE IF NOT EXISTS shifts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id uuid REFERENCES auth.users(id),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text CHECK (status IN ('planned','checked_in','checked_out','missed')) DEFAULT 'planned',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Price rules - readable by all authenticated users, manageable by owner
CREATE POLICY "Everyone can read price rules" ON price_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can manage price rules" ON price_rules FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

-- Bar tabs - staff and owners can manage, users can see their own
CREATE POLICY "Staff can manage bar tabs" ON bar_tabs FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their reservation tabs" ON bar_tabs FOR SELECT TO authenticated USING (
  reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid())
);

-- Products - staff can read, owner manages
CREATE POLICY "Staff can read products" ON products FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Owner can manage products" ON products FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

-- Bar items - staff can manage, users can see their own
CREATE POLICY "Staff can manage bar items" ON bar_items FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their bar items" ON bar_items FOR SELECT TO authenticated USING (
  tab_id IN (SELECT id FROM bar_tabs WHERE reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()))
);

-- Cash registers - staff only
CREATE POLICY "Staff can manage cash registers" ON cash_registers FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));

-- Payments - staff can manage, users can see their own
CREATE POLICY "Staff can manage payments" ON payments FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their payments" ON payments FOR SELECT TO authenticated USING (
  reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()) OR
  tab_id IN (SELECT id FROM bar_tabs WHERE reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()))
);

-- Shifts - staff can see their own, owner can manage all
CREATE POLICY "Staff can see their shifts" ON shifts FOR SELECT TO authenticated USING (
  staff_id = auth.uid() OR get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner'])
);
CREATE POLICY "Staff can update their shifts" ON shifts FOR UPDATE TO authenticated USING (staff_id = auth.uid());
CREATE POLICY "Owner can manage all shifts" ON shifts FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_price_rules_updated_at BEFORE UPDATE ON price_rules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function to auto-create bar tab when reservation is created
CREATE OR REPLACE FUNCTION create_bar_tab_for_reservation()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO bar_tabs (reservation_id, opened_by)
    VALUES (NEW.id, NEW.created_by);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_bar_tab
    AFTER INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION create_bar_tab_for_reservation();