# Crypto Coin Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin CRUD UI for managing supported crypto coins, backed by PostgreSQL via Prisma. Coins were previously hardcoded.

**Architecture:** Coin config moves from hardcoded constants to a Prisma `Coin` model. Server-side `lib/crypto.ts` gains `getCoins()` / `getActiveCoins()` functions with DB-first fallback to hardcoded data. The WebSocket and history hooks are refactored to accept dynamic coin params instead of hardcoded arrays.

**Tech Stack:** Next.js 16 (App Router), Prisma ORM, PostgreSQL, NextAuth.js v4, Tailwind CSS, Recharts.

---

## Task 1: Database — Add Coin model and run migration

**Files:**
- Modify: `prisma/schema.prisma:169-179`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Add Coin model to schema**

Open `prisma/schema.prisma` and add after the `ProjectMember` model (line 179):

```prisma
model Coin {
  id        String   @id @default(cuid())
  symbol    String   // BTC, ETH, SOL, DOGE
  name      String   // Bitcoin, Ethereum, Solana, Dogecoin
  coincapId String   // "bitcoin", "ethereum" — CoinCap asset ID
  color     String   // "#f7931a"
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([symbol])
  @@unique([coincapId])
  @@index([isActive])
}
```

- [ ] **Step 2: Add seedCoins() to prisma/seed.ts**

Open `prisma/seed.ts`. Add import at the top:
```typescript
import { PrismaClient } from '@prisma/client';
```

Add `seedCoins()` function before `main()`:
```typescript
async function seedCoins() {
  const coins = [
    { symbol: 'BTC', name: 'Bitcoin',     coincapId: 'bitcoin',   color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum',   coincapId: 'ethereum',  color: '#627eea' },
    { symbol: 'SOL', name: 'Solana',     coincapId: 'solana',    color: '#14f195' },
    { symbol: 'DOGE', name: 'Dogecoin',  coincapId: 'dogecoin',  color: '#e84142' },
  ];

  for (const coin of coins) {
    await prisma.coin.upsert({
      where: { symbol: coin.symbol },
      update: coin,
      create: coin,
    });
  }
  console.log(`Seeded ${coins.length} coins`);
}
```

Call it inside `main()` before the posts seeding (after line 15):
```typescript
  await seedCoins();
```

- [ ] **Step 3: Generate Prisma client and push schema**

Run:
```
pnpm db:generate && pnpm db:push
```

Expected output: Schema updated, Prisma client regenerated.

- [ ] **Step 4: Run seed**

Run:
```
pnpm db:seed
```

Expected output: "Seeded 4 coins" and "Created 3 posts".

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/seed.ts
git commit -m "feat: add Coin model and seed default crypto coins

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: Server library — Refactor lib/crypto.ts

**Files:**
- Modify: `lib/crypto.ts`

- [ ] **Step 1: Read current lib/crypto.ts**

The current file is 7 lines. We will replace it entirely.

- [ ] **Step 2: Rewrite lib/crypto.ts**

Replace the content of `lib/crypto.ts` with:

```typescript
import { prisma } from '@/lib/db';

export const CRYPTO_COINS_FALLBACK = [
  { symbol: 'BTC', id: 'bitcoin',   name: 'Bitcoin',   color: '#f7931a' },
  { symbol: 'ETH', id: 'ethereum',  name: 'Ethereum',  color: '#627eea' },
  { symbol: 'SOL', id: 'solana',    name: 'Solana',    color: '#14f195' },
  { symbol: 'DOGE', id: 'dogecoin', name: 'Dogecoin',  color: '#e84142' },
] as const;

export type CoinData = {
  symbol: string;
  id: string;       // coincapId
  name: string;
  color: string;
  isActive?: boolean;
};

/** Fetch all coins from DB, falling back to hardcoded data on error */
export async function getCoins(): Promise<CoinData[]> {
  try {
    const coins = await prisma.coin.findMany({
      orderBy: { symbol: 'asc' },
    });
    return coins.map((c) => ({
      symbol: c.symbol,
      id: c.coincapId,
      name: c.name,
      color: c.color,
      isActive: c.isActive,
    }));
  } catch (err) {
    console.warn('[crypto] DB unavailable, using fallback coins:', err);
    return [...CRYPTO_COINS_FALLBACK].map((c) => ({ ...c }));
  }
}

/** Fetch only active coins */
export async function getActiveCoins(): Promise<CoinData[]> {
  try {
    const coins = await prisma.coin.findMany({
      where: { isActive: true },
      orderBy: { symbol: 'asc' },
    });
    return coins.map((c) => ({
      symbol: c.symbol,
      id: c.coincapId,
      name: c.name,
      color: c.color,
      isActive: c.isActive,
    }));
  } catch (err) {
    console.warn('[crypto] DB unavailable, using fallback coins:', err);
    return [...CRYPTO_COINS_FALLBACK].map((c) => ({ ...c }));
  }
}
```

- [ ] **Step 3: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add lib/crypto.ts
git commit -m "feat: refactor lib/crypto.ts with getCoins/getActiveCoins

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 3: API Routes — CRUD for coins

**Files:**
- Create: `app/api/crypto/coins/route.ts`
- Create: `app/api/crypto/coins/[id]/route.ts`

- [ ] **Step 1: Create GET + POST route**

Create directory `app/api/crypto/coins/` and file `route.ts`:

```typescript
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
```

- [ ] **Step 2: Create PATCH + DELETE route**

Create `app/api/crypto/coins/[id]/route.ts`:

```typescript
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

  if (symbol !== undefined && !SYMBOL_REGEX.test(symbol)) {
    errors.push('symbol must be 2-10 uppercase letters');
  }
  if (name !== undefined && (name.length < 2 || name.length > 50)) {
    errors.push('name must be 2-50 characters');
  }
  if (coincapId !== undefined && !COINCAP_ID_REGEX.test(coincapId)) {
    errors.push('coincapId must be 2-50 lowercase letters, numbers, or dashes');
  }
  if (color !== undefined && !COLOR_REGEX.test(color)) {
    errors.push('color must be a valid hex color (3 or 6 digits, optional #)');
  }

  return errors;
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const errors = validatePatchBody(body);
  if (errors.length > 0) {
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { symbol, name, coincapId, color, isActive } = body;

  const existing = await prisma.coin.findUnique({ where: { id: params.id } });
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

  const coin = await prisma.coin.update({
    where: { id: params.id },
    data: updateData,
  });

  return NextResponse.json({ coin });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.coin.findUnique({ where: { id: params.id } });
  if (!existing) {
    return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
  }

  await prisma.coin.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 4: Test API manually**

Start dev server `pnpm dev` in background. Then test with curl:

```bash
# GET all coins (public)
curl -s http://localhost:3000/api/crypto/coins | head -c 500

# GET should return array with 4 coins
```

- [ ] **Step 5: Commit**

```bash
git add app/api/crypto/coins/route.ts app/api/crypto/coins/\[id\]/route.ts
git commit -m "feat: add crypto coins CRUD API routes

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Hooks — Refactor useCryptoWebSocket and useCryptoHistory

**Files:**
- Modify: `hooks/useCryptoWebSocket.ts`
- Modify: `hooks/useCryptoHistory.ts`

- [ ] **Step 1: Read useCryptoWebSocket.ts**

Current file was read earlier. The key changes:
- Remove `const WS_URL = ...` hardcoded line
- Accept `coinIds: string[]` and `coins: CoinData[]` as parameters
- Build WebSocket URL dynamically from `coinIds`
- Use `coins` array (not `CRYPTO_COINS`) to initialize state and map messages

- [ ] **Step 2: Rewrite useCryptoWebSocket.ts**

Replace the content of `hooks/useCryptoWebSocket.ts` with:

```typescript
import { useState, useEffect, useRef, useCallback } from 'react';
import { CoinData } from '@/lib/crypto';

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  priceHistory: { time: number; price: number }[];
}

export interface UseCryptoWebSocketReturn {
  prices: Record<string, CryptoPrice>;
  isConnected: boolean;
  isReconnecting: boolean;
  error: Error | null;
  reconnect: () => void;
}

const MAX_HISTORY_POINTS = 100;
const RECONNECT_DELAYS = [1000, 2000, 4000, 8000, 16000, 30000];

export function useCryptoWebSocket(
  coinIds: string[],
  coins: CoinData[]
): UseCryptoWebSocketReturn {
  const [prices, setPrices] = useState<Record<string, CryptoPrice>>(() => {
    const initial: Record<string, CryptoPrice> = {};
    coins.forEach(({ symbol, name }) => {
      initial[symbol] = { symbol, name, price: 0, priceHistory: [] };
    });
    return initial;
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isManualCloseRef = useRef(false);
  const coinsRef = useRef(coins);
  coinsRef.current = coins;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (coinIds.length === 0) return;

    const wsUrl = `wss://ws.coincap.io/prices?assets=${coinIds.join(',')}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      isManualCloseRef.current = false;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);
        setError(null);
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        const now = Date.now();
        if (now - lastUpdateRef.current < 1000) return;
        lastUpdateRef.current = now;

        const data = JSON.parse(event.data);
        const currentCoins = coinsRef.current;

        setPrices((prev) => {
          const next = { ...prev };
          currentCoins.forEach(({ symbol, id }) => {
            const newPrice = parseFloat(data[id]);
            if (!isNaN(newPrice)) {
              const current = next[symbol];
              next[symbol] = {
                ...current,
                price: newPrice,
                priceHistory: [
                  ...current.priceHistory.slice(-(MAX_HISTORY_POINTS - 1)),
                  { time: now, price: newPrice },
                ],
              };
            }
          });
          return next;
        });
      };

      ws.onerror = () => {
        setError(new Error('WebSocket connection error'));
        ws.close();
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;

        if (isManualCloseRef.current) return;

        const delay = RECONNECT_DELAYS[Math.min(reconnectAttemptRef.current, RECONNECT_DELAYS.length - 1)];
        reconnectAttemptRef.current += 1;
        setIsReconnecting(true);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    }
  }, [coinIds]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      isManualCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
    setIsReconnecting(false);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptRef.current = 0;
    connect();
  }, [connect, disconnect]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { prices, isConnected, isReconnecting, error, reconnect };
}
```

- [ ] **Step 3: Rewrite useCryptoHistory.ts**

Replace the content of `hooks/useCryptoHistory.ts` with:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { CoinData } from '@/lib/crypto';

export interface PricePoint {
  time: number;
  price: number;
}

export interface UseCryptoHistoryReturn {
  history: Record<string, PricePoint[]>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

async function fetchHistory(coins: CoinData[]): Promise<Record<string, PricePoint[]>> {
  const results: Record<string, PricePoint[]> = {};

  const settled = await Promise.allSettled(
    coins.map(async (coin) => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=1`
      );
      if (!response.ok) throw new Error(`Failed to fetch ${coin.id} history`);
      const data = await response.json();
      results[coin.symbol] = data.prices.map(([time, price]: [number, number]) => ({
        time,
        price,
      }));
    })
  );

  const failures = settled.filter((r) => r.status === 'rejected');
  if (failures.length > 0) {
    const failedCoins = failures
      .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      .map((r) => r.reason?.message || 'Unknown error');
    console.warn(`Failed to fetch history for some coins: ${failedCoins.join(', ')}`);
  }

  return results;
}

export function useCryptoHistory(coins: CoinData[]): UseCryptoHistoryReturn {
  const [history, setHistory] = useState<Record<string, PricePoint[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (coins.length === 0) {
      setHistory({});
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchHistory(coins);
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load history'));
    } finally {
      setIsLoading(false);
    }
  }, [coins]);

  useEffect(() => {
    load();
  }, [load]);

  return { history, isLoading, error, refresh: load };
}
```

- [ ] **Step 4: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add hooks/useCryptoWebSocket.ts hooks/useCryptoHistory.ts
git commit -m "refactor: make crypto hooks accept dynamic coin params

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Public crypto page — Update to use DB-backed coins

**Files:**
- Modify: `app/[locale]/crypto/page.tsx`
- Modify: `app/[locale]/crypto/CryptoClient.tsx`

- [ ] **Step 1: Read app/[locale]/crypto/page.tsx**

This is a server component. Currently renders `CryptoClient` directly without passing props.

- [ ] **Step 2: Update app/[locale]/crypto/page.tsx**

Replace `app/[locale]/crypto/page.tsx` content with:

```typescript
import { getActiveCoins } from '@/lib/crypto';
import { CryptoClient } from './CryptoClient';

export default async function CryptoPage() {
  const coins = await getActiveCoins();
  return <CryptoClient coins={coins} />;
}
```

- [ ] **Step 3: Update CryptoClient.tsx to accept coins prop**

Replace `app/[locale]/crypto/CryptoClient.tsx` content with:

```typescript
'use client';

import { useCryptoWebSocket } from '@/hooks/useCryptoWebSocket';
import { useCryptoHistory } from '@/hooks/useCryptoHistory';
import { CoinPriceCard } from '@/components/crypto/CoinPriceCard';
import { CryptoChart } from '@/components/crypto/CryptoChart';
import { CoinData } from '@/lib/crypto';

interface CryptoClientProps {
  coins: CoinData[];
}

export function CryptoClient({ coins }: CryptoClientProps) {
  const coinIds = coins.map((c) => c.id);
  const { prices, isConnected, error: pricesError } = useCryptoWebSocket(coinIds, coins);
  const { history, isLoading, error: historyError } = useCryptoHistory(coins);

  const error = pricesError || historyError;

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold">Live Crypto Prices</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Real-time cryptocurrency prices powered by WebSocket
          </p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-gray-500">
              {isConnected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700">
            {error.message || 'Connection error'}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {coins.map(({ symbol, name, color }) => (
            <CoinPriceCard
              key={symbol}
              symbol={symbol}
              name={name}
              price={prices[symbol]?.price || 0}
              color={color}
            />
          ))}
        </div>

        {!isLoading && (
          <CryptoChart
            history={history}
            liveData={prices}
            coins={coins.map(({ symbol, color }) => ({ symbol, color }))}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add "app/[locale]/crypto/page.tsx" "app/[locale]/crypto/CryptoClient.tsx"
git commit -m "feat: public crypto page uses DB-backed coin config

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 6: Admin crypto page — Update to use DB-backed coins

**Files:**
- Modify: `app/admin/crypto/page.tsx`
- Modify: `app/admin/crypto/CryptoAdminClient.tsx`

- [ ] **Step 1: Update app/admin/crypto/page.tsx**

Replace `app/admin/crypto/page.tsx` content with:

```typescript
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getActiveCoins } from '@/lib/crypto';
import { CryptoAdminClient } from './CryptoAdminClient';

export const metadata: Metadata = {
  title: 'Crypto Monitor (Admin)',
};

export default async function AdminCryptoPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const coins = await getActiveCoins();
  return <CryptoAdminClient coins={coins} />;
}
```

- [ ] **Step 2: Update CryptoAdminClient.tsx to accept coins prop**

Replace `app/admin/crypto/CryptoAdminClient.tsx` content with:

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useCryptoWebSocket } from '@/hooks/useCryptoWebSocket';
import { useCryptoHistory } from '@/hooks/useCryptoHistory';
import { CoinPriceCard } from '@/components/crypto/CoinPriceCard';
import { CryptoChart } from '@/components/crypto/CryptoChart';
import { Button } from '@/components/ui/Button';
import { CoinData } from '@/lib/crypto';

interface CryptoAdminClientProps {
  coins: CoinData[];
}

export function CryptoAdminClient({ coins }: CryptoAdminClientProps) {
  const [selectedCoins, setSelectedCoins] = useState<string[]>(
    coins.filter((c) => c.isActive !== false).map((c) => c.symbol)
  );
  const coinIds = coins.map((c) => c.id);
  const { prices, isConnected, isReconnecting, error, reconnect } = useCryptoWebSocket(coinIds, coins);
  const { history, isLoading, refresh } = useCryptoHistory(coins);

  const toggleCoin = (symbol: string) => {
    setSelectedCoins((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const selectedCoinsConfig = coins.filter(({ symbol }) => selectedCoins.includes(symbol));

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-6xl px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Crypto Monitor</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Admin dashboard</p>
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg bg-gray-100 p-4 dark:bg-gray-800">
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                isConnected ? 'bg-emerald-500' : isReconnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : isReconnecting ? 'Reconnecting...' : 'Disconnected'}
            </span>
          </div>

          <Button onClick={reconnect} size="sm" variant="outline">
            Reconnect
          </Button>

          <Button onClick={refresh} size="sm" variant="outline">
            Refresh History
          </Button>

          <div className="ml-auto flex gap-2">
            {coins.map(({ symbol }) => (
              <label key={symbol} className="flex items-center gap-1 text-sm">
                <input
                  type="checkbox"
                  checked={selectedCoins.includes(symbol)}
                  onChange={() => toggleCoin(symbol)}
                  className="rounded"
                />
                {symbol}
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 p-4 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error.message}
          </div>
        )}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {selectedCoinsConfig.map(({ symbol, name, color }) => (
            <CoinPriceCard
              key={symbol}
              symbol={symbol}
              name={name}
              price={prices[symbol]?.price || 0}
              color={color}
            />
          ))}
        </div>

        {!isLoading && (
          <CryptoChart
            history={history}
            liveData={prices}
            coins={selectedCoinsConfig.map(({ symbol, color }) => ({ symbol, color }))}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add "app/admin/crypto/page.tsx" "app/admin/crypto/CryptoAdminClient.tsx"
git commit -m "feat: admin crypto page uses DB-backed coin config

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: Admin sidebar — Add Coins navigation link

**Files:**
- Modify: `app/admin/layout.tsx`

- [ ] **Step 1: Update app/admin/layout.tsx**

In `app/admin/layout.tsx`, add a nested nav section for Crypto under the existing Crypto link (around line 50-55). The Crypto nav should become a sub-section:

Find:
```tsx
          <Link
            href="/admin/crypto"
            className="block rounded px-4 py-2 hover:bg-gray-800"
          >
            Crypto
          </Link>
```

Replace with:
```tsx
          <div className="mt-2">
            <span className="block px-4 py-2 text-xs font-semibold uppercase text-gray-400">Crypto</span>
            <Link
              href="/admin/crypto"
              className="block rounded px-4 py-2 pl-8 hover:bg-gray-800"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/crypto/coins"
              className="block rounded px-4 py-2 pl-8 hover:bg-gray-800"
            >
              Manage Coins
            </Link>
          </div>
```

- [ ] **Step 2: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/admin/layout.tsx
git commit -m "feat: add Manage Coins nav link in admin sidebar

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: Admin coin management UI — CoinsAdminClient

**Files:**
- Create: `app/admin/crypto/coins/page.tsx`
- Create: `app/admin/crypto/coins/CoinsAdminClient.tsx`

- [ ] **Step 1: Create admin coins page server component**

Create `app/admin/crypto/coins/page.tsx`:

```typescript
import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { getCoins } from '@/lib/crypto';
import { CoinsAdminClient } from './CoinsAdminClient';

export const metadata: Metadata = {
  title: 'Manage Coins (Admin)',
};

export default async function AdminCoinsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const coins = await getCoins();
  return <CoinsAdminClient initialCoins={coins} />;
}
```

- [ ] **Step 2: Create CoinsAdminClient component**

Create `app/admin/crypto/coins/CoinsAdminClient.tsx`. This is the most complex component. It needs:
- A table of coins
- Add coin modal
- Edit coin modal
- Delete confirmation
- Active toggle (PATCH only `isActive` field)
- Toast notifications

```typescript
'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { CoinData } from '@/lib/crypto';

interface CoinsAdminClientProps {
  initialCoins: CoinData[];
}

interface CoinRow extends CoinData {
  createdAt?: string;
  updatedAt?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error';
  message: string;
}

export function CoinsAdminClient({ initialCoins }: CoinsAdminClientProps) {
  const [coins, setCoins] = useState<CoinRow[]>(initialCoins as CoinRow[]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoin, setEditingCoin] = useState<CoinRow | null>(null);
  const [deletingCoin, setDeletingCoin] = useState<CoinRow | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const refetchCoins = useCallback(async () => {
    const res = await fetch('/api/crypto/coins');
    const data = await res.json();
    setCoins(data.coins);
  }, []);

  async function handleAddCoin(formData: FormData) {
    setIsSubmitting(true);
    try {
      const body = {
        symbol: formData.get('symbol') as string,
        name: formData.get('name') as string,
        coincapId: formData.get('coincapId') as string,
        color: formData.get('color') as string,
      };
      const res = await fetch('/api/crypto/coins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Failed to add coin');
        return;
      }
      await refetchCoins();
      setShowAddModal(false);
      addToast('success', `${body.symbol} added successfully`);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleEditCoin(formData: FormData) {
    if (!editingCoin) return;
    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {};
      const symbol = formData.get('symbol');
      const name = formData.get('name');
      const coincapId = formData.get('coincapId');
      const color = formData.get('color');
      if (symbol) body.symbol = symbol;
      if (name) body.name = name;
      if (coincapId) body.coincapId = coincapId;
      if (color) body.color = color;

      const res = await fetch(`/api/crypto/coins/${editingCoin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Failed to update coin');
        return;
      }
      await refetchCoins();
      setEditingCoin(null);
      addToast('success', 'Coin updated successfully');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleActive(coin: CoinRow) {
    const res = await fetch(`/api/crypto/coins/${coin.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coin.isActive }),
    });
    if (!res.ok) {
      addToast('error', 'Failed to toggle coin active status');
      return;
    }
    await refetchCoins();
    addToast('success', `${coin.symbol} ${!coin.isActive ? 'activated' : 'deactivated'}`);
  }

  async function handleDeleteCoin() {
    if (!deletingCoin) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/crypto/coins/${deletingCoin.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const err = await res.json();
        addToast('error', err.error || 'Failed to delete coin');
        return;
      }
      await refetchCoins();
      setDeletingCoin(null);
      addToast('success', `${deletingCoin.symbol} deleted`);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-6xl px-4">
        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/admin" className="hover:text-gray-700">Admin</Link>
          <span>/</span>
          <Link href="/admin/crypto" className="hover:text-gray-700">Crypto</Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">Manage Coins</span>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Manage Coins</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Coin
          </button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Symbol</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">CoinCap ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Color</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Active</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:bg-gray-900 dark:divide-gray-700">
              {coins.map((coin) => (
                <tr key={coin.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {coin.symbol}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {coin.name}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {coin.id}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded"
                        style={{ backgroundColor: coin.color }}
                      />
                      <span className="text-sm text-gray-500">{coin.color}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(coin)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        coin.isActive !== false ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          coin.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                    <button
                      onClick={() => setEditingCoin(coin)}
                      className="mr-3 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingCoin(coin)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {coins.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No coins found. Add your first coin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <Modal title="Add Coin" onClose={() => setShowAddModal(false)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddCoin(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                <input name="symbol" required placeholder="BTC" maxLength={10}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input name="name" required placeholder="Bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CoinCap ID</label>
                <input name="coincapId" required placeholder="bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                <div className="flex gap-2">
                  <input type="color" name="color" defaultValue="#f7931a"
                    className="h-10 w-20 rounded border border-gray-300 p-1 dark:border-gray-600" />
                  <input type="text" name="color" required placeholder="#f7931a" maxLength={7}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Adding...' : 'Add Coin'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Edit Modal */}
        {editingCoin && (
          <Modal title={`Edit ${editingCoin.symbol}`} onClose={() => setEditingCoin(null)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditCoin(new FormData(e.currentTarget));
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Symbol</label>
                <input name="symbol" defaultValue={editingCoin.symbol} required placeholder="BTC" maxLength={10}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                <input name="name" defaultValue={editingCoin.name} required placeholder="Bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CoinCap ID</label>
                <input name="coincapId" defaultValue={editingCoin.id} required placeholder="bitcoin" maxLength={50}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                <div className="flex gap-2">
                  <input type="color" name="color" defaultValue={editingCoin.color}
                    className="h-10 w-20 rounded border border-gray-300 p-1 dark:border-gray-600" />
                  <input type="text" name="color" defaultValue={editingCoin.color} required placeholder="#f7931a" maxLength={7}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditingCoin(null)}
                  className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting}
                  className="rounded bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation */}
        {deletingCoin && (
          <Modal title="Delete Coin" onClose={() => setDeletingCoin(null)}>
            <p className="text-gray-700 dark:text-gray-300">
              Delete <strong>{deletingCoin.symbol}</strong> ({deletingCoin.name})? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button onClick={() => setDeletingCoin(null)}
                className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400">
                Cancel
              </button>
              <button onClick={handleDeleteCoin} disabled={isSubmitting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </Modal>
        )}

        {/* Toasts */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`rounded px-4 py-3 text-sm font-medium shadow-lg ${
                toast.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50">
      <div className="z-50 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Run typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add "app/admin/crypto/coins/page.tsx" "app/admin/crypto/coins/CoinsAdminClient.tsx"
git commit -m "feat: add admin coin management UI page

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 9: Build verification

**Files:**
- None (verification only)

- [ ] **Step 1: Run full typecheck**

Run:
```
pnpm typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 2: Run lint**

Run:
```
pnpm lint
```

Expected: No lint errors.

- [ ] **Step 3: Run build**

Run:
```
pnpm build
```

Expected: Build succeeds without errors.

- [ ] **Step 4: Final commit (if any verification fixes were needed)**

If any files were modified to fix build/lint errors, commit them:
```bash
git add -A
git commit -m "fix: resolve build/lint issues in crypto coin management

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 10: Manual E2E verification

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server and test the full flow**

```bash
pnpm dev
```

1. Navigate to `http://localhost:3000/admin/crypto/coins`
   - Should redirect to signin if not logged in
   - Should show "Manage Coins" table with BTC, ETH, SOL, DOGE

2. Click "+ Add Coin" — fill in form (e.g., XRP / Ripple / ripple / #00aae4)
   - Submit → coin appears in table

3. Click "Edit" on XRP → change color → Save → table updates

4. Click toggle on XRP → coin deactivates → refresh page → XRP disappears from public `/crypto` page

5. Click "Delete" on XRP → confirm → coin removed from table

6. Navigate to `/admin/crypto` → dashboard shows active coins

7. Navigate to `/crypto` → public page shows active coins

8. Test DB fallback: stop PostgreSQL, refresh pages → should still show fallback coins (BTC, ETH, SOL, DOGE)
