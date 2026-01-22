-- Escape Hatch Competitor Intelligence Dashboard
-- Supabase Schema Migration
-- Run this in your Supabase SQL Editor

-- ============================================
-- DROP EXISTING TABLES (if upgrading)
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
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_competitors_tag ON competitors(tag);
CREATE INDEX idx_competitors_is_baseline ON competitors(is_baseline);
CREATE INDEX idx_sources_competitor_id ON sources(competitor_id);
CREATE INDEX idx_claims_competitor_id ON claims(competitor_id);
CREATE INDEX idx_claims_source_id ON claims(source_id);
CREATE INDEX idx_claims_category ON claims(category);
CREATE INDEX idx_claims_verified ON claims(verified);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow public read access (anon key)
CREATE POLICY "Allow public read access to competitors"
  ON competitors FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to sources"
  ON sources FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to claims"
  ON claims FOR SELECT
  USING (true);

-- Allow service role full access (for API routes)
CREATE POLICY "Allow service role full access to competitors"
  ON competitors FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to sources"
  ON sources FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Allow service role full access to claims"
  ON claims FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- SEED DATA: Escape Hatch Baseline
-- ============================================

INSERT INTO competitors (name, slug, website, tag, is_baseline, notes)
VALUES (
  'Escape Hatch',
  'escape-hatch',
  'https://escapehatch.com',
  'core',
  TRUE,
  'Baseline competitor - our product'
);

-- Get baseline ID for claims
DO $$
DECLARE
  baseline_id UUID;
  source_id UUID;
BEGIN
  SELECT id INTO baseline_id FROM competitors WHERE is_baseline = TRUE;

  -- Insert baseline source
  INSERT INTO sources (competitor_id, url, source_type)
  VALUES (baseline_id, 'https://escapehatch.com/how-it-works', 'website')
  RETURNING id INTO source_id;

  -- Insert baseline claims
  INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status, verified_by) VALUES
  (baseline_id, source_id, 'Custody model', 'Bitcoin collateral held in third party multi-sig custodial escrow', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Rehypothecation or collateral reuse', 'No rehypothecation', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Margin calls or liquidation triggers', 'No margin calls', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Term length', '48 month fixed term', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Repayment requirements', 'No repayments during the term', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Drawdown mechanics', 'Fixed monthly USDT drawdown', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Loan currency', 'USDT', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Availability for Australian customers', 'Available to Australian residents', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Eligibility or KYC constraints', 'Standard KYC/AML verification', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Insurance or guarantees', 'Collateral protection via multi-sig escrow', 'explicit', TRUE, 'verified', 'Team'),
  (baseline_id, source_id, 'Jurisdiction and legal posture', 'APAC-focused structure', 'explicit', TRUE, 'verified', 'Team');
END $$;

-- ============================================
-- SEED DATA: Sample Competitors (Optional)
-- ============================================

-- Uncomment below to add sample competitors

/*
INSERT INTO competitors (name, slug, website, tag, is_baseline) VALUES
('Unchained', 'unchained', 'https://unchained.com', 'core', FALSE),
('Ledn', 'ledn', 'https://ledn.io', 'core', FALSE),
('Salt Lending', 'salt-lending', 'https://saltlending.com', 'core', FALSE),
('Coinbase', 'coinbase', 'https://coinbase.com', 'core', FALSE),
('Block Earner', 'block-earner', 'https://blockearner.com.au/', 'core', FALSE),
('Firefish', 'firefish', 'https://firefish.io', 'adjacent', FALSE),
('Debifi', 'debifi', 'https://debifi.com', 'adjacent', FALSE),
('Hodlhodl', 'hodlhodl', 'https://hodlhodl.com', 'contrast', FALSE);
*/

-- ============================================
-- VERIFY SEED DATA
-- ============================================

SELECT 
  'competitors' as table_name, 
  COUNT(*) as row_count 
FROM competitors
UNION ALL
SELECT 
  'sources' as table_name, 
  COUNT(*) as row_count 
FROM sources
UNION ALL
SELECT 
  'claims' as table_name, 
  COUNT(*) as row_count 
FROM claims;
