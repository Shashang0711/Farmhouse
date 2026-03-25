'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet, apiPost } from '../lib/backend-api';
import { PageIntro, SectionCard, StatCard } from '../ui/admin-ui';

type Photo = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

export default function PhotographyPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [farmId, setFarmId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const loadPhotos = async () => {
    if (!token) return;
    try {
      const data = await apiGet<Photo[]>('/photography', token);
      setPhotos(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load photography');
    }
  };

  useEffect(() => {
    if (token) {
      void loadPhotos();
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiPost<Photo>('/photography', token, {
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        farmId,
      });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setFarmId('');
      await loadPhotos();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create photography');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <PageIntro
        eyebrow="Media"
        title="Photography library"
        description="Register visual assets for farmhouse listings through a cleaner content management screen."
      />
      {error && <div className="error-banner">{error}</div>}
      <div className="stat-grid">
        <StatCard
          label="Photo entries"
          value={photos.length}
          meta="Current photography rows loaded from the API."
        />
      </div>
      <section className="split-grid">
        <SectionCard
          title="Create photo"
          description="Add a media record using the existing create endpoint."
        >
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span className="field-label">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              <span className="field-label">Description</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
            <label>
              <span className="field-label">Image URL</span>
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            </label>
            <label>
              <span className="field-label">Farm ID</span>
              <input value={farmId} onChange={(e) => setFarmId(e.target.value)} required />
            </label>
            <div className="full-width farm-row-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create photo'}
              </button>
            </div>
          </form>
        </SectionCard>
        <SectionCard
          title="Content note"
          description="This page is still available to authenticated users with the same logic as before."
        >
          <div className="empty-panel">
            <h3>Cleaner media workflow</h3>
            <p>
              The upgrade improves readability and spacing without altering auth or API behavior.
            </p>
          </div>
        </SectionCard>
      </section>

      <SectionCard title="Existing photos" description="A structured list of photography records.">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Description</th>
                <th>Image URL</th>
              </tr>
            </thead>
            <tbody>
              {photos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-state">
                    No photos found.
                  </td>
                </tr>
              ) : (
                photos.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-title">{p.title}</td>
                    <td className="cell-subtle">{p.description || '—'}</td>
                    <td className="cell-subtle">{p.imageUrl || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
