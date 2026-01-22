'use client';

import Link from 'next/link';
import { ExternalLink, FileText, MessageSquare, CheckCircle, Trash2 } from 'lucide-react';
import { TierBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { CompetitorWithStats } from '@/types/database';
import { extractDomain } from '@/lib/utils';

interface CompetitorCardProps {
  competitor: CompetitorWithStats;
  onDelete?: (id: string) => void;
}

export function CompetitorCard({ competitor, onDelete }: CompetitorCardProps) {
  return (
    <div className="card flex flex-col group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h3 className="font-semibold text-text-primary uppercase tracking-wide text-sm">
            {competitor.name}
          </h3>
          <TierBadge tier={competitor.tag} />
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(competitor.id)}
            className="p-1.5 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-md transition-all duration-150 opacity-0 group-hover:opacity-100"
            title="Delete competitor"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Website URL */}
      {competitor.website && (
        <a
          href={competitor.website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-4 w-fit"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-text-muted" />
          {extractDomain(competitor.website)}
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Stats */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <div className="stat-pill">
          <FileText className="w-3.5 h-3.5 text-text-muted" />
          <span>{competitor.source_count} sources</span>
        </div>
        <div className="stat-pill">
          <MessageSquare className="w-3.5 h-3.5 text-text-muted" />
          <span>{competitor.claim_count} claims</span>
        </div>
        <div className="stat-pill">
          <CheckCircle className="w-3.5 h-3.5 text-status-success" />
          <span>{competitor.verified_count}/{competitor.claim_count} verified</span>
        </div>
      </div>

      {/* Action */}
      <Link href={`/competitors/${competitor.id}`} className="mt-auto">
        <Button variant="secondary" className="w-full">
          View Details
        </Button>
      </Link>
    </div>
  );
}
