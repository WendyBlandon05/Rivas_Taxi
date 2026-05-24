-- Adds estimated trip duration and schedule end time to existing databases.
-- Run this in Supabase SQL Editor if your project was created before these columns existed.

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS scheduled_end_at TIMESTAMPTZ;

UPDATE public.trips
SET
  estimated_duration_minutes = GREATEST(
    30,
    CEIL((COALESCE(distance_km, 0) / 45.0) * 60.0 + 20.0)::INTEGER
  ),
  scheduled_end_at = CASE
    WHEN scheduled_at IS NOT NULL THEN
      scheduled_at + (
        GREATEST(
          30,
          CEIL((COALESCE(distance_km, 0) / 45.0) * 60.0 + 20.0)::INTEGER
        ) || ' minutes'
      )::INTERVAL
    ELSE scheduled_end_at
  END
WHERE estimated_duration_minutes IS NULL
   OR scheduled_end_at IS NULL;

