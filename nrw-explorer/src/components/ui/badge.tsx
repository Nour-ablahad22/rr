import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide', {
  variants: {
    variant: {
      default: 'bg-forest/10 text-forest',
      sand: 'bg-sand/25 text-[#6b5320]',
      solid: 'bg-forest text-white',
      light: 'bg-white/90 text-forest backdrop-blur',
      outline: 'border border-forest/20 text-forest',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
