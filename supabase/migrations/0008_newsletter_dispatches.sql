-- Migration: newsletter_dispatches table
-- Records each newsletter issue that was sent (manual or auto-cron)

CREATE TABLE IF NOT EXISTS newsletter_dispatches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  subject         TEXT NOT NULL,
  content_html    TEXT NOT NULL,
  content_text    TEXT,
  recipients_total INT NOT NULL DEFAULT 0,
  recipients_sent  INT NOT NULL DEFAULT 0,
  recipients_failed INT NOT NULL DEFAULT 0,
  triggered_by    TEXT NOT NULL DEFAULT 'cron', -- 'cron' | 'admin'
  triggered_by_user UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for dashboard ordering
CREATE INDEX IF NOT EXISTS idx_newsletter_dispatches_sent_at ON newsletter_dispatches(sent_at DESC);

-- RLS: admins can view all dispatches; only service role can insert
ALTER TABLE newsletter_dispatches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin read newsletter dispatches"
  ON newsletter_dispatches
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );

CREATE POLICY "service role full access newsletter dispatches"
  ON newsletter_dispatches
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Newsletter subscribers table (if not already exists)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT NOT NULL UNIQUE,
  status       TEXT NOT NULL DEFAULT 'active', -- 'active' | 'unsubscribed'
  confirmed_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  source       TEXT DEFAULT 'website',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role full access newsletter subscribers"
  ON newsletter_subscribers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "admin read newsletter subscribers"
  ON newsletter_subscribers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'staff')
    )
  );
