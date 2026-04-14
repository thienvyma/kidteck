CREATE TABLE IF NOT EXISTS public.landing_content (
  id TEXT PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'landing_content'
      AND policyname = 'Admin manage landing content'
  ) THEN
    CREATE POLICY "Admin manage landing content"
    ON public.landing_content
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

DROP TRIGGER IF EXISTS update_landing_content_modtime ON public.landing_content;

CREATE TRIGGER update_landing_content_modtime
BEFORE UPDATE ON public.landing_content
FOR EACH ROW
EXECUTE PROCEDURE public.update_modified_column();
