import Link from 'next/link';
import { Heart, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { DevToArticle } from '@/lib/devto';

interface DevToArticleCardProps {
  article: DevToArticle;
  truncate?: boolean;
}

export function DevToArticleCard({ article, truncate = false }: DevToArticleCardProps) {
  return (
    <Link href={article.url} target="_blank" rel="noopener noreferrer">
      <Card className="h-full border-0 shadow-lg shadow-brand-500/5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-brand-500/10 dark:bg-slate-900">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {article.tag_list.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
              >
                {tag}
              </span>
            ))}
          </div>
          <CardTitle className={`text-lg line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${truncate ? '' : ''}`}>
            {article.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className={`text-sm text-gray-600 dark:text-gray-400 mb-3 ${truncate ? 'line-clamp-2' : 'line-clamp-3'}`}>
            {article.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-red-400" />
              <span>{article.positive_reactions_count}</span>
            </div>

            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{article.reading_time_minutes} min read</span>
            </div>

            <div className="ml-auto flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
              Read
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
