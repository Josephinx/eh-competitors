import { Competitor, Source, Claim, ClaimCategory, CompetitorWithStats } from '@/types';

// ============================================
// CLAIM CATEGORIES (sorted by sort_order)
// ============================================

export const mockClaimCategories: ClaimCategory[] = [
  { id: 'cat-1', name: 'Custody model', slug: 'custody-model', priority: true, sort_order: 1 },
  { id: 'cat-2', name: 'Rehypothecation or collateral reuse', slug: 'rehypothecation', priority: true, sort_order: 2 },
  { id: 'cat-3', name: 'Margin calls or liquidation triggers', slug: 'margin-calls', priority: true, sort_order: 3 },
  { id: 'cat-4', name: 'Term length', slug: 'term-length', priority: true, sort_order: 4 },
  { id: 'cat-5', name: 'Repayment requirements', slug: 'repayment-requirements', priority: true, sort_order: 5 },
  { id: 'cat-6', name: 'Drawdown mechanics', slug: 'drawdown-mechanics', priority: false, sort_order: 6 },
  { id: 'cat-7', name: 'Loan currency', slug: 'loan-currency', priority: false, sort_order: 7 },
  { id: 'cat-8', name: 'Availability for Australian customers', slug: 'availability-australia', priority: true, sort_order: 8 },
  { id: 'cat-9', name: 'Eligibility or KYC constraints', slug: 'eligibility-kyc', priority: false, sort_order: 9 },
  { id: 'cat-10', name: 'Insurance or guarantees', slug: 'insurance-guarantees', priority: false, sort_order: 10 },
  { id: 'cat-11', name: 'Jurisdiction and legal posture', slug: 'jurisdiction-legal', priority: false, sort_order: 11 },
];

// ============================================
// COMPETITORS
// ============================================

export const mockCompetitors: Competitor[] = [
  // Baseline
  {
    id: 'comp-baseline',
    name: 'Escape Hatch',
    slug: 'escape-hatch',
    website_url: 'https://escapehatch.com',
    tier: 'core',
    is_baseline: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  // Core competitors
  {
    id: 'comp-1',
    name: 'Block Earner',
    slug: 'block-earner',
    website_url: 'https://blockearner.com.au/',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z',
  },
  {
    id: 'comp-2',
    name: 'Lendasat',
    slug: 'lendasat',
    website_url: 'https://lendasat.com',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z',
  },
  {
    id: 'comp-3',
    name: 'Coinbase',
    slug: 'coinbase',
    website_url: 'https://coinbase.com',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z',
  },
  {
    id: 'comp-4',
    name: 'Unchained',
    slug: 'unchained',
    website_url: 'https://unchained.com',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-05T00:00:00Z',
    updated_at: '2024-01-05T00:00:00Z',
  },
  {
    id: 'comp-5',
    name: 'Strike',
    slug: 'strike',
    website_url: 'https://strike.me',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-06T00:00:00Z',
    updated_at: '2024-01-06T00:00:00Z',
  },
  {
    id: 'comp-6',
    name: 'Salt Lending',
    slug: 'salt-lending',
    website_url: 'https://saltlending.com',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-07T00:00:00Z',
    updated_at: '2024-01-07T00:00:00Z',
  },
  {
    id: 'comp-7',
    name: 'Ledn',
    slug: 'ledn',
    website_url: 'https://ledn.io',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-08T00:00:00Z',
    updated_at: '2024-01-08T00:00:00Z',
  },
  {
    id: 'comp-8',
    name: 'Loan My Coins',
    slug: 'loan-my-coins',
    website_url: 'https://loanmycoins.com',
    tier: 'core',
    is_baseline: false,
    created_at: '2024-01-09T00:00:00Z',
    updated_at: '2024-01-09T00:00:00Z',
  },
  // Adjacent competitors
  {
    id: 'comp-9',
    name: 'Firefish',
    slug: 'firefish',
    website_url: 'https://firefish.io',
    tier: 'adjacent',
    is_baseline: false,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-01-10T00:00:00Z',
  },
  {
    id: 'comp-10',
    name: 'Debifi',
    slug: 'debifi',
    website_url: 'https://debifi.com',
    tier: 'adjacent',
    is_baseline: false,
    created_at: '2024-01-11T00:00:00Z',
    updated_at: '2024-01-11T00:00:00Z',
  },
  // Contrast competitor
  {
    id: 'comp-11',
    name: 'Hodlhodl',
    slug: 'hodlhodl',
    website_url: 'https://hodlhodl.com',
    tier: 'contrast',
    is_baseline: false,
    created_at: '2024-01-12T00:00:00Z',
    updated_at: '2024-01-12T00:00:00Z',
  },
];

// ============================================
// SOURCES
// ============================================

export const mockSources: Source[] = [
  // Escape Hatch baseline sources
  {
    id: 'src-1',
    competitor_id: 'comp-baseline',
    url: 'https://escapehatch.com/how-it-works',
    source_type: 'website',
    title: 'How It Works - Escape Hatch',
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'src-2',
    competitor_id: 'comp-baseline',
    url: 'https://escapehatch.com/terms',
    source_type: 'website',
    title: 'Terms of Service',
    created_at: '2024-01-01T00:00:00Z',
  },
  // Firefish
  {
    id: 'src-3',
    competitor_id: 'comp-9',
    url: 'https://firefish.io/lending',
    source_type: 'website',
    title: 'Lending - Firefish',
    created_at: '2024-01-10T00:00:00Z',
  },
  // Loan My Coins
  {
    id: 'src-4',
    competitor_id: 'comp-8',
    url: 'https://loanmycoins.com/features',
    source_type: 'website',
    title: 'Features - Loan My Coins',
    created_at: '2024-01-09T00:00:00Z',
  },
  {
    id: 'src-5',
    competitor_id: 'comp-8',
    url: 'https://loanmycoins.com/whitepaper.pdf',
    source_type: 'whitepaper',
    title: 'Loan My Coins Whitepaper',
    created_at: '2024-01-09T00:00:00Z',
  },
  // Block Earner
  {
    id: 'src-6',
    competitor_id: 'comp-1',
    url: 'https://blockearner.com.au/products',
    source_type: 'website',
    title: 'Products - Block Earner',
    created_at: '2024-01-02T00:00:00Z',
  },
  // Unchained
  {
    id: 'src-7',
    competitor_id: 'comp-4',
    url: 'https://unchained.com/loans',
    source_type: 'website',
    title: 'Bitcoin Loans - Unchained',
    created_at: '2024-01-05T00:00:00Z',
  },
  // Salt Lending
  {
    id: 'src-8',
    competitor_id: 'comp-6',
    url: 'https://saltlending.com/crypto-loans',
    source_type: 'website',
    title: 'Crypto Loans - Salt',
    created_at: '2024-01-07T00:00:00Z',
  },
  // Ledn
  {
    id: 'src-9',
    competitor_id: 'comp-7',
    url: 'https://ledn.io/bitcoin-backed-loans',
    source_type: 'website',
    title: 'Bitcoin-Backed Loans - Ledn',
    created_at: '2024-01-08T00:00:00Z',
  },
  // Debifi
  {
    id: 'src-10',
    competitor_id: 'comp-10',
    url: 'https://debifi.com/about',
    source_type: 'website',
    title: 'About - Debifi',
    created_at: '2024-01-11T00:00:00Z',
  },
  // Hodlhodl
  {
    id: 'src-11',
    competitor_id: 'comp-11',
    url: 'https://hodlhodl.com/lend',
    source_type: 'website',
    title: 'Lend - Hodlhodl',
    created_at: '2024-01-12T00:00:00Z',
  },
];

// ============================================
// CLAIMS (Escape Hatch baseline only for matrix demo)
// ============================================

export const mockClaims: Claim[] = [
  // Escape Hatch baseline claims (all categories)
  {
    id: 'claim-1',
    competitor_id: 'comp-baseline',
    source_id: 'src-1',
    category_id: 'cat-1',
    claim_text: 'Bitcoin collateral held in third party multi-sig custodial escrow',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-2',
    competitor_id: 'comp-baseline',
    source_id: 'src-1',
    category_id: 'cat-2',
    claim_text: 'No rehypothecation',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-3',
    competitor_id: 'comp-baseline',
    source_id: 'src-1',
    category_id: 'cat-3',
    claim_text: 'No margin calls',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-4',
    competitor_id: 'comp-baseline',
    source_id: 'src-2',
    category_id: 'cat-4',
    claim_text: '48 month fixed term',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-5',
    competitor_id: 'comp-baseline',
    source_id: 'src-2',
    category_id: 'cat-5',
    claim_text: 'No repayments during the term',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-6',
    competitor_id: 'comp-baseline',
    source_id: 'src-1',
    category_id: 'cat-6',
    claim_text: 'Fixed monthly USDT drawdown',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-7',
    competitor_id: 'comp-baseline',
    source_id: 'src-1',
    category_id: 'cat-7',
    claim_text: 'USDT',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-8',
    competitor_id: 'comp-baseline',
    source_id: 'src-2',
    category_id: 'cat-8',
    claim_text: 'Available to Australian residents',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-9',
    competitor_id: 'comp-baseline',
    source_id: 'src-2',
    category_id: 'cat-9',
    claim_text: 'Standard KYC/AML verification',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-10',
    competitor_id: 'comp-baseline',
    source_id: 'src-1',
    category_id: 'cat-10',
    claim_text: 'Collateral protection via multi-sig escrow',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'claim-11',
    competitor_id: 'comp-baseline',
    source_id: 'src-2',
    category_id: 'cat-11',
    claim_text: 'APAC-focused structure',
    claim_type: 'explicit',
    verified: true,
    verified_by: 'Team',
    citation: null,
    internal_note: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// ============================================
// COMPUTED DATA HELPERS
// ============================================

export function getCompetitorStats(competitor: Competitor): CompetitorWithStats {
  const sources = mockSources.filter(s => s.competitor_id === competitor.id);
  const claims = mockClaims.filter(c => c.competitor_id === competitor.id);
  const verified = claims.filter(c => c.verified);
  
  return {
    ...competitor,
    source_count: sources.length,
    claim_count: claims.length,
    verified_count: verified.length,
  };
}

export function getAllCompetitorsWithStats(): CompetitorWithStats[] {
  return mockCompetitors
    .filter(c => !c.is_baseline)
    .map(getCompetitorStats);
}

export function getCompetitorById(id: string): Competitor | undefined {
  return mockCompetitors.find(c => c.id === id);
}

export function getSourcesByCompetitorId(competitorId: string): Source[] {
  return mockSources.filter(s => s.competitor_id === competitorId);
}

export function getClaimsByCompetitorId(competitorId: string): Claim[] {
  return mockClaims.filter(c => c.competitor_id === competitorId);
}

export function getCategoryById(id: string): ClaimCategory | undefined {
  return mockClaimCategories.find(c => c.id === id);
}

export function getSourceById(id: string): Source | undefined {
  return mockSources.find(s => s.id === id);
}

// Sort competitors: baseline first, then by tier (core -> adjacent -> contrast), then alphabetically
export function getSortedCompetitorsForMatrix(): Competitor[] {
  const tierOrder = { core: 1, adjacent: 2, contrast: 3 };
  
  return [...mockCompetitors].sort((a, b) => {
    // Baseline always first
    if (a.is_baseline) return -1;
    if (b.is_baseline) return 1;
    
    // Then by tier
    const tierDiff = tierOrder[a.tier] - tierOrder[b.tier];
    if (tierDiff !== 0) return tierDiff;
    
    // Then alphabetically
    return a.name.localeCompare(b.name);
  });
}

// Get baseline competitor
export function getBaseline(): Competitor | undefined {
  return mockCompetitors.find(c => c.is_baseline);
}
