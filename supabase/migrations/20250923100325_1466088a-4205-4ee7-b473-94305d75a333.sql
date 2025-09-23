-- Create test courts with proper UUIDs
INSERT INTO courts (id, name, type, status) VALUES
  (gen_random_uuid(), 'Kurt 1 (Indoor)', 'indoor', 'available'),
  (gen_random_uuid(), 'Kurt 2 (Indoor)', 'indoor', 'available'),
  (gen_random_uuid(), 'Kurt 3 (Outdoor)', 'outdoor', 'available'),
  (gen_random_uuid(), 'Kurt 4 (Outdoor)', 'outdoor', 'available')
ON CONFLICT DO NOTHING;