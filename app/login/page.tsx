'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@farmhouse.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push('/farms');
    } catch (err: any) {
      setError(err?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <section className="auth-hero">
        <span className="auth-hero__badge">Farmhouse admin</span>
        <h1>Manage premium stays with a polished control room.</h1>
        <p>
          Review listings, keep operational teams aligned, and maintain a cleaner hospitality
          workflow with one unified admin experience.
        </p>
        <div className="auth-highlights">
          <div>
            <strong>01</strong>
            <span>Property operations</span>
          </div>
          <div>
            <strong>02</strong>
            <span>User access control</span>
          </div>
          <div>
            <strong>03</strong>
            <span>Decor and media records</span>
          </div>
        </div>
      </section>
      <section className="auth-panel">
        <form className="card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p>Use your existing admin credentials to continue to the workspace.</p>
          <label>
            <span className="field-label">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            <span className="field-label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <div className="error-banner">{error}</div>}
          <div className="auth-actions">
            <button type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Enter dashboard'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
