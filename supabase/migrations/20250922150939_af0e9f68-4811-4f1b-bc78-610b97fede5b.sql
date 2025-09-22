-- Seed data and fixes for POS system (avoiding function replacement)

-- 1) Enum role (if not exists) - safe to run multiple times
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('guest','member','coach','staff','admin','owner');
  END IF;
END$$;

-- 2) Fix reservation_id type in sales table to match bookings
DO $$
BEGIN
  -- Check if reservation_id exists and fix its type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='sales' AND column_name='reservation_id'
  ) THEN
    -- Try to convert to bigint if it's not already
    BEGIN
      ALTER TABLE public.sales
        ALTER COLUMN reservation_id TYPE bigint
        USING CASE 
          WHEN reservation_id::text ~ '^[0-9]+$' THEN reservation_id::text::bigint
          ELSE NULL
        END;
    EXCEPTION WHEN OTHERS THEN
      -- If conversion fails, just make sure it's nullable
      ALTER TABLE public.sales ALTER COLUMN reservation_id DROP NOT NULL;
    END;
  ELSE
    -- Add the column if it doesn't exist
    ALTER TABLE public.sales ADD COLUMN reservation_id bigint;
  END IF;
END$$;

-- Add FK constraint if bookings table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='bookings') THEN
    ALTER TABLE public.sales
      DROP CONSTRAINT IF EXISTS sales_reservation_fk;
    ALTER TABLE public.sales
      ADD CONSTRAINT sales_reservation_fk
      FOREIGN KEY (reservation_id) REFERENCES public.bookings(id) ON DELETE SET NULL;
  END IF;
END$$;

-- POS settings (QR) - insert default settings
INSERT INTO public.pos_settings (qr_bank_account, qr_bank_code, qr_recipient_name, qr_default_message, alert_email)
VALUES ('1234567890', '0800', 'Tenis Nisa', 'Platba za nákup - Tenis Nisa', 'kdyrova.tenis@seznam.cz')
ON CONFLICT (id) DO NOTHING;

-- Basic products - sample data for testing
INSERT INTO public.products (sku,name,category,unit,sell_price,cost_price,track_stock,stock_qty,min_stock,is_active)
VALUES
('SUD50L', 'Sud piva 50 l',       'Bar',    'l',  0,   1500, true, 50,  10,  true),  -- ingredient
('PIVO05', 'Točené pivo 0,5 l',   'Bar',    'ks', 45,   25,  false, 0,  0,   true),  -- finished product (recipe)
('KOLA033','Coca-Cola 0,33 l',    'Bar',    'ks', 35,   18,  true,  30, 5,   true),
('VODA05', 'Voda 0,5 l',          'Bar',    'ks', 25,   12,  true,  40, 8,   true),
('HOTDOG', 'Párek v rohlíku',     'Jídlo',  'ks', 65,   35,  true,  20, 5,   true),
('MICKY3','Tenisové míčky 3 ks',  'Míčky',  'ks',150,   80,  true,  25, 5,   true),
('RAKETA','Raketa - půjčení',     'Půjčovna','ks',50,    0,  false, 0,  0,   true),
('KURT60','Kurt 60 min',          'Kurt/Hala','ks',0,    0,  false, 0,  0,   true)
ON CONFLICT (sku) DO NOTHING;

-- Recipe: beer 0.5L takes 0.5L from keg
DO $$
DECLARE
    beer_id bigint;
    keg_id bigint;
BEGIN
    -- Get product IDs
    SELECT id INTO beer_id FROM public.products WHERE sku = 'PIVO05';
    SELECT id INTO keg_id FROM public.products WHERE sku = 'SUD50L';
    
    -- Insert recipe if both products exist and recipe doesn't exist
    IF beer_id IS NOT NULL AND keg_id IS NOT NULL THEN
        INSERT INTO public.recipes (product_id, component_id, qty)
        VALUES (beer_id, keg_id, 0.5)
        ON CONFLICT DO NOTHING;
    END IF;
END$$;