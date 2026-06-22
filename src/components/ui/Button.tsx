import { forwardRef } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-medium rounded transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap select-none';

const variants: Record<Variant, string> = {
  // Editorial: solid ink primary (the "black pill" idea, recoloured to warm ink), squared-soft
  primary: 'bg-ink text-white hover:bg-graphite',
  secondary: 'bg-transparent text-ink border border-hairline-strong hover:bg-sand',
  ghost: 'bg-transparent text-graphite hover:bg-sand',
  accent: 'bg-clay text-white hover:bg-clay-deep',
  danger: 'bg-transparent text-danger border border-danger/40 hover:bg-danger/10',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-body-sm',
  md: 'h-11 px-5 text-body-sm',
  lg: 'h-12 px-7 text-body',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
);
Button.displayName = 'Button';

interface ButtonLinkProps extends LinkProps {
  variant?: Variant;
  size?: Size;
}

export function ButtonLink({ variant = 'primary', size = 'md', className, ...props }: ButtonLinkProps) {
  return <Link className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}
