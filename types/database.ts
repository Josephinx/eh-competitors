// Database types for Supabase
// Generated from confirmed schema

export type Tag = 'core' | 'adjacent' | 'contrast';
export type SourceType = 'website' | 'whitepaper' | 'press' | 'social' | 'other';
export type ClaimType = 'explicit' | 'implied';
export type ClaimStatus = 'pending' | 'verified' | 'rejected';

export interface Database {
  public: {
    Tables: {
      competitors: {
        Row: {
          id: string;
          name: string;
          slug: string;
          website: string | null;
          notes: string | null;
          tag: Tag;
          is_baseline: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          website?: string | null;
          notes?: string | null;
          tag: Tag;
          is_baseline?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          website?: string | null;
          notes?: string | null;
          tag?: Tag;
          is_baseline?: boolean;
          updated_at?: string;
        };
      };
      sources: {
        Row: {
          id: string;
          competitor_id: string;
          url: string;
          source_type: SourceType;
          captured_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          url: string;
          source_type: SourceType;
          captured_at?: string;
        };
        Update: {
          id?: string;
          competitor_id?: string;
          url?: string;
          source_type?: SourceType;
          captured_at?: string;
        };
      };
      claims: {
        Row: {
          id: string;
          competitor_id: string;
          source_id: string | null;
          category: string;
          claim_text: string;
          claim_type: ClaimType;
          citation: string | null;
          source_url: string | null;
          verbatim_quote: string | null;
          status: ClaimStatus;
          internal_note: string | null;
          verified: boolean;
          verified_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          competitor_id: string;
          source_id?: string | null;
          category: string;
          claim_text: string;
          claim_type: ClaimType;
          citation?: string | null;
          source_url?: string | null;
          verbatim_quote?: string | null;
          status?: ClaimStatus;
          internal_note?: string | null;
          verified?: boolean;
          verified_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          competitor_id?: string;
          source_id?: string | null;
          category?: string;
          claim_text?: string;
          claim_type?: ClaimType;
          citation?: string | null;
          source_url?: string | null;
          verbatim_quote?: string | null;
          status?: ClaimStatus;
          internal_note?: string | null;
          verified?: boolean;
          verified_by?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      tag: Tag;
      source_type: SourceType;
      claim_type: ClaimType;
      claim_status: ClaimStatus;
    };
  };
}

// Convenience types
export type Competitor = Database['public']['Tables']['competitors']['Row'];
export type CompetitorInsert = Database['public']['Tables']['competitors']['Insert'];
export type CompetitorUpdate = Database['public']['Tables']['competitors']['Update'];

export type Source = Database['public']['Tables']['sources']['Row'];
export type SourceInsert = Database['public']['Tables']['sources']['Insert'];
export type SourceUpdate = Database['public']['Tables']['sources']['Update'];

export type Claim = Database['public']['Tables']['claims']['Row'];
export type ClaimInsert = Database['public']['Tables']['claims']['Insert'];
export type ClaimUpdate = Database['public']['Tables']['claims']['Update'];

// Extended types with relations
export interface CompetitorWithStats extends Competitor {
  source_count: number;
  claim_count: number;
  verified_count: number;
}

export interface CompetitorWithRelations extends Competitor {
  sources: Source[];
  claims: Claim[];
}

// Matrix data type
export interface MatrixCell {
  category: string;
  competitor_id: string;
  competitor_name: string;
  tag: Tag;
  is_baseline: boolean;
  claim_id: string | null;
  claim_text: string | null;
  verified: boolean;
}

// Claim categories (stored as text, but these are the standard values)
export const CLAIM_CATEGORIES = [
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
] as const;

export const PRIORITY_CATEGORIES = [
  'Custody model',
  'Rehypothecation or collateral reuse',
  'Margin calls or liquidation triggers',
  'Term length',
  'Repayment requirements',
  'Availability for Australian customers',
] as const;

export type ClaimCategory = typeof CLAIM_CATEGORIES[number];

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count?: number;
  page?: number;
  pageSize?: number;
}
