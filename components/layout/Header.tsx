'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LanguageSelector } from './LanguageSelector';

export function Header() {
  const { data: session, status } = useSession();
  const t = useTranslations('Navigation');
  const locale = useLocale();

  const user = session?.user;
  const isLoading = status === 'loading';

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
  };

  // Show loading state while checking session
  if (isLoading) {
    return (
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
              <span className="text-white font-bold text-sm">YS</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
              Software Engineering
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href={`/${locale}/blog`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('blog')}</Link>
            <Link href={`/${locale}/about`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('about')}</Link>
            <Link href={`/${locale}/projects`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('projects')}</Link>
            <Link href={`/${locale}/portfolio`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('portfolio')}</Link>
            <Link href={`/${locale}/writing`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('writing')}</Link>
            <Link href={`/${locale}/team`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('team')}</Link>
            <Link href={`/${locale}/contact`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('contact')}</Link>
            <Link href={`/${locale}/crypto`} className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600">{t('crypto')}</Link>
            <ThemeToggle />
            <LanguageSelector />
            <Button size="sm" className="btn-glow" disabled>Loading...</Button>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shadow-lg shadow-brand-500/25">
            <span className="text-white font-bold text-sm">YS</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
            Software Engineering
          </span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href={`/${locale}/blog`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('blog')}
          </Link>
          <Link
            href={`/${locale}/about`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('about')}
          </Link>
          <Link
            href={`/${locale}/projects`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('projects')}
          </Link>
          <Link
            href={`/${locale}/portfolio`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('portfolio')}
          </Link>
          <Link
            href={`/${locale}/writing`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('writing')}
          </Link>
          <Link
            href={`/${locale}/team`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('team')}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('contact')}
          </Link>
          <Link
            href={`/${locale}/crypto`}
            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            {t('crypto')}
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <LanguageSelector />

          {session ? (
            <div className="flex items-center gap-3">
              {/* Admin Link */}
              {user?.role === 'ADMIN' && (
                <Link href={`/${locale}/admin`}>
                  <Button variant="primary" size="sm" className="btn-glow">
                    {t('admin')}
                  </Button>
                </Link>
              )}

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || 'Profile'}
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-full object-cover border-2 border-brand-500"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-bold border-2 border-brand-500">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                  <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-brand-500/10 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* User Info */}
                    <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                      </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <Link
                        href={`/${locale}/profile`}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Your Profile
                      </Link>
                      {user?.role === 'ADMIN' && (
                        <Link
                          href={`/${locale}/admin`}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {t('signOut')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm" className="btn-glow">
                {t('signIn')}
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
