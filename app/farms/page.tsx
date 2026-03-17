'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { apiGet } from '../lib/backend-api';

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
  const [rowDeletingId, setRowDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const loadFarms = async () => {
    if (!token) return;
    try {
      const data = await apiGet<Farm[]>('/farms', token);
      setFarms(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load farms');
    }
  };

  const deleteFarm = async (farmId: string) => {
    if (!token) return;
    const ok = window.confirm(
      'Delete this farm? This will also delete related photos and decorations.',
    );
    if (!ok) return;
    setRowDeletingId(farmId);
    setError(null);
    try {
      await fetch(`/api/farms/${farmId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(async (res) => {
        if (!res.ok && res.status !== 204) throw new Error((await res.text()) || res.statusText);
      });
      await loadFarms();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to delete farm');
    } finally {
      setRowDeletingId(null);
    }
  };

  useEffect(() => {
    if (token) {
      void loadFarms();
    }
  }, [token]);

  if (!user) {
    return null;
  }

  const isAdmin = user.role === 'ADMIN';

  return (
    <div className="page">
      <div className="page-header-row">
        <h1>Farms</h1>
        {isAdmin && (
          <button
            type="button"
            className="primary-ghost-button"
            onClick={() => router.push('/farms/new')}
          >
            + Add Farm
          </button>
        )}
      </div>
      {error && <p className="error">{error}</p>}

      <section className="card">
        <h2>Existing Farms</h2>
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
            {farms.map((farm) => (
              <tr key={farm.id}>
                <td>{farm.name}</td>
                <td>{farm.location}</td>
                <td>{farm.description}</td>
                <td>{farm.price || '—'}</td>
                <td>{farm.capacity || '—'}</td>
                <td>{farm.rating !== undefined ? farm.rating : '—'}</td>
                <td>{farm.isPopular ? 'Yes' : 'No'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => router.push(`/farms/${farm.id}`)}>
                      View
                    </button>
                    {isAdmin && (
                      <>
                        <button type="button" onClick={() => router.push(`/farms/${farm.id}/edit`)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFarm(farm.id)}
                          disabled={rowDeletingId === farm.id}
                        >
                          {rowDeletingId === farm.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
