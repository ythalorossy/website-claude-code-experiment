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
