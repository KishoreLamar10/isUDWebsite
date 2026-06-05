import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const facilityUses = await prisma.facilityUse.findMany({
      where: { archivedAt: null },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });

    return NextResponse.json(facilityUses);
  } catch (error) {
    console.error('Error fetching facility uses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
