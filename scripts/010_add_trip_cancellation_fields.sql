-- =====================================================
-- TRIP CANCELLATION FIELDS
-- =====================================================

ALTER TABLE public.trips
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
