-- ============================================================
-- ESCAPE HATCH COMPETITOR INTELLIGENCE - COMPLETE DATABASE SETUP
-- ============================================================
-- 
-- Run this entire script in your Supabase SQL Editor:
-- 1. Go to your Supabase Dashboard
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Paste this entire script
-- 4. Click "Run"
--
-- This script is IDEMPOTENT - safe to run multiple times
-- ============================================================

-- ============================================
-- STEP 1: DROP EXISTING TABLES (clean slate)
-- ============================================

DROP TABLE IF EXISTS claims CASCADE;
DROP TABLE IF EXISTS sources CASCADE;
DROP TABLE IF EXISTS competitors CASCADE;

-- ============================================
-- STEP 2: CREATE TABLES WITH CONSTRAINTS
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
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_competitors_tag ON competitors(tag);
CREATE INDEX idx_competitors_is_baseline ON competitors(is_baseline);
CREATE INDEX idx_sources_competitor_id ON sources(competitor_id);
CREATE INDEX idx_claims_competitor_id ON claims(competitor_id);
CREATE INDEX idx_claims_source_id ON claims(source_id);
CREATE INDEX idx_claims_category ON claims(category);
CREATE INDEX idx_claims_verified ON claims(verified);

-- ============================================
-- STEP 4: CREATE AUTO-UPDATE TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_competitors_updated_at ON competitors;
CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON competitors
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_claims_updated_at ON claims;
CREATE TRIGGER update_claims_updated_at
  BEFORE UPDATE ON claims
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- STEP 5: ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Allow read access to all (for anon key)
DROP POLICY IF EXISTS "Allow read access to competitors" ON competitors;
CREATE POLICY "Allow read access to competitors" ON competitors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read access to sources" ON sources;
CREATE POLICY "Allow read access to sources" ON sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read access to claims" ON claims;
CREATE POLICY "Allow read access to claims" ON claims FOR SELECT USING (true);

-- ============================================
-- STEP 6: SEED COMPETITORS
-- ============================================

INSERT INTO competitors (name, slug, website, tag, is_baseline, notes) VALUES
  -- Baseline
  ('Escape Hatch', 'escape-hatch', 'https://escapehatch.com', 'core', TRUE, 'Our product - baseline for comparison'),
  
  -- Core competitors
  ('Block Earner', 'block-earner', 'https://blockearner.com.au/', 'core', FALSE, 'Australian crypto lending platform'),
  ('Lendasat', 'lendasat', 'https://lendasat.com', 'core', FALSE, 'Bitcoin-backed loans'),
  ('Coinbase', 'coinbase', 'https://coinbase.com', 'core', FALSE, 'Major US exchange with lending products'),
  ('Unchained', 'unchained', 'https://unchained.com', 'core', FALSE, 'Bitcoin-native financial services'),
  ('Strike', 'strike', 'https://strike.me', 'core', FALSE, 'Bitcoin payments and services'),
  ('Salt Lending', 'salt-lending', 'https://saltlending.com', 'core', FALSE, 'Crypto-backed loans'),
  ('Ledn', 'ledn', 'https://ledn.io', 'core', FALSE, 'Bitcoin savings and loans'),
  ('Loan My Coins', 'loan-my-coins', 'https://loanmycoins.com', 'core', FALSE, 'Crypto lending platform'),
  
  -- Adjacent competitors
  ('Firefish', 'firefish', 'https://firefish.io', 'adjacent', FALSE, 'DeFi lending protocol'),
  ('Debifi', 'debifi', 'https://debifi.com', 'adjacent', FALSE, 'Decentralized lending'),
  
  -- Contrast competitor
  ('Hodlhodl', 'hodlhodl', 'https://hodlhodl.com', 'contrast', FALSE, 'P2P Bitcoin lending')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  website = EXCLUDED.website,
  tag = EXCLUDED.tag,
  notes = EXCLUDED.notes;

-- ============================================
-- STEP 7: SEED SOURCES
-- ============================================

INSERT INTO sources (competitor_id, url, source_type)
SELECT c.id, s.url, s.source_type::text
FROM competitors c
CROSS JOIN (VALUES
  ('escape-hatch', 'https://escapehatch.com/how-it-works', 'website'),
  ('escape-hatch', 'https://escapehatch.com/terms', 'website'),
  ('block-earner', 'https://blockearner.com.au/products', 'website'),
  ('unchained', 'https://unchained.com/loans', 'website'),
  ('salt-lending', 'https://saltlending.com/crypto-loans', 'website'),
  ('ledn', 'https://ledn.io/bitcoin-backed-loans', 'website'),
  ('firefish', 'https://firefish.io/lending', 'website'),
  ('debifi', 'https://debifi.com/about', 'website'),
  ('hodlhodl', 'https://hodlhodl.com/lend', 'website'),
  ('loan-my-coins', 'https://loanmycoins.com/features', 'website'),
  ('loan-my-coins', 'https://loanmycoins.com/whitepaper.pdf', 'whitepaper')
) AS s(slug, url, source_type)
WHERE c.slug = s.slug
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 8: SEED ESCAPE HATCH BASELINE CLAIMS
-- ============================================

INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, verified_by, status)
SELECT 
  c.id,
  (SELECT id FROM sources WHERE competitor_id = c.id AND url LIKE '%how-it-works%' LIMIT 1),
  cl.category,
  cl.claim_text,
  cl.claim_type::text,
  cl.verified,
  cl.verified_by,
  cl.status::text
FROM competitors c
CROSS JOIN (VALUES
  ('Custody model', 'Bitcoin collateral held in third party multi-sig custodial escrow', 'explicit', TRUE, 'Team', 'verified'),
  ('Rehypothecation or collateral reuse', 'No rehypothecation - collateral is never lent or reused', 'explicit', TRUE, 'Team', 'verified'),
  ('Margin calls or liquidation triggers', 'No margin calls - fixed terms regardless of BTC price', 'explicit', TRUE, 'Team', 'verified'),
  ('Drawdown mechanics', 'Fixed monthly USDT drawdown schedule', 'explicit', TRUE, 'Team', 'verified'),
  ('Loan currency', 'USDT stablecoin disbursements', 'explicit', TRUE, 'Team', 'verified'),
  ('Insurance or guarantees', 'Collateral protection via multi-sig escrow arrangement', 'explicit', TRUE, 'Team', 'verified')
) AS cl(category, claim_text, claim_type, verified, verified_by, status)
WHERE c.slug = 'escape-hatch'
ON CONFLICT DO NOTHING;

-- Add claims from terms page
INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, verified_by, status)
SELECT 
  c.id,
  (SELECT id FROM sources WHERE competitor_id = c.id AND url LIKE '%terms%' LIMIT 1),
  cl.category,
  cl.claim_text,
  cl.claim_type::text,
  cl.verified,
  cl.verified_by,
  cl.status::text
FROM competitors c
CROSS JOIN (VALUES
  ('Term length', '48 month fixed term', 'explicit', TRUE, 'Team', 'verified'),
  ('Repayment requirements', 'No repayments during the term - balloon payment at end', 'explicit', TRUE, 'Team', 'verified'),
  ('Availability for Australian customers', 'Available to Australian residents', 'explicit', TRUE, 'Team', 'verified'),
  ('Eligibility or KYC constraints', 'Standard KYC/AML verification required', 'explicit', TRUE, 'Team', 'verified'),
  ('Jurisdiction and legal posture', 'APAC-focused legal structure', 'explicit', TRUE, 'Team', 'verified')
) AS cl(category, claim_text, claim_type, verified, verified_by, status)
WHERE c.slug = 'escape-hatch'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 9: SEED SAMPLE COMPETITOR CLAIMS
-- ============================================

-- Unchained claims
INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status)
SELECT 
  c.id,
  (SELECT id FROM sources WHERE competitor_id = c.id LIMIT 1),
  cl.category,
  cl.claim_text,
  cl.claim_type::text,
  cl.verified,
  cl.status::text
FROM competitors c
CROSS JOIN (VALUES
  ('Custody model', 'Collaborative custody with 2-of-3 multisig', 'explicit', TRUE, 'verified'),
  ('Margin calls or liquidation triggers', 'Margin calls at specific LTV thresholds', 'explicit', TRUE, 'verified'),
  ('Term length', 'Flexible terms available', 'implied', FALSE, 'pending'),
  ('Availability for Australian customers', 'US-focused, limited international availability', 'explicit', TRUE, 'verified')
) AS cl(category, claim_text, claim_type, verified, status)
WHERE c.slug = 'unchained'
ON CONFLICT DO NOTHING;

-- Ledn claims
INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status)
SELECT 
  c.id,
  (SELECT id FROM sources WHERE competitor_id = c.id LIMIT 1),
  cl.category,
  cl.claim_text,
  cl.claim_type::text,
  cl.verified,
  cl.status::text
FROM competitors c
CROSS JOIN (VALUES
  ('Custody model', 'Custodial - Ledn holds collateral', 'explicit', TRUE, 'verified'),
  ('Rehypothecation or collateral reuse', 'May rehypothecate collateral per terms', 'implied', FALSE, 'pending'),
  ('Margin calls or liquidation triggers', 'Liquidation at 80% LTV', 'explicit', TRUE, 'verified'),
  ('Loan currency', 'USD and USDC available', 'explicit', TRUE, 'verified')
) AS cl(category, claim_text, claim_type, verified, status)
WHERE c.slug = 'ledn'
ON CONFLICT DO NOTHING;

-- Salt Lending claims
INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status)
SELECT 
  c.id,
  (SELECT id FROM sources WHERE competitor_id = c.id LIMIT 1),
  cl.category,
  cl.claim_text,
  cl.claim_type::text,
  cl.verified,
  cl.status::text
FROM competitors c
CROSS JOIN (VALUES
  ('Custody model', 'Third-party institutional custody', 'explicit', TRUE, 'verified'),
  ('Margin calls or liquidation triggers', 'Automatic liquidation protocols', 'explicit', FALSE, 'pending'),
  ('Term length', '12-month standard terms', 'explicit', TRUE, 'verified'),
  ('Loan currency', 'USD, stablecoins available', 'explicit', TRUE, 'verified')
) AS cl(category, claim_text, claim_type, verified, status)
WHERE c.slug = 'salt-lending'
ON CONFLICT DO NOTHING;

-- Hodlhodl claims (contrast)
INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status)
SELECT 
  c.id,
  (SELECT id FROM sources WHERE competitor_id = c.id LIMIT 1),
  cl.category,
  cl.claim_text,
  cl.claim_type::text,
  cl.verified,
  cl.status::text
FROM competitors c
CROSS JOIN (VALUES
  ('Custody model', 'Non-custodial P2P with multisig escrow', 'explicit', TRUE, 'verified'),
  ('Rehypothecation or collateral reuse', 'No rehypothecation - P2P model', 'explicit', TRUE, 'verified'),
  ('Margin calls or liquidation triggers', 'Lender-defined liquidation terms', 'explicit', TRUE, 'verified'),
  ('Jurisdiction and legal posture', 'Decentralized, jurisdiction-agnostic', 'implied', FALSE, 'pending')
) AS cl(category, claim_text, claim_type, verified, status)
WHERE c.slug = 'hodlhodl'
ON CONFLICT DO NOTHING;

-- ============================================
-- STEP 10: VERIFY RESULTS
-- ============================================

SELECT 
  'COMPETITORS' as table_name, 
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE is_baseline) as baseline_count,
  COUNT(*) FILTER (WHERE tag = 'core' AND NOT is_baseline) as core_count,
  COUNT(*) FILTER (WHERE tag = 'adjacent') as adjacent_count,
  COUNT(*) FILTER (WHERE tag = 'contrast') as contrast_count
FROM competitors

UNION ALL

SELECT 
  'SOURCES' as table_name, 
  COUNT(*) as row_count,
  NULL, NULL, NULL, NULL
FROM sources

UNION ALL

SELECT 
  'CLAIMS' as table_name, 
  COUNT(*) as row_count,
  COUNT(*) FILTER (WHERE verified) as verified_count,
  COUNT(*) FILTER (WHERE NOT verified) as pending_count,
  NULL, NULL
FROM claims;

-- Show baseline claims
SELECT 
  '✅ BASELINE CLAIMS' as status,
  c.name as competitor,
  cl.category,
  cl.claim_text,
  cl.verified
FROM claims cl
JOIN competitors c ON cl.competitor_id = c.id
WHERE c.is_baseline
ORDER BY cl.category;
