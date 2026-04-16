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
          setGames((prev) =>
            prev.map((g) => (g.id === id ? { ...g, status: !currentStatus } : g))
          );
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
                                </svg>
                              </a>
                            )}
                            {game.itchUrl && (
                              <a href={game.itchUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600" aria-label="itch.io">
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
                          <span key={g} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                            {g}
                          </span>
                        ))}
                        {game.genre.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{game.genre.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {game.platform.slice(0, 3).map((p) => (
                          <span key={p} className="rounded-full bg-fuchsia-100 px-2 py-0.5 text-xs text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300">
                            {p}
                          </span>
                        ))}
                        {game.platform.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{game.platform.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {game.engine.slice(0, 3).map((e) => (
                          <span key={e} className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                            {e}
                          </span>
                        ))}
                        {game.engine.length > 3 && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                            +{game.engine.length - 3}
                          </span>
                        )}
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
