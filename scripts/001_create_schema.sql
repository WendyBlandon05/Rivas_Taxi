-- Pacific Coast Taxi Database Schema
-- Run this file in Supabase SQL Editor before scripts/002_seed_data.sql.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE service_type AS ENUM ('turistico', 'interdepartamental', 'local', 'programada');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE driver_status AS ENUM ('available', 'busy', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  cedula_number TEXT,
  location TEXT,
  address TEXT,
  role user_role NOT NULL DEFAULT 'passenger',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS admins_select_all_profiles ON public.profiles;
DROP POLICY IF EXISTS admins_update_all_profiles ON public.profiles;

CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY profiles_insert_own ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY admins_select_all_profiles ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY admins_update_all_profiles ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id UUID UNIQUE,
  license_number TEXT,
  cedula_number TEXT,
  license_expiry DATE,
  vehicle_brand TEXT,
  vehicle_model TEXT,
  vehicle_year INTEGER,
  vehicle_color TEXT,
  vehicle_plate TEXT UNIQUE,
  vehicle_photo_url TEXT,
  status driver_status NOT NULL DEFAULT 'offline',
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  total_trips INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  current_latitude NUMERIC(10,7),
  current_longitude NUMERIC(10,7),
  current_location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT drivers_user_id_matches_id CHECK (user_id IS NULL OR user_id = id)
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS drivers_select_public ON public.drivers;
DROP POLICY IF EXISTS drivers_insert_own ON public.drivers;
DROP POLICY IF EXISTS drivers_update_own ON public.drivers;
DROP POLICY IF EXISTS admins_manage_drivers ON public.drivers;
DROP POLICY IF EXISTS admins_update_drivers ON public.drivers;

CREATE POLICY drivers_select_public ON public.drivers
  FOR SELECT USING (TRUE);

CREATE POLICY drivers_insert_own ON public.drivers
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY drivers_update_own ON public.drivers
  FOR UPDATE USING (auth.uid() = id OR auth.uid() = user_id);

CREATE POLICY admins_manage_drivers ON public.drivers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  distance_km NUMERIC(8,2) NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  image_url TEXT,
  is_popular BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS destinations_select_public ON public.destinations;
CREATE POLICY destinations_select_public ON public.destinations
  FOR SELECT USING (TRUE);

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  min_trip_amount NUMERIC(10,2) DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS discount_codes_select_public ON public.discount_codes;
DROP POLICY IF EXISTS admins_manage_discount_codes ON public.discount_codes;

CREATE POLICY discount_codes_select_public ON public.discount_codes
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY admins_manage_discount_codes ON public.discount_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code TEXT UNIQUE NOT NULL DEFAULT ('PCT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6))),
  passenger_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  passenger_name TEXT,
  passenger_phone TEXT,
  passenger_email TEXT,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  service_type service_type NOT NULL DEFAULT 'local',
  status trip_status NOT NULL DEFAULT 'pending',
  origin TEXT,
  destination TEXT,
  origin_address TEXT NOT NULL,
  origin_lat NUMERIC(10,7),
  origin_lng NUMERIC(10,7),
  destination_address TEXT NOT NULL,
  destination_lat NUMERIC(10,7),
  destination_lng NUMERIC(10,7),
  destination_id UUID REFERENCES public.destinations(id),
  scheduled_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  estimated_duration_minutes INTEGER NOT NULL DEFAULT 30,
  trip_date DATE,
  trip_time TIME,
  distance_km NUMERIC(8,2),
  price_usd NUMERIC(10,2),
  estimated_price NUMERIC(10,2),
  discount_code TEXT,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  passengers INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS trips_insert_public ON public.trips;
DROP POLICY IF EXISTS passengers_select_own_trips ON public.trips;
DROP POLICY IF EXISTS passengers_insert_trips ON public.trips;
DROP POLICY IF EXISTS passengers_update_own_trips ON public.trips;
DROP POLICY IF EXISTS drivers_select_assigned_trips ON public.trips;
DROP POLICY IF EXISTS drivers_update_assigned_trips ON public.trips;
DROP POLICY IF EXISTS admins_select_all_trips ON public.trips;
DROP POLICY IF EXISTS admins_update_all_trips ON public.trips;

CREATE POLICY trips_insert_public ON public.trips
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY passengers_select_own_trips ON public.trips
  FOR SELECT USING (
    auth.uid() = passenger_id
    OR passenger_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY passengers_update_own_trips ON public.trips
  FOR UPDATE USING (auth.uid() = passenger_id AND status IN ('pending', 'confirmed'));

CREATE POLICY drivers_select_assigned_trips ON public.trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = trips.driver_id AND (d.id = auth.uid() OR d.user_id = auth.uid())
    )
  );

CREATE POLICY drivers_update_assigned_trips ON public.trips
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = trips.driver_id AND (d.id = auth.uid() OR d.user_id = auth.uid())
    )
  );

CREATE POLICY admins_select_all_trips ON public.trips
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE POLICY admins_update_all_trips ON public.trips
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.driver_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
  passenger_name TEXT NOT NULL,
  passenger_email TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.driver_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS driver_reviews_select_public ON public.driver_reviews;
DROP POLICY IF EXISTS driver_reviews_insert_public ON public.driver_reviews;

CREATE POLICY driver_reviews_select_public ON public.driver_reviews
  FOR SELECT USING (TRUE);

CREATE POLICY driver_reviews_insert_public ON public.driver_reviews
  FOR INSERT WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_driver_review BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS reviews_select_public ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_public ON public.reviews;

CREATE POLICY reviews_select_public ON public.reviews
  FOR SELECT USING (TRUE);

CREATE POLICY reviews_insert_public ON public.reviews
  FOR INSERT WITH CHECK (TRUE);

CREATE TABLE IF NOT EXISTS public.driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(driver_id, date, start_time)
);

ALTER TABLE public.driver_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS availability_select_public ON public.driver_availability;
DROP POLICY IF EXISTS drivers_manage_own_availability ON public.driver_availability;

CREATE POLICY availability_select_public ON public.driver_availability
  FOR SELECT USING (TRUE);

CREATE POLICY drivers_manage_own_availability ON public.driver_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.drivers d
      WHERE d.id = driver_availability.driver_id AND (d.id = auth.uid() OR d.user_id = auth.uid())
    )
  );

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

CREATE OR REPLACE VIEW public.demo_drivers AS
SELECT
  d.id,
  p.first_name,
  p.last_name,
  p.full_name,
  p.phone,
  d.vehicle_brand,
  d.vehicle_model,
  d.vehicle_color,
  d.vehicle_plate,
  d.rating,
  d.total_trips,
  0::integer AS total_cancelled_trips,
  d.status,
  d.is_verified,
  d.current_latitude,
  d.current_longitude,
  d.current_location,
  d.created_at,
  d.updated_at
FROM public.drivers d
JOIN public.profiles p ON p.id = d.id;

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_drivers_updated_at ON public.drivers;
CREATE TRIGGER trigger_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS trigger_trips_updated_at ON public.trips;
CREATE TRIGGER trigger_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  metadata_full_name TEXT;
  metadata_first_name TEXT;
  metadata_last_name TEXT;
BEGIN
  metadata_full_name := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL);
  metadata_first_name := COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL);
  metadata_last_name := COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL);

  IF metadata_full_name IS NULL THEN
    metadata_full_name := NULLIF(TRIM(CONCAT(COALESCE(metadata_first_name, ''), ' ', COALESCE(metadata_last_name, ''))), '');
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    first_name,
    last_name,
    phone,
    cedula_number,
    location,
    address,
    role
  )
  VALUES (
    NEW.id,
    NEW.email,
    metadata_full_name,
    metadata_first_name,
    metadata_last_name,
    NEW.raw_user_meta_data ->> 'phone',
    NEW.raw_user_meta_data ->> 'cedula_number',
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'address',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'passenger')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(public.profiles.full_name, EXCLUDED.full_name),
    first_name = COALESCE(public.profiles.first_name, EXCLUDED.first_name),
    last_name = COALESCE(public.profiles.last_name, EXCLUDED.last_name),
    phone = COALESCE(public.profiles.phone, EXCLUDED.phone),
    role = COALESCE(public.profiles.role, EXCLUDED.role);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_driver_rating_from_driver_reviews()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.drivers
  SET rating = (
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 5.00)
    FROM public.driver_reviews
    WHERE driver_id = NEW.driver_id
  )
  WHERE id = NEW.driver_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_driver_rating_from_driver_reviews ON public.driver_reviews;
CREATE TRIGGER trigger_update_driver_rating_from_driver_reviews
  AFTER INSERT OR UPDATE ON public.driver_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_driver_rating_from_driver_reviews();
