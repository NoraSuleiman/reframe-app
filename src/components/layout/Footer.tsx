import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const COLUMNS = [
  {
    heading: 'Catalogue',
    links: [
      { to: '/marketplace', label: 'All materials' },
      { to: '/marketplace?family=panel', label: 'Panels' },
      { to: '/marketplace?family=glazing', label: 'Glazing' },
      { to: '/marketplace?family=substructure', label: 'Substructure' },
    ],
  },
  {
    heading: 'Tools',
    links: [
      { to: '/palette', label: 'Material palette' },
      { to: '/builder', label: '3D façade builder' },
      { to: '/cart', label: 'Cart & quote' },
    ],
  },
  {
    heading: 'Project',
    links: [
      { to: '/contact', label: 'Contact' },
      { to: '/login', label: 'Log in' },
      { to: '/signup', label: 'Create account' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-section border-t border-hairline bg-surface">
      <div className="container-content grid gap-10 py-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-body-sm text-stone">
            An open marketplace for reclaimed façade materials — catalogued, scored for retained
            capital, and ready to reassemble. Companion to the <em>Reframing Design</em> thesis.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <h4 className="eyebrow mb-3 font-sans">{col.heading}</h4>
            <ul className="space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-body-sm text-stone hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-hairline">
        <div className="container-content flex flex-col gap-2 py-5 text-caption text-stone sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ReFrame — Reclaimed Material Marketplace. Prototype.</p>
          <p>Alexandria Canal Hub · City of Sydney</p>
        </div>
      </div>
    </footer>
  );
}
