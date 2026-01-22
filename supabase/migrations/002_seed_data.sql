-- Seed: Populate Escape Hatch Competitor Intelligence Database
-- Run this AFTER the schema migration
-- Idempotent: Uses ON CONFLICT DO NOTHING

-- ============================================
-- COMPETITORS
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
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- SOURCES (for Escape Hatch baseline)
-- ============================================

INSERT INTO sources (competitor_id, url, source_type) VALUES
  -- Escape Hatch sources
  ((SELECT id FROM competitors WHERE slug = 'escape-hatch'), 'https://escapehatch.com/how-it-works', 'website'),
  ((SELECT id FROM competitors WHERE slug = 'escape-hatch'), 'https://escapehatch.com/terms', 'website'),
  
  -- Block Earner
  ((SELECT id FROM competitors WHERE slug = 'block-earner'), 'https://blockearner.com.au/products', 'website'),
  
  -- Unchained
  ((SELECT id FROM competitors WHERE slug = 'unchained'), 'https://unchained.com/loans', 'website'),
  
  -- Salt Lending
  ((SELECT id FROM competitors WHERE slug = 'salt-lending'), 'https://saltlending.com/crypto-loans', 'website'),
  
  -- Ledn
  ((SELECT id FROM competitors WHERE slug = 'ledn'), 'https://ledn.io/bitcoin-backed-loans', 'website'),
  
  -- Firefish
  ((SELECT id FROM competitors WHERE slug = 'firefish'), 'https://firefish.io/lending', 'website'),
  
  -- Debifi
  ((SELECT id FROM competitors WHERE slug = 'debifi'), 'https://debifi.com/about', 'website'),
  
  -- Hodlhodl
  ((SELECT id FROM competitors WHERE slug = 'hodlhodl'), 'https://hodlhodl.com/lend', 'website'),
  
  -- Loan My Coins
  ((SELECT id FROM competitors WHERE slug = 'loan-my-coins'), 'https://loanmycoins.com/features', 'website'),
  ((SELECT id FROM competitors WHERE slug = 'loan-my-coins'), 'https://loanmycoins.com/whitepaper.pdf', 'whitepaper')
ON CONFLICT DO NOTHING;

-- ============================================
-- CLAIMS (Escape Hatch baseline - all categories)
-- ============================================

-- Get Escape Hatch competitor ID and source IDs
DO $$
DECLARE
  eh_id UUID;
  src_how_it_works UUID;
  src_terms UUID;
BEGIN
  SELECT id INTO eh_id FROM competitors WHERE slug = 'escape-hatch';
  SELECT id INTO src_how_it_works FROM sources WHERE competitor_id = eh_id AND url LIKE '%how-it-works%' LIMIT 1;
  SELECT id INTO src_terms FROM sources WHERE competitor_id = eh_id AND url LIKE '%terms%' LIMIT 1;

  -- Insert baseline claims
  INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, verified_by, status) VALUES
    (eh_id, src_how_it_works, 'Custody model', 'Bitcoin collateral held in third party multi-sig custodial escrow', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_how_it_works, 'Rehypothecation or collateral reuse', 'No rehypothecation - collateral is never lent or reused', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_how_it_works, 'Margin calls or liquidation triggers', 'No margin calls - fixed terms regardless of BTC price', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_terms, 'Term length', '48 month fixed term', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_terms, 'Repayment requirements', 'No repayments during the term - balloon payment at end', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_how_it_works, 'Drawdown mechanics', 'Fixed monthly USDT drawdown schedule', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_how_it_works, 'Loan currency', 'USDT stablecoin disbursements', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_terms, 'Availability for Australian customers', 'Available to Australian residents', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_terms, 'Eligibility or KYC constraints', 'Standard KYC/AML verification required', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_how_it_works, 'Insurance or guarantees', 'Collateral protection via multi-sig escrow arrangement', 'explicit', TRUE, 'Team', 'verified'),
    (eh_id, src_terms, 'Jurisdiction and legal posture', 'APAC-focused legal structure', 'explicit', TRUE, 'Team', 'verified')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- SAMPLE CLAIMS FOR OTHER COMPETITORS
-- ============================================

-- Unchained claims
DO $$
DECLARE
  comp_id UUID;
  src_id UUID;
BEGIN
  SELECT id INTO comp_id FROM competitors WHERE slug = 'unchained';
  SELECT id INTO src_id FROM sources WHERE competitor_id = comp_id LIMIT 1;

  INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status) VALUES
    (comp_id, src_id, 'Custody model', 'Collaborative custody with 2-of-3 multisig', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Margin calls or liquidation triggers', 'Margin calls at specific LTV thresholds', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Term length', 'Flexible terms available', 'implied', FALSE, 'pending'),
    (comp_id, src_id, 'Availability for Australian customers', 'US-focused, limited international availability', 'explicit', TRUE, 'verified')
  ON CONFLICT DO NOTHING;
END $$;

-- Ledn claims
DO $$
DECLARE
  comp_id UUID;
  src_id UUID;
BEGIN
  SELECT id INTO comp_id FROM competitors WHERE slug = 'ledn';
  SELECT id INTO src_id FROM sources WHERE competitor_id = comp_id LIMIT 1;

  INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status) VALUES
    (comp_id, src_id, 'Custody model', 'Custodial - Ledn holds collateral', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Rehypothecation or collateral reuse', 'May rehypothecate collateral per terms', 'implied', FALSE, 'pending'),
    (comp_id, src_id, 'Margin calls or liquidation triggers', 'Liquidation at 80% LTV', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Loan currency', 'USD and USDC available', 'explicit', TRUE, 'verified')
  ON CONFLICT DO NOTHING;
END $$;

-- Salt Lending claims
DO $$
DECLARE
  comp_id UUID;
  src_id UUID;
BEGIN
  SELECT id INTO comp_id FROM competitors WHERE slug = 'salt-lending';
  SELECT id INTO src_id FROM sources WHERE competitor_id = comp_id LIMIT 1;

  INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status) VALUES
    (comp_id, src_id, 'Custody model', 'Third-party institutional custody', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Margin calls or liquidation triggers', 'Automatic liquidation protocols', 'explicit', FALSE, 'pending'),
    (comp_id, src_id, 'Term length', '12-month standard terms', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Loan currency', 'USD, stablecoins available', 'explicit', TRUE, 'verified')
  ON CONFLICT DO NOTHING;
END $$;

-- Hodlhodl claims (contrast)
DO $$
DECLARE
  comp_id UUID;
  src_id UUID;
BEGIN
  SELECT id INTO comp_id FROM competitors WHERE slug = 'hodlhodl';
  SELECT id INTO src_id FROM sources WHERE competitor_id = comp_id LIMIT 1;

  INSERT INTO claims (competitor_id, source_id, category, claim_text, claim_type, verified, status) VALUES
    (comp_id, src_id, 'Custody model', 'Non-custodial P2P with multisig escrow', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Rehypothecation or collateral reuse', 'No rehypothecation - P2P model', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Margin calls or liquidation triggers', 'Lender-defined liquidation terms', 'explicit', TRUE, 'verified'),
    (comp_id, src_id, 'Jurisdiction and legal posture', 'Decentralized, jurisdiction-agnostic', 'implied', FALSE, 'pending')
  ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- VERIFICATION SUMMARY
-- ============================================

-- Output row counts for verification
DO $$
DECLARE
  comp_count INTEGER;
  src_count INTEGER;
  claim_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO comp_count FROM competitors;
  SELECT COUNT(*) INTO src_count FROM sources;
  SELECT COUNT(*) INTO claim_count FROM claims;
  
  RAISE NOTICE 'Seed complete: % competitors, % sources, % claims', comp_count, src_count, claim_count;
END $$;
