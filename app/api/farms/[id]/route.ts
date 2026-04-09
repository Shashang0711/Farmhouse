import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { Role } from '@prisma/client';
import { deleteStoredImagesFromS3 } from '@/app/lib/upload-storage';
import { requireAuth, requireRole } from '../../_lib/auth';
import { normalizeAmenitiesForStorage, type AmenityPayload } from '@/app/lib/amenities';
import { validateFarmUpdatePayload } from '@/app/lib/farm-validation';

type Params = { params: { id: string } };

/** Matches DB row for delete cleanup; Prisma client types may lag after schema changes. */
type FarmDeleteMedia = {
  images: { imageUrl: string }[];
  thumbnailUrl: string | null;
};

export async function GET(req: NextRequest, { params }: Params) {
  const farm = await prisma.farm.findUnique({
    where: { id: params.id },
    include: {
      images: { select: { id: true, imageUrl: true, farmId: true } },
    },
  });
  if (!farm) {
    return NextResponse.json({ message: 'Farm not found' }, { status: 404 });
  }
  return NextResponse.json(farm);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    requireRole(req, [Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 },
    );
  }

  const body = (await req.json()) as {
    name?: string;
    location?: string | null;
    description?: string | null;
    price?: string | null;
    originalPrice?: string | null;
    rating?: number | null;
    reviews?: number | null;
    capacity?: string | null;
    features?: string[];
    amenities?: AmenityPayload[];
    facilities?: string[];
    pricing?: any;
    rules?: string[];
    contactPhone?: string | null;
    contactEmail?: string | null;
    isPopular?: boolean | null;
    discount?: string | null;
    weekdayPrice?: string | null;
    weekendPrice?: string | null;
    thumbnailImageUrl?: string | null;
  };

  const updateErr = validateFarmUpdatePayload({
    name: body.name,
    location: body.location ?? undefined,
    description: body.description ?? undefined,
    price: body.price ?? undefined,
    originalPrice: body.originalPrice ?? undefined,
    rating: body.rating ?? undefined,
    reviews: body.reviews ?? undefined,
    capacity: body.capacity ?? undefined,
    features: body.features,
    amenities: body.amenities,
    facilities: body.facilities,
    rules: body.rules,
    contactPhone: body.contactPhone ?? undefined,
    contactEmail: body.contactEmail ?? undefined,
    discount: body.discount ?? undefined,
    weekdayPrice: body.weekdayPrice ?? undefined,
    weekendPrice: body.weekendPrice ?? undefined,
  });
  if (updateErr) {
    return NextResponse.json({ message: updateErr }, { status: 400 });
  }

  const farm = await prisma.farm.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.location !== undefined ? { location: body.location } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
      ...(body.originalPrice !== undefined ? { originalPrice: body.originalPrice } : {}),
      ...(body.rating !== undefined ? { rating: body.rating } : {}),
      ...(body.reviews !== undefined ? { reviews: body.reviews } : {}),
      ...(body.capacity !== undefined ? { capacity: body.capacity } : {}),
      ...(body.features !== undefined ? { features: body.features } : {}),
      ...(body.amenities !== undefined
        ? { amenities: normalizeAmenitiesForStorage(body.amenities) }
        : {}),
      ...(body.facilities !== undefined ? { facilities: body.facilities } : {}),
      ...(body.pricing !== undefined ? { pricing: body.pricing } : {}),
      ...(body.rules !== undefined ? { rules: body.rules } : {}),
      ...(body.contactPhone !== undefined ? { contactPhone: body.contactPhone } : {}),
      ...(body.contactEmail !== undefined ? { contactEmail: body.contactEmail } : {}),
      ...(body.isPopular !== undefined && body.isPopular !== null
        ? { isPopular: body.isPopular }
        : {}),
      ...(body.discount !== undefined ? { discount: body.discount } : {}),
      ...(body.weekdayPrice !== undefined ? { weekdayPrice: body.weekdayPrice } : {}),
      ...(body.weekendPrice !== undefined ? { weekendPrice: body.weekendPrice } : {}),
      ...(body.thumbnailImageUrl !== undefined
        ? {
            thumbnailUrl:
              body.thumbnailImageUrl === null || body.thumbnailImageUrl === ''
                ? null
                : String(body.thumbnailImageUrl).trim(),
          }
        : {}),
    },
  });

  return NextResponse.json(farm);
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    requireRole(req, [Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 },
    );
  }

  try {
    const farm = (await prisma.farm.findUnique({
      where: { id: params.id },
      include: { images: true },
    })) as FarmDeleteMedia | null;
    if (!farm) {
      return NextResponse.json({ message: 'Farm not found' }, { status: 404 });
    }
    const urls = [
      ...farm.images.map((i) => i.imageUrl),
      ...(farm.thumbnailUrl ? [farm.thumbnailUrl] : []),
    ];

    await prisma.$transaction(async (tx) => {
      await tx.farm.delete({ where: { id: params.id } });
    });

    await deleteStoredImagesFromS3(urls);

    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? 'Failed to delete farm' }, { status: 400 });
  }
}
