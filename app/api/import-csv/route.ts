import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import type { 
  CompetitorInsert, 
  SourceInsert, 
  ClaimInsert,
  SourceType,
  ClaimType,
  Tag,
} from '@/types/database';

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

const VALID_SOURCE_TYPES: SourceType[] = ['website', 'whitepaper', 'press', 'social', 'other'];
const VALID_CLAIM_TYPES: ClaimType[] = ['explicit', 'implied'];
const VALID_TAGS: Tag[] = ['core', 'adjacent', 'contrast'];

interface CSVRow {
  competitor_name: string;
  competitor_website?: string;
  competitor_tag?: string;
  source_url: string;
  source_type: string;
  claim_category: string;
  claim_text: string;
  claim_type: string;
  citation?: string;
  internal_note?: string;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseCSV(content: string): { headers: string[]; rows: string[][] } {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map(line => {
    // Handle quoted values with commas inside
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ''));
    
    return values;
  });
  
  return { headers, rows };
}

function validateRow(row: CSVRow, rowIndex: number): string[] {
  const errors: string[] = [];
  
  if (!row.competitor_name) {
    errors.push(`Row ${rowIndex}: competitor_name is required`);
  }
  
  if (!row.source_url) {
    errors.push(`Row ${rowIndex}: source_url is required`);
  }
  
  if (!VALID_SOURCE_TYPES.includes(row.source_type as SourceType)) {
    errors.push(`Row ${rowIndex}: invalid source_type "${row.source_type}"`);
  }
  
  if (!VALID_CATEGORIES.includes(row.claim_category)) {
    errors.push(`Row ${rowIndex}: invalid claim_category "${row.claim_category}"`);
  }
  
  if (!row.claim_text) {
    errors.push(`Row ${rowIndex}: claim_text is required`);
  }
  
  if (!VALID_CLAIM_TYPES.includes(row.claim_type as ClaimType)) {
    errors.push(`Row ${rowIndex}: invalid claim_type "${row.claim_type}"`);
  }
  
  if (row.competitor_tag && !VALID_TAGS.includes(row.competitor_tag as Tag)) {
    errors.push(`Row ${rowIndex}: invalid competitor_tag "${row.competitor_tag}"`);
  }
  
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { csv_content } = body;

    if (!csv_content || typeof csv_content !== 'string') {
      return NextResponse.json(
        { error: 'csv_content is required' },
        { status: 400 }
      );
    }

    const { headers, rows } = parseCSV(csv_content);

    // Required columns
    const requiredColumns = [
      'competitor_name',
      'source_url',
      'source_type',
      'claim_category',
      'claim_text',
      'claim_type',
    ];

    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length > 0) {
      return NextResponse.json(
        { error: `Missing required columns: ${missingColumns.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse rows into objects
    const parsedRows: CSVRow[] = rows.map(row => {
      const obj: Record<string, string> = {};
      headers.forEach((header, i) => {
        obj[header] = row[i] || '';
      });
      return obj as unknown as CSVRow;
    });

    // Validate all rows
    const allErrors: string[] = [];
    parsedRows.forEach((row, i) => {
      const errors = validateRow(row, i + 2); // +2 for header row and 1-indexing
      allErrors.push(...errors);
    });

    if (allErrors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: allErrors },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Group by competitor
    const competitorMap = new Map<string, CSVRow[]>();
    parsedRows.forEach(row => {
      const existing = competitorMap.get(row.competitor_name) || [];
      existing.push(row);
      competitorMap.set(row.competitor_name, existing);
    });

    const stats = {
      competitors_created: 0,
      competitors_existing: 0,
      sources_created: 0,
      claims_created: 0,
    };

    // Process each competitor
    for (const [competitorName, competitorRows] of competitorMap) {
      // Check if competitor exists
      const { data: existingComp } = await supabase
        .from('competitors')
        .select('id')
        .eq('name', competitorName)
        .single();

      let competitorId: string;

      if (existingComp) {
        competitorId = existingComp.id;
        stats.competitors_existing++;
      } else {
        // Create competitor
        const firstRow = competitorRows[0];
        const competitorData: CompetitorInsert = {
          name: competitorName,
          slug: generateSlug(competitorName),
          website: firstRow.competitor_website || null,
          tag: (firstRow.competitor_tag as Tag) || 'core',
          is_baseline: false,
        };

        const { data: newComp, error: compError } = await supabase
          .from('competitors')
          .insert(competitorData)
          .select()
          .single();

        if (compError) {
          console.error('Failed to create competitor:', compError);
          continue;
        }

        competitorId = newComp.id;
        stats.competitors_created++;
      }

      // Group rows by source URL
      const sourceMap = new Map<string, CSVRow[]>();
      competitorRows.forEach(row => {
        const existing = sourceMap.get(row.source_url) || [];
        existing.push(row);
        sourceMap.set(row.source_url, existing);
      });

      // Process sources and claims
      for (const [sourceUrl, sourceRows] of sourceMap) {
        // Check if source exists
        const { data: existingSource } = await supabase
          .from('sources')
          .select('id')
          .eq('competitor_id', competitorId)
          .eq('url', sourceUrl)
          .single();

        let sourceId: string;

        if (existingSource) {
          sourceId = existingSource.id;
        } else {
          // Create source
          const firstRow = sourceRows[0];
          const sourceData: SourceInsert = {
            competitor_id: competitorId,
            url: sourceUrl,
            source_type: firstRow.source_type as SourceType,
          };

          const { data: newSource, error: srcError } = await supabase
            .from('sources')
            .insert(sourceData)
            .select()
            .single();

          if (srcError) {
            console.error('Failed to create source:', srcError);
            continue;
          }

          sourceId = newSource.id;
          stats.sources_created++;
        }

        // Create claims
        for (const row of sourceRows) {
          // Check if claim already exists (same competitor, category, claim_text)
          const { data: existingClaim } = await supabase
            .from('claims')
            .select('id')
            .eq('competitor_id', competitorId)
            .eq('category', row.claim_category)
            .eq('claim_text', row.claim_text)
            .single();

          if (existingClaim) {
            continue; // Skip duplicate
          }

          const claimData: ClaimInsert = {
            competitor_id: competitorId,
            source_id: sourceId,
            category: row.claim_category,
            claim_text: row.claim_text,
            claim_type: row.claim_type as ClaimType,
            citation: row.citation || null,
            internal_note: row.internal_note || null,
            status: 'pending',
            verified: false,
          };

          const { error: claimError } = await supabase
            .from('claims')
            .insert(claimData);

          if (claimError) {
            console.error('Failed to create claim:', claimError);
            continue;
          }

          stats.claims_created++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to import CSV' },
      { status: 500 }
    );
  }
}
