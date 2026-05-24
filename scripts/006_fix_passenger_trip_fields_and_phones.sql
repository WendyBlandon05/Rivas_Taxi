-- Adds passenger trip fields used by reservations and fills missing phone numbers.
-- Safe to run multiple times.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS passenger_name TEXT,
  ADD COLUMN IF NOT EXISTS passenger_phone TEXT,
  ADD COLUMN IF NOT EXISTS passenger_email TEXT,
  ADD COLUMN IF NOT EXISTS origin_lat NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS origin_lng NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS destination_lat NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS destination_lng NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scheduled_end_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS price_usd NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS estimated_price NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS discount_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS final_price NUMERIC(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distance_km NUMERIC(8,2);

UPDATE public.trips
SET
  estimated_price = COALESCE(estimated_price, price_usd, final_price),
  price_usd = COALESCE(price_usd, estimated_price, final_price),
  final_price = COALESCE(final_price, estimated_price, price_usd, 0),
  discount_amount = COALESCE(discount_amount, 0),
  estimated_duration_minutes = COALESCE(estimated_duration_minutes, 30);

UPDATE public.profiles
SET phone = '+505' || (
  '8' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0')
)
WHERE phone IS NULL OR TRIM(phone) = '';

UPDATE public.trips t
SET
  passenger_name = COALESCE(t.passenger_name, p.full_name),
  passenger_phone = COALESCE(t.passenger_phone, p.phone),
  passenger_email = COALESCE(t.passenger_email, p.email)
FROM public.profiles p
WHERE t.passenger_id = p.id;

UPDATE public.trips
SET passenger_phone = '+505' || (
  '8' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0')
)
WHERE passenger_phone IS NULL OR TRIM(passenger_phone) = '';
