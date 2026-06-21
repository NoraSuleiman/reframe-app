import { Link } from 'react-router-dom';

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={className} aria-label="ReFrame — home">
      <span className="flex items-center gap-2">
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden>
          <g fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="6" width="8.5" height="8.5" />
            <rect x="17.5" y="6" width="8.5" height="8.5" />
            <rect x="6" y="17.5" width="8.5" height="8.5" />
            <rect x="17.5" y="17.5" width="8.5" height="8.5" className="text-clay" stroke="#9C5B3B" />
          </g>
        </svg>
        <span className="font-display text-h5 font-semibold tracking-tight">ReFrame</span>
      </span>
    </Link>
  );
}
