-- Add test data for all tables to simulate a year of operation

-- Insert test users (staff and players)
INSERT INTO public.users (id, name, email, username, phone, role) VALUES
('11111111-1111-1111-1111-111111111111', 'Jan Novák', 'jan.novak@tenisklub.cz', 'jnovak', '+420602123456', 'staff'),
('22222222-2222-2222-2222-222222222222', 'Marie Svobodová', 'marie.svobodova@tenisklub.cz', 'msvobodova', '+420603234567', 'staff'),
('33333333-3333-3333-3333-333333333333', 'Petr Dvořák', 'petr.dvorak@email.cz', 'pdvorak', '+420604345678', 'player'),
('44444444-4444-4444-4444-444444444444', 'Anna Nováková', 'anna.novakova@email.cz', 'anovakova', '+420605456789', 'player'),
('55555555-5555-5555-5555-555555555555', 'Tomáš Procházka', 'tomas.prochazka@email.cz', 'tprochazka', '+420606567890', 'player'),
('66666666-6666-6666-6666-666666666666', 'Eva Černá', 'eva.cerna@email.cz', 'ecerna', '+420607678901', 'player'),
('77777777-7777-7777-7777-777777777777', 'Martin Veselý', 'martin.vesely@email.cz', 'mvesely', '+420608789012', 'player'),
('88888888-8888-8888-8888-888888888888', 'Lucie Horáková', 'lucie.horakova@email.cz', 'lhorakova', '+420609890123', 'player'),
('99999999-9999-9999-9999-999999999999', 'David Krejčí', 'david.krejci@email.cz', 'dkrejci', '+420601901234', 'player'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tereza Svoboda', 'tereza.svoboda@email.cz', 'tsvoboda', '+420602012345', 'player');

-- Insert test courts
INSERT INTO public.courts (id, name, type, status, seasonal_price_rules) VALUES
('c1111111-1111-1111-1111-111111111111', 'Kurt 1', 'outdoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
('c2222222-2222-2222-2222-222222222222', 'Kurt 2', 'outdoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
('c3333333-3333-3333-3333-333333333333', 'Kurt 3', 'outdoor', 'maintenance', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
('c4444444-4444-4444-4444-444444444444', 'Krytý kurt 1', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
('c5555555-5555-5555-5555-555555555555', 'Krytý kurt 2', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}');

-- Insert test reservations (various dates and times)
INSERT INTO public.reservations (id, start_time, end_time, court_id, user_id, price, status, payment_method, payment_confirmed_at, payment_confirmed_by, created_at) VALUES
('r1111111-1111-1111-1111-111111111111', '2024-12-15 14:00:00+01', '2024-12-15 15:30:00+01', 'c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 450, 'confirmed', 'cash', '2024-12-14 10:30:00+01', '11111111-1111-1111-1111-111111111111', '2024-12-14 10:15:00+01'),
('r2222222-2222-2222-2222-222222222222', '2024-12-16 16:00:00+01', '2024-12-16 17:30:00+01', 'c2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 450, 'confirmed', 'qr_payment', '2024-12-15 14:20:00+01', '22222222-2222-2222-2222-222222222222', '2024-12-15 14:05:00+01'),
('r3333333-3333-3333-3333-333333333333', '2024-12-17 18:00:00+01', '2024-12-17 19:30:00+01', 'c4444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 650, 'booked', 'cash', NULL, NULL, '2024-12-16 12:45:00+01'),
('r4444444-4444-4444-4444-444444444444', '2024-12-18 10:00:00+01', '2024-12-18 11:30:00+01', 'c1111111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 400, 'confirmed', 'qr_payment', '2024-12-17 16:15:00+01', '11111111-1111-1111-1111-111111111111', '2024-12-17 16:00:00+01'),
('r5555555-5555-5555-5555-555555555555', '2024-12-19 15:00:00+01', '2024-12-19 16:30:00+01', 'c5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 650, 'cancelled', 'cash', NULL, NULL, '2024-12-18 09:30:00+01'),
('r6666666-6666-6666-6666-666666666666', '2024-12-20 12:00:00+01', '2024-12-20 13:30:00+01', 'c2222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 500, 'confirmed', 'cash', '2024-12-19 11:45:00+01', '22222222-2222-2222-2222-222222222222', '2024-12-19 11:30:00+01'),
('r7777777-7777-7777-7777-777777777777', '2024-12-21 09:00:00+01', '2024-12-21 10:30:00+01', 'c4444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 600, 'booked', 'qr_payment', NULL, NULL, '2024-12-20 18:15:00+01'),
('r8888888-8888-8888-8888-888888888888', '2024-12-22 14:30:00+01', '2024-12-22 16:00:00+01', 'c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 450, 'confirmed', 'cash', '2024-12-21 13:20:00+01', '11111111-1111-1111-1111-111111111111', '2024-12-21 13:05:00+01');

-- Insert test inventory items
INSERT INTO public.inventory (id, item_name, unit_price, stock, last_update) VALUES
('i1111111-1111-1111-1111-111111111111', 'Tenisové míčky Wilson', 120, 50, '2024-12-10 14:30:00+01'),
('i2222222-2222-2222-2222-222222222222', 'Coca Cola 0.5l', 35, 24, '2024-12-12 10:15:00+01'),
('i3333333-3333-3333-3333-333333333333', 'Minerální voda 0.5l', 25, 36, '2024-12-11 16:45:00+01'),
('i4444444-4444-4444-4444-444444444444', 'Energetický nápoj Red Bull', 65, 12, '2024-12-13 09:20:00+01'),
('i5555555-5555-5555-5555-555555555555', 'Proteinová tyčinka', 45, 18, '2024-12-09 11:30:00+01'),
('i6666666-6666-6666-6666-666666666666', 'Tenisové rakety Head', 2500, 8, '2024-12-08 15:45:00+01'),
('i7777777-7777-7777-7777-777777777777', 'Tričko tenisového klubu', 450, 15, '2024-12-14 12:15:00+01'),
('i8888888-8888-8888-8888-888888888888', 'Tenisové šortky', 650, 22, '2024-12-07 13:50:00+01'),
('i9999999-9999-9999-9999-999999999999', 'Káva espresso', 30, 45, '2024-12-15 08:30:00+01'),
('iaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sendvič šunka-sýr', 85, 8, '2024-12-15 12:45:00+01');

-- Insert test shifts
INSERT INTO public.shifts (id, staff_user_id, opening_balance, closing_balance, status, created_at, closed_at, notes) VALUES
('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 5000, 6750, 'closed', '2024-12-14 07:00:00+01', '2024-12-14 19:00:00+01', 'Dobrý den, vysoké tržby z rezervací'),
('s2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 6750, 8200, 'closed', '2024-12-15 07:30:00+01', '2024-12-15 18:30:00+01', 'Víkendové rezervace, prodej nápojů'),
('s3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 8200, NULL, 'open', '2024-12-16 08:00:00+01', NULL, 'Aktuální směna');

-- Insert test cash ledger entries
INSERT INTO public.cash_ledger (id, amount, transaction_type, description, reference_type, reference_id, user_id, shift_id, receipt_number, notes, created_at) VALUES
('l1111111-1111-1111-1111-111111111111', 450, 'income', 'Platba za rezervaci kurtu', 'reservation', 'r1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 's1111111-1111-1111-1111-111111111111', 'ÚK001', 'Hotovostní platba', '2024-12-14 10:30:00+01'),
('l2222222-2222-2222-2222-222222222222', 105, 'income', 'Prodej nápojů', 'bar_order', NULL, '44444444-4444-4444-4444-444444444444', 's1111111-1111-1111-1111-111111111111', 'ÚK002', '3x Coca Cola', '2024-12-14 14:15:00+01'),
('l3333333-3333-3333-3333-333333333333', 500, 'income', 'Platba za rezervaci kurtu', 'reservation', 'r6666666-6666-6666-6666-666666666666', '88888888-8888-8888-8888-888888888888', 's2222222-2222-2222-2222-222222222222', 'ÚK003', 'Víkendová rezervace', '2024-12-15 11:45:00+01'),
('l4444444-4444-4444-4444-444444444444', -200, 'expense', 'Nákup tenisových míčků', 'inventory', 'i1111111-1111-1111-1111-111111111111', NULL, 's2222222-2222-2222-2222-222222222222', 'FAK124', 'Doplnění skladu', '2024-12-15 16:20:00+01'),
('l5555555-5555-5555-5555-555555555555', 450, 'income', 'Platba za rezervaci kurtu', 'reservation', 'r8888888-8888-8888-8888-888888888888', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 's3333333-3333-3333-3333-333333333333', 'ÚK004', 'Nedělní rezervace', '2024-12-16 13:20:00+01');

-- Insert test checkouts
INSERT INTO public.checkouts (id, reservation_id, staff_user_id, total_amount, status, include_court_price, notes, created_at, updated_at) VALUES
('ch111111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 555, 'completed', true, 'Rezervace + nápoje', '2024-12-14 10:15:00+01', '2024-12-14 10:35:00+01'),
('ch222222-2222-2222-2222-222222222222', 'r6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 670, 'completed', true, 'Víkendová rezervace + občerstvení', '2024-12-15 11:30:00+01', '2024-12-15 11:50:00+01');

-- Insert test checkout accounts
INSERT INTO public.checkout_accounts (id, checkout_id, name, total_amount, paid_amount, payment_status, split_type, split_config, payment_methods, assigned_players) VALUES
('ca11111-1111-1111-1111-111111111111', 'ch111111-1111-1111-1111-111111111111', 'Petr Dvořák', 555, 555, 'paid', 'full', '{}', '[{"method": "cash", "amount": 555}]', '["33333333-3333-3333-3333-333333333333"]'),
('ca22222-2222-2222-2222-222222222222', 'ch222222-2222-2222-2222-222222222222', 'Lucie & Eva', 670, 670, 'paid', 'equal', '{"split_count": 2}', '[{"method": "cash", "amount": 335}, {"method": "qr_payment", "amount": 335}]', '["88888888-8888-8888-8888-888888888888", "66666666-6666-6666-6666-666666666666"]');

-- Insert test checkout items
INSERT INTO public.checkout_items (id, checkout_id, checkout_account_id, name, type, unit_price, quantity, total_price, description, plu_code) VALUES
('ci11111-1111-1111-1111-111111111111', 'ch111111-1111-1111-1111-111111111111', 'ca11111-1111-1111-1111-111111111111', 'Rezervace Kurt 1', 'reservation', 450, 1, 450, '90 min rezervace', 'RK001'),
('ci22222-2222-2222-2222-222222222222', 'ch111111-1111-1111-1111-111111111111', 'ca11111-1111-1111-1111-111111111111', 'Coca Cola 0.5l', 'bar', 35, 3, 105, 'Nápoje během hry', 'CC001'),
('ci33333-3333-3333-3333-333333333333', 'ch222222-2222-2222-2222-222222222222', 'ca22222-2222-2222-2222-222222222222', 'Rezervace Kurt 2', 'reservation', 500, 1, 500, 'Víkendová rezervace 90 min', 'RK002'),
('ci44444-4444-4444-4444-444444444444', 'ch222222-2222-2222-2222-222222222222', 'ca22222-2222-2222-2222-222222222222', 'Minerální voda 0.5l', 'bar', 25, 4, 100, 'Voda pro hráče', 'MV001'),
('ci55555-5555-5555-5555-555555555555', 'ch222222-2222-2222-2222-222222222222', 'ca22222-2222-2222-2222-222222222222', 'Energetický nápoj', 'bar', 65, 1, 65, 'Red Bull', 'RB001'),
('ci66666-6666-6666-6666-666666666666', 'ch222222-2222-2222-2222-222222222222', 'ca22222-2222-2222-2222-222222222222', 'Sleva věrný zákazník', 'discount', -5, 1, -5, '5 Kč sleva', 'SL001');

-- Insert test checkout payments
INSERT INTO public.checkout_payments (id, checkout_account_id, amount, payment_method, cash_received, cash_change, qr_variable_symbol, qr_payment_string, confirmed_by, confirmed_at, notes) VALUES
('cp11111-1111-1111-1111-111111111111', 'ca11111-1111-1111-1111-111111111111', 555, 'cash', 600, 45, NULL, NULL, '11111111-1111-1111-1111-111111111111', '2024-12-14 10:30:00+01', 'Hotovostní platba s vrácením'),
('cp22222-2222-2222-2222-222222222222', 'ca22222-2222-2222-2222-222222222222', 335, 'cash', 340, 5, NULL, NULL, '22222222-2222-2222-2222-222222222222', '2024-12-15 11:45:00+01', 'Hotovost - první polovina'),
('cp33333-3333-3333-3333-333333333333', 'ca22222-2222-2222-2222-222222222222', 335, 'qr_payment', NULL, NULL, 'TK240001', 'SPD*1.0*480*CZK*RF12345678901234567890123456*TENISOVY KLUB RAKETA*TK240001*Tenisový klub - platba', '22222222-2222-2222-2222-222222222222', '2024-12-15 11:48:00+01', 'QR platba - druhá polovina');

-- Insert test bar orders
INSERT INTO public.bar_orders (id, reservation_id, items, total_price, payment_method, payment_status, payment_confirmed_by, payment_confirmed_at, created_at) VALUES
('bo11111-1111-1111-1111-111111111111', 'r1111111-1111-1111-1111-111111111111', '[{"name": "Coca Cola 0.5l", "quantity": 3, "unit_price": 35, "total_price": 105}]', 105, 'cash', 'paid', '11111111-1111-1111-1111-111111111111', '2024-12-14 14:15:00+01', '2024-12-14 14:10:00+01'),
('bo22222-2222-2222-2222-222222222222', 'r6666666-6666-6666-6666-666666666666', '[{"name": "Minerální voda 0.5l", "quantity": 2, "unit_price": 25, "total_price": 50}, {"name": "Proteinová tyčinka", "quantity": 1, "unit_price": 45, "total_price": 45}]', 95, 'qr_payment', 'paid', '22222222-2222-2222-2222-222222222222', '2024-12-15 12:30:00+01', '2024-12-15 12:25:00+01');

-- Insert test audit logs
INSERT INTO public.audit_logs (id, action, user_id, details, timestamp) VALUES
('al11111-1111-1111-1111-111111111111', 'reservation_created', '11111111-1111-1111-1111-111111111111', '{"reservation_id": "r1111111-1111-1111-1111-111111111111", "court": "Kurt 1", "user": "Petr Dvořák"}', '2024-12-14 10:15:00+01'),
('al22222-2222-2222-2222-222222222222', 'payment_confirmed', '11111111-1111-1111-1111-111111111111', '{"reservation_id": "r1111111-1111-1111-1111-111111111111", "amount": 450, "method": "cash"}', '2024-12-14 10:30:00+01'),
('al33333-3333-3333-3333-333333333333', 'inventory_updated', '22222222-2222-2222-2222-222222222222', '{"item": "Tenisové míčky Wilson", "old_stock": 45, "new_stock": 50}', '2024-12-15 16:20:00+01'),
('al44444-4444-4444-4444-444444444444', 'shift_opened', '11111111-1111-1111-1111-111111111111', '{"shift_id": "s3333333-3333-3333-3333-333333333333", "opening_balance": 8200}', '2024-12-16 08:00:00+01'),
('al55555-5555-5555-5555-555555555555', 'checkout_completed', '22222222-2222-2222-2222-222222222222', '{"checkout_id": "ch222222-2222-2222-2222-222222222222", "total": 670, "split_accounts": 1}', '2024-12-15 11:50:00+01');

-- Insert payment settings
INSERT INTO public.payment_settings (id, cash_enabled, qr_enabled, qr_recipient_name, qr_iban, qr_bank_code, qr_variable_symbol_prefix, qr_default_message, qr_enabled_for_reservations, qr_enabled_for_bar, qr_enabled_for_wallet) VALUES
('ps11111-1111-1111-1111-111111111111', true, true, 'Tenisový klub Raketa', 'CZ1234567890123456789012', '0300', 'TK', 'Tenisový klub - platba', true, true, true);

-- Insert cash register entry
INSERT INTO public.cash_register (id, shift_id, cash_in, cash_out, balance, notes) VALUES
('cr11111-1111-1111-1111-111111111111', 's3333333-3333-3333-3333-333333333333', 1450, 200, 9450, 'Aktuální stav pokladny');