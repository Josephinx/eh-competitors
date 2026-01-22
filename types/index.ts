// Core entity types

export type Tier = 'core' | 'adjacent' | 'contrast';
export type SourceType = 'website' | 'whitepaper' | 'press' | 'social' | 'other';
export type ClaimType = 'explicit' | 'implied';

export interface Competitor {
  id: string;
  name: string;
  slug: string;
  website_url: string | null;
  tier: Tier;
  is_baseline: boolean;
  created_at: string;
  updated_at: string;
}

export interface Source {
  id: string;
  competitor_id: string;
  url: string;
  source_type: SourceType;
  title: string | null;
  created_at: string;
}

export interface ClaimCategory {
  id: string;
  name: string;
  slug: string;
  priority: boolean;
  sort_order: number;
}

export interface Claim {
  id: string;
  competitor_id: string;
  source_id: string | null;
  category_id: string;
  claim_text: string;
  claim_type: ClaimType;
  verified: boolean;
  verified_by: string | null;
  citation: string | null;
  internal_note: string | null;
  created_at: string;
  updated_at: string;
}

// Derived/computed types

export interface CompetitorWithStats extends Competitor {
  source_count: number;
  claim_count: number;
  verified_count: number;
}

export interface MatrixCell {
  category_id: string;
  category_name: string;
  category_priority: boolean;
  competitor_id: string;
  competitor_name: string;
  tier: Tier;
  is_baseline: boolean;
  claim_id: string | null;
  claim_text: string | null;
  verified: boolean;
}

// Export types

export type ExportTab = 'investor' | 'visual' | 'fulltext' | 'csv';

export interface ExportModalState {
  isOpen: boolean;
  activeTab: ExportTab;
}

// Form types

export interface AddCompetitorForm {
  name: string;
  website_url: string;
  tier: Tier;
}

export interface AddSourceForm {
  url: string;
  source_type: SourceType;
}

export interface AddClaimForm {
  category_id: string;
  claim_text: string;
  claim_type: ClaimType;
  source_id?: string;
}
