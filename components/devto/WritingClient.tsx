'use client';

import { useState, useMemo } from 'react';
import type { DevToArticle } from '@/lib/devto';
import { DevToArticleCard } from '@/components/devto/DevToArticleCard';
import { WritingSortSelect, type SortOption } from '@/components/devto/WritingSortSelect';

interface WritingClientProps {
  articles: DevToArticle[];
}

function sortArticles(articles: DevToArticle[], sort: SortOption): DevToArticle[] {
  return [...articles].sort((a, b) => {
    switch (sort) {
      case 'recent':
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      case 'popular':
        return b.positive_reactions_count - a.positive_reactions_count;
      case 'author':
        return a.username.localeCompare(b.username);
      case 'readtime':
        return a.reading_time_minutes - b.reading_time_minutes;
    }
  });
}

export function WritingClient({ articles }: WritingClientProps) {
  const [sort, setSort] = useState<SortOption>('recent');

  const sortedArticles = useMemo(
    () => sortArticles(articles, sort),
    [articles, sort]
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          {/* Title row: left-aligned title, right-aligned sort */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 md:text-6xl">
              Writing
            </h1>
            <WritingSortSelect value={sort} onChange={setSort} />
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
            Technical articles, tutorials, and insights from my Dev.to publication
          </p>
        </div>
      </section>

      {/* Articles Section with smooth transition on re-sort */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {sortedArticles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Articles unavailable. Set DEV_TO_USERNAMES in your environment to display your Dev.to articles.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 transition-opacity duration-300">
              {sortedArticles.map((article) => (
                <DevToArticleCard key={article.url} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
