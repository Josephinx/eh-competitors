// Data access layer for Supabase queries
// Uses anon key for read operations (client-safe)

import { createClient } from './client';
import type { 
  Competitor, 
  CompetitorWithStats, 
  Source, 
  Claim,
  Tag,
  CLAIM_CATEGORIES,
} from '@/types/database';

// ============================================
// COMPETITORS
// ============================================

export async function fetchCompetitors(): Promise<CompetitorWithStats[]> {
  const supabase = createClient();
  
  // Fetch competitors with counts via separate queries
  const { data: competitors, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('is_baseline', false)
    .order('name');

  if (error) throw new Error(error.message);
  if (!competitors) return [];

  // Fetch counts for each competitor
  const competitorsWithStats = await Promise.all(
    competitors.map(async (comp) => {
      const [sourcesRes, claimsRes] = await Promise.all([
        supabase
          .from('sources')
          .select('id', { count: 'exact', head: true })
          .eq('competitor_id', comp.id),
        supabase
          .from('claims')
          .select('id, verified')
          .eq('competitor_id', comp.id),
      ]);

      const claims = claimsRes.data || [];
      const verifiedCount = claims.filter((c) => c.verified).length;

      return {
        ...comp,
        source_count: sourcesRes.count || 0,
        claim_count: claims.length,
        verified_count: verifiedCount,
      };
    })
  );

  return competitorsWithStats;
}

export async function fetchCompetitorById(id: string): Promise<Competitor | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }
  
  return data;
}

export async function fetchBaseline(): Promise<Competitor | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('competitors')
    .select('*')
    .eq('is_baseline', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
}

// ============================================
// SOURCES
// ============================================

export async function fetchSourcesByCompetitorId(competitorId: string): Promise<Source[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('captured_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchSourceById(id: string): Promise<Source | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('sources')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
}

// ============================================
// CLAIMS
// ============================================

export async function fetchClaimsByCompetitorId(competitorId: string): Promise<Claim[]> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('category')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchClaimById(id: string): Promise<Claim | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('claims')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(error.message);
  }
  
  return data;
}

// ============================================
// COMPARISON MATRIX
// ============================================

export interface MatrixData {
  competitors: Competitor[];
  claims: Claim[];
  categories: string[];
}

export async function fetchMatrixData(tierFilters?: Tag[]): Promise<MatrixData> {
  const supabase = createClient();
  
  // Fetch all competitors (baseline + filtered by tier)
  let competitorsQuery = supabase
    .from('competitors')
    .select('*')
    .order('is_baseline', { ascending: false }); // Baseline first

  if (tierFilters && tierFilters.length > 0) {
    // Include baseline OR competitors matching tier filter
    competitorsQuery = supabase
      .from('competitors')
      .select('*')
      .or(`is_baseline.eq.true,tag.in.(${tierFilters.join(',')})`)
      .order('is_baseline', { ascending: false });
  }

  const { data: competitors, error: compError } = await competitorsQuery;
  if (compError) throw new Error(compError.message);

  // Fetch all claims for these competitors
  const competitorIds = (competitors || []).map((c) => c.id);
  
  const { data: claims, error: claimsError } = await supabase
    .from('claims')
    .select('*')
    .in('competitor_id', competitorIds);

  if (claimsError) throw new Error(claimsError.message);

  // Sort competitors: baseline first, then by tier (core -> adjacent -> contrast), then alphabetically
  const tierOrder: Record<Tag, number> = { core: 1, adjacent: 2, contrast: 3 };
  const sortedCompetitors = (competitors || []).sort((a, b) => {
    if (a.is_baseline) return -1;
    if (b.is_baseline) return 1;
    const tierDiff = tierOrder[a.tag as Tag] - tierOrder[b.tag as Tag];
    if (tierDiff !== 0) return tierDiff;
    return a.name.localeCompare(b.name);
  });

  // Get unique categories from claims, or use default list
  const categories = [
    'Custody model',
    'Rehypothecation or collateral reuse',
    'Margin calls or liquidation triggers',
    'Term length',
    'Repayment requirements',
    'Drawdown mechanics',
    'Loan currency',
    'Availability for Australian customers',
    'Eligibility or KYC constraints',
    'Insurance or guarantees',
    'Jurisdiction and legal posture',
    'Custody and security claims',
    'Product structure',
  ];

  return {
    competitors: sortedCompetitors,
    claims: claims || [],
    categories,
  };
}

// ============================================
// AGGREGATED STATS
// ============================================

export async function fetchDashboardStats(): Promise<{
  totalCompetitors: number;
  totalSources: number;
  totalClaims: number;
  verifiedClaims: number;
}> {
  const supabase = createClient();

  const [competitorsRes, sourcesRes, claimsRes] = await Promise.all([
    supabase.from('competitors').select('id', { count: 'exact', head: true }).eq('is_baseline', false),
    supabase.from('sources').select('id', { count: 'exact', head: true }),
    supabase.from('claims').select('id, verified'),
  ]);

  const claims = claimsRes.data || [];
  const verifiedClaims = claims.filter((c) => c.verified).length;

  return {
    totalCompetitors: competitorsRes.count || 0,
    totalSources: sourcesRes.count || 0,
    totalClaims: claims.length,
    verifiedClaims,
  };
}
