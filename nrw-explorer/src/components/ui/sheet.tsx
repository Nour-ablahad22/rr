import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export const SheetTitle = DialogPrimitive.Title;
export const SheetDescription = DialogPrimitive.Description;

type Side = 'left' | 'right' | 'bottom' | 'top';
const sideClasses: Record<Side, string> = {
  right: 'inset-y-0 right-0 h-full w-[88%] max-w-sm border-l data-[state=open]:slide-in-from-right',
  left: 'inset-y-0 left-0 h-full w-[88%] max-w-sm border-r data-[state=open]:slide-in-from-left',
  bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-3xl border-t data-[state=open]:slide-in-from-bottom',
  top: 'inset-x-0 top-0 border-b data-[state=open]:slide-in-from-top',
};

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { side?: Side; hideClose?: boolean }
>(({ side = 'right', className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-[1200] bg-ink/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed z-[1201] flex flex-col bg-ivory shadow-lift duration-300 data-[state=open]:animate-in',
        sideClasses[side],
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className="absolute right-4 top-4 rounded-full p-2 text-ink-muted transition hover:bg-forest/5 hover:text-forest"
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = 'SheetContent';

export const Dialog = DialogPrimitive.Root;
export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { overlayClassName?: string }
>(({ className, overlayClassName, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay
      className={cn('fixed inset-0 z-[1200] bg-ink/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0', overlayClassName)}
    />
    <DialogPrimitive.Content ref={ref} className={cn('fixed z-[1201] focus:outline-none', className)} {...props}>
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = 'DialogContent';
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
export const DialogClose = DialogPrimitive.Close;
