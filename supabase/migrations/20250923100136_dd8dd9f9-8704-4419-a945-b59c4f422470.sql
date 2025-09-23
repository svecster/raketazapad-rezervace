-- Create test courts
INSERT INTO courts (id, name, type, status) VALUES
  ('court-1', 'Kurt 1 (Indoor)', 'indoor', 'available'),
  ('court-2', 'Kurt 2 (Indoor)', 'indoor', 'available'),
  ('court-3', 'Kurt 3 (Outdoor)', 'outdoor', 'available'),
  ('court-4', 'Kurt 4 (Outdoor)', 'outdoor', 'available')
ON CONFLICT (id) DO NOTHING;

-- Create test reservations
INSERT INTO reservations (id, court_id, start_time, end_time, price, status, payment_method, guest_contact, user_id) VALUES
  (
    gen_random_uuid(),
    'court-1',
    '2024-01-15 10:00:00+00',
    '2024-01-15 11:30:00+00',
    750,
    'booked',
    'cash',
    '{"name": "Jan Novák", "email": "jan.novak@email.cz", "phone": "+420 123 456 789"}',
    NULL
  ),
  (
    gen_random_uuid(),
    'court-2',
    '2024-01-15 14:00:00+00',
    '2024-01-15 15:30:00+00',
    600,
    'paid',
    'qr',
    '{"name": "Marie Svobodová", "email": "marie@email.cz", "phone": "+420 987 654 321"}',
    NULL
  ),
  (
    gen_random_uuid(),
    'court-3',
    CURRENT_DATE + INTERVAL '2 hours',
    CURRENT_DATE + INTERVAL '3.5 hours',
    500,
    'booked',
    'cash',
    '{"name": "Pavel Novotný", "email": "pavel@email.cz", "phone": "+420 555 666 777"}',
    NULL
  ),
  (
    gen_random_uuid(),
    'court-1',
    CURRENT_DATE + INTERVAL '5 hours',
    CURRENT_DATE + INTERVAL '6.5 hours',
    750,
    'booked',
    'qr',
    '{"name": "Jana Kratká", "email": "jana@email.cz", "phone": "+420 888 999 000"}',
    NULL
  )
ON CONFLICT DO NOTHING;