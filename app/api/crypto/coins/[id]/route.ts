import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

const SYMBOL_REGEX = /^[A-Z]{2,10}$/;
const COINCAP_ID_REGEX = /^[a-z0-9-]{2,50}$/;
const COLOR_REGEX = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validatePatchBody(body: Record<string, unknown>) {
  const errors: string[] = [];

  const symbol = body.symbol as string | undefined;
  const name = body.name as string | undefined;
  const coincapId = body.coincapId as string | undefined;
  const color = body.color as string | undefined;

  if (symbol !== undefined) {
    if (typeof symbol !== 'string' || !SYMBOL_REGEX.test(symbol)) {
      errors.push('symbol must be 2-10 uppercase letters');
    }
  }
  if (name !== undefined) {
    if (typeof name !== 'string' || name.length < 2 || name.length > 50) {
      errors.push('name must be 2-50 characters');
    }
  }
  if (coincapId !== undefined) {
    if (typeof coincapId !== 'string' || !COINCAP_ID_REGEX.test(coincapId)) {
      errors.push('coincapId must be 2-50 lowercase letters, numbers, or dashes');
    }
  }
  if (color !== undefined) {
    if (typeof color !== 'string' || !COLOR_REGEX.test(color)) {
      errors.push('color must be a valid hex color (3 or 6 digits, optional #)');
    }
  }

  return errors;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const errors = validatePatchBody(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { symbol, name, coincapId, color, isActive } = body;
  const { id } = await params;

  const existing = await prisma.coin.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
  }

  // Check for conflicts with other coins
  if (symbol && symbol !== existing.symbol) {
    const conflict = await prisma.coin.findUnique({ where: { symbol } });
    if (conflict) {
      return NextResponse.json({ error: 'A coin with this symbol already exists' }, { status: 409 });
    }
  }
  if (coincapId && coincapId !== existing.coincapId) {
    const conflict = await prisma.coin.findUnique({ where: { coincapId } });
    if (conflict) {
      return NextResponse.json({ error: 'A coin with this coincapId already exists' }, { status: 409 });
    }
  }

  const updateData: Record<string, unknown> = {};
  if (symbol !== undefined) updateData.symbol = symbol;
  if (name !== undefined) updateData.name = name;
  if (coincapId !== undefined) updateData.coincapId = coincapId;
  if (color !== undefined) updateData.color = color;
  if (isActive !== undefined) updateData.isActive = isActive;

  try {
    const coin = await prisma.coin.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ coin });
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code?: string }).code === 'P2002'
    ) {
      return NextResponse.json({ error: 'A coin with this symbol or coincapId already exists' }, { status: 409 });
    }
    throw err;
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.coin.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
  }

  await prisma.coin.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
