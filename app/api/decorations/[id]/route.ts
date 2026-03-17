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

  const decoration = await prisma.decoration.findUnique({
    where: { id: params.id },
  });
  if (!decoration) {
    return NextResponse.json({ message: 'Decoration not found' }, { status: 404 });
  }
  return NextResponse.json(decoration);
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
    description?: string | null;
    price?: number | null;
  };

  const decoration = await prisma.decoration.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.price !== undefined ? { price: body.price } : {}),
    },
  });

  return NextResponse.json(decoration);
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

  await prisma.decoration.delete({ where: { id: params.id } });
  return NextResponse.json(null, { status: 204 });
}
