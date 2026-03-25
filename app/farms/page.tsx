'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet } from '../lib/backend-api';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import ConfirmDialog from '../ components/ConfirmDialog';
import { HeaderLink, PageIntro, SectionCard } from '../ui/admin-ui';

type Farm = {
  id: string;
  name: string;
  location?: string;
  description?: string;
  price?: string;
  capacity?: string;
  rating?: number;
  isPopular?: boolean;
};

export default function FarmsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [rowDeletingId, setRowDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const loadFarms = async () => {
    if (!token) return;
    try {
      const res = await apiGet<{ data: Farm[]; meta: { totalPages: number } }>(`/farms?page=${page}&limit=15`, token);
      setFarms(res.data);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load farms');
    }
  };

  const deleteFarm = async () => {
    if (!token || !confirmDeleteId) return;

    setRowDeletingId(confirmDeleteId);
    setError(null);

    try {
      const res = await fetch(`/api/farms/${confirmDeleteId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());

      await loadFarms();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete farm');
    } finally {
      setRowDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  useEffect(() => {
    if (token) {
      void loadFarms();
    }
  }, [token, page]);

  if (!user) return null;

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="page">
      <PageIntro
        eyebrow="Catalog"
        title="Farm listings"
        description="Review every property, inspect listing quality, and manage edits from one streamlined table."
        actions={
          isAdmin ? (
            <HeaderLink href="/farms/new" variant="primary">
              Add farm
            </HeaderLink>
          ) : null
        }
      />

      {error && <div className="error-banner">{error}</div>}

      <SectionCard
        title="Existing farms"
        description={`${farms.length} listing${farms.length === 1 ? '' : 's'} currently available in the system.`}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Description</th>
                <th>Price</th>
                <th>Capacity</th>
                <th>Rating</th>
                <th>Popular</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {farms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="empty-state">
                    No farms found.
                  </td>
                </tr>
              ) : (
                farms.map((farm) => (
                  <tr key={farm.id}>
                    <td className="cell-title">{farm.name}</td>
                    <td>{farm.location || '—'}</td>
                    <td className="cell-subtle">{farm.description || '—'}</td>
                    <td>{farm.price || '—'}</td>
                    <td>{farm.capacity || '—'}</td>
                    <td>{farm.rating ?? '—'}</td>
                    <td>
                      <span
                        className={
                          farm.isPopular
                            ? 'status-chip status-chip--success'
                            : 'status-chip status-chip--neutral'
                        }
                      >
                        {farm.isPopular ? 'Popular' : 'Standard'}
                      </span>
                    </td>

                    <td>
                      <div className="menu-wrap">
                        <input type="checkbox" className="toggler" />

                        <div className="dots">
                          <div></div>
                        </div>

                        <div className="menu">
                          <ul>
                            <li>
                              <button onClick={() => router.push(`/farms/${farm.id}`)}>
                                <Eye size={16} />
                                <span>View</span>
                              </button>
                            </li>

                            {isAdmin && (
                              <>
                                <li>
                                  <button onClick={() => router.push(`/farms/${farm.id}/edit`)}>
                                    <Pencil size={16} />
                                    <span>Edit</span>
                                  </button>
                                </li>

                                <li>
                                  <button
                                    onClick={() => setConfirmDeleteId(farm.id)}
                                    className="danger"
                                  >
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                  </button>
                                </li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '15px', marginTop: '1.5rem', padding: '0 1rem', paddingBottom: '1rem' }}>
          <button 
            disabled={page === 1} 
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: page === 1 ? '#f8fafc' : '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Page {page} of {totalPages || 1}</span>
          <button 
            disabled={page >= totalPages || totalPages === 0} 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: '6px', background: page >= totalPages || totalPages === 0 ? '#f8fafc' : '#fff', cursor: page >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </SectionCard>

      <ConfirmDialog
        open={!!confirmDeleteId}
        title="Delete Farm"
        description="Are you sure you want to delete this farm? This will also delete related photos and decorations."
        confirmText="Delete"
        loading={rowDeletingId === confirmDeleteId}
        onConfirm={deleteFarm}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
}
