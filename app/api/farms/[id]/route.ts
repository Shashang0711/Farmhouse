import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';
import { Role } from '@prisma/client';
import { requireAuth, requireRole } from '../../_lib/auth';

type Params = { params: { id: string } };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    requireAuth(req);
  } catch (err: any) {
    return NextResponse.json({ message: err.message || 'Unauthorized' }, { status: 401 });
  }

  const farm = await prisma.farm.findUnique({
    where: { id: params.id },
    include: { photos: true, decorations: true },
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
  };

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
      ...(body.amenities !== undefined ? { amenities: body.amenities } : {}),
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
    await prisma.$transaction(async (tx) => {
      await tx.photography.deleteMany({ where: { farmId: params.id } });
      await tx.decoration.deleteMany({ where: { farmId: params.id } });
      await tx.farm.delete({ where: { id: params.id } });
    });

    return new NextResponse(null, { status: 204 }); // ✅ FIXED
  } catch (err: any) {
    return NextResponse.json({ message: err?.message ?? 'Failed to delete farm' }, { status: 400 });
  }
}
