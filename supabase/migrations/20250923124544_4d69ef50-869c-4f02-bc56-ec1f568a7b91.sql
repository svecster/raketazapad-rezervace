-- Create new tables for tennis facility MVP without modifying existing enums

-- Price rules table for dynamic pricing
CREATE TABLE IF NOT EXISTS price_rules (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  court_type text CHECK (court_type IN ('indoor','outdoor')) NOT NULL, -- Keep existing enum values
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
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

-- Create new products table (avoiding conflicts)
DROP TABLE IF EXISTS products_mvp;
CREATE TABLE products_mvp (
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
  product_id bigint REFERENCES products_mvp(id),
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

-- Create new payments table
DROP TABLE IF EXISTS payments_mvp;
CREATE TABLE payments_mvp (
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

-- Add new columns to reservations if they don't exist
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS price_czk numeric(10,2) DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS note text;

-- Enable RLS on all new tables
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_mvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments_mvp ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can read price rules" ON price_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can manage price rules" ON price_rules FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

CREATE POLICY "Staff can manage bar tabs" ON bar_tabs FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their reservation tabs" ON bar_tabs FOR SELECT TO authenticated USING (
  reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid())
);

CREATE POLICY "Staff can read products" ON products_mvp FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Owner can manage products" ON products_mvp FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

CREATE POLICY "Staff can manage bar items" ON bar_items FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their bar items" ON bar_items FOR SELECT TO authenticated USING (
  tab_id IN (SELECT id FROM bar_tabs WHERE reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()))
);

CREATE POLICY "Staff can manage cash registers" ON cash_registers FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));

CREATE POLICY "Staff can manage payments" ON payments_mvp FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their payments" ON payments_mvp FOR SELECT TO authenticated USING (
  reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()) OR
  tab_id IN (SELECT id FROM bar_tabs WHERE reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()))
);

CREATE POLICY "Staff can see their shifts" ON shifts FOR SELECT TO authenticated USING (
  staff_id = auth.uid() OR get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner'])
);
CREATE POLICY "Staff can update their shifts" ON shifts FOR UPDATE TO authenticated USING (staff_id = auth.uid());
CREATE POLICY "Owner can manage all shifts" ON shifts FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

-- Insert sample data with correct enum values
INSERT INTO price_rules (name, court_type, day_of_week, start_hour, end_hour, price_per_hour_czk) VALUES
('Vnitřní kurty - všední dny ráno', 'indoor', 1, 8, 16, 400),
('Vnitřní kurty - všední dny večer', 'indoor', 1, 16, 22, 500),
('Venkovní kurty - všední dny', 'outdoor', 1, 8, 22, 300),
('Vnitřní kurty - víkend', 'indoor', 0, 8, 22, 600),
('Venkovní kurty - víkend', 'outdoor', 0, 8, 22, 400);

INSERT INTO products_mvp (name, sku, price_czk, vat) VALUES
('Coca Cola 0.33l', 'COCA-033', 45, 21),
('Pivo Pilsner Urquell 0.5l', 'BEER-PILS-05', 65, 21),
('Kofola 0.33l', 'KOFOLA-033', 40, 21),
('Voda neperlivá 0.5l', 'WATER-STILL-05', 25, 21),
('Bageta se šunkou', 'BAGETA-SUNKA', 120, 21),
('Snickers', 'SNICKERS', 35, 21);

-- Create function to auto-create bar tab when reservation is created
CREATE OR REPLACE FUNCTION create_bar_tab_for_reservation()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NOT NULL THEN
        INSERT INTO bar_tabs (reservation_id, opened_by)
        VALUES (NEW.id, NEW.created_by);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS auto_create_bar_tab ON reservations;
CREATE TRIGGER auto_create_bar_tab
    AFTER INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION create_bar_tab_for_reservation();