'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet, apiPost } from '../lib/backend-api';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export default function UsersPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!loading && user && user.role !== 'ADMIN') {
      router.replace('/farms');
    }
  }, [user, loading, router]);

  const loadUsers = async () => {
    if (!token) return;
    try {
      const data = await apiGet<User[]>('/users', token);
      setUsers(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load users');
    }
  };

  useEffect(() => {
    if (token) {
      void loadUsers();
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost<User>('/users', token, {
        email,
        name,
        password,
      });
      setEmail('');
      setName('');
      setPassword('');
      await loadUsers();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="page">
      <h1>Users</h1>
      <section className="card">
        <h2>Create User</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            <span>Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Existing Users</h2>
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.email}</td>
                <td>{u.name}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
