'use client';

import { cn } from '@/lib/utils';
import type { Tag } from '@/types/database';

interface TierBadgeProps {
  tier: Tag;
  className?: string;
}

export function TierBadge({ tier, className }: TierBadgeProps) {
  const variants = {
    core: 'bg-tier-core text-white',
    adjacent: 'bg-tier-adjacent text-white',
    contrast: 'bg-transparent text-primary border border-primary',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-semibold uppercase rounded-sm',
        variants[tier],
        className
      )}
    >
      {tier}
    </span>
  );
}

interface CategoryBadgeProps {
  name: string;
  className?: string;
}

export function CategoryBadge({ name, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs font-medium text-text-secondary bg-bg-app rounded',
        className
      )}
    >
      {name}
    </span>
  );
}

interface SourceTypeBadgeProps {
  type: string;
  className?: string;
}

export function SourceTypeBadge({ type, className }: SourceTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-xs text-text-muted bg-bg-app rounded',
        className
      )}
    >
      {type}
    </span>
  );
}
