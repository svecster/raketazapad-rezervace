-- Seed data for POS system (without touching existing functions)

-- 1) Enum role (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('guest','member','coach','staff','admin','owner');
  END IF;
END$$;

-- 2) Fix reservation_id type in sales table
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

-- POS settings (QR)
INSERT INTO public.pos_settings (qr_bank_account, qr_bank_code, qr_recipient_name, qr_default_message, alert_email)
VALUES ('1234567890', '0800', 'Tenis Nisa', 'Platba za nákup - Tenis Nisa', 'kdyrova.tenis@seznam.cz')
ON CONFLICT (id) DO NOTHING;

-- Basic products
INSERT INTO public.products (sku,name,category,unit,sell_price,cost_price,track_stock,stock_qty,min_stock)
VALUES
('SUD50L', 'Sud piva 50 l',       'Bar',    'l',  0,   1500, true, 50,  10),  -- ingredient
('PIVO05', 'Točené pivo 0,5 l',   'Bar',    'ks', 45,   25,  false, 0,  0),   -- finished product (recipe)
('KOLA033','Coca-Cola 0,33 l',    'Bar',    'ks', 35,   18,  true,  30, 5),
('VODA05', 'Voda 0,5 l',          'Bar',    'ks', 25,   12,  true,  40, 8),
('HOTDOG', 'Párek v rohlíku',     'Jídlo',  'ks', 65,   35,  true,  20, 5),
('MICKY3','Tenisové míčky 3 ks',  'Míčky',  'ks',150,   80,  true,  25, 5),
('RAKETA','Raketa - půjčení',     'Půjčovna','ks',50,    0,  false, 0,  0),
('KURT60','Kurt 60 min',          'Kurt/Hala','ks',0,    0,  false, 0,  0)
ON CONFLICT (sku) DO NOTHING;

-- Recipe: beer 0.5L takes 0.5L from keg
INSERT INTO public.recipes (product_id, component_id, qty)
SELECT p_pivo.id, p_sud.id, 0.5
FROM public.products p_pivo, public.products p_sud
WHERE p_pivo.sku='PIVO05' AND p_sud.sku='SUD50L'
ON CONFLICT DO NOTHING;