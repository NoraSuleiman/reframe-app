import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

const fieldBase =
  'w-full rounded border border-hairline-strong bg-surface-raised px-3 text-body text-ink placeholder:text-mute focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(fieldBase, 'h-11', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(fieldBase, 'min-h-[96px] py-2.5', className)} {...props} />
));
Textarea.displayName = 'Textarea';

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function Field({ label, htmlFor, hint, error, required, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="block text-body-sm font-medium text-graphite">
        {label}
        {required && <span className="text-clay"> *</span>}
      </label>
      {children}
      {hint && !error && <p className="text-caption text-stone">{hint}</p>}
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  );
}
