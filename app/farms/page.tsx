"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { apiGet, apiPost, apiPostForm } from "../lib/backend-api";

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
  photoFiles: File[];
  price: string;
  originalPrice: string;
  rating: string;
  reviews: string;
  capacity: string;
  featuresText: string;
  amenitiesText: string;
  facilitiesText: string;
  rulesText: string;
  weekdayPrice: string;
  weekendPrice: string;
  contactPhone: string;
  contactEmail: string;
  isPopular: boolean;
  discount: string;
};

export default function FarmsPage() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  const [farms, setFarms] = useState<Farm[]>([]);
  const [rows, setRows] = useState<FarmFormRow[]>([
    {
      name: "",
      location: "",
      description: "",
      photoFiles: [],
      price: "",
      originalPrice: "",
      rating: "",
      reviews: "",
      capacity: "",
      featuresText: "",
      amenitiesText: "",
      facilitiesText: "",
      rulesText: "",
      weekdayPrice: "",
      weekendPrice: "",
      contactPhone: "",
      contactEmail: "",
      isPopular: false,
      discount: ""
    }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rowSavingId, setRowSavingId] = useState<string | null>(null);
  const [rowDeletingId, setRowDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    location: string;
    description: string;
  } | null>(null);

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

  const startEdit = (farm: Farm) => {
    setEditingId(farm.id);
    setEditDraft({
      name: farm.name ?? "",
      location: farm.location ?? "",
      description: farm.description ?? ""
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = async (farmId: string) => {
    if (!token || !editDraft) return;
    setRowSavingId(farmId);
    setError(null);
    try {
      await fetch(`/api/farms/${farmId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editDraft.name.trim(),
          location: editDraft.location.trim() || null,
          description: editDraft.description.trim() || null
        })
      }).then(async (res) => {
        if (!res.ok) throw new Error((await res.text()) || res.statusText);
      });
      await loadFarms();
      cancelEdit();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update farm");
    } finally {
      setRowSavingId(null);
    }
  };

  const deleteFarm = async (farmId: string) => {
    if (!token) return;
    const ok = window.confirm(
      "Delete this farm? This will also delete related photos and decorations."
    );
    if (!ok) return;
    setRowDeletingId(farmId);
    setError(null);
    try {
      await fetch(`/api/farms/${farmId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(async (res) => {
        if (!res.ok && res.status !== 204) throw new Error((await res.text()) || res.statusText);
      });
      await loadFarms();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete farm");
    } finally {
      setRowDeletingId(null);
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
      const farmsToCreate = rows
        .filter((r) => r.name.trim().length > 0)
        .map((r) => ({
          name: r.name.trim(),
          location: r.location.trim() || undefined,
          description: r.description.trim() || undefined,
          price: r.price.trim() || undefined,
          originalPrice: r.originalPrice.trim() || undefined,
          rating: r.rating.trim() ? Number(r.rating.trim()) : undefined,
          reviews: r.reviews.trim() ? Number(r.reviews.trim()) : undefined,
          capacity: r.capacity.trim() || undefined,
          features: r.featuresText
            .split(/[,\\n]/g)
            .map((s) => s.trim())
            .filter(Boolean),
          amenities: r.amenitiesText
            .split(/[,\\n]/g)
            .map((s) => s.trim())
            .filter(Boolean),
          facilities: r.facilitiesText
            .split(/\\n/g)
            .map((s) => s.trim())
            .filter(Boolean),
          rules: r.rulesText
            .split(/\\n/g)
            .map((s) => s.trim())
            .filter(Boolean),
          weekdayPrice: r.weekdayPrice.trim() || undefined,
          weekendPrice: r.weekendPrice.trim() || undefined,
          contactPhone: r.contactPhone.trim() || undefined,
          contactEmail: r.contactEmail.trim() || undefined,
          isPopular: r.isPopular,
          discount: r.discount.trim() || undefined,
          photoFiles: r.photoFiles
        }));

      if (farmsToCreate.length === 0) {
        setError("Please enter at least one farm name.");
        setSubmitting(false);
        return;
      }

      const invalid = farmsToCreate.find((f) => (f.photoFiles?.length ?? 0) < 10);
      if (invalid) {
        setError("Each farm requires at least 10 images.");
        setSubmitting(false);
        return;
      }

      const payloadFarms: {
        name: string;
        location?: string;
        description?: string;
        price?: string;
        originalPrice?: string;
        rating?: number;
        reviews?: number;
        capacity?: string;
        features?: string[];
        amenities?: string[];
        facilities?: string[];
        pricing?: any;
        rules?: string[];
        contactPhone?: string;
        contactEmail?: string;
        isPopular?: boolean;
        discount?: string;
        weekdayPrice?: string;
        weekendPrice?: string;
        photoImageUrls: string[];
      }[] = [];

      for (const farm of farmsToCreate) {
        const formData = new FormData();
        for (const file of farm.photoFiles) {
          formData.append("files", file);
        }

        const uploadRes = await apiPostForm<{
          files: { url: string; name: string; size: number; type: string }[];
        }>("/uploads", token, formData);

        const photoImageUrls = uploadRes.files.map((f) => f.url);
        if (photoImageUrls.length < 10) {
          setError("Upload failed: each farm requires at least 10 images.");
          setSubmitting(false);
          return;
        }

        const pricing =
          farm.weekdayPrice || farm.weekendPrice
            ? {
                weekday: farm.weekdayPrice ? { "24 Hours": farm.weekdayPrice } : {},
                weekend: farm.weekendPrice ? { "24 Hours": farm.weekendPrice } : {}
              }
            : undefined;

        payloadFarms.push({
          name: farm.name,
          location: farm.location,
          description: farm.description,
          price: farm.price,
          originalPrice: farm.originalPrice,
          rating: farm.rating,
          reviews: farm.reviews,
          capacity: farm.capacity,
          features: farm.features,
          amenities: farm.amenities,
          facilities: farm.facilities,
          pricing,
          rules: farm.rules,
          contactPhone: farm.contactPhone,
          contactEmail: farm.contactEmail,
          isPopular: farm.isPopular,
          discount: farm.discount,
          weekdayPrice: farm.weekdayPrice,
          weekendPrice: farm.weekendPrice,
          photoImageUrls
        });
      }

      await apiPost<Farm[]>("/farms", token, {
        farms: payloadFarms
      });
      setRows([
        {
          name: "",
          location: "",
          description: "",
          photoFiles: [],
          price: "",
          originalPrice: "",
          rating: "",
          reviews: "",
          capacity: "",
          featuresText: "",
          amenitiesText: "",
          facilitiesText: "",
          rulesText: "",
          weekdayPrice: "",
          weekendPrice: "",
          contactPhone: "",
          contactEmail: "",
          isPopular: false,
          discount: ""
        }
      ]);
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

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="page">
      <h1>Farms</h1>
      {isAdmin && (
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
                    placeholder="Farm Name"
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
                    placeholder="Location"
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
                    placeholder="Description"
                  />
                </label>
                <label className="full-width">
                  <span>
                    Photos (min 10)
                    {row.photoFiles.length > 0 ? ` — selected ${row.photoFiles.length}` : ""}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, photoFiles: files } : r))
                      );
                    }}
                    required
                  />
                </label>
                <label>
                  <span>Display Price</span>
                  <input
                    value={row.price}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, price: e.target.value } : r))
                      )
                    }
                    placeholder="₹28,000"
                  />
                </label>
                <label>
                  <span>Original Price</span>
                  <input
                    value={row.originalPrice}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, originalPrice: e.target.value } : r
                        )
                      )
                    }
                    placeholder="₹28,000"
                  />
                </label>
                <label>
                  <span>Rating</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={row.rating}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, rating: e.target.value } : r))
                      )
                    }
                    placeholder="4.7"
                  />
                </label>
                <label>
                  <span>Reviews Count</span>
                  <input
                    type="number"
                    min="0"
                    value={row.reviews}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, reviews: e.target.value } : r))
                      )
                    }
                    placeholder="0"
                  />
                </label>
                <label>
                  <span>Capacity</span>
                  <input
                    value={row.capacity}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) => (i === index ? { ...r, capacity: e.target.value } : r))
                      )
                    }
                    placeholder="15-20 Guests"
                  />
                </label>
                <label className="full-width">
                  <span>Features (comma or new line)</span>
                  <textarea
                    rows={2}
                    value={row.featuresText}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, featuresText: e.target.value } : r
                        )
                      )
                    }
                    placeholder="5BHK (2 AC Rooms), Private Swimming Pool, Private Garden..."
                  />
                </label>
                <label className="full-width">
                  <span>Amenities (comma or new line)</span>
                  <textarea
                    rows={2}
                    value={row.amenitiesText}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, amenitiesText: e.target.value } : r
                        )
                      )
                    }
                    placeholder="5BHK, 2 AC Rooms, Private Swimming Pool..."
                  />
                </label>
                <label className="full-width">
                  <span>Facilities (one per line)</span>
                  <textarea
                    rows={3}
                    value={row.facilitiesText}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, facilitiesText: e.target.value } : r
                        )
                      )
                    }
                    placeholder="5BHK Farmhouse&#10;2 AC Rooms only&#10;Private Swimming Pool..."
                  />
                </label>
                <label className="full-width">
                  <span>Rules (one per line)</span>
                  <textarea
                    rows={3}
                    value={row.rulesText}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, rulesText: e.target.value } : r
                        )
                      )
                    }
                    placeholder="A maximum of 15–20 guests is allowed&#10;Security deposit is mandatory..."
                  />
                </label>
                <label>
                  <span>Weekday 24h Price</span>
                  <input
                    value={row.weekdayPrice}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, weekdayPrice: e.target.value } : r
                        )
                      )
                    }
                    placeholder="₹28,000"
                  />
                </label>
                <label>
                  <span>Weekend 24h Price</span>
                  <input
                    value={row.weekendPrice}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, weekendPrice: e.target.value } : r
                        )
                      )
                    }
                    placeholder="₹28,000"
                  />
                </label>
                <label>
                  <span>Contact Phone</span>
                  <input
                    value={row.contactPhone}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, contactPhone: e.target.value } : r
                        )
                      )
                    }
                    placeholder="8160554061"
                  />
                </label>
                <label>
                  <span>Contact Email</span>
                  <input
                    type="email"
                    value={row.contactEmail}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, contactEmail: e.target.value } : r
                        )
                      )
                    }
                    placeholder="param@farmhouse.com"
                  />
                </label>
                <label>
                  <span>Discount Label</span>
                  <input
                    value={row.discount}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, discount: e.target.value } : r
                        )
                      )
                    }
                    placeholder="10% OFF"
                  />
                </label>
                <label>
                  <span>Popular</span>
                  <input
                    type="checkbox"
                    checked={row.isPopular}
                    onChange={(e) =>
                      setRows((prev) =>
                        prev.map((r, i) =>
                          i === index ? { ...r, isPopular: e.target.checked } : r
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
                setRows((prev) => [
                  ...prev,
                  {
                    name: "",
                    location: "",
                    description: "",
                    photoFiles: [],
                    price: "",
                    originalPrice: "",
                    rating: "",
                    reviews: "",
                    capacity: "",
                    featuresText: "",
                    amenitiesText: "",
                    facilitiesText: "",
                    rulesText: "",
                    weekdayPrice: "",
                    weekendPrice: "",
                    contactPhone: "",
                    contactEmail: "",
                    isPopular: false,
                    discount: ""
                  }
                ])
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
      )}

      <section className="card">
        <h2>Existing Farms</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {farms.map((farm) => (
              <tr key={farm.id}>
                <td>
                  {isAdmin && editingId === farm.id ? (
                    <input
                      value={editDraft?.name ?? ""}
                      onChange={(e) =>
                        setEditDraft((d) => (d ? { ...d, name: e.target.value } : d))
                      }
                    />
                  ) : (
                    farm.name
                  )}
                </td>
                <td>
                  {isAdmin && editingId === farm.id ? (
                    <input
                      value={editDraft?.location ?? ""}
                      onChange={(e) =>
                        setEditDraft((d) => (d ? { ...d, location: e.target.value } : d))
                      }
                    />
                  ) : (
                    farm.location
                  )}
                </td>
                <td>
                  {isAdmin && editingId === farm.id ? (
                    <input
                      value={editDraft?.description ?? ""}
                      onChange={(e) =>
                        setEditDraft((d) => (d ? { ...d, description: e.target.value } : d))
                      }
                    />
                  ) : (
                    farm.description
                  )}
                </td>
                <td>
                  {isAdmin && editingId === farm.id ? (
                    <div className="row-actions">
                      <button
                        type="button"
                        onClick={() => saveEdit(farm.id)}
                        disabled={rowSavingId === farm.id}
                      >
                        {rowSavingId === farm.id ? "Saving..." : "Save"}
                      </button>
                      <button type="button" onClick={cancelEdit} disabled={rowSavingId === farm.id}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="row-actions">
                      <button type="button" onClick={() => router.push(`/farms/${farm.id}`)}>
                        View
                      </button>
                      {isAdmin && (
                        <>
                          <button type="button" onClick={() => startEdit(farm)}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteFarm(farm.id)}
                            disabled={rowDeletingId === farm.id}
                          >
                            {rowDeletingId === farm.id ? "Deleting..." : "Delete"}
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

