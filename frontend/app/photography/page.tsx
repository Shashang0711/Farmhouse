"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { apiGet, apiPost } from "../lib/backend-api";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [farmId, setFarmId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const loadPhotos = async () => {
    if (!token) return;
    try {
      const data = await apiGet<Photo[]>("/photography", token);
      setPhotos(data);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load photography");
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
      await apiPost<Photo>("/photography", token, {
        title,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
        farmId
      });
      setTitle("");
      setDescription("");
      setImageUrl("");
      setFarmId("");
      await loadPhotos();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create photography");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="page">
      <h1>Photography</h1>
      <section className="card">
        <h2>Create Photo</h2>
        <form onSubmit={handleSubmit} className="form-grid">
          <label>
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
            <span>Image URL</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
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
            {submitting ? "Creating..." : "Create Photo"}
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Existing Photos</h2>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Image URL</th>
            </tr>
          </thead>
          <tbody>
            {photos.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.description}</td>
                <td>{p.imageUrl}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

