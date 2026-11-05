import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      'flex h-11 w-full rounded-full border border-input bg-white px-4 text-sm text-ink placeholder:text-ink-muted/80 transition focus-visible:border-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/20 disabled:opacity-50',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
