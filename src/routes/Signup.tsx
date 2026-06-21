import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp, loading } = useAuthStore();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 4) return setError('Use a password of at least 4 characters.');
    try {
      await signUp(email, password, displayName);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-up failed.');
    }
  }

  return (
    <div className="container-content flex justify-center py-section">
      <div className="w-full max-w-md">
        <p className="eyebrow">Get started</p>
        <h1 className="mt-2 font-display text-h2">Create your account</h1>
        <p className="mt-2 text-body-sm text-stone">
          It’s free — curate palettes and build façades from reclaimed stock.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <Field label="Name" htmlFor="name" required>
            <Input id="name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </Field>
          <Field label="Email" htmlFor="email" required>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password" htmlFor="password" required hint="Mock auth — don’t use a real password.">
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-body-sm text-danger">{error}</p>}
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-6 text-center text-body-sm text-stone">
          Already have an account?{' '}
          <Link to="/login" className="text-clay underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
