import { lazy, Suspense, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SiteLayout, FullLayout } from '@/components/layout/Layout';
import { RequireAuth } from '@/components/RequireAuth';
import { LoadingBlock } from '@/components/ui/States';
import { IntroAnimation } from '@/components/intro/IntroAnimation';

import Home from '@/routes/Home';
import Marketplace from '@/routes/Marketplace';
import MaterialDetail from '@/routes/MaterialDetail';
import Palette from '@/routes/Palette';
import Cart from '@/routes/Cart';
import Checkout from '@/routes/Checkout';
import Contact from '@/routes/Contact';
import Login from '@/routes/Login';
import Signup from '@/routes/Signup';
import NotFound from '@/routes/NotFound';

// Heavy / role-gated routes are code-split so the catalogue bundle stays light.
const Builder = lazy(() => import('@/routes/Builder'));
const Admin = lazy(() => import('@/routes/Admin'));

export default function App() {
  const [introDone, setIntroDone] = useState(
    () => sessionStorage.getItem('rf_intro') === '1',
  );

  function handleIntroComplete() {
    sessionStorage.setItem('rf_intro', '1');
    setIntroDone(true);
  }

  if (!introDone) {
    return <IntroAnimation onComplete={handleIntroComplete} />;
  }

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/material/:slug" element={<MaterialDetail />} />
        <Route path="/palette" element={<Palette />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin"
          element={
            <RequireAuth role="admin">
              <Suspense fallback={<LoadingBlock />}>
                <Admin />
              </Suspense>
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<FullLayout />}>
        <Route
          path="/builder"
          element={
            <Suspense fallback={<LoadingBlock label="Loading the 3D builder…" />}>
              <Builder />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
