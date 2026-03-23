import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { prisma } from '@/lib/db';

export const metadata = {
  title: 'Home',
  description: 'Welcome to our modern marketing website',
};

export default async function HomePage() {
  const recentPosts = await prisma.post.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      publishedAt: true,
    },
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated fluid gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-accent-50 dark:from-slate-950 dark:via-slate-900 dark:to-brand-950" />
        <div className="absolute inset-0 overflow-hidden">
          {/* Blob 1 - Large violet/pink */}
          <div className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] animate-fluid-blob-1 bg-gradient-to-br from-violet-600/60 via-fuchsia-600/50 to-pink-600/60 rounded-full blur-3xl" />
          {/* Blob 2 - Bottom right cyan/blue */}
          <div className="absolute -bottom-1/4 -right-1/4 w-[150%] h-[150%] animate-fluid-blob-2 bg-gradient-to-br from-cyan-600/60 via-blue-600/50 to-violet-600/60 rounded-full blur-3xl" />
          {/* Blob 3 - Center amber/pink accent */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] animate-fluid-blob-3 bg-gradient-to-br from-amber-500/50 via-pink-600/50 to-rose-600/50 rounded-full blur-3xl" />
          {/* Blob 4 - Subtle teal accent */}
          <div className="absolute top-0 right-1/4 w-[80%] h-[80%] animate-fluid-blob-4 bg-gradient-to-br from-teal-500/40 via-cyan-600/40 to-blue-600/40 rounded-full blur-3xl" />
          {/* Dark overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60 dark:from-slate-950/60 dark:to-slate-950/60" />
        </div>

        <div className="container relative">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Now with AI-powered features
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-brand-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
                Build Something
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">Amazing Today</span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
              A modern marketing website built with Next.js 15, featuring a blog with MDX support,
              admin CMS, and cutting-edge technology.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/blog">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Blog
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-28 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900" />
        <div className="container relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                Powerful Features
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
              Everything you need to build a modern, fast, and beautiful website.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="card-hover border-0 shadow-xl shadow-brand-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-4 shadow-lg shadow-brand-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Built on Next.js 15 with React Server Components for blazing fast performance and SEO.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl shadow-accent-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center mb-4 shadow-lg shadow-accent-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <CardTitle className="text-xl">MDX Blog</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Write content in MDX with beautiful syntax highlighting powered by Shiki.
                </p>
              </CardContent>
            </Card>

            <Card className="card-hover border-0 shadow-xl shadow-primary-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-brand-500 flex items-center justify-center mb-4 shadow-lg shadow-primary-500/25">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <CardTitle className="text-xl">Admin CMS</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Full-featured admin panel with role-based access and optimistic UI updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Posts Section */}
      {recentPosts.length > 0 && (
        <section className="py-20 md:py-28 relative bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-900/50 dark:to-slate-950">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-500/5 via-transparent to-accent-500/5" />
          <div className="container relative">
            <div className="mb-12 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                    Latest Posts
                  </span>
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Stay updated with our latest articles and insights.
                </p>
              </div>
              <Link href="/blog">
                <Button variant="outline" className="hidden md:inline-flex">
                  View All
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {recentPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="card-hover h-full border-0 shadow-lg shadow-brand-500/5 bg-white dark:bg-slate-900">
                    <CardHeader>
                      <div className="text-xs font-medium text-brand-600 dark:text-brand-400 mb-2">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
                      </div>
                      <CardTitle className="text-lg line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {post.excerpt}
                      </p>
                      <div className="mt-4 flex items-center text-brand-600 dark:text-brand-400 text-sm font-medium">
                        Read more
                        <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/blog">
                <Button variant="outline">
                  View All Posts
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-gray-100 dark:bg-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800" />
        <div className="absolute inset-0 opacity-20 dark:opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/30 dark:bg-brand-500 rounded-full blur-3xl" />
        </div>
        <div className="container relative">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of developers building amazing websites with our platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/30"
                >
                  Contact Us
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  className="bg-transparent border-2 border-slate-500 text-white hover:bg-slate-800 hover:border-slate-400"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
