-- Clean up existing courts and create the correct structure
-- Delete all existing courts
DELETE FROM courts;

-- Create 2 indoor courts (v hale)
INSERT INTO courts (name, type, status, seasonal_price_rules) VALUES
('Hala 1', 'indoor', 'available', '{
  "spring_morning_indoor_member": 300,
  "spring_morning_indoor_non_member": 360,
  "spring_evening_indoor_member": 350,
  "spring_evening_indoor_non_member": 420,
  "summer_morning_indoor_member": 280,
  "summer_morning_indoor_non_member": 336,
  "summer_evening_indoor_member": 320,
  "summer_evening_indoor_non_member": 384,
  "autumn_morning_indoor_member": 320,
  "autumn_morning_indoor_non_member": 384,
  "autumn_evening_indoor_member": 370,
  "autumn_evening_indoor_non_member": 444,
  "winter_morning_indoor_member": 350,
  "winter_morning_indoor_non_member": 420,
  "winter_evening_indoor_member": 400,
  "winter_evening_indoor_non_member": 480
}'),
('Hala 2', 'indoor', 'available', '{
  "spring_morning_indoor_member": 300,
  "spring_morning_indoor_non_member": 360,
  "spring_evening_indoor_member": 350,
  "spring_evening_indoor_non_member": 420,
  "summer_morning_indoor_member": 280,
  "summer_morning_indoor_non_member": 336,
  "summer_evening_indoor_member": 320,
  "summer_evening_indoor_non_member": 384,
  "autumn_morning_indoor_member": 320,
  "autumn_morning_indoor_non_member": 384,
  "autumn_evening_indoor_member": 370,
  "autumn_evening_indoor_non_member": 444,
  "winter_morning_indoor_member": 350,
  "winter_morning_indoor_non_member": 420,
  "winter_evening_indoor_member": 400,
  "winter_evening_indoor_non_member": 480
}');

-- Create 4 outdoor courts  
INSERT INTO courts (name, type, status, seasonal_price_rules) VALUES
('Kurt 1', 'outdoor', 'available', '{
  "spring_morning_outdoor_member": 200,
  "spring_morning_outdoor_non_member": 240,
  "spring_evening_outdoor_member": 230,
  "spring_evening_outdoor_non_member": 276,
  "summer_morning_outdoor_member": 220,
  "summer_morning_outdoor_non_member": 264,
  "summer_evening_outdoor_member": 250,
  "summer_evening_outdoor_non_member": 300,
  "autumn_morning_outdoor_member": 180,
  "autumn_morning_outdoor_non_member": 216,
  "autumn_evening_outdoor_member": 210,
  "autumn_evening_outdoor_non_member": 252,
  "winter_morning_outdoor_member": 150,
  "winter_morning_outdoor_non_member": 180,
  "winter_evening_outdoor_member": 180,
  "winter_evening_outdoor_non_member": 216
}'),
('Kurt 2', 'outdoor', 'available', '{
  "spring_morning_outdoor_member": 200,
  "spring_morning_outdoor_non_member": 240,
  "spring_evening_outdoor_member": 230,
  "spring_evening_outdoor_non_member": 276,
  "summer_morning_outdoor_member": 220,
  "summer_morning_outdoor_non_member": 264,
  "summer_evening_outdoor_member": 250,
  "summer_evening_outdoor_non_member": 300,
  "autumn_morning_outdoor_member": 180,
  "autumn_morning_outdoor_non_member": 216,
  "autumn_evening_outdoor_member": 210,
  "autumn_evening_outdoor_non_member": 252,
  "winter_morning_outdoor_member": 150,
  "winter_morning_outdoor_non_member": 180,
  "winter_evening_outdoor_member": 180,
  "winter_evening_outdoor_non_member": 216
}'),
('Kurt 3', 'outdoor', 'available', '{
  "spring_morning_outdoor_member": 200,
  "spring_morning_outdoor_non_member": 240,
  "spring_evening_outdoor_member": 230,
  "spring_evening_outdoor_non_member": 276,
  "summer_morning_outdoor_member": 220,
  "summer_morning_outdoor_non_member": 264,
  "summer_evening_outdoor_member": 250,
  "summer_evening_outdoor_non_member": 300,
  "autumn_morning_outdoor_member": 180,
  "autumn_morning_outdoor_non_member": 216,
  "autumn_evening_outdoor_member": 210,
  "autumn_evening_outdoor_non_member": 252,
  "winter_morning_outdoor_member": 150,
  "winter_morning_outdoor_non_member": 180,
  "winter_evening_outdoor_member": 180,
  "winter_evening_outdoor_non_member": 216
}'),
('Kurt 4', 'outdoor', 'available', '{
  "spring_morning_outdoor_member": 200,
  "spring_morning_outdoor_non_member": 240,
  "spring_evening_outdoor_member": 230,
  "spring_evening_outdoor_non_member": 276,
  "summer_morning_outdoor_member": 220,
  "summer_morning_outdoor_non_member": 264,
  "summer_evening_outdoor_member": 250,
  "summer_evening_outdoor_non_member": 300,
  "autumn_morning_outdoor_member": 180,
  "autumn_morning_outdoor_non_member": 216,
  "autumn_evening_outdoor_member": 210,
  "autumn_evening_outdoor_non_member": 252,
  "winter_morning_outdoor_member": 150,
  "winter_morning_outdoor_non_member": 180,
  "winter_evening_outdoor_member": 180,
  "winter_evening_outdoor_non_member": 216
}');