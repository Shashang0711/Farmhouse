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
    payload = requireRole(req, [Role.OWNER, Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 }
    );
  }

  const body = (await req.json()) as {
    farms?: { name?: string; location?: string | null; description?: string | null }[];
  };

  if (!body.farms || !Array.isArray(body.farms) || body.farms.length === 0) {
    return NextResponse.json(
      { message: 'farms array is required' },
      { status: 400 }
    );
  }

  const ownerId = payload.sub;

  const created = await prisma.$transaction(async (tx) => {
    const results = [];
    for (const f of body.farms!) {
      if (!f.name) continue;
      const farm = await tx.farm.create({
        data: {
          name: f.name,
          location: f.location ?? undefined,
          description: f.description ?? undefined,
          ownerId
        }
      });
      results.push(farm);
    }
    return results;
  });

  return NextResponse.json(created, { status: 201 });
}

