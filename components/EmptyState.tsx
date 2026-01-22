'use client';

import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: typeof FileText;
  title: string;
  description?: string;
  className?: string;
}

export function EmptyState({ 
  icon: Icon = FileText, 
  title, 
  description, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center',
      className
    )}>
      <div className="w-12 h-12 mb-4 text-text-muted">
        <Icon className="w-full h-full" />
      </div>
      <h3 className="text-sm font-medium text-text-secondary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-text-muted max-w-[200px]">
          {description}
        </p>
      )}
    </div>
  );
}
