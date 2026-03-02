"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { apiGet, apiPost } from "../lib/backend-api";

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
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [farmId, setFarmId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadDecorations = async () => {
    if (!token) return;
    try {
      const data = await apiGet<Decoration[]>("/decorations", token);
      setDecorations(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load decorations");
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
      await apiPost<Decoration>("/decorations", token, {
        name,
        description: description || undefined,
        price: price ? Number(price) : undefined,
        farmId
      });
      setName("");
      setDescription("");
      setPrice("");
      setFarmId("");
      await loadDecorations();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create decoration");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <h1>Decorations</h1>
      <section className="card">
        <h2>Create Decoration</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            <span>Description</span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <label>
            <span>Price</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              min="0"
            />
          </label>
          <label>
            <span>Farm ID</span>
            <input
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Decoration"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Existing Decorations</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {decorations.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.description}</td>
                <td>{d.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

