'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet, apiPost, apiPostForm } from '../lib/backend-api';
import { PageIntro, SectionCard, StatCard } from '../ui/admin-ui';

type PhotographyImage = {
  id: string;
  imageUrl: string;
};

type Photo = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  images?: PhotographyImage[];
};

export default function PhotographyPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
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

      await apiPost<Photo>('/photography', token, {
        title,
        thumbnailUrl: finalThumbnailUrl,
        images: finalImageUrls,
      });
      setTitle('');
      setThumbnailFile(null);
      setImageFiles([]);
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
        description="Register standalone visual assets with multi-image support."
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
        <SectionCard title="Create photo" description="Add a standalone media record.">
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
                {submitting ? 'Creating...' : 'Create photo'}
              </button>
            </div>
          </form>
        </SectionCard>
        <SectionCard
          title="Usage note"
          description="Photography is now a standalone module independent of farm IDs."
        >
          <div className="empty-panel">
            <h3>Visual Management</h3>
            <p>
              Provides robust file upload capabilities and local preview previews out of the box.
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
                <th>Thumbnail</th>
                <th>Total Images</th>
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
                    <td className="cell-subtle">
                      {p.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.thumbnailUrl}
                          alt="thumbnail"
                          style={{ height: 40, width: 40, objectFit: 'cover' }}
                        />
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>{p.images?.length ?? 0}</td>
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
