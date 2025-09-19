-- Add test data for all tables to simulate a year of operation

-- Insert test users (staff and players)
INSERT INTO public.users (name, email, username, phone, role) VALUES
('Jan Novák', 'jan.novak@tenisklub.cz', 'jnovak', '+420602123456', 'staff'),
('Marie Svobodová', 'marie.svobodova@tenisklub.cz', 'msvobodova', '+420603234567', 'staff'),
('Petr Dvořák', 'petr.dvorak@email.cz', 'pdvorak', '+420604345678', 'player'),
('Anna Nováková', 'anna.novakova@email.cz', 'anovakova', '+420605456789', 'player'),
('Tomáš Procházka', 'tomas.prochazka@email.cz', 'tprochazka', '+420606567890', 'player'),
('Eva Černá', 'eva.cerna@email.cz', 'ecerna', '+420607678901', 'player'),
('Martin Veselý', 'martin.vesely@email.cz', 'mvesely', '+420608789012', 'player'),
('Lucie Horáková', 'lucie.horakova@email.cz', 'lhorakova', '+420609890123', 'player'),
('David Krejčí', 'david.krejci@email.cz', 'dkrejci', '+420601901234', 'player'),
('Tereza Svoboda', 'tereza.svoboda@email.cz', 'tsvoboda', '+420602012345', 'player');

-- Insert test courts
INSERT INTO public.courts (name, type, status, seasonal_price_rules) VALUES
('Kurt 1', 'outdoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
('Kurt 2', 'outdoor', 'available', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
('Kurt 3', 'outdoor', 'unavailable', '{"spring": {"weekday": 400, "weekend": 500}, "summer": {"weekday": 450, "weekend": 550}, "autumn": {"weekday": 350, "weekend": 450}, "winter": {"weekday": 300, "weekend": 400}}'),
('Krytý kurt 1', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}'),
('Krytý kurt 2', 'indoor', 'available', '{"spring": {"weekday": 600, "weekend": 700}, "summer": {"weekday": 550, "weekend": 650}, "autumn": {"weekday": 650, "weekend": 750}, "winter": {"weekday": 700, "weekend": 800}}');

-- Insert test inventory items
INSERT INTO public.inventory (item_name, unit_price, stock, last_update) VALUES
('Tenisové míčky Wilson', 120, 50, '2024-12-10 14:30:00+01'),
('Coca Cola 0.5l', 35, 24, '2024-12-12 10:15:00+01'),
('Minerální voda 0.5l', 25, 36, '2024-12-11 16:45:00+01'),
('Energetický nápoj Red Bull', 65, 12, '2024-12-13 09:20:00+01'),
('Proteinová tyčinka', 45, 18, '2024-12-09 11:30:00+01'),
('Tenisové rakety Head', 2500, 8, '2024-12-08 15:45:00+01'),
('Tričko tenisového klubu', 450, 15, '2024-12-14 12:15:00+01'),
('Tenisové šortky', 650, 22, '2024-12-07 13:50:00+01'),
('Káva espresso', 30, 45, '2024-12-15 08:30:00+01'),
('Sendvič šunka-sýr', 85, 8, '2024-12-15 12:45:00+01');

-- Insert payment settings
INSERT INTO public.payment_settings (cash_enabled, qr_enabled, qr_recipient_name, qr_iban, qr_bank_code, qr_variable_symbol_prefix, qr_default_message, qr_enabled_for_reservations, qr_enabled_for_bar, qr_enabled_for_wallet) VALUES
(true, true, 'Tenisový klub Raketa', 'CZ1234567890123456789012', '0300', 'TK', 'Tenisový klub - platba', true, true, true);