-- Fix courts table enum issue and create comprehensive data model

-- Check and drop existing enum constraint/type
DO $$
BEGIN
    -- Drop enum type if it exists
    DROP TYPE IF EXISTS court_type CASCADE;
    DROP TYPE IF EXISTS court_status CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- Fix existing court data
UPDATE courts SET type = 'inside' WHERE type = 'indoor';
UPDATE courts SET type = 'outside' WHERE type = 'outdoor';

-- Now safely alter the columns to text type
ALTER TABLE courts ALTER COLUMN type TYPE text;
ALTER TABLE courts ALTER COLUMN status TYPE text;

-- Add constraints
ALTER TABLE courts DROP CONSTRAINT IF EXISTS check_court_type;
ALTER TABLE courts ADD CONSTRAINT check_court_type CHECK (type IN ('inside','outside'));
ALTER TABLE courts DROP CONSTRAINT IF EXISTS check_court_status;
ALTER TABLE courts ADD CONSTRAINT check_court_status CHECK (status IN ('available','maintenance','hidden'));
ALTER TABLE courts ALTER COLUMN status SET DEFAULT 'available';

-- Fix user_profiles constraints
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS check_app_role;
ALTER TABLE user_profiles ADD CONSTRAINT check_app_role CHECK (app_role IN ('guest','player','trainer','staff','owner','admin'));

-- Update reservations table
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS price_czk numeric(10,2) DEFAULT 0;
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS note text;

-- Handle reservation status enum issue
DO $$
BEGIN
    DROP TYPE IF EXISTS reservation_status CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

ALTER TABLE reservations ALTER COLUMN status TYPE text;
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS check_reservation_status;
ALTER TABLE reservations ADD CONSTRAINT check_reservation_status CHECK (status IN ('new','confirmed','checked_in','completed','no_show','canceled'));
ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'new';

-- Create new tables only if they don't exist

-- Price rules
CREATE TABLE IF NOT EXISTS price_rules (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name text NOT NULL,
  court_type text CHECK (court_type IN ('inside','outside')) NOT NULL,
  day_of_week int CHECK (day_of_week BETWEEN 0 AND 6),
  start_hour int CHECK (start_hour BETWEEN 0 AND 23),
  end_hour int CHECK (end_hour BETWEEN 1 AND 24),
  price_per_hour_czk numeric(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Bar tabs
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

-- Handle products table safely
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
        -- If products exists, create new one with different name first
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
        -- Drop old and rename
        DROP TABLE IF EXISTS products CASCADE;
        ALTER TABLE products_mvp RENAME TO products;
    ELSE
        -- Create new products table
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
    END IF;
END $$;

-- Bar items
CREATE TABLE IF NOT EXISTS bar_items (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tab_id bigint REFERENCES bar_tabs(id) ON DELETE CASCADE,
  product_id bigint REFERENCES products(id),
  qty numeric(10,3) NOT NULL DEFAULT 1,
  unit_price_czk numeric(10,2) NOT NULL,
  total_czk numeric(10,2) GENERATED ALWAYS AS (qty * unit_price_czk) STORED,
  created_at timestamp with time zone DEFAULT now()
);

-- Cash registers
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

-- Handle payments table safely
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'payments') THEN
        -- If payments exists, create new one with different name first
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
        -- Drop old and rename
        DROP TABLE IF EXISTS payments CASCADE;
        ALTER TABLE payments_mvp RENAME TO payments;
    ELSE
        -- Create new payments table
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
    END IF;
END $$;

-- Shifts
CREATE TABLE IF NOT EXISTS shifts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  staff_id uuid REFERENCES auth.users(id),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status text CHECK (status IN ('planned','checked_in','checked_out','missed')) DEFAULT 'planned',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_tabs ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bar_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Everyone can read price rules" ON price_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner can manage price rules" ON price_rules FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

CREATE POLICY "Staff can manage bar tabs" ON bar_tabs FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their reservation tabs" ON bar_tabs FOR SELECT TO authenticated USING (
  reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid())
);

CREATE POLICY "Staff can read products" ON products FOR SELECT TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Owner can manage products" ON products FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

CREATE POLICY "Staff can manage bar items" ON bar_items FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their bar items" ON bar_items FOR SELECT TO authenticated USING (
  tab_id IN (SELECT id FROM bar_tabs WHERE reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()))
);

CREATE POLICY "Staff can manage cash registers" ON cash_registers FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));

CREATE POLICY "Staff can manage payments" ON payments FOR ALL TO authenticated USING (get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner']));
CREATE POLICY "Users can see their payments" ON payments FOR SELECT TO authenticated USING (
  reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()) OR
  tab_id IN (SELECT id FROM bar_tabs WHERE reservation_id IN (SELECT id FROM reservations WHERE created_by = auth.uid()))
);

CREATE POLICY "Staff can see their shifts" ON shifts FOR SELECT TO authenticated USING (
  staff_id = auth.uid() OR get_user_role(auth.uid()) = ANY (ARRAY['staff', 'owner'])
);
CREATE POLICY "Staff can update their shifts" ON shifts FOR UPDATE TO authenticated USING (staff_id = auth.uid());
CREATE POLICY "Owner can manage all shifts" ON shifts FOR ALL TO authenticated USING (get_user_role(auth.uid()) = 'owner');

-- Insert sample data only if tables are empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM price_rules LIMIT 1) THEN
        INSERT INTO price_rules (name, court_type, day_of_week, start_hour, end_hour, price_per_hour_czk) VALUES
        ('Vnitřní kurty - všední dny ráno', 'inside', 1, 8, 16, 400),
        ('Vnitřní kurty - všední dny večer', 'inside', 1, 16, 22, 500),
        ('Venkovní kurty - všední dny', 'outside', 1, 8, 22, 300),
        ('Vnitřní kurty - víkend', 'inside', 0, 8, 22, 600),
        ('Venkovní kurty - víkend', 'outside', 0, 8, 22, 400);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM products LIMIT 1) THEN
        INSERT INTO products (name, sku, price_czk, vat) VALUES
        ('Coca Cola 0.33l', 'COCA-033', 45, 21),
        ('Pivo Pilsner Urquell 0.5l', 'BEER-PILS-05', 65, 21),
        ('Kofola 0.33l', 'KOFOLA-033', 40, 21),
        ('Voda neperlivá 0.5l', 'WATER-STILL-05', 25, 21),
        ('Bageta se šunkou', 'BAGETA-SUNKA', 120, 21),
        ('Snickers', 'SNICKERS', 35, 21);
    END IF;
END $$;

-- Create auto bar tab trigger
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

DROP TRIGGER IF EXISTS auto_create_bar_tab ON reservations;
CREATE TRIGGER auto_create_bar_tab
    AFTER INSERT ON reservations
    FOR EACH ROW
    EXECUTE FUNCTION create_bar_tab_for_reservation();