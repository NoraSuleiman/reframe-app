import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/';
  const { signIn, magicLink, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed.');
    }
  }

  async function onMagicLink() {
    setError(null);
    if (!email.trim()) return setError('Enter your email first.');
    try {
      await magicLink(email);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Magic link failed.');
    }
  }

  return (
    <div className="container-content flex justify-center py-section">
      <div className="w-full max-w-md">
        <p className="eyebrow">Welcome back</p>
        <h1 className="mt-2 font-display text-h2">Log in to ReFrame</h1>
        <p className="mt-2 text-body-sm text-stone">
          Save palettes, persist 3D façades, and submit quote requests.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="password" required>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </Button>
          <Button type="button" variant="secondary" className="w-full" onClick={onMagicLink} disabled={loading}>
            Email me a magic link
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-stone">
          New here?{' '}
          <Link to="/signup" className="text-clay underline">
            Create an account
          </Link>
        </p>

        <div className="mt-8 rounded-lg border border-dashed border-hairline-strong bg-surface p-4 text-caption text-stone">
          <p className="mb-1 font-medium text-graphite">Demo accounts (mock auth)</p>
          <p>Admin — admin@reframe.studio · reframe</p>
          <p>Designer — designer@reframe.studio · reframe</p>
        </div>
      </div>
    </div>
  );
}
