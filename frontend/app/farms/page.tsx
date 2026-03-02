"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { apiGet, apiPost } from "../lib/backend-api";

type Farm = {
  id: string;
  name: string;
  location?: string;
  description?: string;
};

type FarmFormRow = {
  name: string;
  location: string;
  description: string;
};

export default function FarmsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [rows, setRows] = useState<FarmFormRow[]>([
    { name: "", location: "", description: "" }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadFarms = async () => {
    if (!token) return;
    try {
      const data = await apiGet<Farm[]>("/farms", token);
      setFarms(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load farms");
    }
  };

  useEffect(() => {
    if (token) {
      void loadFarms();
    }
  }, [token]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const payloadFarms = rows
        .filter((r) => r.name.trim().length > 0)
        .map((r) => ({
          name: r.name.trim(),
          location: r.location.trim() || undefined,
          description: r.description.trim() || undefined
        }));

      if (payloadFarms.length === 0) {
        setError("Please enter at least one farm name.");
        setSubmitting(false);
        return;
      }

      await apiPost<Farm[]>("/farms", token, {
        farms: payloadFarms
      });
      setRows([{ name: "", location: "", description: "" }]);
      await loadFarms();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create farm");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <h1>Farms</h1>
      <section className="card">
        <h2>Bulk Create Farms</h2>
        <form onSubmit={handleSubmit} className="form-grid full-width">
          {rows.map((row, index) => (
            <div key={index} className="full-width farm-row">
              <div className="farm-row-grid">
                <label>
                  <span>Name</span>
                  <input
                    value={row.name}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, name: e.target.value } : r
                        )
                      )
                    }
                    required={index === 0}
                  />
                </label>
                <label>
                  <span>Location</span>
                  <input
                    value={row.location}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, location: e.target.value } : r
                        )
                      )
                    }
                  />
                </label>
                <label>
                  <span>Description</span>
                  <input
                    value={row.description}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, description: e.target.value } : r
                        )
                      )
                    }
                  />
                </label>
                {rows.length > 1 && (
                  <button
                    type="button"
                    className="farm-row-remove"
                    onClick={() =>
                      setRows((prev) => prev.filter((_, i) => i !== index))
                    }
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
          ))}
          <div className="full-width farm-row-actions">
            <button
              type="button"
              onClick={() =>
                setRows((prev) => [...prev, { name: "", location: "", description: "" }])
              }
            >
              + Add another farm
            </button>
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Farm"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Existing Farms</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((farm) => (
              <tr key={farm.id}>
                <td>{farm.name}</td>
                <td>{farm.location}</td>
                <td>{farm.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

