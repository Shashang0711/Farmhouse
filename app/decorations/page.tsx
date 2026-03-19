'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet, apiPost } from '../lib/backend-api';
import { PageIntro, SectionCard, StatCard } from '../ui/admin-ui';

type Decoration = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

export default function DecorationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [farmId, setFarmId] = useState('');
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

  const loadDecorations = async () => {
    if (!token) return;
    try {
      const data = await apiGet<Decoration[]>('/decorations', token);
      setDecorations(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load decorations');
    }
  };

  useEffect(() => {
    if (token) {
      void loadDecorations();
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost<Decoration>('/decorations', token, {
        name,
        description: description || undefined,
        price: price ? Number(price) : undefined,
        farmId,
      });
      setName('');
      setDescription('');
      setPrice('');
      setFarmId('');
      await loadDecorations();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create decoration');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="page">
      <PageIntro
        eyebrow="Enhancements"
        title="Decoration management"
        description="Create and review add-on decor packages tied to farmhouse listings."
      />
      {error && <div className="error-banner">{error}</div>}
      <div className="stat-grid">
        <StatCard
          label="Decor records"
          value={decorations.length}
          meta="Loaded from the existing decorations API."
        />
      </div>
      <section className="split-grid">
        <SectionCard
          title="Create decoration"
          description="Add a decoration package and attach it to a farm by ID."
        >
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span className="field-label">Name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
            <label>
              <span className="field-label">Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
              <span className="field-label">Price</span>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
              />
            </label>
            <label>
              <span className="field-label">Farm ID</span>
              <input value={farmId} onChange={(e) => setFarmId(e.target.value)} required />
            </label>
            <div className="full-width farm-row-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create decoration'}
              </button>
            </div>
          </form>
        </SectionCard>
        <SectionCard
          title="Usage note"
          description="The creation logic remains unchanged; only the layout and styling were elevated."
        >
          <div className="empty-panel">
            <h3>Better visual clarity</h3>
            <p>Use this area for quick entry while keeping the existing backend integration untouched.</p>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Existing decorations" description="Review all configured decoration entries.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {decorations.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-state">
                    No decorations found.
                  </td>
                </tr>
              ) : (
                <>
                  {decorations.map((d) => (
                    <tr key={d.id}>
                      <td className="cell-title">{d.name}</td>
                      <td className="cell-subtle">{d.description || '—'}</td>
                      <td>{d.price ?? '—'}</td>
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
