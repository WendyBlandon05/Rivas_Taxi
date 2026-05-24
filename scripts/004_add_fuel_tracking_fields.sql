-- Add richer daily fuel tracking for drivers.
-- Run this in the Supabase SQL Editor if the database already exists.

CREATE TABLE IF NOT EXISTS public.fuel_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  amount_usd NUMERIC(10,2) NOT NULL,
  gallons NUMERIC(10,2),
  remaining_gallons NUMERIC(10,2),
  price_per_gallon NUMERIC(10,2),
  odometer_start INTEGER,
  odometer_end INTEGER,
  km_driven NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(demo_driver_id, date)
);

ALTER TABLE public.fuel_consumption
  ADD COLUMN IF NOT EXISTS remaining_gallons NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS price_per_gallon NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS km_driven NUMERIC(10,2);

UPDATE public.fuel_consumption
SET
  price_per_gallon = CASE
    WHEN gallons IS NOT NULL AND gallons > 0 THEN ROUND((amount_usd / gallons)::numeric, 2)
    ELSE price_per_gallon
  END,
  km_driven = CASE
    WHEN odometer_start IS NOT NULL AND odometer_end IS NOT NULL AND odometer_end >= odometer_start
      THEN odometer_end - odometer_start
    ELSE km_driven
  END
WHERE price_per_gallon IS NULL OR km_driven IS NULL;

ALTER TABLE public.fuel_consumption ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fuel_select_admin_driver ON public.fuel_consumption;
DROP POLICY IF EXISTS fuel_insert_admin_driver ON public.fuel_consumption;
DROP POLICY IF EXISTS fuel_update_admin_driver ON public.fuel_consumption;

CREATE POLICY fuel_select_admin_driver ON public.fuel_consumption
  FOR SELECT USING (
    demo_driver_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY fuel_insert_admin_driver ON public.fuel_consumption
  FOR INSERT WITH CHECK (
    demo_driver_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY fuel_update_admin_driver ON public.fuel_consumption
  FOR UPDATE USING (
    demo_driver_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    demo_driver_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
