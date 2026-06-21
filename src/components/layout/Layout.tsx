import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Nav } from './Nav';
import { Footer } from './Footer';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Standard marketing/catalogue layout: nav + content + footer. */
export function SiteLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Nav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/** Full-height layout for the 3D builder: nav + flex-grow canvas area, no footer. */
export function FullLayout() {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Nav />
      <main className="min-h-0 flex-1">
        <Outlet />
      </main>
    </div>
  );
}
