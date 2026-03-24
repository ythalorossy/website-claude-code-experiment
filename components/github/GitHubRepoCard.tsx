import Link from 'next/link';
import { Github, Star, GitFork } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import type { GithubRepo } from '@/lib/github';

interface GitHubRepoCardProps {
  repo: GithubRepo;
}

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-500',
  JavaScript: 'bg-yellow-500',
  Python: 'bg-green-500',
  Rust: 'bg-orange-600',
  Go: 'bg-cyan-500',
  Java: 'bg-red-500',
  'C++': 'bg-purple-500',
  C: 'bg-gray-500',
  Ruby: 'bg-red-600',
  PHP: 'bg-indigo-500',
  Swift: 'bg-orange-500',
  Kotlin: 'bg-purple-600',
  Dart: 'bg-blue-400',
  HTML: 'bg-orange-400',
  CSS: 'bg-blue-300',
};

export function GitHubRepoCard({ repo }: GitHubRepoCardProps) {
  return (
    <Link href={repo.html_url} target="_blank" rel="noopener noreferrer">
      <Card className="h-full border-0 shadow-lg shadow-brand-500/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/10 dark:bg-slate-900">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Github className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {repo.name}
              </h3>
            </div>
          </div>

          {repo.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {repo.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-3 h-3 rounded-full ${
                    LANGUAGE_COLORS[repo.language] || 'bg-gray-400'
                  }`}
                />
                <span>{repo.language}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              <span>{repo.stargazers_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <GitFork className="h-4 w-4" />
              <span>{repo.forks_count}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
