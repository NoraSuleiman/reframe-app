import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { Logo } from './Logo';

import { usePaletteStore } from '@/store/palette';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/cn';

const NAV_LINKS = [
  { to: '/marketplace', label: 'Marketplace' },
  { to: '/builder', label: '3D Builder' },
];

export function Nav() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const paletteCount = usePaletteStore((s) => s.items.length);
  const cartCount = useCartStore((s) => s.items.length);
  const profile = useAuthStore((s) => s.profile);
  const signOut = useAuthStore((s) => s.signOut);

  function onSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(`/marketplace?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-paper/85 backdrop-blur">
      <div className="container-content flex h-16 items-center gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded px-3 py-2 text-body-sm font-medium transition-colors',
                  isActive ? 'text-ink' : 'text-stone hover:text-ink',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-xs flex-1 md:block">
          <div className="relative">
            <svg
              viewBox="0 0 16 16"
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone"
            >
              <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              <path d="M11 11l4 4" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search materials…"
              aria-label="Search materials"
              className="h-10 w-full rounded-full border border-hairline bg-surface pl-9 pr-3 text-body-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <IndicatorLink to="/palette" label="Palette" count={paletteCount} icon="palette" />
          <IndicatorLink to="/cart" label="Cart" count={cartCount} icon="cart" />

          {profile?.role === 'admin' && (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="ml-1 flex h-9 items-center gap-2 rounded-full border border-hairline-strong px-2 pr-3 text-body-sm hover:bg-sand focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
                  aria-label="Account menu"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-ink font-mono text-[0.625rem] text-paper">
                    {profile.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline">{profile.displayName.split(' ')[0]}</span>
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 min-w-[180px] rounded-md border border-hairline bg-surface-raised p-1 shadow-overlay"
                >
                  <div className="px-3 py-2">
                    <p className="text-body-sm font-medium text-ink">{profile.displayName}</p>
                    <p className="text-caption text-stone">{profile.email}</p>
                  </div>
                  <Separator />
                  <Item to="/palette">My palette</Item>
                  <Item to="/admin">Admin</Item>
                  <Separator />
                  <DropdownMenu.Item
                    onSelect={() => signOut()}
                    className="cursor-pointer rounded px-3 py-2 text-body-sm text-graphite outline-none data-[highlighted]:bg-sand"
                  >
                    Sign out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          )}
        </div>
      </div>
    </header>
  );
}

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        to={to}
        className="block cursor-pointer rounded px-3 py-2 text-body-sm text-graphite outline-none data-[highlighted]:bg-sand"
      >
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}

function Separator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-hairline" />;
}

function IndicatorLink({
  to,
  label,
  count,
  icon,
}: {
  to: string;
  label: string;
  count: number;
  icon: 'palette' | 'cart';
}) {
  return (
    <Link
      to={to}
      aria-label={`${label}${count ? `, ${count} items` : ''}`}
      className="relative grid h-9 w-9 place-items-center rounded-full text-graphite hover:bg-sand focus:outline-none focus-visible:ring-2 focus-visible:ring-clay/40"
    >
      {icon === 'palette' ? (
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
          <rect x="3" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="3" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="3" y="11" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="11" y="11" width="6" height="6" rx="1" fill="#9C5B3B" stroke="#9C5B3B" strokeWidth="1.4" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
          <path
            d="M3 4h2l1.5 9h8l1.5-6H6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
          <circle cx="8" cy="16" r="1.2" fill="currentColor" />
          <circle cx="14" cy="16" r="1.2" fill="currentColor" />
        </svg>
      )}
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-clay px-1 font-mono text-[0.5625rem] text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
