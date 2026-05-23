-- Pacific Coast Taxi Seed Data
-- Version 1.0

-- =====================================================
-- DESTINATIONS
-- =====================================================

INSERT INTO public.destinations (name, description, distance_km, price_usd, is_popular) VALUES
  ('San Juan del Sur', 'Popular beach town with vibrant nightlife', 28.00, 140.00, TRUE),
  ('Playa Maderas', 'Famous surf beach with consistent waves', 35.00, 175.00, TRUE),
  ('Playa Marsella', 'Calm beach perfect for swimming', 32.00, 160.00, TRUE),
  ('Playa Hermosa', 'Beautiful secluded beach', 38.00, 190.00, FALSE),
  ('Tola', 'Gateway to exclusive resorts', 45.00, 225.00, FALSE),
  ('Managua (Aeropuerto)', 'Augusto C. Sandino International Airport', 110.00, 550.00, TRUE),
  ('Granada', 'Colonial city with rich history', 75.00, 375.00, FALSE),
  ('Masaya', 'City of crafts and volcano', 90.00, 450.00, FALSE),
  ('Ometepe', 'Island with twin volcanoes', 50.00, 250.00, TRUE),
  ('Popoyo', 'World-class surf destination', 55.00, 275.00, TRUE),
  ('El Astillero', 'Quiet fishing village', 40.00, 200.00, FALSE),
  ('Playa Gigante', 'Growing surf community', 42.00, 210.00, FALSE),
  ('Rivas Centro', 'Local city center', 5.00, 25.00, FALSE),
  ('Moyogalpa (Puerto)', 'Ferry port to Ometepe', 48.00, 240.00, FALSE),
  ('La Virgen', 'Lakeside town', 20.00, 100.00, FALSE)
ON CONFLICT DO NOTHING;

-- =====================================================
-- DISCOUNT CODES
-- =====================================================

INSERT INTO public.discount_codes (code, discount_percentage, max_uses, valid_until, is_active) VALUES
  ('BIENVENIDO10', 10, 100, NOW() + INTERVAL '1 year', TRUE),
  ('PACIFIC15', 15, 50, NOW() + INTERVAL '6 months', TRUE),
  ('VERANO20', 20, 30, NOW() + INTERVAL '3 months', TRUE),
  ('PROMO25', 25, 20, NOW() + INTERVAL '1 month', TRUE),
  ('SURFTRIP', 15, NULL, NOW() + INTERVAL '1 year', TRUE),
  ('AEROPUERTO10', 10, NULL, NOW() + INTERVAL '1 year', TRUE)
ON CONFLICT DO NOTHING;
