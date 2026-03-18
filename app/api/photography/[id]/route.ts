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
    description?: string | null;
    imageUrl?: string | null;
  };

  const photo = await prisma.photography.update({
    where: { id: params.id },
    data: {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.imageUrl !== undefined ? { imageUrl: body.imageUrl } : {}),
    },
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
