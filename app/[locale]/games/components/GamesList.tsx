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
            {game.image ? (
              <img src={game.image} alt={game.title} className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex-shrink-0">
                <span className="text-lg font-bold text-white/30">{game.title.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
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
