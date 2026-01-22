import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { CompetitorUpdate, Tag } from '@/types/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, website, notes, tag } = body;

    const supabase = createServerClient();

    // Check if competitor exists and is not baseline
    const { data: existing, error: fetchError } = await supabase
      .from('competitors')
      .select('is_baseline')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    if (existing.is_baseline) {
      return NextResponse.json(
        { error: 'Cannot modify baseline competitor' },
        { status: 403 }
      );
    }

    // Build update object
    const updateData: CompetitorUpdate = {
      updated_at: new Date().toISOString(),
    };

    if (name !== undefined) {
      updateData.name = name.trim();
      updateData.slug = generateSlug(name);
    }
    if (website !== undefined) {
      updateData.website = website?.trim() || null;
    }
    if (notes !== undefined) {
      updateData.notes = notes?.trim() || null;
    }
    if (tag !== undefined) {
      const validTags: Tag[] = ['core', 'adjacent', 'contrast'];
      if (!validTags.includes(tag)) {
        return NextResponse.json(
          { error: 'Invalid tag value' },
          { status: 400 }
        );
      }
      updateData.tag = tag;
    }

    const { data, error } = await supabase
      .from('competitors')
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
      { error: 'Failed to update competitor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = createServerClient();

    // Check if competitor exists and is not baseline
    const { data: existing, error: fetchError } = await supabase
      .from('competitors')
      .select('is_baseline')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Competitor not found' },
        { status: 404 }
      );
    }

    if (existing.is_baseline) {
      return NextResponse.json(
        { error: 'Cannot delete baseline competitor' },
        { status: 403 }
      );
    }

    // Delete will cascade to sources and claims (via FK constraints)
    const { error } = await supabase
      .from('competitors')
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
      { error: 'Failed to delete competitor' },
      { status: 500 }
    );
  }
}
