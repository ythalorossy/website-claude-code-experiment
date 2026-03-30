import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const SYMBOL_REGEX = /^[A-Z]{2,10}$/;
const COINCAP_ID_REGEX = /^[a-z0-9-]{2,50}$/;
const COLOR_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validateCoinBody(body: Record<string, unknown>) {
  const errors: string[] = [];

  const symbol = body.symbol as string | undefined;
  const name = body.name as string | undefined;
  const coincapId = body.coincapId as string | undefined;
  const color = body.color as string | undefined;

  if (!symbol || !SYMBOL_REGEX.test(symbol)) {
    errors.push('symbol must be 2-10 uppercase letters');
  }
  if (!name || name.length < 2 || name.length > 50) {
    errors.push('name must be 2-50 characters');
  }
  if (!coincapId || !COINCAP_ID_REGEX.test(coincapId)) {
    errors.push('coincapId must be 2-50 lowercase letters, numbers, or dashes');
  }
  if (!color || !COLOR_REGEX.test(color)) {
    errors.push('color must be a valid hex color (3 or 6 digits, optional #)');
  }

  return errors;
}

export async function GET() {
  const coins = await prisma.coin.findMany({
    orderBy: { symbol: 'asc' },
  });
  return NextResponse.json({ coins });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const errors = validateCoinBody(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { symbol, name, coincapId, color } = body;

  // Check for existing symbol or coincapId
  const existing = await prisma.coin.findFirst({
    where: { OR: [{ symbol }, { coincapId }] },
  });
  if (existing) {
    const conflict = existing.symbol === symbol ? 'symbol' : 'coincapId';
    return NextResponse.json({ error: `A coin with this ${conflict} already exists` }, { status: 409 });
  }

  const coin = await prisma.coin.create({
    data: { symbol, name, coincapId, color },
  });

  return NextResponse.json({ coin }, { status: 201 });
}
