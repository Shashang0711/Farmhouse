'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet, apiPost, apiPostForm } from '../lib/backend-api';
import { PageIntro, SectionCard, StatCard } from '../ui/admin-ui';

type DecorationImage = {
  id: string;
  imageUrl: string;
};

type Decoration = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  images?: DecorationImage[];
};

export default function DecorationsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [decorations, setDecorations] = useState<Decoration[]>([]);
  const [title, setTitle] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
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
      let finalThumbnailUrl: string | undefined = undefined;
      const finalImageUrls: string[] = [];

      if (thumbnailFile) {
        const formData = new FormData();
        formData.append('files', thumbnailFile);
        const res = await apiPostForm<{ files: { url: string }[] }>('/uploads', token, formData);
        finalThumbnailUrl = res.files[0].url;
      }

      if (imageFiles.length > 0) {
        if (imageFiles.length < 10) {
          throw new Error('At least 10 images are required');
        }
        const formData = new FormData();
        imageFiles.forEach((f) => formData.append('files', f));
        const res = await apiPostForm<{ files: { url: string }[] }>('/uploads', token, formData);
        res.files.forEach((f) => finalImageUrls.push(f.url));
      }

      await apiPost<Decoration>('/decorations', token, {
        title,
        thumbnailUrl: finalThumbnailUrl,
        images: finalImageUrls,
      });
      setTitle('');
      setThumbnailFile(null);
      setImageFiles([]);
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
        <SectionCard title="Create decoration" description="Add a standalone decoration package.">
          <form onSubmit={handleSubmit} className="form-grid">
            <label>
              <span className="field-label">Title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </label>
            <label>
              <span className="field-label">Thumbnail Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) setThumbnailFile(e.target.files[0]);
                }}
              />
            </label>
            {thumbnailFile && (
              <div
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: 64,
                  height: 64,
                  marginTop: 8,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(thumbnailFile)}
                  alt="thumb preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                />
                <button
                  type="button"
                  onClick={() => setThumbnailFile(null)}
                  style={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: 20,
                    height: 20,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
            <label className="full-width">
              <span className="field-label">Images (min 10)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  if (e.target.files) {
                    setImageFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                  }
                }}
              />
            </label>
            {imageFiles.length > 0 && (
              <div
                className="full-width"
                style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}
              >
                {imageFiles.map((file, i) => (
                  <div
                    key={i}
                    style={{ position: 'relative', display: 'inline-block', width: 64, height: 64 }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                    />
                    <button
                      type="button"
                      onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      style={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
            <p>
              Use this area for quick entry while keeping the existing backend integration
              untouched.
            </p>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        title="Existing decorations"
        description="Review all configured decoration entries."
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Thumbnail</th>
                <th>Total Images</th>
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
                      <td className="cell-title">{d.title}</td>
                      <td className="cell-subtle">
                        {d.thumbnailUrl ? (
                          <img
                            src={d.thumbnailUrl}
                            alt="thumbnail"
                            style={{ height: 40, width: 40, objectFit: 'cover' }}
                          />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{d.images?.length ?? 0}</td>
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
