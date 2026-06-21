import { ButtonLink } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container-content flex flex-col items-center py-section text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-3 font-display text-h1">Page not found</h1>
      <p className="mt-3 max-w-md text-stone">
        That route doesn’t exist. Head back to the marketplace to keep browsing reclaimed materials.
      </p>
      <ButtonLink to="/marketplace" className="mt-6">
        Browse the marketplace
      </ButtonLink>
    </div>
  );
}
