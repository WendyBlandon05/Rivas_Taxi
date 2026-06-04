-- Contador de visitas para la web.
-- 552 es el total historico tomado de GA4 hasta el dia de implementacion.

CREATE TABLE IF NOT EXISTS public.site_visit_settings (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE,
  initial_total INTEGER NOT NULL DEFAULT 552,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT site_visit_settings_single_row CHECK (id = TRUE)
);

INSERT INTO public.site_visit_settings (id, initial_total)
VALUES (TRUE, 552)
ON CONFLICT (id) DO UPDATE
SET initial_total = EXCLUDED.initial_total,
    updated_at = NOW();

CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL DEFAULT '/',
  user_agent TEXT,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.site_visit_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS site_visit_settings_no_public_access ON public.site_visit_settings;
DROP POLICY IF EXISTS site_visits_no_public_access ON public.site_visits;

CREATE INDEX IF NOT EXISTS idx_site_visits_visited_at
  ON public.site_visits(visited_at DESC);

CREATE INDEX IF NOT EXISTS idx_site_visits_page_path
  ON public.site_visits(page_path);
