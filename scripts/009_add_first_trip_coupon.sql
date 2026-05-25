-- =====================================================
-- STEP 1: RUN THIS FIRST, THEN RUN STEP 2 SEPARATELY
-- =====================================================
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'urbano';
ALTER TYPE service_type ADD VALUE IF NOT EXISTS 'empresarial';

-- =====================================================
-- STEP 2: RUN THIS IN A SECOND QUERY AFTER STEP 1 FINISHES
-- =====================================================
ALTER TABLE public.trips
  ALTER COLUMN service_type SET DEFAULT 'urbano';

INSERT INTO public.discount_codes (
  code,
  discount_percentage,
  min_trip_amount,
  max_uses,
  valid_until,
  is_active
) VALUES (
  'BIENVENIDO20',
  20,
  0,
  NULL,
  NOW() + INTERVAL '1 year',
  TRUE
)
ON CONFLICT (code) DO UPDATE SET
  discount_percentage = EXCLUDED.discount_percentage,
  min_trip_amount = EXCLUDED.min_trip_amount,
  valid_until = EXCLUDED.valid_until,
  is_active = TRUE;
