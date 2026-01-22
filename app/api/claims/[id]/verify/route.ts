import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { verified, verified_by } = body;

    if (typeof verified !== 'boolean') {
      return NextResponse.json(
        { error: 'verified boolean is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if claim exists
    const { data: existing, error: fetchError } = await supabase
      .from('claims')
      .select('id, verified')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Claim not found' },
        { status: 404 }
      );
    }

    // Update verified status
    const { data, error } = await supabase
      .from('claims')
      .update({
        verified,
        verified_by: verified ? (verified_by || 'User') : null,
        status: verified ? 'verified' : 'pending',
        updated_at: new Date().toISOString(),
      })
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
      { error: 'Failed to update verification status' },
      { status: 500 }
    );
  }
}
