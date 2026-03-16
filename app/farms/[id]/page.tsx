"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { apiGet } from "../../lib/backend-api";

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
      router.replace("/login");
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
        setError(err?.message ?? "Failed to load farm");
      }
    };
    void load();
  }, [token, params.id]);

  if (!user) return null;

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        <h1>Farm Details</h1>
        <button type="button" onClick={() => router.push("/farms")}>
          Back to farms
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {farm && (
        <>
          <section className="card">
            <h2>{farm.name}</h2>
            <p>
              <strong>Location:</strong> {farm.location || "—"}
            </p>
            <p>
              <strong>Description:</strong> {farm.description || "—"}
            </p>
            <p>
              <strong>Price:</strong> {farm.price || "—"}
            </p>
            <p>
              <strong>Original Price:</strong> {farm.originalPrice || "—"}
            </p>
            <p>
              <strong>Rating / Reviews:</strong>{" "}
              {farm.rating !== undefined ? farm.rating : "—"}{" "}
              {farm.reviews !== undefined ? `(${farm.reviews} reviews)` : ""}
            </p>
            <p>
              <strong>Capacity:</strong> {farm.capacity || "—"}
            </p>
            <p>
              <strong>Popular:</strong> {farm.isPopular ? "Yes" : "No"}
            </p>
            <p>
              <strong>Discount:</strong> {farm.discount || "—"}
            </p>
            <p>
              <strong>Weekday 24h:</strong> {farm.weekdayPrice || "—"}
            </p>
            <p>
              <strong>Weekend 24h:</strong> {farm.weekendPrice || "—"}
            </p>
            <p>
              <strong>Contact:</strong>{" "}
              {farm.contactPhone || farm.contactEmail
                ? `${farm.contactPhone ?? ""} ${farm.contactEmail ?? ""}`.trim()
                : "—"}
            </p>
            <p>
              <strong>Photos:</strong> {farm.photos.length}
            </p>
            <p>
              <strong>Decorations:</strong> {farm.decorations.length}
            </p>
          </section>

          <section className="card">
            <h2>Features & Amenities</h2>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
                <h3>Features</h3>
                {farm.features && farm.features.length > 0 ? (
                  <ul>
                    {farm.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                ) : (
                  <p>—</p>
                )}
              </div>
              <div>
                <h3>Amenities</h3>
                {farm.amenities && farm.amenities.length > 0 ? (
                  <ul>
                    {farm.amenities.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                ) : (
                  <p>—</p>
                )}
              </div>
            </div>
          </section>

          <section className="card">
            <h2>Facilities & Rules</h2>
            <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
              <div>
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
              <div>
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
          </section>

          <section className="card">
            <h2>Photos</h2>
            {farm.photos.length === 0 ? (
              <p>No photos.</p>
            ) : (
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
                      <td>{p.title}</td>
                      <td>
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.title} style={{ height: 44 }} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ wordBreak: "break-all" }}>{p.imageUrl || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <section className="card">
            <h2>Decorations</h2>
            {farm.decorations.length === 0 ? (
              <p>No decorations.</p>
            ) : (
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
                      <td>{d.name}</td>
                      <td>{d.description || "—"}</td>
                      <td>{d.price ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}

