import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'clay' | 'moss' | 'glazing' | 'substructure' | 'shading' | 'outline';

const tones: Record<Tone, string> = {
  neutral: 'bg-sand text-graphite',
  clay: 'bg-clay-tint text-clay-deep',
  moss: 'bg-moss-tint text-moss',
  glazing: 'bg-family-glazing/20 text-[#3f5a59]',
  substructure: 'bg-family-substructure/20 text-[#4a4f53]',
  shading: 'bg-family-shading/20 text-[#5e5132]',
  outline: 'bg-transparent text-stone border border-hairline-strong',
};

interface BadgeProps {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ tone = 'neutral', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-mono text-micro uppercase tracking-label',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
