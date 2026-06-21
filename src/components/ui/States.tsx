import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-5 w-5 animate-spin text-stone', className)}
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.2" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  );
}

export function LoadingBlock({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-24 text-stone">
      <Spinner />
      <span className="text-body-sm">{label}</span>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-surface px-6 py-16 text-center',
        className,
      )}
    >
      <h3 className="font-display text-h5 text-graphite">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-body-sm text-stone">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
