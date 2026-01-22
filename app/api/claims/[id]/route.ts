import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { ClaimType, ClaimStatus } from '@/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      category, 
      claim_text, 
      claim_type,
      citation,
      status,
      internal_note,
      source_id,
      source_url,
      verbatim_quote,
    } = body;

    const supabase = createServerClient();

    // Check if claim exists
    const { data: existing, error: fetchError } = await supabase
      .from('claims')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (category !== undefined) {
      if (!VALID_CATEGORIES.includes(category)) {
        return NextResponse.json(
          { error: 'Invalid category' },
          { status: 400 }
        );
      }
      updateData.category = category;
    }

    if (claim_text !== undefined) {
      updateData.claim_text = claim_text.trim();
    }

    if (claim_type !== undefined) {
      const validClaimTypes: ClaimType[] = ['explicit', 'implied'];
      if (!validClaimTypes.includes(claim_type)) {
        return NextResponse.json(
          { error: 'Invalid claim_type' },
          { status: 400 }
        );
      }
      updateData.claim_type = claim_type;
    }

    if (status !== undefined) {
      const validStatuses: ClaimStatus[] = ['pending', 'verified', 'rejected'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
      
      // Update verified boolean based on status
      updateData.verified = status === 'verified';
      if (status !== 'verified') {
        updateData.verified_by = null;
      }
    }

    if (citation !== undefined) {
      updateData.citation = citation?.trim() || null;
    }

    if (internal_note !== undefined) {
      updateData.internal_note = internal_note?.trim() || null;
    }

    if (source_id !== undefined) {
      updateData.source_id = source_id || null;
    }

    if (source_url !== undefined) {
      updateData.source_url = source_url?.trim() || null;
    }

    if (verbatim_quote !== undefined) {
      updateData.verbatim_quote = verbatim_quote?.trim() || null;
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}

// PATCH method for partial updates (used by ClaimDetailModal)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { 
      claim_text, 
      source_url,
      verbatim_quote,
    } = body;

    const supabase = createServerClient();

    // Check if claim exists
    const { data: existing, error: fetchError } = await supabase
      .from('claims')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (claim_text !== undefined) {
      updateData.claim_text = claim_text.trim();
    }

    if (source_url !== undefined) {
      updateData.source_url = source_url?.trim() || null;
    }

    if (verbatim_quote !== undefined) {
      updateData.verbatim_quote = verbatim_quote?.trim() || null;
    }

    const { data, error } = await supabase
      .from('claims')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to update claim' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // Check if claim exists
    const { data: existing, error: fetchError } = await supabase
      .from('claims')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    const { error } = await supabase
      .from('claims')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to delete claim' },
      { status: 500 }
    );
  }
}
