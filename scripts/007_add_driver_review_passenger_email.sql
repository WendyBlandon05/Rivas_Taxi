-- Adds the passenger fields expected by the driver review flow.
-- Safe to run more than once.

ALTER TABLE public.driver_reviews
  ADD COLUMN IF NOT EXISTS passenger_name TEXT,
  ADD COLUMN IF NOT EXISTS passenger_email TEXT;

UPDATE public.driver_reviews
SET passenger_name = 'Pasajero'
WHERE passenger_name IS NULL OR btrim(passenger_name) = '';

ALTER TABLE public.driver_reviews
  ALTER COLUMN passenger_name SET DEFAULT 'Pasajero';

CREATE INDEX IF NOT EXISTS idx_driver_reviews_passenger_email
  ON public.driver_reviews(passenger_email);
