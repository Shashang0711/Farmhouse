import { NextResponse } from 'next/server';
import { prisma } from '@/prisma/client';

/**
 * Public aggregate counts for the login hero (no auth).
 * Intentionally limited to non-sensitive totals for the admin landing UI.
 */
export async function GET() {
  const [farms, users, decorations, photography] = await Promise.all([
    prisma.farm.count(),
    prisma.user.count(),
    prisma.decoration.count(),
    prisma.photography.count(),
  ]);

  return NextResponse.json({
    farms,
    users,
    /** Decor + photography listing rows (matches “Decor and media records”). */
    decorMedia: decorations + photography,
  });
}
