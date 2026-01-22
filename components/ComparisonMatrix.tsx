'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, AlertTriangle, ExternalLink, Quote } from 'lucide-react';
import { TierBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Competitor, Claim, Tag } from '@/types/database';
import { PRIORITY_CATEGORIES } from '@/types/database';

interface ComparisonMatrixProps {
  competitors: Competitor[];
  categories: string[];
  claims: Claim[];
  tierFilters: Tag[];
  onTierFilterChange: (tiers: Tag[]) => void;
  onClaimClick?: (claim: Claim) => void;
}

interface PopoverPosition {
  top: number;
  left: number;
}

export function ComparisonMatrix({
  competitors,
  categories,
  claims,
  tierFilters,
  onTierFilterChange,
  onClaimClick,
}: ComparisonMatrixProps) {
  const [hoveredClaim, setHoveredClaim] = useState<Claim | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter competitors based on tier selection (baseline always shown)
  const filteredCompetitors = competitors.filter(
    c => c.is_baseline || tierFilters.includes(c.tag)
  );

  // Get claim for a specific competitor and category
  const getClaim = (competitorId: string, category: string): Claim | undefined => {
    return claims.find(
      c => c.competitor_id === competitorId && c.category === category
    );
  };

  // Check if category is priority
  const isPriorityCategory = (category: string): boolean => {
    return PRIORITY_CATEGORIES.includes(category as typeof PRIORITY_CATEGORIES[number]);
  };

  // Toggle tier filter
  const toggleTier = (tier: Tag) => {
    if (tierFilters.includes(tier)) {
      onTierFilterChange(tierFilters.filter(t => t !== tier));
    } else {
      onTierFilterChange([...tierFilters, tier]);
    }
  };

  // Handle cell hover
  const handleCellHover = (claim: Claim | undefined, event: React.MouseEvent) => {
    if (!claim || (!claim.source_url && !claim.verbatim_quote)) {
      setHoveredClaim(null);
      return;
    }

    const cell = event.currentTarget as HTMLElement;
    const container = containerRef.current;
    if (!container) return;

    const cellRect = cell.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Position popover below the cell, aligned to left edge
    let left = cellRect.left - containerRect.left;
    let top = cellRect.bottom - containerRect.top + 8;

    // Ensure popover doesn't go off right edge
    const popoverWidth = 320;
    if (left + popoverWidth > containerRect.width) {
      left = containerRect.width - popoverWidth - 16;
    }

    setPopoverPosition({ top, left });
    setHoveredClaim(claim);
  };

  const handleCellLeave = () => {
    setHoveredClaim(null);
  };

  // Check if claim has extra details
  const hasDetails = (claim: Claim | undefined): boolean => {
    return !!(claim && (claim.source_url || claim.verbatim_quote));
  };

  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      {/* Legend and filters */}
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="w-2 h-4 bg-primary rounded-sm" />
          <span>Escape Hatch baseline</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <AlertTriangle className="w-3 h-3 text-primary" />
          <span>Priority comparison category</span>
        </div>
        
        {/* Tier filters */}
        <div className="flex items-center gap-2 ml-auto">
          {(['core', 'adjacent', 'contrast'] as Tag[]).map(tier => (
            <button
              key={tier}
              onClick={() => toggleTier(tier)}
              className={cn(
                'px-3 py-1 text-xs font-medium uppercase rounded transition-colors',
                tierFilters.includes(tier)
                  ? tier === 'core'
                    ? 'bg-tier-core text-white'
                    : tier === 'adjacent'
                    ? 'bg-tier-adjacent text-white'
                    : 'bg-transparent text-primary border border-primary'
                  : 'bg-bg-card text-text-muted border border-border'
              )}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix table */}
      <div className="flex-1 overflow-auto scrollbar-thin border border-border rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {/* Category header */}
              <th className="matrix-header text-left min-w-[200px] sticky left-0 z-20 bg-matrix-header">
                CATEGORY
              </th>
              
              {/* Competitor headers */}
              {filteredCompetitors.map(competitor => (
                <th
                  key={competitor.id}
                  className={cn(
                    'matrix-header text-left min-w-[180px]',
                    competitor.is_baseline && 'border-l-2 border-r-2 border-l-primary border-r-primary'
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-primary uppercase text-xs">
                        {competitor.name}
                      </span>
                      {competitor.is_baseline ? (
                        <span className="text-[10px] text-primary font-medium">BASELINE</span>
                      ) : (
                        <TierBadge tier={competitor.tag} className="text-[10px]" />
                      )}
                    </div>
                    {!competitor.is_baseline && (
                      <span className="text-[10px] text-text-muted">
                        {claims.filter(c => c.competitor_id === competitor.id && c.verified).length}/
                        {claims.filter(c => c.competitor_id === competitor.id).length} verified
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map(category => {
              const isPriority = isPriorityCategory(category);
              
              return (
                <tr
                  key={category}
                  className={cn(
                    isPriority && 'bg-matrix-priority'
                  )}
                >
                  {/* Category cell */}
                  <td className={cn(
                    'matrix-category',
                    isPriority && 'bg-matrix-priority'
                  )}>
                    <div className="flex items-start gap-2">
                      {isPriority && (
                        <AlertTriangle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-text-primary text-sm">
                        {category}
                      </span>
                    </div>
                  </td>
                  
                  {/* Claim cells */}
                  {filteredCompetitors.map(competitor => {
                    const claim = getClaim(competitor.id, category);
                    const claimHasDetails = hasDetails(claim);
                    
                    return (
                      <td
                        key={`${competitor.id}-${category}`}
                        className={cn(
                          'matrix-cell',
                          competitor.is_baseline && 'border-l-2 border-r-2 border-l-primary border-r-primary bg-primary-light/30',
                          claim && 'cursor-pointer hover:bg-bg-card-hover'
                        )}
                        onMouseEnter={(e) => handleCellHover(claim, e)}
                        onMouseLeave={handleCellLeave}
                        onClick={() => claim && onClaimClick?.(claim)}
                      >
                        {claim ? (
                          <div className="flex items-start gap-1">
                            {claim.verified && (
                              <Check className="w-3 h-3 text-status-success mt-0.5 flex-shrink-0" />
                            )}
                            <span className="text-sm text-text-primary">
                              {claim.claim_text}
                            </span>
                            {claimHasDetails && (
                              <span className="text-primary ml-1">•</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Hover Popover */}
      {hoveredClaim && (hoveredClaim.source_url || hoveredClaim.verbatim_quote) && (
        <div
          ref={popoverRef}
          className="absolute z-50 w-80 bg-bg-modal border border-border rounded-lg shadow-lg p-4 pointer-events-auto"
          style={{
            top: popoverPosition.top,
            left: popoverPosition.left,
          }}
          onMouseEnter={() => setHoveredClaim(hoveredClaim)}
          onMouseLeave={handleCellLeave}
        >
          {/* Source URL */}
          {hoveredClaim.source_url && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1.5">
                <ExternalLink className="w-3 h-3" />
                Source
              </div>
              <a
                href={hoveredClaim.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:text-primary-hover hover:underline break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {hoveredClaim.source_url}
              </a>
            </div>
          )}

          {/* Verbatim Quote */}
          {hoveredClaim.verbatim_quote && (
            <div>
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1.5">
                <Quote className="w-3 h-3" />
                Verbatim Quote
              </div>
              <blockquote className="text-sm text-text-secondary italic border-l-2 border-primary pl-3">
                "{hoveredClaim.verbatim_quote}"
              </blockquote>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
