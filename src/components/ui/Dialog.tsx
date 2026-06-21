import * as RDialog from '@radix-ui/react-dialog';
import { cn } from '@/lib/cn';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, className }: DialogProps) {
  return (
    <RDialog.Root open={open} onOpenChange={onOpenChange}>
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm data-[state=open]:animate-in" />
        <RDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-hairline bg-surface-raised p-6 shadow-overlay focus:outline-none',
            className,
          )}
        >
          <RDialog.Title className="font-display text-h4">{title}</RDialog.Title>
          {description && (
            <RDialog.Description className="mt-1 text-body-sm text-stone">
              {description}
            </RDialog.Description>
          )}
          <div className="mt-4">{children}</div>
          <RDialog.Close
            className="absolute right-4 top-4 rounded p-1 text-stone hover:bg-sand"
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </RDialog.Close>
        </RDialog.Content>
      </RDialog.Portal>
    </RDialog.Root>
  );
}
