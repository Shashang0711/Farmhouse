'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { useAuth } from '../../../lib/auth-context';
import { apiGet, apiPatch } from '../../../lib/backend-api';
import { parseStoredAmenity, type AmenityItem } from '../../../lib/amenities';
import { IconPicker } from '../../../components/IconPicker';
import { AmenityLucideIcon } from '../../../components/AmenityLucideIcon';
import { HeaderLink, PageIntro, SectionCard } from '../../../ui/admin-ui';

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
};

type FieldErrors = Record<string, string | undefined>;

export default function EditFarmPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, token, loading } = useAuth();

  const [loadingFarm, setLoadingFarm] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [rating, setRating] = useState('');
  const [reviews, setReviews] = useState('');
  const [capacity, setCapacity] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [amenities, setAmenities] = useState<AmenityItem[]>([{ icon: 'Wifi', name: '' }]);
  const [activeIconIndex, setActiveIconIndex] = useState<number | null>(null);
  const [facilitiesText, setFacilitiesText] = useState('');
  const [rulesText, setRulesText] = useState('');
  const [weekdayPrice, setWeekdayPrice] = useState('');
  const [weekendPrice, setWeekendPrice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [discount, setDiscount] = useState('');
  const [isPopular, setIsPopular] = useState(false);

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

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoadingFarm(true);
      try {
        const data = await apiGet<FarmDetail>(`/farms/${params.id}`, token);
        setName(data.name ?? '');
        setLocation(data.location ?? '');
        setDescription(data.description ?? '');
        setPrice(data.price ?? '');
        setOriginalPrice(data.originalPrice ?? '');
        setRating(data.rating !== undefined && data.rating !== null ? String(data.rating) : '');
        setReviews(data.reviews !== undefined && data.reviews !== null ? String(data.reviews) : '');
        setCapacity(data.capacity ?? '');
        setFeaturesText((data.features ?? []).join('\n'));
        const amenityRows = (data.amenities ?? []).map((raw) => parseStoredAmenity(raw));
        setAmenities(amenityRows.length ? amenityRows : [{ icon: 'Wifi', name: '' }]);
        setFacilitiesText((data.facilities ?? []).join('\n'));
        setRulesText((data.rules ?? []).join('\n'));
        setWeekdayPrice(data.weekdayPrice ?? '');
        setWeekendPrice(data.weekendPrice ?? '');
        setContactPhone(data.contactPhone ?? '');
        setContactEmail(data.contactEmail ?? '');
        setDiscount(data.discount ?? '');
        setIsPopular(Boolean(data.isPopular));
      } catch (err: any) {
        setFormError(err?.message ?? 'Failed to load farm');
      } finally {
        setLoadingFarm(false);
      }
    };
    void load();
  }, [token, params.id]);

  if (!user || user.role !== 'ADMIN') return null;

  const validate = () => {
    const errs: FieldErrors = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!location.trim()) errs.location = 'Location is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (!price.trim()) errs.price = 'Display price is required.';
    if (!originalPrice.trim()) errs.originalPrice = 'Original price is required.';
    if (!capacity.trim()) errs.capacity = 'Capacity is required.';
    if (!featuresText.trim()) errs.featuresText = 'At least one feature is required.';
    if (!amenities.some((a) => a.name.trim()))
      errs.amenities = 'At least one amenity with a name is required.';
    if (!facilitiesText.trim()) errs.facilitiesText = 'Facilities are required.';
    if (!rulesText.trim()) errs.rulesText = 'Rules are required.';
    if (!weekdayPrice.trim()) errs.weekdayPrice = 'Weekday 24h price is required.';
    if (!weekendPrice.trim()) errs.weekendPrice = 'Weekend 24h price is required.';
    if (!contactPhone.trim()) errs.contactPhone = 'Contact phone is required.';
    if (!contactEmail.trim()) errs.contactEmail = 'Contact email is required.';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setFormError(null);

    if (!validate()) {
      setFormError('Please fill all required fields highlighted in red.');
      return;
    }

    setSubmitting(true);
    try {
      const features = featuresText
        .split(/[,\\n]/g)
        .map((s) => s.trim())
        .filter(Boolean);
      const amenitiesPayload = amenities
        .filter((a) => a.name.trim())
        .map((a) => ({ icon: a.icon, name: a.name.trim() }));
      const facilities = facilitiesText
        .split(/\\n/g)
        .map((s) => s.trim())
        .filter(Boolean);
      const rules = rulesText
        .split(/\\n/g)
        .map((s) => s.trim())
        .filter(Boolean);

      const pricing =
        weekdayPrice || weekendPrice
          ? {
              weekday: weekdayPrice ? { '24 Hours': weekdayPrice } : {},
              weekend: weekendPrice ? { '24 Hours': weekendPrice } : {},
            }
          : undefined;

      await apiPatch(`/farms/${params.id}`, token, {
        name: name.trim(),
        location: location.trim(),
        description: description.trim(),
        price: price.trim(),
        originalPrice: originalPrice.trim(),
        rating: rating.trim() ? Number(rating.trim()) : null,
        reviews: reviews.trim() ? Number(reviews.trim()) : null,
        capacity: capacity.trim(),
        features,
        amenities: amenitiesPayload,
        facilities,
        pricing,
        rules,
        contactPhone: contactPhone.trim(),
        contactEmail: contactEmail.trim(),
        isPopular,
        discount: discount.trim() || null,
        weekdayPrice: weekdayPrice.trim(),
        weekendPrice: weekendPrice.trim(),
      });

      router.push('/farms');
    } catch (err: any) {
      setFormError(err?.message ?? 'Failed to update farm');
    } finally {
      setSubmitting(false);
    }
  };

  const err = (field: string) => fieldErrors[field];

  return (
    <div className="page">
      <PageIntro
        eyebrow="Catalog"
        title="Edit farmhouse listing"
        description="Update listing presentation details while keeping the existing patch logic exactly intact."
        actions={<HeaderLink href="/farms">Back to list</HeaderLink>}
      />
      {formError && <div className="error-banner">{formError}</div>}

      <SectionCard
        title="Edit details"
        description="All field rules and submit behavior are unchanged; only the UI structure has been modernized."
      >
        {loadingFarm ? (
          <p>Loading farm...</p>
        ) : (
          <form onSubmit={handleSubmit} className="form-grid full-width">
            <label>
              <span className="field-label">
                Name <span className="field-required">*</span>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={err('name') ? 'field-error' : ''}
              />
              {err('name') && <span className="field-error-text">{err('name')}</span>}
            </label>
            <label>
              <span className="field-label">
                Location <span className="field-required">*</span>
              </span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={err('location') ? 'field-error' : ''}
              />
              {err('location') && <span className="field-error-text">{err('location')}</span>}
            </label>
            <label>
              <span className="field-label">
                Description <span className="field-required">*</span>
              </span>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={err('description') ? 'field-error' : ''}
              />
              {err('description') && <span className="field-error-text">{err('description')}</span>}
            </label>
            <label>
              <span className="field-label">
                Display Price <span className="field-required">*</span>
              </span>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={err('price') ? 'field-error' : ''}
              />
              {err('price') && <span className="field-error-text">{err('price')}</span>}
            </label>
            <label>
              <span className="field-label">
                Original Price <span className="field-required">*</span>
              </span>
              <input
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                className={err('originalPrice') ? 'field-error' : ''}
              />
              {err('originalPrice') && (
                <span className="field-error-text">{err('originalPrice')}</span>
              )}
            </label>
            <label>
              <span className="field-label">Rating</span>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </label>
            <label>
              <span className="field-label">Reviews Count</span>
              <input
                type="number"
                min="0"
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
              />
            </label>
            <label>
              <span className="field-label">
                Capacity <span className="field-required">*</span>
              </span>
              <input
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={err('capacity') ? 'field-error' : ''}
              />
              {err('capacity') && <span className="field-error-text">{err('capacity')}</span>}
            </label>
            <label className="full-width">
              <span className="field-label">
                Features (comma or new line) <span className="field-required">*</span>
              </span>
              <textarea
                rows={2}
                value={featuresText}
                onChange={(e) => setFeaturesText(e.target.value)}
                className={err('featuresText') ? 'field-error' : ''}
              />
              {err('featuresText') && (
                <span className="field-error-text">{err('featuresText')}</span>
              )}
            </label>
            <div className="full-width field-stack">
              <span className="field-label">
                Amenities <span className="field-required">*</span>
              </span>
              <p className="field-hint">Pick a Lucide icon and enter a label for each amenity.</p>
              <div className="amenity-rows">
                {amenities.map((item, idx) => (
                  <div key={idx} className="amenity-row">
                    <button
                      type="button"
                      className={`amenity-icon-select${err('amenities') ? ' field-error' : ''}`}
                      onClick={() => setActiveIconIndex(idx)}
                    >
                      <span className="amenity-icon-preview">
                        <AmenityLucideIcon iconName={item.icon} size={20} />
                      </span>
                      <span className="amenity-icon-label">{item.icon}</span>
                    </button>
                    <input
                      value={item.name}
                      onChange={(e) => {
                        const v = e.target.value;
                        setAmenities((prev) =>
                          prev.map((a, i) => (i === idx ? { ...a, name: v } : a)),
                        );
                      }}
                      placeholder="Amenity name"
                      className={err('amenities') ? 'field-error' : ''}
                    />
                    <button
                      type="button"
                      className="amenity-row-remove"
                      onClick={() =>
                        setAmenities((prev) =>
                          prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx),
                        )
                      }
                      aria-label="Remove amenity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="amenity-add-link"
                onClick={() => setAmenities((prev) => [...prev, { icon: 'Wifi', name: '' }])}
              >
                + Add amenity
              </button>
              {err('amenities') && <span className="field-error-text">{err('amenities')}</span>}
            </div>
            <label className="full-width">
              <span className="field-label">
                Facilities (one per line) <span className="field-required">*</span>
              </span>
              <textarea
                rows={3}
                value={facilitiesText}
                onChange={(e) => setFacilitiesText(e.target.value)}
                className={err('facilitiesText') ? 'field-error' : ''}
              />
              {err('facilitiesText') && (
                <span className="field-error-text">{err('facilitiesText')}</span>
              )}
            </label>
            <label className="full-width">
              <span className="field-label">
                Rules (one per line) <span className="field-required">*</span>
              </span>
              <textarea
                rows={3}
                value={rulesText}
                onChange={(e) => setRulesText(e.target.value)}
                className={err('rulesText') ? 'field-error' : ''}
              />
              {err('rulesText') && <span className="field-error-text">{err('rulesText')}</span>}
            </label>
            <label>
              <span className="field-label">
                Weekday 24h Price <span className="field-required">*</span>
              </span>
              <input
                value={weekdayPrice}
                onChange={(e) => setWeekdayPrice(e.target.value)}
                className={err('weekdayPrice') ? 'field-error' : ''}
              />
              {err('weekdayPrice') && (
                <span className="field-error-text">{err('weekdayPrice')}</span>
              )}
            </label>
            <label>
              <span className="field-label">
                Weekend 24h Price <span className="field-required">*</span>
              </span>
              <input
                value={weekendPrice}
                onChange={(e) => setWeekendPrice(e.target.value)}
                className={err('weekendPrice') ? 'field-error' : ''}
              />
              {err('weekendPrice') && (
                <span className="field-error-text">{err('weekendPrice')}</span>
              )}
            </label>
            <label>
              <span className="field-label">
                Contact Phone <span className="field-required">*</span>
              </span>
              <input
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className={err('contactPhone') ? 'field-error' : ''}
              />
              {err('contactPhone') && (
                <span className="field-error-text">{err('contactPhone')}</span>
              )}
            </label>
            <label>
              <span className="field-label">
                Contact Email <span className="field-required">*</span>
              </span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className={err('contactEmail') ? 'field-error' : ''}
              />
              {err('contactEmail') && (
                <span className="field-error-text">{err('contactEmail')}</span>
              )}
            </label>
            <label>
              <span className="field-label">Discount Label</span>
              <input value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </label>
            <label className="field-stack field-stack--checkbox">
              <span className="field-label">Popular</span>
              <span className="checkbox-field">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                />
                <span>Highlight this listing in the customer experience</span>
              </span>
            </label>

            <div className="full-width farm-row-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </SectionCard>

      {activeIconIndex !== null && amenities[activeIconIndex] && (
        <IconPicker
          value={amenities[activeIconIndex].icon}
          onChange={(iconName) => {
            setAmenities((prev) =>
              prev.map((a, i) => (i === activeIconIndex ? { ...a, icon: iconName } : a)),
            );
            setActiveIconIndex(null);
          }}
          onClose={() => setActiveIconIndex(null)}
        />
      )}
    </div>
  );
}
