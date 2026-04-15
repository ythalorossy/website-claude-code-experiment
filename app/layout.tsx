import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ChatWidget } from '@/components/chat/ChatWidget';
import { ThemeScript } from '@/components/ThemeScript';

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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const themeCookie = cookieStore.get('theme');
  const theme = themeCookie?.value || 'dark';

  return (
    <html lang="en" suppressHydrationWarning className={theme}>
      <body className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100">
        <ThemeScript />
        <SessionProvider>
          {children}
          <ChatWidget />
        </SessionProvider>
      </body>
    </html>
  );
}
