-- Pacific Coast Taxi Database Schema
-- Version 1.0

-- =====================================================
-- ENUM TYPES
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('passenger', 'driver', 'admin');

-- Trip status
CREATE TYPE trip_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- Service types
CREATE TYPE service_type AS ENUM ('turistico', 'interdepartamental', 'local', 'programada');

-- Driver availability status
CREATE TYPE driver_status AS ENUM ('available', 'busy', 'offline');

-- =====================================================
-- PROFILES TABLE (extends auth.users)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  location TEXT,
  role user_role DEFAULT 'passenger',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "admins_select_all_profiles" ON public.profiles 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DRIVERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  license_expiry DATE,
  vehicle_brand TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  vehicle_year INTEGER,
  vehicle_color TEXT NOT NULL,
  vehicle_plate TEXT NOT NULL UNIQUE,
  vehicle_photo_url TEXT,
  status driver_status DEFAULT 'offline',
  rating DECIMAL(2,1) DEFAULT 5.0,
  total_trips INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;

-- Policies for drivers
CREATE POLICY "drivers_select_public" ON public.drivers 
  FOR SELECT USING (TRUE);

CREATE POLICY "drivers_insert_own" ON public.drivers 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "drivers_update_own" ON public.drivers 
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update any driver
CREATE POLICY "admins_update_drivers" ON public.drivers 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- DESTINATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  distance_km DECIMAL(6,2) NOT NULL,
  price_usd DECIMAL(8,2) NOT NULL,
  image_url TEXT,
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "destinations_select_public" ON public.destinations 
  FOR SELECT USING (TRUE);

-- =====================================================
-- TRIPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code TEXT UNIQUE NOT NULL,
  passenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  service_type service_type NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_id UUID REFERENCES public.destinations(id),
  distance_km DECIMAL(6,2),
  price_usd DECIMAL(8,2) NOT NULL,
  discount_code TEXT,
  discount_amount DECIMAL(8,2) DEFAULT 0,
  final_price DECIMAL(8,2) NOT NULL,
  passengers INTEGER DEFAULT 1,
  trip_date DATE NOT NULL,
  trip_time TIME NOT NULL,
  notes TEXT,
  status trip_status DEFAULT 'pending',
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

-- Passengers can view their own trips
CREATE POLICY "passengers_select_own_trips" ON public.trips 
  FOR SELECT USING (auth.uid() = passenger_id);

-- Drivers can view trips assigned to them
CREATE POLICY "drivers_select_assigned_trips" ON public.trips 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.drivers 
      WHERE user_id = auth.uid() AND id = trips.driver_id
    )
  );

-- Admins can view all trips
CREATE POLICY "admins_select_all_trips" ON public.trips 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Passengers can insert their own trips
CREATE POLICY "passengers_insert_trips" ON public.trips 
  FOR INSERT WITH CHECK (auth.uid() = passenger_id);

-- Passengers can update their own pending trips
CREATE POLICY "passengers_update_own_trips" ON public.trips 
  FOR UPDATE USING (auth.uid() = passenger_id AND status IN ('pending', 'confirmed'));

-- Drivers can update trips assigned to them
CREATE POLICY "drivers_update_assigned_trips" ON public.trips 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.drivers 
      WHERE user_id = auth.uid() AND id = trips.driver_id
    )
  );

-- Admins can update any trip
CREATE POLICY "admins_update_all_trips" ON public.trips 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- REVIEWS TABLE (for trips and drivers)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_driver_review BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "reviews_select_public" ON public.reviews 
  FOR SELECT USING (TRUE);

-- Users can insert their own reviews
CREATE POLICY "reviews_insert_own" ON public.reviews 
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Users can update their own reviews
CREATE POLICY "reviews_update_own" ON public.reviews 
  FOR UPDATE USING (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "reviews_delete_own" ON public.reviews 
  FOR DELETE USING (auth.uid() = reviewer_id);

-- =====================================================
-- DISCOUNT CODES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL CHECK (discount_percentage > 0 AND discount_percentage <= 100),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "discount_codes_select_public" ON public.discount_codes 
  FOR SELECT USING (is_active = TRUE);

-- =====================================================
-- DRIVER AVAILABILITY TABLE (for scheduling)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.driver_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(driver_id, date, start_time)
);

ALTER TABLE public.driver_availability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "availability_select_public" ON public.driver_availability 
  FOR SELECT USING (TRUE);

CREATE POLICY "drivers_manage_own_availability" ON public.driver_availability 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.drivers 
      WHERE user_id = auth.uid() AND id = driver_availability.driver_id
    )
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate confirmation code
CREATE OR REPLACE FUNCTION generate_confirmation_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'PCT-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$ LANGUAGE plpgsql;

-- Function to update driver rating
CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.drivers
  SET rating = (
    SELECT COALESCE(AVG(rating), 5.0)
    FROM public.reviews
    WHERE driver_id = NEW.driver_id AND is_driver_review = TRUE
  )
  WHERE id = NEW.driver_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update driver rating when a review is added
CREATE TRIGGER trigger_update_driver_rating
  AFTER INSERT OR UPDATE ON public.reviews
  FOR EACH ROW
  WHEN (NEW.is_driver_review = TRUE)
  EXECUTE FUNCTION update_driver_rating();

-- Function to increment driver trip count
CREATE OR REPLACE FUNCTION increment_driver_trips()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.drivers
    SET total_trips = total_trips + 1
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment driver trips when trip is completed
CREATE TRIGGER trigger_increment_driver_trips
  AFTER UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION increment_driver_trips();

-- =====================================================
-- AUTO-CREATE PROFILE TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'passenger')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_drivers_updated_at
  BEFORE UPDATE ON public.drivers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_trips_updated_at
  BEFORE UPDATE ON public.trips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
