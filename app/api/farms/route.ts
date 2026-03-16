import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../_lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireAuth(req);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: 401 }
    );
  }

  const farms = await prisma.farm.findMany();
  return NextResponse.json(farms);
}

export async function POST(req: NextRequest) {
  let payload;
  try {
    payload = requireRole(req, [Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 }
    );
  }

  const body = (await req.json()) as {
    farms?: {
      name?: string;
      location?: string | null;
      description?: string | null;
      price?: string | null;
      originalPrice?: string | null;
      rating?: number | null;
      reviews?: number | null;
      capacity?: string | null;
      features?: string[];
      amenities?: string[];
      facilities?: string[];
      pricing?: any;
      rules?: string[];
      contactPhone?: string | null;
      contactEmail?: string | null;
      isPopular?: boolean | null;
      discount?: string | null;
      weekdayPrice?: string | null;
      weekendPrice?: string | null;
      photoImageUrls?: string[];
    }[];
  };

  if (!body.farms || !Array.isArray(body.farms) || body.farms.length === 0) {
    return NextResponse.json(
      { message: 'farms array is required' },
      { status: 400 }
    );
  }

  const ownerId = payload.sub;

  try {
    const created = await prisma.$transaction(async (tx) => {
      const results = [];
      for (const f of body.farms!) {
        const name = (f.name ?? '').trim();
        if (!name) continue;

        const photoUrls = (Array.isArray(f.photoImageUrls) ? f.photoImageUrls : [])
          .map((u) => (typeof u === 'string' ? u.trim() : ''))
          .filter(Boolean);

        if (photoUrls.length < 10) {
          throw new Error(`Farm "${name}" requires at least 10 photos.`);
        }

        const farm = await tx.farm.create({
          data: {
            name,
            location: f.location ?? undefined,
            description: f.description ?? undefined,
            ownerId,
            photos: {
              create: photoUrls.map((url, idx) => ({
                title: `Photo ${idx + 1}`,
                imageUrl: url
              }))
            },
            ...( {
              price: f.price ?? undefined,
              originalPrice: f.originalPrice ?? undefined,
              rating: f.rating ?? undefined,
              reviews: f.reviews ?? undefined,
              capacity: f.capacity ?? undefined,
              features: f.features ?? [],
              amenities: f.amenities ?? [],
              facilities: f.facilities ?? [],
              pricing: f.pricing ?? undefined,
              rules: f.rules ?? [],
              contactPhone: f.contactPhone ?? undefined,
              contactEmail: f.contactEmail ?? undefined,
              isPopular: f.isPopular ?? false,
              discount: f.discount ?? undefined,
              weekdayPrice: f.weekdayPrice ?? undefined,
              weekendPrice: f.weekendPrice ?? undefined
            } as any)
          }
        });
        results.push(farm);
      }
      return results;
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message ?? 'Failed to create farm(s)' },
      { status: 400 }
    );
  }
}

