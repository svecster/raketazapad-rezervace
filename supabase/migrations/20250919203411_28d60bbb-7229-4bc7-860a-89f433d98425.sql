-- Clean up and ensure exactly 10 records for each table type

-- First, let's clean up existing data to ensure we have space for exactly 10 records

-- Clean users table - keep first 10
WITH users_to_keep AS (
  SELECT id FROM public.users ORDER BY created_at LIMIT 10
)
DELETE FROM public.users WHERE id NOT IN (SELECT id FROM users_to_keep);

-- Clean courts table - keep first 10  
WITH courts_to_keep AS (
  SELECT id FROM public.courts ORDER BY name LIMIT 10
)
DELETE FROM public.courts WHERE id NOT IN (SELECT id FROM courts_to_keep);

-- Clean inventory table - keep first 10
WITH inventory_to_keep AS (
  SELECT id FROM public.inventory ORDER BY item_name LIMIT 10
)
DELETE FROM public.inventory WHERE id NOT IN (SELECT id FROM inventory_to_keep);

-- Add missing users with proper enum casting
INSERT INTO public.users (name, email, username, phone, role) 
VALUES
  ('Pavel Svoboda', 'pavel.svoboda@email.cz', 'psvoboda', '+420701123456', 'player'::user_role),
  ('Klára Horáková', 'klara.horakova@email.cz', 'khorakova', '+420702234567', 'player'::user_role),
  ('Michal Černý', 'michal.cerny@email.cz', 'mcerny', '+420703345678', 'player'::user_role),
  ('Barbora Nová', 'barbora.nova@email.cz', 'bnova', '+420704456789', 'player'::user_role),
  ('Jiří Dvořák', 'jiri.dvorak@email.cz', 'jdvorak', '+420705567890', 'player'::user_role),
  ('Veronika Malá', 'veronika.mala@email.cz', 'vmala', '+420706678901', 'player'::user_role),
  ('Robert Veselý', 'robert.vesely@email.cz', 'rvesely', '+420707789012', 'player'::user_role),
  ('Simona Krásná', 'simona.krasna@email.cz', 'skrasna', '+420708890123', 'player'::user_role),
  ('Filip Novotný', 'filip.novotny@email.cz', 'fnovotny', '+420709901234', 'player'::user_role),
  ('Monika Světlá', 'monika.svetla@email.cz', 'msvetla', '+420710012345', 'player'::user_role)
ON CONFLICT (email) DO NOTHING;

-- Ensure we have exactly 10 users by trimming if needed
WITH users_to_keep AS (
  SELECT id FROM public.users ORDER BY created_at LIMIT 10
)
DELETE FROM public.users WHERE id NOT IN (SELECT id FROM users_to_keep);

-- Add missing courts with proper enum casting
INSERT INTO public.courts (name, type, status, seasonal_price_rules)
VALUES
  ('Kurt 4', 'outdoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
  ('Kurt 5', 'outdoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
  ('Krytý kurt 3', 'indoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
  ('Krytý kurt 4', 'indoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
  ('Krytý kurt 5', 'indoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
  ('Antukový kurt 1', 'outdoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 350, "weekend": 450}, "summer": {"weekday": 400, "weekend": 500}, "autumn": {"weekday": 300, "weekend": 400}, "winter": {"weekday": 250, "weekend": 350}}'),
  ('Antukový kurt 2', 'outdoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 350, "weekend": 450}, "summer": {"weekday": 400, "weekend": 500}, "autumn": {"weekday": 300, "weekend": 400}, "winter": {"weekday": 250, "weekend": 350}}'),
  ('Beachvolejbalové hřiště', 'outdoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 300, "weekend": 400}, "summer": {"weekday": 350, "weekend": 450}, "autumn": {"weekday": 250, "weekend": 350}, "winter": {"weekday": 200, "weekend": 300}}'),
  ('Multifunkční kurt', 'indoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 500, "weekend": 600}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 550, "weekend": 650}, "winter": {"weekday": 600, "weekend": 700}}'),
  ('Tréninkový kurt', 'indoor'::court_type, 'available'::court_status, '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 350, "weekend": 450}, "autumn": {"weekday": 450, "weekend": 550}, "winter": {"weekday": 500, "weekend": 600}}')
ON CONFLICT (name) DO NOTHING;

-- Ensure exactly 10 courts
WITH courts_to_keep AS (
  SELECT id FROM public.courts ORDER BY name LIMIT 10
)
DELETE FROM public.courts WHERE id NOT IN (SELECT id FROM courts_to_keep);

-- Add missing inventory items
INSERT INTO public.inventory (item_name, unit_price, stock, last_update)
VALUES
  ('Tenisová raketa Wilson', 3500, 5, NOW()),
  ('Tenisové míčky Dunlop', 110, 35, NOW()),
  ('Sprite 0.5l', 32, 28, NOW()),
  ('Káva americano', 45, 40, NOW()),
  ('Croissant', 55, 12, NOW()),
  ('Isotonický nápoj', 58, 15, NOW()),
  ('Tenisová taška', 850, 6, NOW()),
  ('Ručník klubový', 280, 20, NOW()),
  ('Energy bar', 35, 25, NOW()),
  ('Minerální voda 1.5l', 35, 18, NOW())
ON CONFLICT (item_name) DO NOTHING;

-- Ensure exactly 10 inventory items
WITH inventory_to_keep AS (
  SELECT id FROM public.inventory ORDER BY item_name LIMIT 10
)
DELETE FROM public.inventory WHERE id NOT IN (SELECT id FROM inventory_to_keep);