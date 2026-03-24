import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateRange(startDate: Date | string | null, endDate: Date | string | null): string {
  if (!startDate && !endDate) return '';
  const start = startDate
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(new Date(startDate))
    : '';
  const end = endDate
    ? new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short' }).format(new Date(endDate))
    : 'Present';
  if (start && end) return `${start} – ${end}`;
  if (start) return `${start} – Present`;
  return `Until ${end}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}