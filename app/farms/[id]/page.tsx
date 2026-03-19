'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { apiGet } from '../../lib/backend-api';
import { HeaderLink, PageIntro, SectionCard, StatCard } from '../../ui/admin-ui';

type Photo = {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
};

type Decoration = {
  id: string;
  name: string;
  description?: string;
  price?: number;
};

type FarmDetail = {
  id: string;
  name: string;
  location?: string;
  description?: string;
  price?: string;
  originalPrice?: string;
  rating?: number;
  reviews?: number;
  capacity?: string;
  features: string[];
  amenities: string[];
  facilities: string[];
  pricing?: any;
  rules: string[];
  contactPhone?: string;
  contactEmail?: string;
  isPopular?: boolean;
  discount?: string;
  weekdayPrice?: string;
  weekendPrice?: string;
  photos: Photo[];
  decorations: Decoration[];
};

export default function FarmDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [farm, setFarm] = useState<FarmDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setError(null);
      try {
        const data = await apiGet<FarmDetail>(`/farms/${params.id}`, token);
        setFarm(data);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load farm');
      }
    };
    void load();
  }, [token, params.id]);

  if (!user) return null;

  return (
    <div className="page">
      <PageIntro
        eyebrow="Listing detail"
        title={farm ? farm.name : 'Farm details'}
        description="Inspect the full property record, including amenities, media, pricing, and linked decorations."
        actions={<HeaderLink href="/farms">Back to farms</HeaderLink>}
      />

      {error && <div className="error-banner">{error}</div>}

      {farm && (
        <>
          <div className="stat-grid">
            <StatCard label="Photos" value={farm.photos.length} />
            <StatCard label="Decorations" value={farm.decorations.length} />
            <StatCard
              label="Popularity"
              value={farm.isPopular ? 'Popular' : 'Standard'}
              meta={farm.discount || 'No discount label'}
            />
          </div>

          <SectionCard title="Property overview" description="Core listing details and customer-facing commercial information.">
            <div className="details-grid">
              <div className="detail-card">
                <strong>Location</strong>
                <span>{farm.location || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Description</strong>
                <span>{farm.description || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Display price</strong>
                <span>{farm.price || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Original price</strong>
                <span>{farm.originalPrice || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Rating / Reviews</strong>
                <span>
                  {farm.rating !== undefined ? farm.rating : '—'}{' '}
                  {farm.reviews !== undefined ? `(${farm.reviews} reviews)` : ''}
                </span>
              </div>
              <div className="detail-card">
                <strong>Capacity</strong>
                <span>{farm.capacity || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Weekday 24h</strong>
                <span>{farm.weekdayPrice || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Weekend 24h</strong>
                <span>{farm.weekendPrice || '—'}</span>
              </div>
              <div className="detail-card">
                <strong>Contact</strong>
                <span>
                  {farm.contactPhone || farm.contactEmail
                    ? `${farm.contactPhone ?? ''} ${farm.contactEmail ?? ''}`.trim()
                    : '—'}
                </span>
              </div>
            </div>
          </SectionCard>

          <section className="list-grid">
            <SectionCard title="Features & amenities" description="Customer-facing property highlights.">
              <div className="list-grid">
                <div className="list-panel">
                  <h3>Features</h3>
                  {farm.features && farm.features.length > 0 ? (
                    <div className="pill-list">
                      {farm.features.map((f) => (
                        <span key={f} className="pill">
                          {f}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>—</p>
                  )}
                </div>
                <div className="list-panel">
                  <h3>Amenities</h3>
                  {farm.amenities && farm.amenities.length > 0 ? (
                    <div className="pill-list">
                      {farm.amenities.map((a) => (
                        <span key={a} className="pill">
                          {a}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Facilities & rules" description="Operational details and guest constraints.">
              <div className="list-grid">
                <div className="list-panel">
                  <h3>Facilities</h3>
                  {farm.facilities && farm.facilities.length > 0 ? (
                    <ul>
                      {farm.facilities.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>—</p>
                  )}
                </div>
                <div className="list-panel">
                  <h3>Rules</h3>
                  {farm.rules && farm.rules.length > 0 ? (
                    <ul>
                      {farm.rules.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>—</p>
                  )}
                </div>
              </div>
            </SectionCard>
          </section>

          <SectionCard title="Photos" description="Media linked to this listing.">
            {farm.photos.length === 0 ? (
              <p>No photos.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Image</th>
                      <th>URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farm.photos.map((p) => (
                      <tr key={p.id}>
                        <td className="cell-title">{p.title}</td>
                        <td>
                          {p.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.imageUrl} alt={p.title} className="gallery-thumb" />
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          {p.imageUrl ? (
                            <a href={p.imageUrl} target="_blank" rel="noreferrer" className="link-text">
                              {p.imageUrl}
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Decorations" description="Linked decoration packages for this farm.">
            {farm.decorations.length === 0 ? (
              <p>No decorations.</p>
            ) : (
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
                    {farm.decorations.map((d) => (
                      <tr key={d.id}>
                        <td className="cell-title">{d.name}</td>
                        <td className="cell-subtle">{d.description || '—'}</td>
                        <td>{d.price ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}
