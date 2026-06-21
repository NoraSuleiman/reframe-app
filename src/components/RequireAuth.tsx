import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import type { Role } from '@/domain/types';
import { LoadingBlock } from './ui/States';

interface RequireAuthProps {
  role?: Role;
  children: React.ReactNode;
}

/** Route guard — redirects to /login (preserving intent) and enforces an optional role. */
export function RequireAuth({ role, children }: RequireAuthProps) {
  const { profile, initialised } = useAuthStore();
  const location = useLocation();

  if (!initialised) return <LoadingBlock />;

  if (!profile) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (role && profile.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
