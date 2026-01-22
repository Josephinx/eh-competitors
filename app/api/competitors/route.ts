import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { CompetitorInsert, Tag } from '@/types/database';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, website, notes, tag } = body;

    // Validation
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const validTags: Tag[] = ['core', 'adjacent', 'contrast'];
    if (!tag || !validTags.includes(tag)) {
      return NextResponse.json(
        { error: 'Valid tag is required (core, adjacent, contrast)' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    const slug = generateSlug(name);

    const competitorData: CompetitorInsert = {
      name: name.trim(),
      slug,
      website: website?.trim() || null,
      notes: notes?.trim() || null,
      tag,
      is_baseline: false,
    };

    const { data, error } = await supabase
      .from('competitors')
      .insert(competitorData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      
      // Handle unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'A competitor with this name already exists' },
          { status: 409 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create competitor' },
      { status: 500 }
    );
  }
}
