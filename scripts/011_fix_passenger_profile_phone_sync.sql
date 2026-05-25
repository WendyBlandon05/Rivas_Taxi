-- =====================================================
-- SYNC PASSENGER PROFILE PHONE FROM AUTH METADATA
-- =====================================================

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
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data ->> 'phone', '')), ''),
    NEW.raw_user_meta_data ->> 'cedula_number',
    NEW.raw_user_meta_data ->> 'location',
    NEW.raw_user_meta_data ->> 'address',
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'passenger')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name),
    first_name = COALESCE(NULLIF(public.profiles.first_name, ''), EXCLUDED.first_name),
    last_name = COALESCE(NULLIF(public.profiles.last_name, ''), EXCLUDED.last_name),
    phone = COALESCE(NULLIF(public.profiles.phone, ''), EXCLUDED.phone),
    location = COALESCE(NULLIF(public.profiles.location, ''), EXCLUDED.location),
    address = COALESCE(NULLIF(public.profiles.address, ''), EXCLUDED.address),
    role = COALESCE(public.profiles.role, EXCLUDED.role),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

UPDATE public.profiles p
SET
  full_name = COALESCE(NULLIF(p.full_name, ''), NULLIF(TRIM(COALESCE(u.raw_user_meta_data ->> 'full_name', '')), '')),
  first_name = COALESCE(NULLIF(p.first_name, ''), NULLIF(TRIM(COALESCE(u.raw_user_meta_data ->> 'first_name', '')), '')),
  last_name = COALESCE(NULLIF(p.last_name, ''), NULLIF(TRIM(COALESCE(u.raw_user_meta_data ->> 'last_name', '')), '')),
  phone = COALESCE(NULLIF(p.phone, ''), NULLIF(TRIM(COALESCE(u.raw_user_meta_data ->> 'phone', '')), '')),
  location = COALESCE(NULLIF(p.location, ''), NULLIF(TRIM(COALESCE(u.raw_user_meta_data ->> 'location', '')), '')),
  updated_at = NOW()
FROM auth.users u
WHERE p.id = u.id
  AND (
    p.phone IS NULL
    OR TRIM(p.phone) = ''
    OR p.full_name IS NULL
    OR TRIM(p.full_name) = ''
  );
