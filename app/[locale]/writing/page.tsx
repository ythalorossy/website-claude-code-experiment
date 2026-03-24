import { Metadata } from 'next';
import { getDevToArticles } from '@/lib/devto';
import { DevToArticleCard } from '@/components/devto/DevToArticleCard';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'My articles and technical writing on Dev.to',
};

export const revalidate = 3600;

export default async function WritingPage() {
  const articles = await getDevToArticles(30);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-violet-50 via-fuchsia-50 to-transparent py-20 dark:from-violet-950/20 dark:via-fuchsia-950/20 dark:to-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-violet-200/40 via-transparent to-transparent" />
        <div className="container relative mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 bg-clip-text text-5xl font-bold tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 md:text-6xl">
              Writing
            </h1>
            <p className="mt-6 text-xl text-gray-600 dark:text-gray-400">
              Technical articles, tutorials, and insights from my Dev.to publication
            </p>
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                Articles unavailable. Set DEV_TO_USERNAMES in your environment to display your Dev.to articles.
              </p>
            </div>
          ) : (
            <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((article) => (
                <DevToArticleCard key={article.url} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
