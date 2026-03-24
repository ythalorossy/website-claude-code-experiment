# Writing Page Article Sorting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add client-side sorting to the Writing page articles via a minimal pill/dropdown control.

**Architecture:** Server Component (`app/[locale]/writing/page.tsx`) fetches articles. A new Client Component (`WritingClient.tsx`) manages sort state and renders the sorted grid. A new `WritingSortSelect` component provides the minimal pill dropdown UI positioned in the top-right of the hero section.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, lucide-react icons, TypeScript

---

## File Map

```
components/devto/WritingSortSelect.tsx   [CREATE] — pill dropdown
components/devto/WritingClient.tsx        [CREATE] — client wrapper
app/[locale]/writing/page.tsx             [MODIFY] — thin server wrapper
lib/devto.ts                              [NO CHANGE]
```

---

## Tasks

### Task 1: Create WritingSortSelect Component

**Files:**
- Create: `components/devto/WritingSortSelect.tsx`

```tsx
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
```

Note: The `type SortOption` is imported inline as `import { WritingSortSelect, type SortOption }` which is valid TypeScript with `isolatedModules`. If your TSConfig has `verbatimModuleSyntax: true`, use `import { WritingSortSelect }` and define `SortOption` type separately or re-export it.

- [ ] **Step 1: Create WritingSortSelect component file**

Create `components/devto/WritingSortSelect.tsx` with the code above.

- [ ] **Step 2: Verify file exists and has no TypeScript errors**

Run: `pnpm typecheck`
Expected: No errors related to WritingSortSelect

- [ ] **Step 3: Commit**

```bash
git add components/devto/WritingSortSelect.tsx
git commit -m "feat: add WritingSortSelect pill dropdown component"
```

---

### Task 2: Create WritingClient Component

**Files:**
- Create: `components/devto/WritingClient.tsx`
- Read: `components/devto/DevToArticleCard.tsx` (already read — for reference)

```tsx
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
```

Key changes from original writing page:
- Sort dropdown positioned top-right of hero (`flex items-center justify-between`)
- Description text left-aligned (`max-w-3xl`, not `mx-auto text-center`)
- Article grid has `transition-opacity duration-300` for smooth re-sort effect

- [ ] **Step 1: Create WritingClient component**

Create `components/devto/WritingClient.tsx` with the code above.

- [ ] **Step 2: Verify TypeScript**

Run: `pnpm typecheck`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/devto/WritingClient.tsx
git commit -m "feat: add WritingClient component with sort state"
```

---

### Task 3: Update Writing Page to Thin Server Wrapper

**Files:**
- Modify: `app/[locale]/writing/page.tsx`
- Read: `app/[locale]/writing/page.tsx` (already read — for reference)

```tsx
import { Metadata } from 'next';
import { getDevToArticles } from '@/lib/devto';
import { WritingClient } from '@/components/devto/WritingClient';

export const metadata: Metadata = {
  title: 'Writing',
  description: 'My articles and technical writing on Dev.to',
};

export const revalidate = 3600;

export default async function WritingPage() {
  const articles = await getDevToArticles(30);
  return <WritingClient articles={articles} />;
}
```

- [ ] **Step 1: Replace WritingPage with thin server wrapper**

Replace `app/[locale]/writing/page.tsx` with the code above.

- [ ] **Step 2: Run typecheck and build**

Run: `pnpm typecheck && pnpm build`
Expected: No errors, successful build

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/writing/page.tsx
git commit -m "feat: convert WritingPage to thin server wrapper"
```

---

## Verification

- [ ] **Build succeeds:** `pnpm build` passes
- [ ] **Typecheck passes:** `pnpm typecheck` passes
- [ ] **Sort works:** Sort dropdown changes article order client-side
- [ ] **Default sort is Recent:** Articles sorted by `published_at` desc on load
- [ ] **Dropdown is top-right:** Visible in hero section, unobtrusive
- [ ] **Smooth transition:** Article grid fades on re-sort
