import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/prisma/client';
import { Role } from '@prisma/client';
import { requireRole } from '../_lib/auth';

export async function GET(req: NextRequest) {
  try {
    requireRole(req, [Role.OWNER, Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 }
    );
  }

  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  let creator;
  try {
    creator = requireRole(req, [Role.OWNER, Role.ADMIN]);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Unauthorized' },
      { status: err.message === 'Forbidden' ? 403 : 401 }
    );
  }

  const body = (await req.json()) as {
    email?: string;
    name?: string;
    password?: string;
    role?: Role;
  };

  if (!body.email || !body.name || !body.password || !body.role) {
    return NextResponse.json(
      { message: 'email, name, password and role are required' },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: body.email }
  });
  if (existing) {
    return NextResponse.json(
      { message: 'Email already in use' },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: passwordHash,
      role: body.role
    }
  });

  return NextResponse.json(user, { status: 201 });
}

