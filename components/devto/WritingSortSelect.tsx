'use client';

import { ChevronDown } from 'lucide-react';

export type SortOption = 'recent' | 'popular' | 'author' | 'readtime';

const sortLabels: Record<SortOption, string> = {
  recent: 'Recent',
  popular: 'Popular',
  author: 'Author',
  readtime: 'Quick Read',
};

interface WritingSortSelectProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function WritingSortSelect({ value, onChange }: WritingSortSelectProps) {
  const options: SortOption[] = ['recent', 'popular', 'author', 'readtime'];

  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="appearance-none rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 px-4 py-1.5 pr-8 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:border-brand-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-colors"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {sortLabels[opt]}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
