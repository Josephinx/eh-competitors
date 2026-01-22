import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ClaimInsert, ClaimType, ClaimStatus } from '@/types/database';

const VALID_CATEGORIES = [
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      competitor_id, 
      source_id, 
      category, 
      claim_text, 
      claim_type,
      citation,
      internal_note,
      source_url,
      verbatim_quote,
    } = body;

    // Validation
    if (!competitor_id) {
      return NextResponse.json(
        { error: 'competitor_id is required' },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: 'Valid category is required' },
        { status: 400 }
      );
    }

    if (!claim_text || typeof claim_text !== 'string') {
      return NextResponse.json(
        { error: 'claim_text is required' },
        { status: 400 }
      );
    }

    const validClaimTypes: ClaimType[] = ['explicit', 'implied'];
    if (!claim_type || !validClaimTypes.includes(claim_type)) {
      return NextResponse.json(
        { error: 'Valid claim_type is required (explicit, implied)' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Verify competitor exists
    const { data: competitor, error: compError } = await supabase
      .from('competitors')
      .select('id')
      .eq('id', competitor_id)
      .single();

    if (compError || !competitor) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    // Verify source exists if provided
    if (source_id) {
      const { data: source, error: srcError } = await supabase
        .from('sources')
        .select('id')
        .eq('id', source_id)
        .single();

      if (srcError || !source) {
        return NextResponse.json(
          { error: 'Source not found' },
          { status: 404 }
        );
      }
    }

    const claimData: ClaimInsert = {
      competitor_id,
      source_id: source_id || null,
      category,
      claim_text: claim_text.trim(),
      claim_type,
      citation: citation?.trim() || null,
      internal_note: internal_note?.trim() || null,
      source_url: source_url?.trim() || null,
      verbatim_quote: verbatim_quote?.trim() || null,
      status: 'pending',
      verified: false,
    };

    const { data, error } = await supabase
      .from('claims')
      .insert(claimData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create claim' },
      { status: 500 }
    );
  }
}
