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

  const decorations = await prisma.decoration.findMany();
  return NextResponse.json(decorations);
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
    name?: string;
    description?: string | null;
    price?: number | null;
    farmId?: string;
  };

  if (!body.name || !body.farmId) {
    return NextResponse.json(
      { message: 'name and farmId are required' },
      { status: 400 }
    );
  }

  const decoration = await prisma.decoration.create({
    data: {
      name: body.name,
      description: body.description ?? undefined,
      price: body.price ?? undefined,
      farmId: body.farmId
    }
  });

  return NextResponse.json(decoration, { status: 201 });
}

