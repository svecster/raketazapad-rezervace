-- Add more test data using the existing users and courts

-- Create variables to hold UUIDs (for better readability)
DO $$
DECLARE
    user1_id uuid;
    user2_id uuid;
    user3_id uuid;
    user4_id uuid;
    user5_id uuid;
    staff1_id uuid;
    staff2_id uuid;
    court1_id uuid;
    court2_id uuid;
    court4_id uuid;
    reservation1_id uuid;
    reservation2_id uuid;
    shift1_id uuid;
    shift2_id uuid;
    shift3_id uuid;
BEGIN
    -- Get user IDs
    SELECT id INTO staff1_id FROM public.users WHERE email = 'jan.novak@tenisklub.cz';
    SELECT id INTO staff2_id FROM public.users WHERE email = 'marie.svobodova@tenisklub.cz';
    SELECT id INTO user1_id FROM public.users WHERE email = 'petr.dvorak@email.cz';
    SELECT id INTO user2_id FROM public.users WHERE email = 'anna.novakova@email.cz';
    SELECT id INTO user3_id FROM public.users WHERE email = 'eva.cerna@email.cz';
    SELECT id INTO user4_id FROM public.users WHERE email = 'lucie.horakova@email.cz';
    SELECT id INTO user5_id FROM public.users WHERE email = 'martin.vesely@email.cz';
    
    -- Get court IDs
    SELECT id INTO court1_id FROM public.courts WHERE name = 'Kurt 1';
    SELECT id INTO court2_id FROM public.courts WHERE name = 'Kurt 2';
    SELECT id INTO court4_id FROM public.courts WHERE name = 'Krytý kurt 1';

    -- Insert test shifts
    INSERT INTO public.shifts (id, staff_user_id, opening_balance, closing_balance, status, created_at, closed_at, notes) VALUES
    (gen_random_uuid(), staff1_id, 5000, 6750, 'closed', '2024-12-14 07:00:00+01', '2024-12-14 19:00:00+01', 'Dobrý den, vysoké tržby z rezervací'),
    (gen_random_uuid(), staff2_id, 6750, 8200, 'closed', '2024-12-15 07:30:00+01', '2024-12-15 18:30:00+01', 'Víkendové rezervace, prodej nápojů'),
    (gen_random_uuid(), staff1_id, 8200, NULL, 'open', '2024-12-16 08:00:00+01', NULL, 'Aktuální směna')
    RETURNING id INTO shift3_id;

    -- Get shift IDs for ledger entries
    SELECT id INTO shift1_id FROM public.shifts WHERE staff_user_id = staff1_id AND status = 'closed' ORDER BY created_at LIMIT 1;
    SELECT id INTO shift2_id FROM public.shifts WHERE staff_user_id = staff2_id AND status = 'closed' LIMIT 1;

    -- Insert test reservations
    INSERT INTO public.reservations (id, start_time, end_time, court_id, user_id, price, status, payment_method, payment_confirmed_at, payment_confirmed_by, created_at) VALUES
    (gen_random_uuid(), '2024-12-15 14:00:00+01', '2024-12-15 15:30:00+01', court1_id, user1_id, 450, 'confirmed', 'cash', '2024-12-14 10:30:00+01', staff1_id, '2024-12-14 10:15:00+01'),
    (gen_random_uuid(), '2024-12-16 16:00:00+01', '2024-12-16 17:30:00+01', court2_id, user2_id, 450, 'confirmed', 'qr_payment', '2024-12-15 14:20:00+01', staff2_id, '2024-12-15 14:05:00+01'),
    (gen_random_uuid(), '2024-12-17 18:00:00+01', '2024-12-17 19:30:00+01', court4_id, user3_id, 650, 'booked', 'cash', NULL, NULL, '2024-12-16 12:45:00+01'),
    (gen_random_uuid(), '2024-12-18 10:00:00+01', '2024-12-18 11:30:00+01', court1_id, user4_id, 400, 'confirmed', 'qr_payment', '2024-12-17 16:15:00+01', staff1_id, '2024-12-17 16:00:00+01'),
    (gen_random_uuid(), '2024-12-19 15:00:00+01', '2024-12-19 16:30:00+01', court2_id, user5_id, 650, 'cancelled', 'cash', NULL, NULL, '2024-12-18 09:30:00+01');

    -- Get reservation IDs for further references
    SELECT id INTO reservation1_id FROM public.reservations WHERE user_id = user1_id LIMIT 1;
    SELECT id INTO reservation2_id FROM public.reservations WHERE user_id = user2_id LIMIT 1;

    -- Insert test cash ledger entries
    INSERT INTO public.cash_ledger (amount, transaction_type, description, reference_type, reference_id, user_id, shift_id, receipt_number, notes, created_at) VALUES
    (450, 'income', 'Platba za rezervaci kurtu', 'reservation', reservation1_id, user1_id, shift1_id, 'ÚK001', 'Hotovostní platba', '2024-12-14 10:30:00+01'),
    (105, 'income', 'Prodej nápojů', 'bar_order', NULL, user2_id, shift1_id, 'ÚK002', '3x Coca Cola', '2024-12-14 14:15:00+01'),
    (500, 'income', 'Platba za rezervaci kurtu', 'reservation', reservation2_id, user4_id, shift2_id, 'ÚK003', 'Víkendová rezervace', '2024-12-15 11:45:00+01'),
    (-200, 'expense', 'Nákup tenisových míčků', 'inventory', NULL, NULL, shift2_id, 'FAK124', 'Doplnění skladu', '2024-12-15 16:20:00+01'),
    (450, 'income', 'Platba za rezervaci kurtu', 'reservation', NULL, user3_id, shift3_id, 'ÚK004', 'Nedělní rezervace', '2024-12-16 13:20:00+01');

    -- Insert test bar orders
    INSERT INTO public.bar_orders (reservation_id, items, total_price, payment_method, payment_status, payment_confirmed_by, payment_confirmed_at, created_at) VALUES
    (reservation1_id, '[{"name": "Coca Cola 0.5l", "quantity": 3, "unit_price": 35, "total_price": 105}]', 105, 'cash', 'paid', staff1_id, '2024-12-14 14:15:00+01', '2024-12-14 14:10:00+01'),
    (reservation2_id, '[{"name": "Minerální voda 0.5l", "quantity": 2, "unit_price": 25, "total_price": 50}, {"name": "Proteinová tyčinka", "quantity": 1, "unit_price": 45, "total_price": 45}]', 95, 'qr_payment', 'paid', staff2_id, '2024-12-15 12:30:00+01', '2024-12-15 12:25:00+01');

    -- Insert test audit logs
    INSERT INTO public.audit_logs (action, user_id, details, timestamp) VALUES
    ('reservation_created', staff1_id, '{"reservation_id": "' || reservation1_id || '", "court": "Kurt 1", "user": "Petr Dvořák"}', '2024-12-14 10:15:00+01'),
    ('payment_confirmed', staff1_id, '{"reservation_id": "' || reservation1_id || '", "amount": 450, "method": "cash"}', '2024-12-14 10:30:00+01'),
    ('inventory_updated', staff2_id, '{"item": "Tenisové míčky Wilson", "old_stock": 45, "new_stock": 50}', '2024-12-15 16:20:00+01'),
    ('shift_opened', staff1_id, '{"shift_id": "' || shift3_id || '", "opening_balance": 8200}', '2024-12-16 08:00:00+01'),
    ('user_created', staff1_id, '{"user": "Petr Dvořák", "role": "player"}', '2024-12-14 09:00:00+01');

    -- Insert cash register entry
    INSERT INTO public.cash_register (shift_id, cash_in, cash_out, balance, notes) VALUES
    (shift3_id, 1450, 200, 9450, 'Aktuální stav pokladny');

END $$;