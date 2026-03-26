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

  const photo = await prisma.photography.findUnique({
    where: { id: params.id },
    include: { images: true },
  });
  if (!photo) {
    return NextResponse.json({ message: 'Photography not found' }, { status: 404 });
  }
  return NextResponse.json(photo);
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
    title?: string;
    thumbnailUrl?: string | null;
    images?: string[];
  };

  const imagesData = Array.isArray(body.images) ? body.images.filter(Boolean) : undefined;
  if (imagesData && imagesData.length > 0 && imagesData.length < 10) {
    return NextResponse.json({ message: 'At least 10 images are required' }, { status: 400 });
  }

  const photo = await prisma.photography.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.thumbnailUrl !== undefined ? { thumbnailUrl: body.thumbnailUrl } : {}),
      ...(imagesData
        ? {
            images: {
              deleteMany: {},
              create: imagesData.map((url) => ({ imageUrl: url })),
            },
          }
        : {}),
    },
    include: { images: true },
  });

  return NextResponse.json(photo);
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

  await prisma.photography.delete({ where: { id: params.id } });
  return NextResponse.json(null, { status: 204 });
}
