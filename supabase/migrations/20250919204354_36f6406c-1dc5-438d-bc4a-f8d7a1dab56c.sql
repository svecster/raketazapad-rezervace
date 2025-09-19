-- Add remaining test data to reach exactly 10 records for each table (with correct enum values)

-- Add 9 more reservations to reach 10 total
DO $$
DECLARE
    court_ids uuid[];
    user_ids uuid[];
    staff_ids uuid[];
BEGIN
    -- Get arrays of IDs
    SELECT ARRAY(SELECT id FROM public.courts ORDER BY name LIMIT 5) INTO court_ids;
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'player' LIMIT 8) INTO user_ids;
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'staff' LIMIT 2) INTO staff_ids;
    
    -- Insert reservations with correct enum values
    INSERT INTO public.reservations (start_time, end_time, court_id, user_id, price, status, payment_method, payment_confirmed_at, payment_confirmed_by, created_at) VALUES
    ('2024-12-23 10:00:00+01', '2024-12-23 11:30:00+01', court_ids[1], user_ids[1], 400, 'paid', 'cash', '2024-12-22 15:30:00+01', staff_ids[1], '2024-12-22 15:15:00+01'),
    ('2024-12-23 12:00:00+01', '2024-12-23 13:30:00+01', court_ids[2], user_ids[2], 400, 'booked', 'qr_payment', NULL, NULL, '2024-12-22 16:20:00+01'),
    ('2024-12-23 14:00:00+01', '2024-12-23 15:30:00+01', court_ids[3], user_ids[3], 650, 'paid', 'cash', '2024-12-22 17:45:00+01', staff_ids[2], '2024-12-22 17:30:00+01'),
    ('2024-12-24 09:00:00+01', '2024-12-24 10:30:00+01', court_ids[4], user_ids[4], 600, 'booked', 'qr_payment', NULL, NULL, '2024-12-23 08:15:00+01'),
    ('2024-12-24 11:00:00+01', '2024-12-24 12:30:00+01', court_ids[5], user_ids[5], 600, 'paid', 'cash', '2024-12-23 10:20:00+01', staff_ids[1], '2024-12-23 10:05:00+01'),
    ('2024-12-24 13:00:00+01', '2024-12-24 14:30:00+01', court_ids[1], user_ids[6], 400, 'cancelled', 'cash', NULL, NULL, '2024-12-23 11:30:00+01'),
    ('2024-12-25 15:00:00+01', '2024-12-25 16:30:00+01', court_ids[2], user_ids[7], 500, 'paid', 'qr_payment', '2024-12-24 14:10:00+01', staff_ids[2], '2024-12-24 13:55:00+01'),
    ('2024-12-25 17:00:00+01', '2024-12-25 18:30:00+01', court_ids[3], user_ids[8], 650, 'booked', 'cash', NULL, NULL, '2024-12-24 16:40:00+01'),
    ('2024-12-26 08:00:00+01', '2024-12-26 09:30:00+01', court_ids[4], user_ids[1], 600, 'paid', 'qr_payment', '2024-12-25 19:25:00+01', staff_ids[1], '2024-12-25 19:10:00+01');
END $$;

-- Add 9 more shifts to reach 10 total
DO $$
DECLARE
    staff_ids uuid[];
BEGIN
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'staff' LIMIT 2) INTO staff_ids;
    
    INSERT INTO public.shifts (staff_user_id, opening_balance, closing_balance, status, created_at, closed_at, notes) VALUES
    (staff_ids[1], 8200, 9150, 'closed', '2024-12-17 07:00:00+01', '2024-12-17 19:00:00+01', 'Dobrý obrat, mnoho rezervací'),
    (staff_ids[2], 9150, 10500, 'closed', '2024-12-18 07:30:00+01', '2024-12-18 18:30:00+01', 'Víkendový rush, vysoký prodej'),
    (staff_ids[1], 10500, 11200, 'closed', '2024-12-19 08:00:00+01', '2024-12-19 19:30:00+01', 'Standardní den'),
    (staff_ids[2], 11200, 12100, 'closed', '2024-12-20 07:00:00+01', '2024-12-20 18:00:00+01', 'Busy Friday'),
    (staff_ids[1], 12100, 13500, 'closed', '2024-12-21 08:30:00+01', '2024-12-21 19:30:00+01', 'Sobotní špička'),
    (staff_ids[2], 13500, 14200, 'closed', '2024-12-22 09:00:00+01', '2024-12-22 18:00:00+01', 'Nedělní klid'),
    (staff_ids[1], 14200, 15100, 'closed', '2024-12-23 07:30:00+01', '2024-12-23 19:00:00+01', 'Předvánoční nápor'),
    (staff_ids[2], 15100, 15800, 'closed', '2024-12-24 08:00:00+01', '2024-12-24 16:00:00+01', 'Štědrý den - zkráceno'),
    (staff_ids[1], 15800, NULL, 'open', '2024-12-26 08:00:00+01', NULL, 'Aktuální směna po svátcích');
END $$;

-- Add 8 more cash ledger entries to reach 10 total
DO $$
DECLARE
    user_ids uuid[];
    shift_ids uuid[];
BEGIN
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'player' LIMIT 5) INTO user_ids;
    SELECT ARRAY(SELECT id FROM public.shifts ORDER BY created_at DESC LIMIT 5) INTO shift_ids;
    
    INSERT INTO public.cash_ledger (amount, transaction_type, description, reference_type, user_id, shift_id, receipt_number, notes, created_at) VALUES
    (400, 'income', 'Platba za rezervaci kurtu', 'reservation', user_ids[1], shift_ids[1], 'ÚK005', 'Ranní rezervace', '2024-12-23 10:15:00+01'),
    (125, 'income', 'Prodej občerstvení', 'bar_order', user_ids[2], shift_ids[1], 'ÚK006', 'Nápoje + sendvič', '2024-12-23 12:30:00+01'),
    (650, 'income', 'Platba za krytý kurt', 'reservation', user_ids[3], shift_ids[2], 'ÚK007', 'Premium rezervace', '2024-12-23 14:45:00+01'),
    (-300, 'expense', 'Nákup inventáře', 'inventory', NULL, shift_ids[2], 'FAK125', 'Doplnění nápojů', '2024-12-23 16:20:00+01'),
    (500, 'income', 'Platba za víkendovou rezervaci', 'reservation', user_ids[4], shift_ids[3], 'ÚK008', 'Sobotní rezervace', '2024-12-24 11:20:00+01'),
    (85, 'income', 'Prodej sportovního vybavení', 'bar_order', user_ids[5], shift_ids[3], 'ÚK009', 'Tenisové míčky', '2024-12-24 13:15:00+01'),
    (750, 'income', 'Platba za turnaj', 'reservation', user_ids[1], shift_ids[4], 'ÚK010', 'Turnajový poplatek', '2024-12-25 15:30:00+01'),
    (-150, 'expense', 'Oprava vybavení', 'maintenance', NULL, shift_ids[4], 'FAK126', 'Oprava sítě', '2024-12-25 17:45:00+01');
END $$;

-- Add 10 audit logs
DO $$
DECLARE
    user_ids uuid[];
    staff_ids uuid[];
BEGIN
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'player' LIMIT 5) INTO user_ids;
    SELECT ARRAY(SELECT id FROM public.users WHERE role = 'staff' LIMIT 2) INTO staff_ids;
    
    INSERT INTO public.audit_logs (action, user_id, details, timestamp) VALUES
    ('user_created', staff_ids[1], '{"user_name": "Pavel Svoboda", "role": "player"}', '2024-12-20 10:15:00+01'),
    ('reservation_modified', staff_ids[1], '{"reservation_id": "abc123", "old_time": "14:00", "new_time": "15:00"}', '2024-12-20 11:30:00+01'),
    ('payment_processed', staff_ids[2], '{"amount": 400, "method": "cash", "customer": "Anna Nováková"}', '2024-12-20 14:20:00+01'),
    ('inventory_restocked', staff_ids[1], '{"item": "Coca Cola", "added_quantity": 24}', '2024-12-21 09:45:00+01'),
    ('court_maintenance', staff_ids[2], '{"court": "Kurt 3", "status": "unavailable", "reason": "surface repair"}', '2024-12-21 12:15:00+01'),
    ('shift_started', staff_ids[1], '{"opening_balance": 12100, "notes": "Regular Friday shift"}', '2024-12-22 07:00:00+01'),
    ('discount_applied', staff_ids[2], '{"customer": "Martin Veselý", "discount": "10%", "reason": "loyalty"}', '2024-12-22 16:30:00+01'),
    ('reservation_cancelled', staff_ids[1], '{"reservation_id": "def456", "customer": "Eva Černá", "refund": true}', '2024-12-23 13:45:00+01'),
    ('system_backup', staff_ids[2], '{"backup_size": "2.5GB", "duration": "15min", "status": "success"}', '2024-12-23 23:00:00+01'),
    ('price_updated', staff_ids[1], '{"court": "Indoor courts", "old_price": 650, "new_price": 700}', '2024-12-24 08:30:00+01');
END $$;