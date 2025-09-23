-- Create test reservations using existing court IDs
WITH court_ids AS (
  SELECT id, name FROM courts LIMIT 4
)
INSERT INTO reservations (court_id, start_time, end_time, price, status, payment_method, guest_contact)
SELECT 
  c.id,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN '2024-01-15 10:00:00+00'::timestamptz
    WHEN ROW_NUMBER() OVER() = 2 THEN '2024-01-15 14:00:00+00'::timestamptz  
    WHEN ROW_NUMBER() OVER() = 3 THEN CURRENT_DATE + INTERVAL '2 hours'
    ELSE CURRENT_DATE + INTERVAL '5 hours'
  END as start_time,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN '2024-01-15 11:30:00+00'::timestamptz
    WHEN ROW_NUMBER() OVER() = 2 THEN '2024-01-15 15:30:00+00'::timestamptz
    WHEN ROW_NUMBER() OVER() = 3 THEN CURRENT_DATE + INTERVAL '3.5 hours'
    ELSE CURRENT_DATE + INTERVAL '6.5 hours'
  END as end_time,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 750
    WHEN ROW_NUMBER() OVER() = 2 THEN 600
    WHEN ROW_NUMBER() OVER() = 3 THEN 500
    ELSE 750
  END as price,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 'booked'::reservation_status
    WHEN ROW_NUMBER() OVER() = 2 THEN 'paid'::reservation_status
    ELSE 'booked'::reservation_status
  END as status,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN 'cash'
    WHEN ROW_NUMBER() OVER() = 2 THEN 'qr'
    WHEN ROW_NUMBER() OVER() = 3 THEN 'cash'
    ELSE 'qr'
  END as payment_method,
  CASE 
    WHEN ROW_NUMBER() OVER() = 1 THEN '{"name": "Jan Novák", "email": "jan.novak@email.cz", "phone": "+420 123 456 789"}'::jsonb
    WHEN ROW_NUMBER() OVER() = 2 THEN '{"name": "Marie Svobodová", "email": "marie@email.cz", "phone": "+420 987 654 321"}'::jsonb
    WHEN ROW_NUMBER() OVER() = 3 THEN '{"name": "Pavel Novotný", "email": "pavel@email.cz", "phone": "+420 555 666 777"}'::jsonb
    ELSE '{"name": "Jana Kratká", "email": "jana@email.cz", "phone": "+420 888 999 000"}'::jsonb
  END as guest_contact
FROM court_ids c
LIMIT 4;