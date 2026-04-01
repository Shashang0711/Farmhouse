'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { HeaderLink, PageIntro, SectionCard } from '../ui/admin-ui';

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setPassword('');
      setConfirmPassword('');
      setMessage(null);
      setError(null);
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required.');
      return;
    }

    if (password || confirmPassword) {
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Password and confirmation do not match.');
        return;
      }
    }

    const emailChanged = trimmed.toLowerCase() !== user.email.toLowerCase();
    const passwordChange = password.length > 0;
    if (!emailChanged && !passwordChange) {
      setError('Change your email or enter a new password to save.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile({
        email: trimmed,
        ...(passwordChange ? { password } : {}),
      });
      setPassword('');
      setConfirmPassword('');
      setMessage('Profile updated.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      try {
        const parsed = JSON.parse(msg) as { message?: string };
        setError(parsed.message ?? msg);
      } catch {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Account"
        title="Profile"
        description="Update your sign-in email or password."
        actions={
          <HeaderLink href={user.role === 'ADMIN' ? '/dashboard' : '/farms'}>
            {user.role === 'ADMIN' ? 'Back to overview' : 'Back to farms'}
          </HeaderLink>
        }
      />

      <SectionCard
        title="Sign-in details"
        description="Changes apply immediately. Use a strong password if you rotate it."
      >
        <form onSubmit={handleSubmit} className="form-grid full-width">
          <label className="full-width">
            <span className="field-label">
              Email <span className="field-required">*</span>
            </span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="full-width">
            <span className="field-label">New password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </label>
          <label className="full-width">
            <span className="field-label">Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat if changing password"
            />
          </label>
          {error && <p className="full-width field-error-text">{error}</p>}
          {message && <p className="full-width profile-page-success">{message}</p>}
          <div className="full-width farm-row-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
