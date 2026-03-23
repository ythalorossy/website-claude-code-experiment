'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
];

export function Footer() {
  const pathname = usePathname();
  const locale = pathname.split('/')[1] || 'en';
  const currentYear = new Date().getFullYear();
  const t = useTranslations('Footer');

  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {t('product')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href={`/${locale}/about`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('about')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/team`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('team')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/blog`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('blog')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {t('legal')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('termsOfService')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {t('contact')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  href={`/${locale}/contact`}
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('contactUs')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {t('language')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <Link
                    href={`/${lang.code}`}
                    className={`flex items-center gap-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors ${
                      lang.code === locale ? 'text-brand-600 dark:text-brand-400 font-medium' : ''
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                    {lang.code === locale && (
                      <svg className="h-3 w-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
              {t('social')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="#"
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('twitter')}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  {t('gitHub')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">YS</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                &copy; {currentYear} Software Engineering. {t('rights')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-gray-500 dark:text-gray-500">
                {t('allSystemsOperational')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}