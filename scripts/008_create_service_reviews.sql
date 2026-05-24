-- Creates the general service reviews table used by the home page testimonials.
-- These reviews are different from driver_reviews: they rate Pacific Coast Taxi
-- as a service, not a specific driver. Safe to run more than once.

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
DROP POLICY IF EXISTS reviews_insert_authenticated ON public.reviews;
DROP POLICY IF EXISTS reviews_insert_public ON public.reviews;

CREATE POLICY reviews_select_public ON public.reviews
  FOR SELECT USING (TRUE);

CREATE POLICY reviews_insert_authenticated ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE INDEX IF NOT EXISTS idx_reviews_rating
  ON public.reviews(rating);

CREATE INDEX IF NOT EXISTS idx_reviews_service_public
  ON public.reviews(is_driver_review, rating, created_at DESC);
