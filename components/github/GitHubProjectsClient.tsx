'use client';

import { useState, useMemo } from 'react';
import { GitHubRepoCard } from './GitHubRepoCard';
import type { GithubRepo } from '@/lib/github';
import { Button } from '@/components/ui/Button';

type SortKey = 'stars' | 'updated' | 'name';

interface GitHubProjectsClientProps {
  repos: GithubRepo[];
}

export function GitHubProjectsClient({ repos }: GitHubProjectsClientProps) {
  const [sortKey, setSortKey] = useState<SortKey>('stars');

  const sortedRepos = useMemo(() => {
    const sorted = [...repos];
    switch (sortKey) {
      case 'stars':
        return sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
      case 'updated':
        return sorted.sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [repos, sortKey]);

  return (
    <div>
      {/* Sort Controls */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <Button
          size="sm"
          variant={sortKey === 'stars' ? 'primary' : 'outline'}
          onClick={() => setSortKey('stars')}
        >
          Stars
        </Button>
        <Button
          size="sm"
          variant={sortKey === 'updated' ? 'primary' : 'outline'}
          onClick={() => setSortKey('updated')}
        >
          Recently Updated
        </Button>
        <Button
          size="sm"
          variant={sortKey === 'name' ? 'primary' : 'outline'}
          onClick={() => setSortKey('name')}
        >
          Name
        </Button>
      </div>

      {/* Repo Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedRepos.map((repo) => (
          <GitHubRepoCard key={repo.name} repo={repo} />
        ))}
      </div>
    </div>
  );
}
