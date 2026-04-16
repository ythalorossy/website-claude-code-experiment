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
}

export function GamesClient({ games }: { games: Game[] }) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const featuredGame = games[0] || null;
  const remainingGames = games.slice(1);

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

          {remainingGames.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No games yet.</p>
            </div>
          ) : view === 'grid' ? (
            <GamesGrid games={remainingGames} />
          ) : (
            <GamesList games={remainingGames} />
          )}
        </div>
      </section>
    </div>
  );
}
