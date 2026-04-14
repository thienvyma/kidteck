CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.landing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  learner_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  stage TEXT NOT NULL,
  message TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'enrolled', 'archived')),
  source TEXT NOT NULL DEFAULT 'landing_cta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS landing_leads_status_created_at_idx
ON public.landing_leads (status, created_at DESC);

CREATE INDEX IF NOT EXISTS landing_leads_created_at_idx
ON public.landing_leads (created_at DESC);

ALTER TABLE public.landing_leads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'landing_leads'
      AND policyname = 'Admin manage landing leads'
  ) THEN
    CREATE POLICY "Admin manage landing leads"
    ON public.landing_leads
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_landing_leads_modtime ON public.landing_leads;

CREATE TRIGGER update_landing_leads_modtime
BEFORE UPDATE ON public.landing_leads
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();
