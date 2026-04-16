# Games Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/games` public page and full admin CMS for game projects, separate from the existing Project model.

**Architecture:** New `Game` Prisma model with genre/platform/engine arrays. Public page at `/[locale]/games` with hero (most recent game), grid/list view toggle. Admin at `/admin/games` with full CRUD. REST API at `/api/games`.

**Tech Stack:** Next.js 16, Prisma, PostgreSQL, Tailwind CSS, Lucide icons.

---

## File Structure

```
prisma/schema.prisma                              # Add Game model
app/api/games/route.ts                           # GET list, POST create
app/api/games/[id]/route.ts                      # GET, PATCH, DELETE
app/admin/games/page.tsx                         # Admin table listing
app/admin/games/new/page.tsx                     # Create form
app/admin/games/[id]/edit/page.tsx               # Edit form
app/[locale]/games/page.tsx                      # Public server page
app/[locale]/games/components/GamesClient.tsx    # Client: view toggle + renders grid/list
app/[locale]/games/components/GamesHero.tsx      # Featured game hero
app/[locale]/games/components/GamesGrid.tsx     # Grid card view
app/[locale]/games/components/GamesList.tsx     # List row view
messages/en.json                                 # Add Games i18n keys
messages/pt.json                                 # Add Games i18n keys
messages/es.json                                 # Add Games i18n keys
```

---

## Task 1: Add Game Model to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma:152-167` (after Project model)

- [ ] **Step 1: Add Game model to schema**

After line 167 (`}` closing Project model), add:

```prisma
model Game {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  image       String?
  genre       String[]  @default([])
  platform    String[]  @default([])
  engine      String[]  @default([])
  playUrl     String?
  itchUrl     String?
  status      Boolean   @default(true)
  startDate   DateTime?
  endDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

- [ ] **Step 2: Generate Prisma client and push schema**

Run: `npx prisma generate && npx prisma db push`
Expected: Game model generated, schema pushed to database.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat(db): add Game model for games section"
```

---

## Task 2: Create API Routes

**Files:**
- Create: `app/api/games/route.ts`
- Create: `app/api/games/[id]/route.ts`

- [ ] **Step 1: Create `app/api/games/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const games = await prisma.game.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ games });
  } catch (error) {
    console.error('Error fetching games:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, image, genre, platform, engine, playUrl, itchUrl, status, startDate, endDate } = body;

    const game = await prisma.game.create({
      data: {
        title,
        description,
        image,
        genre: genre || [],
        platform: platform || [],
        engine: engine || [],
        playUrl,
        itchUrl,
        status: status ?? true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return NextResponse.json(game, { status: 201 });
  } catch (error) {
    console.error('Error creating game:', error);
    return NextResponse.json({ error: 'Failed to create game' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create `app/api/games/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch (error) {
    console.error('Error fetching game:', error);
    return NextResponse.json({ error: 'Failed to fetch game' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, image, genre, platform, engine, playUrl, itchUrl, status, startDate, endDate } = body;

    const game = await prisma.game.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(genre !== undefined && { genre }),
        ...(platform !== undefined && { platform }),
        ...(engine !== undefined && { engine }),
        ...(playUrl !== undefined && { playUrl }),
        ...(itchUrl !== undefined && { itchUrl }),
        ...(status !== undefined && { status }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return NextResponse.json(game);
  } catch (error) {
    console.error('Error updating game:', error);
    return NextResponse.json({ error: 'Failed to update game' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.game.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json({ error: 'Failed to delete game' }, { status: 500 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/games/route.ts app/api/games/[id]/route.ts
git commit -m "feat(api): add games CRUD endpoints"
```

---

## Task 3: Build Admin Games Page (Table Listing)

**Files:**
- Create: `app/admin/games/page.tsx`

- [ ] **Step 1: Create `app/admin/games/page.tsx`**

Pattern mirrors `app/admin/projects/page.tsx` but with Game fields. Key differences:
- Columns: Title, Status, Genres, Platforms, Engines, Created, Actions
- Genres/Platforms/Engines displayed as tag pills (like technologies in projects)
- No members column
- Edit links to `/admin/games/${id}/edit`
- Delete calls `DELETE /api/games/${id}`

```tsx
'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string | null;
  genre: string[];
  platform: string[];
  engine: string[];
  playUrl: string | null;
  itchUrl: string | null;
  status: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export default function AdminGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useState(() => {
    fetch('/api/games')
      .then((res) => res.json())
      .then((data) => {
        setGames(data.games || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  });

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/games/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: !currentStatus }),
      });
      if (res.ok) {
        startTransition(() => {
          setGames((prev) => prev.map((g) => (g.id === id ? { ...g, status: !currentStatus } : g)));
        });
      }
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const deleteGame = async (id: string) => {
    if (!confirm('Are you sure you want to delete this game?')) return;
    try {
      const res = await fetch(`/api/games/${id}`, { method: 'DELETE' });
      if (res.ok) {
        startTransition(() => {
          setGames((prev) => prev.filter((g) => g.id !== id));
        });
      }
    } catch (error) {
      console.error('Failed to delete game:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Games</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your games</p>
        </div>
        <Link href="/admin/games/new">
          <Button>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Game
          </Button>
        </Link>
      </div>

      <Card>
        <div className="overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gradient-to-r from-brand-500 to-accent-500 text-white">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Game</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Genres</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Platforms</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Engines</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider">Created</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {games.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No games yet.
                  </td>
                </tr>
              ) : (
                games.map((game) => (
                  <tr key={game.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        {game.image ? (
                          <img src={game.image} alt="" className="h-10 w-10 rounded-lg object-cover ring-2 ring-brand-500/20" />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white ring-2 ring-brand-500/20">
                            {game.title.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{game.title}</span>
                          <div className="flex gap-2">
                            {game.playUrl && (
                              <a href={game.playUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" aria-label="Play">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </a>
                            )}
                            {game.itchUrl && (
                              <a href={game.itchUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" aria-label="Itch.io">
                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M3.13 1.338C2.08 1.96.02 4.328 0 4.95v1.03c0 1.303 1.22 2.45 2.325 2.45 1.33 0 2.435-1.147 2.435-2.45V3.6c0-.097.04-.19.116-.255.16-.136 1.345-1.028 1.645-1.653H8.93c-.33.625-.98 1.35-1.745 1.653-.16.065-.116.158-.116.255v9.57c0 .097.04.19.116.255 1.345.625 2.48 2.333 3.13 3.005.065.065.146.095.22.095h9.64c.074 0 .156-.03.22-.095.65-.672 1.785-2.38 3.13-3.005.077-.065.117-.158.117-.255v-9.57c0-.097-.04-.19-.116-.255-.766-.303-1.416-1.028-1.745-1.653h2.41c.3.625 1.486 1.517 1.646 1.653.075.065.116.158.116.255v1.03c0 .622-2.08 2.612-3.13 2.98C21.92 9.43 21.97 9.4 22 9.36V4.95c-.03.04-.08-.07-2.87-.622C17.08.96 15.02-1.41 14.97-1.96v-1.03c0-1.303-1.22-2.45-2.325-2.45-1.33 0-2.435 1.147-2.435 2.45v1.34c0 .097-.04.19-.116.255-1.345.625-2.48 2.332-3.13 3.005-.065.065-.146.095-.22.095H2.22c-.074 0-.155-.03-.22-.095-.65-.673-1.785-2.38-3.13-3.005C-1.07 1.47-1.11 1.377-1.11 1.28v-.95c.615.57 2.135 1.01 4.24 1.01z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => toggleStatus(game.id, game.status)}
                        disabled={isPending}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-all ${
                          game.status
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${game.status ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {game.status ? 'Active' : 'Archived'}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {game.genre.slice(0, 3).map((g) => (
                          <span key={g} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{g}</span>
                        ))}
                        {game.genre.length > 3 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">+{game.genre.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {game.platform.slice(0, 3).map((p) => (
                          <span key={p} className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">{p}</span>
                        ))}
                        {game.platform.length > 3 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">+{game.platform.length - 3}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {game.engine.slice(0, 3).map((e) => (
                          <span key={e} className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">{e}</span>
                        ))}
                        {game.engine.length > 3 && <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">+{game.engine.length - 3}</span>}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {new Date(game.createdAt).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/games/${game.id}/edit`}
                          className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
                          title="Edit"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => deleteGame(game.id)}
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/games/page.tsx
git commit -m "feat(admin): add games admin listing page"
```

---

## Task 4: Build Admin Game Create/Edit Forms

**Files:**
- Create: `app/admin/games/new/page.tsx`
- Create: `app/admin/games/[id]/edit/page.tsx`

- [ ] **Step 1: Create `app/admin/games/new/page.tsx`**

Pattern mirrors `app/admin/projects/new/page.tsx`. Key differences:
- Fields: title, description, image, genre (checkbox group), platform (checkbox group), engine (checkbox group), playUrl, itchUrl, status, startDate, endDate
- Genre/platform/engine use checkbox groups with predefined options (not comma-separated text)
- No members section

Predefined options:
```typescript
const GENRE_OPTIONS = ['RPG', 'FPS', 'Puzzle', 'Platformer', 'Strategy', 'Adventure', 'Simulation', 'Sports', 'Horror', 'Other'];
const PLATFORM_OPTIONS = ['PC', 'Mobile', 'Web', 'Console', 'Nintendo Switch', 'PlayStation', 'Xbox'];
const ENGINE_OPTIONS = ['Unity', 'Unreal', 'Godot', 'Phaser', 'GameMaker', 'Construct', 'Custom', 'Other'];
```

For each array field (genre/platform/engine), the form stores selected values as string arrays, submitted directly to the API (not comma-separated like technologies in projects).

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const GENRE_OPTIONS = ['RPG', 'FPS', 'Puzzle', 'Platformer', 'Strategy', 'Adventure', 'Simulation', 'Sports', 'Horror', 'Other'];
const PLATFORM_OPTIONS = ['PC', 'Mobile', 'Web', 'Console', 'Nintendo Switch', 'PlayStation', 'Xbox'];
const ENGINE_OPTIONS = ['Unity', 'Unreal', 'Godot', 'Phaser', 'GameMaker', 'Construct', 'Custom', 'Other'];

export default function NewGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    playUrl: '',
    itchUrl: '',
    status: true,
    startDate: '',
    endDate: '',
  });

  const [genre, setGenre] = useState<string[]>([]);
  const [platform, setPlatform] = useState<string[]>([]);
  const [engine, setEngine] = useState<string[]>([]);

  const toggleArrayField = (field: 'genre' | 'platform' | 'engine', value: string) => {
    const setValues = field === 'genre' ? setGenre : field === 'platform' ? setPlatform : setEngine;
    const values = field === 'genre' ? genre : field === 'platform' ? platform : engine;
    if (values.includes(value)) {
      setValues(values.filter((v) => v !== value));
    } else {
      setValues([...values, value]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          genre,
          platform,
          engine,
        }),
      });

      if (!res.ok) throw new Error('Failed to create game');
      router.push('/admin/games');
      router.refresh();
    } catch (err) {
      setError('Failed to create game');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/games" className="mb-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Games
        </Link>
        <h1 className="text-3xl font-bold">Add Game</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-slate-900">
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">{error}</div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Title *</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Description *</label>
            <textarea rows={4} required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Image URL</label>
            <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/game-image.jpg"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Play URL</label>
            <input type="url" value={formData.playUrl} onChange={(e) => setFormData({ ...formData, playUrl: e.target.value })}
              placeholder="https://play.example.com/game"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Itch.io URL</label>
            <input type="url" value={formData.itchUrl} onChange={(e) => setFormData({ ...formData, itchUrl: e.target.value })}
              placeholder="https://yourname.itch.io/game"
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Start Date</label>
            <input type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">End Date</label>
            <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-slate-800" />
          </div>

          {/* Genre checkboxes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Genre</label>
            <div className="flex flex-wrap gap-2">
              {GENRE_OPTIONS.map((opt) => (
                <label key={opt} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm cursor-pointer transition-colors ${
                  genre.includes(opt)
                    ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-300 dark:border-brand-700'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                  <input type="checkbox" checked={genre.includes(opt)} onChange={() => toggleArrayField('genre', opt)} className="sr-only" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Platform checkboxes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Platform</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORM_OPTIONS.map((opt) => (
                <label key={opt} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm cursor-pointer transition-colors ${
                  platform.includes(opt)
                    ? 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-700'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                  <input type="checkbox" checked={platform.includes(opt)} onChange={() => toggleArrayField('platform', opt)} className="sr-only" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          {/* Engine checkboxes */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium">Engine</label>
            <div className="flex flex-wrap gap-2">
              {ENGINE_OPTIONS.map((opt) => (
                <label key={opt} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm cursor-pointer transition-colors ${
                  engine.includes(opt)
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}>
                  <input type="checkbox" checked={engine.includes(opt)} onChange={() => toggleArrayField('engine', opt)} className="sr-only" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2 flex items-center">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.checked })} className="rounded border-gray-300" />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/admin/games" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Cancel</Link>
          <button type="submit" disabled={loading} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Create Game'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

- [ ] **Step 2: Create `app/admin/games/[id]/edit/page.tsx`**

Same as new page, but fetches existing game data on mount and submits PATCH to `/api/games/${id}`. Uses `Promise.all` pattern from `EditProjectPage` (lines 62-93) to load data. Pre-selects checkboxes based on existing `genre`, `platform`, `engine` arrays.

Differences from new page:
- Title: "Edit Game" instead of "Add Game"
- Button: "Save Changes" instead of "Create Game"
- On mount: fetches game from `/api/games/${id}` and populates all fields
- On submit: PATCH to `/api/games/${id}` instead of POST to `/api/games`

- [ ] **Step 3: Commit**

```bash
git add app/admin/games/new/page.tsx app/admin/games/[id]/edit/page.tsx
git commit -m "feat(admin): add games create and edit forms"
```

---

## Task 5: Build Public Games Page

**Files:**
- Create: `app/[locale]/games/page.tsx`
- Create: `app/[locale]/games/components/GamesClient.tsx`
- Create: `app/[locale]/games/components/GamesHero.tsx`
- Create: `app/[locale]/games/components/GamesGrid.tsx`
- Create: `app/[locale]/games/components/GamesList.tsx`

- [ ] **Step 1: Create `app/[locale]/games/page.tsx`**

Server component. Fetches all games from DB (ordered by `createdAt` desc). Passes data to `GamesClient`. Sets metadata.

```tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { GamesClient } from './components/GamesClient';

export const metadata: Metadata = {
  title: 'Games',
  description: 'Play our game projects',
};

export default async function GamesPage() {
  const games = await prisma.game.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return <GamesClient games={games} />;
}
```

- [ ] **Step 2: Create `app/[locale]/games/components/GamesClient.tsx`**

Client component with view toggle state. Renders hero, view toggle buttons, and conditionally renders GamesGrid or GamesList.

```tsx
'use client';

import { useState } from 'react';
import { GamesHero } from './GamesHero';
import { GamesGrid } from './GamesGrid';
import { GamesList } from './GamesList';
import { LayoutGrid, List } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string | null;
  genre: string[];
  platform: string[];
  engine: string[];
  playUrl: string | null;
  itchUrl: string | null;
  status: boolean;
  createdAt: string;
}

export function GamesClient({ games }: { games: Game[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const featuredGame = games[0] || null;
  const gridGames = games; // all games shown in grid including featured (or skip featured? spec says hero shows most recent, grid shows all - use same games array)

  return (
    <div className="min-h-screen">
      {featuredGame ? <GamesHero game={featuredGame} /> : (
        <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
          <div className="container relative mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 md:text-6xl">Games</h1>
              <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">Coming soon...</p>
            </div>
          </div>
        </section>
      )}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">All Games</h2>
            <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-slate-900">
              <button
                onClick={() => setView('grid')}
                className={`rounded-md p-2 transition-colors ${view === 'grid' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setView('list')}
                className={`rounded-md p-2 transition-colors ${view === 'list' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                aria-label="List view"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {games.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No games yet.</p>
            </div>
          ) : view === 'grid' ? (
            <GamesGrid games={games} />
          ) : (
            <GamesList games={games} />
          )}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create `app/[locale]/games/components/GamesHero.tsx`**

Hero section for the featured (most recent) game. Takes a single `game` prop. Shows: large gradient/image background with game title, truncated description, genre/platform/engine badges, Play and Itch.io buttons.

```tsx
import { ExternalLink } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string | null;
  genre: string[];
  platform: string[];
  engine: string[];
  playUrl: string | null;
  itchUrl: string | null;
}

export function GamesHero({ game }: { game: Game }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent" />
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-cyan-600 shadow-2xl">
            {game.image ? (
              <img src={game.image} alt={game.title} className="h-80 w-full object-cover opacity-80" />
            ) : (
              <div className="flex h-80 items-center justify-center">
                <span className="text-8xl font-bold text-white/20">{game.title.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            <div className="relative bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8">
              <div className="flex flex-wrap gap-2 mb-3">
                {game.genre.map((g) => (
                  <span key={g} className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-sm text-white">{g}</span>
                ))}
                {game.platform.map((p) => (
                  <span key={p} className="rounded-full bg-fuchsia-500/30 backdrop-blur-sm px-3 py-1 text-sm text-white">{p}</span>
                ))}
                {game.engine.map((e) => (
                  <span key={e} className="rounded-full bg-cyan-500/30 backdrop-blur-sm px-3 py-1 text-sm text-white">{e}</span>
                ))}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{game.title}</h1>
              <p className="text-white/80 mb-6 line-clamp-2">{game.description}</p>
              <div className="flex gap-3">
                {game.playUrl && (
                  <a href={game.playUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-violet-700 shadow-lg hover:bg-white/90 transition-colors">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Play Now
                  </a>
                )}
                {game.itchUrl && (
                  <a href={game.itchUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-6 py-2.5 text-sm font-semibold text-white border border-white/30 hover:bg-white/30 transition-colors">
                    <ExternalLink className="h-4 w-4" />
                    Itch.io
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create `app/[locale]/games/components/GamesGrid.tsx`**

Grid of game cards. Same Card-based design as the Projects portfolio page. Each card:
- Thumbnail (48px height) with gradient fallback showing first 2 letters
- Title, truncated description (3 lines)
- Genre/platform/engine tag pills (max 4 + "+N more")
- Status badge (Active/Archived)
- Hover overlay with play/itch icon links (same pattern as Project cards)

```tsx
import { Card } from '@/components/ui/Card';
import { ExternalLink } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string | null;
  genre: string[];
  platform: string[];
  engine: string[];
  playUrl: string | null;
  itchUrl: string | null;
  status: boolean;
}

export function GamesGrid({ games }: { games: Game[] }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <Card key={game.id} className="group relative overflow-hidden border-0 bg-white shadow-lg shadow-brand-500/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/10 dark:bg-slate-900">
          {/* Thumbnail */}
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-accent-500">
            {game.image ? (
              <img src={game.image} alt={game.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl font-bold text-white/30">{game.title.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            {/* Hover Links */}
            <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {game.playUrl && (
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
                  aria-label="Play game">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </a>
              )}
              {game.itchUrl && (
                <a href={game.itchUrl} target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-colors hover:bg-white/30"
                  aria-label="View on Itch.io">
                  <ExternalLink className="h-5 w-5 text-white" />
                </a>
              )}
            </div>
            {/* Status Badge */}
            <div className="absolute right-3 top-3">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${game.status ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                {game.status ? 'Active' : 'Archived'}
              </span>
            </div>
          </div>
          {/* Content */}
          <div className="p-5">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{game.title}</h3>
            <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {[...game.genre, ...game.platform, ...game.engine].slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{tag}</span>
              ))}
              {[...game.genre, ...game.platform, ...game.engine].length > 4 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  +{[...game.genre, ...game.platform, ...game.engine].length - 4}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `app/[locale]/games/components/GamesList.tsx`**

Compact list rows. Each row: small thumbnail (64x64 rounded-lg), title, description truncated to 1 line, all tags inline, status badge, play/itch icon links on right.

```tsx
import { Card } from '@/components/ui/Card';
import { ExternalLink } from 'lucide-react';

interface Game {
  id: string;
  title: string;
  description: string;
  image: string | null;
  genre: string[];
  platform: string[];
  engine: string[];
  playUrl: string | null;
  itchUrl: string | null;
  status: boolean;
}

export function GamesList({ games }: { games: Game[] }) {
  return (
    <div className="mx-auto max-w-6xl space-y-3">
      {games.map((game) => (
        <Card key={game.id} className="p-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            {game.image ? (
              <img src={game.image} alt={game.title} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex-shrink-0">
                <span className="text-lg font-bold text-white/30">{game.title.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{game.title}</h3>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0 ${game.status ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                  {game.status ? 'Active' : 'Archived'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mb-2">{game.description}</p>
              <div className="flex flex-wrap gap-1">
                {game.genre.map((g) => (
                  <span key={g} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{g}</span>
                ))}
                {game.platform.map((p) => (
                  <span key={p} className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">{p}</span>
                ))}
                {game.engine.map((e) => (
                  <span key={e} className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">{e}</span>
                ))}
              </div>
            </div>
            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {game.playUrl && (
                <a href={game.playUrl} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white transition-colors hover:bg-brand-600"
                  aria-label="Play game">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </a>
              )}
              {game.itchUrl && (
                <a href={game.itchUrl} target="_blank" rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                  aria-label="View on Itch.io">
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/games/page.tsx app/[locale]/games/components/
git commit -m "feat: add public games page with hero, grid, and list views"
```

---

## Task 6: Add i18n Strings

**Files:**
- Modify: `messages/en.json`
- Modify: `messages/pt.json`
- Modify: `messages/es.json`

- [ ] **Step 1: Add Games section to all locale files**

Add to each file under the existing structure:

```json
"Games": {
  "title": "Games",
  "subtitle": "Play our game projects",
  "noGames": "No games yet.",
  "comingSoon": "Coming soon...",
  "playNow": "Play Now",
  "itchio": "Itch.io",
  "allGames": "All Games",
  "active": "Active",
  "archived": "Archived"
}
```

Also add "games" to Navigation section: `"games": "Games"`

- [ ] **Step 2: Commit**

```bash
git add messages/en.json messages/pt.json messages/es.json
git commit -m "feat(i18n): add Games section strings for en, pt, es"
```

---

## Task 7: Verify and Test

- [ ] **Step 1: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No errors.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No errors.

- [ ] **Step 3: Start dev server and test manually**

Run: `pnpm dev`
Test:
- Navigate to `/games` — hero should show most recent game, grid/list toggle works
- Navigate to `/admin/games` — table should show games, create/edit/delete work
- Create a new game via admin form with genre/platform/engine checkboxes
- Toggle view between grid and list on public page

- [ ] **Step 4: Kill dev server**

- [ ] **Step 5: Commit any remaining changes**

---

## Spec Coverage Check

| Spec Section | Tasks |
|---|---|
| Game model (genre, platform, engine, playUrl, itchUrl) | Task 1 |
| Public page with hero (most recent) | Task 5 |
| Grid view | Task 5 |
| List view | Task 5 |
| View toggle | Task 5 |
| Admin listing table | Task 3 |
| Admin create/edit forms | Task 4 |
| API CRUD | Task 2 |
| i18n strings | Task 6 |
| No detail page (games link to playUrl/itchUrl) | implicit |
