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

-- Now let's add missing data to reach exactly 10 for each type

-- Add missing users (if less than 10) with proper enum casting
INSERT INTO public.users (name, email, username, phone, role) 
SELECT name, email, username, phone, role::user_role FROM (VALUES
  ('Pavel Svoboda', 'pavel.svoboda@email.cz', 'psvoboda', '+420701123456', 'player'),
  ('Klára Horáková', 'klara.horakova@email.cz', 'khorakova', '+420702234567', 'player'),
  ('Michal Černý', 'michal.cerny@email.cz', 'mcerny', '+420703345678', 'player'),
  ('Barbora Nová', 'barbora.nova@email.cz', 'bnova', '+420704456789', 'player'),
  ('Jiří Dvořák', 'jiri.dvorak@email.cz', 'jdvorak', '+420705567890', 'player'),
  ('Veronika Malá', 'veronika.mala@email.cz', 'vmala', '+420706678901', 'player'),
  ('Robert Veselý', 'robert.vesely@email.cz', 'rvesely', '+420707789012', 'player'),
  ('Simona Krásná', 'simona.krasna@email.cz', 'skrasna', '+420708890123', 'player'),
  ('Filip Novotný', 'filip.novotny@email.cz', 'fnovotny', '+420709901234', 'player'),
  ('Monika Světlá', 'monika.svetla@email.cz', 'msvetla', '+420710012345', 'player')
) AS new_users(name, email, username, phone, role)
WHERE (SELECT COUNT(*) FROM public.users) < 10
LIMIT (10 - (SELECT COUNT(*) FROM public.users));

-- Add missing courts (if less than 10) with proper enum casting
INSERT INTO public.courts (name, type, status, seasonal_price_rules)
SELECT name, type::court_type, status::court_status, seasonal_price_rules::jsonb FROM (VALUES
  ('Kurt 4', 'outdoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
  ('Kurt 5', 'outdoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
  ('Krytý kurt 3', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
  ('Krytý kurt 4', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
  ('Krytý kurt 5', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
  ('Antukový kurt 1', 'outdoor', 'available', '{"spring": {"weekday": 350, "weekend": 450}, "summer": {"weekday": 400, "weekend": 500}, "autumn": {"weekday": 300, "weekend": 400}, "winter": {"weekday": 250, "weekend": 350}}'),
  ('Antukový kurt 2', 'outdoor', 'available', '{"spring": {"weekday": 350, "weekend": 450}, "summer": {"weekday": 400, "weekend": 500}, "autumn": {"weekday": 300, "weekend": 400}, "winter": {"weekday": 250, "weekend": 350}}'),
  ('Beachvolejbalové hřiště', 'outdoor', 'available', '{"spring": {"weekday": 300, "weekend": 400}, "summer": {"weekday": 350, "weekend": 450}, "autumn": {"weekday": 250, "weekend": 350}, "winter": {"weekday": 200, "weekend": 300}}'),
  ('Multifunkční kurt', 'indoor', 'available', '{"spring": {"weekday": 500, "weekend": 600}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 550, "weekend": 650}, "winter": {"weekday": 600, "weekend": 700}}'),
  ('Tréninkový kurt', 'indoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 350, "weekend": 450}, "autumn": {"weekday": 450, "weekend": 550}, "winter": {"weekday": 500, "weekend": 600}}')
) AS new_courts(name, type, status, seasonal_price_rules)
WHERE (SELECT COUNT(*) FROM public.courts) < 10
LIMIT (10 - (SELECT COUNT(*) FROM public.courts));

-- Add missing inventory items (if less than 10)
INSERT INTO public.inventory (item_name, unit_price, stock, last_update)
SELECT * FROM (VALUES
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
) AS new_inventory(item_name, unit_price, stock, last_update)
WHERE (SELECT COUNT(*) FROM public.inventory) < 10
LIMIT (10 - (SELECT COUNT(*) FROM public.inventory));