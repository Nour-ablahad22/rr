import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-forest text-white shadow-soft hover:bg-forest-800 hover:shadow-lift',
        accent: 'bg-sand text-ink hover:bg-sand-dark hover:text-white',
        outline: 'border border-forest/25 bg-white/70 text-forest hover:border-forest hover:bg-forest hover:text-white',
        ghost: 'text-ink hover:bg-forest/5 hover:text-forest',
        light: 'bg-white/95 text-forest shadow-soft hover:bg-white',
        glass: 'border border-white/40 bg-white/10 text-white backdrop-blur-md hover:bg-white/20',
        link: 'text-forest underline-offset-4 hover:underline rounded-none px-0',
      },
      size: {
        default: 'h-11 px-5',
        sm: 'h-9 px-4 text-[13px]',
        lg: 'h-12 px-7 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };
