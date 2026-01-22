-- Migration: Create Escape Hatch Competitor Intelligence Schema
-- Run this against your Supabase project

-- ============================================
-- DROP EXISTING TABLES (if they exist)
-- ============================================

DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;

-- ============================================
-- CREATE TABLES
-- ============================================

-- Competitors table
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  website TEXT,
  notes TEXT,
  tag TEXT NOT NULL CHECK (tag IN ('core', 'adjacent', 'contrast')),
  is_baseline BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sources table
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('website', 'whitepaper', 'press', 'social', 'other')),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Claims table
CREATE TABLE claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('explicit', 'implied')),
  citation TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  internal_note TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_competitors_tag ON competitors(tag);
CREATE INDEX idx_competitors_is_baseline ON competitors(is_baseline);
CREATE INDEX idx_sources_competitor_id ON sources(competitor_id);
CREATE INDEX idx_claims_competitor_id ON claims(competitor_id);
CREATE INDEX idx_claims_source_id ON claims(source_id);
CREATE INDEX idx_claims_category ON claims(category);
CREATE INDEX idx_claims_verified ON claims(verified);

-- ============================================
-- TRIGGERS FOR updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (anon key)
CREATE POLICY "Allow read access to competitors" ON competitors
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to sources" ON sources
  FOR SELECT USING (true);

CREATE POLICY "Allow read access to claims" ON claims
  FOR SELECT USING (true);

-- Allow full access for service role (bypasses RLS by default)
-- Note: Service role key already bypasses RLS, these are for documentation

COMMENT ON TABLE competitors IS 'Bitcoin-backed lending competitors being tracked';
COMMENT ON TABLE sources IS 'Source URLs for competitor claims';
COMMENT ON TABLE claims IS 'Specific claims extracted from competitor sources';
