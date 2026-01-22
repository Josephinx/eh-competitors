import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { SourceInsert, SourceType } from '@/types/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitor_id, url, source_type } = body;

    // Validation
    if (!competitor_id) {
      return NextResponse.json(
        { error: 'competitor_id is required' },
        { status: 400 }
      );
    }

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const validSourceTypes: SourceType[] = ['website', 'whitepaper', 'press', 'social', 'other'];
    if (!source_type || !validSourceTypes.includes(source_type)) {
      return NextResponse.json(
        { error: 'Valid source_type is required (website, whitepaper, press, social, other)' },
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

    const sourceData: SourceInsert = {
      competitor_id,
      url: url.trim(),
      source_type,
    };

    const { data, error } = await supabase
      .from('sources')
      .insert(sourceData)
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
      { error: 'Failed to create source' },
      { status: 500 }
    );
  }
}
