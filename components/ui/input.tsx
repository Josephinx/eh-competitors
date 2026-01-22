'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'login';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseStyles = 'w-full px-3 py-2 text-sm rounded-md transition-colors focus:outline-none';
    
    const variants = {
      default: 'bg-bg-input border border-border text-text-primary placeholder:text-text-muted focus:border-border-focus',
      login: 'bg-white border border-primary/50 text-text-inverse placeholder:text-text-muted focus:border-primary',
    };

    return (
      <input
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
