-- Adds optional profile/driver fields used by the admin driver editor.
-- Run this in Supabase SQL Editor if your project was created before the latest schema.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS cedula_number TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.drivers
  ADD COLUMN IF NOT EXISTS cedula_number TEXT,
  ADD COLUMN IF NOT EXISTS vehicle_photo_url TEXT;
