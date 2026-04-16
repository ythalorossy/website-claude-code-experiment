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
  const allTags = (game: Game) => [...game.genre, ...game.platform, ...game.engine];

  return (
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
      {games.map((game) => (
        <Card key={game.id} className="group relative overflow-hidden border-0 bg-white shadow-lg shadow-brand-500/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/10 dark:bg-slate-900">
          <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-brand-500 to-accent-500">
            {game.image ? (
              <img src={game.image} alt={game.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-4xl font-bold text-white/30">{game.title.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
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
            <div className="absolute right-3 top-3">
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${game.status ? 'bg-green-500/90 text-white' : 'bg-gray-500/90 text-white'}`}>
                {game.status ? 'Active' : 'Archived'}
              </span>
            </div>
          </div>
          <div className="p-5">
            <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">{game.title}</h3>
            <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{game.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {allTags(game).slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">{tag}</span>
              ))}
              {allTags(game).length > 4 && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  +{allTags(game).length - 4}
                </span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
