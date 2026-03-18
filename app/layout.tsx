import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SessionProvider } from '@/components/providers/SessionProvider';

export const metadata: Metadata = {
  title: {
    default: 'Software Engineering',
    template: '%s | Software Engineering',
  },
  description: 'A software engineering blog with admin CMS',
  keywords: ['software engineering', 'blog', 'nextjs', 'cms'],
  authors: [{ name: 'Software Engineering' }],
  openGraph: {
    title: 'Software Engineering',
    description: 'A software engineering blog with admin CMS',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://example.com',
    siteName: 'Software Engineering',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Check for saved theme preference or default to dark
              (function() {
                var theme = localStorage.getItem('theme');
                if (theme) {
                  document.documentElement.classList.add(theme);
                } else {
                  // Default to dark mode
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <SessionProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
