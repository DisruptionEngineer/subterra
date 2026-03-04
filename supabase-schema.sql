-- ============================================
-- SUBTERRA — Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Pipelines
CREATE TABLE pipelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  schedule TEXT NOT NULL DEFAULT '0 9 * * 1',
  schedule_label TEXT NOT NULL DEFAULT 'Every Monday at 9:00 AM',
  delivery_method TEXT NOT NULL DEFAULT 'email_pdf',
  delivery_emails TEXT[] NOT NULL DEFAULT '{}',
  brand_color TEXT NOT NULL DEFAULT '#6366f1',
  brand_name TEXT NOT NULL DEFAULT '',
  brand_logo_url TEXT,
  report_title TEXT NOT NULL DEFAULT '',
  last_event_at TIMESTAMPTZ,
  last_report_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pipelines_user_id ON pipelines(user_id);
CREATE INDEX idx_pipelines_slug ON pipelines(slug);
CREATE INDEX idx_pipelines_status ON pipelines(status);

-- Webhook Events
CREATE TABLE webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  headers JSONB DEFAULT '{}',
  source_ip TEXT,
  processed BOOLEAN DEFAULT FALSE,
  received_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_pipeline_id ON webhook_events(pipeline_id);
CREATE INDEX idx_events_received_at ON webhook_events(received_at);
CREATE INDEX idx_events_pipeline_received ON webhook_events(pipeline_id, received_at);

-- Reports
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  file_url TEXT,
  format TEXT NOT NULL DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel')),
  period_start TEXT NOT NULL,
  period_end TEXT NOT NULL,
  event_count INTEGER NOT NULL DEFAULT 0,
  delivered BOOLEAN DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_pipeline_id ON reports(pipeline_id);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'scale')),
  pipeline_limit INTEGER NOT NULL DEFAULT 1,
  report_limit INTEGER NOT NULL DEFAULT 10,
  reports_used INTEGER NOT NULL DEFAULT 0,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Function to increment report usage
CREATE OR REPLACE FUNCTION increment_report_usage(p_user_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE subscriptions
  SET reports_used = reports_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- If no subscription exists, create a free one
  IF NOT FOUND THEN
    INSERT INTO subscriptions (user_id, plan, pipeline_limit, report_limit, reports_used)
    VALUES (p_user_id, 'free', 1, 10, 1);
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Auto-create subscription on first pipeline creation
CREATE OR REPLACE FUNCTION ensure_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO subscriptions (user_id, plan, pipeline_limit, report_limit)
  VALUES (NEW.user_id, 'free', 1, 10)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_subscription
  BEFORE INSERT ON pipelines
  FOR EACH ROW
  EXECUTE FUNCTION ensure_subscription();

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_pipelines_updated_at
  BEFORE UPDATE ON pipelines
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
