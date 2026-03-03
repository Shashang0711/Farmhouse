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

  const photos = await prisma.photography.findMany();
  return NextResponse.json(photos);
}

export async function POST(req: NextRequest) {
  try {
    requireRole(req, [Role.OWNER, Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 }
    );
  }

  const body = (await req.json()) as {
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    farmId?: string;
  };

  if (!body.title || !body.farmId) {
    return NextResponse.json(
      { message: 'title and farmId are required' },
      { status: 400 }
    );
  }

  const photo = await prisma.photography.create({
    data: {
      title: body.title,
      description: body.description ?? undefined,
      imageUrl: body.imageUrl ?? undefined,
      farmId: body.farmId
    }
  });

  return NextResponse.json(photo, { status: 201 });
}

