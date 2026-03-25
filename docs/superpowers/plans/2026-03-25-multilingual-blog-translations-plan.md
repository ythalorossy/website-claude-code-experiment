# Multilingual Blog Translations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow admins to translate blog posts into all supported languages (en, pt, es). Users see content in their selected locale with English fallback.

**Architecture:** English is the canonical source stored in `Post`. Translations are stored in a new `PostTranslation` table linked by `postId`. Same slug works across all locales. Blog pages use locale-aware content fetching with fallback to English.

**Tech Stack:** Next.js 16 App Router, Prisma ORM, TipTap rich text editor, next-intl i18n.

---

## File Map

### New Files
- `app/api/posts/[id]/translations/route.ts` — Translation CRUD (GET, POST)
- `app/api/posts/[id]/translations/[locale]/route.ts` — DELETE translation
- `components/TranslationEditor.tsx` — Side-by-side translation editor component

### Modified Files
- `prisma/schema.prisma` — Add `PostTranslation` model
- `app/api/posts/[id]/route.ts` — Include translations in GET response
- `app/api/posts/route.ts` — Include translations in list (for language badges)
- `app/[locale]/blog/page.tsx` — Locale-aware post listing with fallback
- `app/[locale]/blog/[slug]/page.tsx` — Locale-aware post display with fallback
- `app/admin/posts/AdminPostsClient.tsx` — Add language badges to post list
- `app/admin/posts/[id]/edit/page.tsx` — Add "Manage Translations" button and modal

---

## Task 1: Database Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add PostTranslation model to schema**

Add after the `Post` model (around line 90):

```prisma
model PostTranslation {
  id        String  @id @default(cuid())
  postId    String
  locale    String  // 'pt' or 'es' only (not 'en')
  title     String
  content   String  @db.Text
  excerpt   String? @db.Text

  post      Post    @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, locale])
  @@index([postId])
}
```

Also add `translations PostTranslation[]` to the `Post` model.

- [ ] **Step 2: Generate Prisma client and push schema**

Run: `pnpm db:generate && pnpm db:push`

---

## Task 2: API — Include Translations in GET Responses

**Files:**
- Modify: `app/api/posts/[id]/route.ts:12-27`
- Modify: `app/api/posts/route.ts:14-22`

- [ ] **Step 1: Update GET /api/posts/[id] to include translations**

Modify the `include` section in `app/api/posts/[id]/route.ts`:

```typescript
const post = await prisma.post.findUnique({
  where: { id },
  include: {
    author: {
      select: { name: true, email: true },
    },
    translations: {
      select: { locale: true, title: true, content: true, excerpt: true },
    },
  },
});
```

- [ ] **Step 2: Update GET /api/posts (list) to include translation count**

Modify the `include` in `app/api/posts/route.ts`:

```typescript
const posts = await prisma.post.findMany({
  where,
  orderBy: { createdAt: 'desc' },
  include: {
    author: {
      select: { name: true, email: true },
    },
    translations: {
      select: { locale: true },
    },
  },
});
```

- [ ] **Step 3: Commit**

```bash
git add app/api/posts/route.ts app/api/posts/[id]/route.ts prisma/schema.prisma
git commit -m "feat: include translations in post API responses"
```

---

## Task 3: Translation CRUD API Endpoints

**Files:**
- Create: `app/api/posts/[id]/translations/route.ts`
- Create: `app/api/posts/[id]/translations/[locale]/route.ts`

- [ ] **Step 1: Create GET+POST translations route**

Create `app/api/posts/[id]/translations/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  return NextResponse.json(post.translations);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { locale, title, content, excerpt } = body;

  if (!locale || !title || !content) {
    return NextResponse.json(
      { error: 'Locale, title, and content are required' },
      { status: 400 }
    );
  }

  if (locale === 'en') {
    return NextResponse.json(
      { error: 'Cannot create translation for English. Edit the main post.' },
      { status: 400 }
    );
  }

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const translation = await prisma.postTranslation.upsert({
    where: { postId_locale: { postId: id, locale } },
    update: { title, content, excerpt },
    create: { postId: id, locale, title, content, excerpt },
  });

  return NextResponse.json(translation, { status: 201 });
}
```

- [ ] **Step 2: Create DELETE translation route**

Create `app/api/posts/[id]/translations/[locale]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string; locale: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id, locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.postTranslation.delete({
    where: { postId_locale: { postId: id, locale } },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/posts/[id]/translations/route.ts app/api/posts/[id]/translations/[locale]/route.ts
git commit -m "feat: add translation CRUD API endpoints"
```

---

## Task 4: Blog Listing — Locale-Aware Content

**Files:**
- Modify: `app/[locale]/blog/page.tsx:16-30`

- [ ] **Step 1: Update blog list to use locale-aware content**

Replace the `prisma.post.findMany` call with one that includes translations:

```typescript
const posts = await prisma.post.findMany({
  where: { status: 'PUBLISHED' },
  orderBy: { publishedAt: 'desc' },
  include: {
    author: { select: { name: true } },
    translations: {
      select: { locale: true, title: true, excerpt: true },
    },
  },
});

// Build locale-aware post data
const postsWithLocale = posts.map((post) => {
  const translation = post.translations.find((t) => t.locale === locale);
  return {
    id: post.id,
    title: translation?.title || post.title,
    slug: post.slug,
    excerpt: translation?.excerpt || post.excerpt,
    tags: post.tags,
    publishedAt: post.publishedAt,
    author: post.author,
    hasTranslation: !!translation,
  };
});
```

Then update the template to use `postsWithLocale` and add a locale indicator badge showing available translations.

- [ ] **Step 2: Commit**

```bash
git add app/\[locale\]/blog/page.tsx
git commit -m "feat: use locale-aware content in blog listing with fallback"
```

---

## Task 5: Blog Post Page — Locale-Aware Content

**Files:**
- Modify: `app/[locale]/blog/[slug]/page.tsx:36-47`

- [ ] **Step 1: Update blog post to use locale-aware content**

Replace the `prisma.post.findUnique` call:

```typescript
const post = await prisma.post.findUnique({
  where: { slug },
  include: {
    author: { select: { name: true } },
    translations: true,
  },
});
```

After the `if (!post || post.status !== 'PUBLISHED')` check, add locale-aware content resolution:

```typescript
// Get locale-aware content
const translation = post.translations.find((t) => t.locale === locale);
const displayTitle = translation?.title || post.title;
const displayContent = translation?.content || post.content;
const displayExcerpt = translation?.excerpt || post.excerpt;
```

Update metadata and template to use `displayTitle`, `displayContent`, `displayExcerpt` instead of `post.title`, `post.content`, `post.excerpt`.

- [ ] **Step 2: Update generateMetadata to use locale-aware title**

```typescript
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      translations: true,
    },
  });

  if (!post) {
    return { title: 'Post Not Found' };
  }

  const translation = post.translations.find((t) => t.locale === locale);
  const title = translation?.title || post.title;
  const excerpt = translation?.excerpt || post.excerpt;

  return {
    title,
    description: excerpt || undefined,
    openGraph: { title, description: excerpt || undefined, type: 'article' },
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add app/\[locale\]/blog/\[slug\]/page.tsx
git commit -m "feat: use locale-aware content in blog post with fallback"
```

---

## Task 6: Admin Post List — Language Badges

**Files:**
- Modify: `app/admin/posts/AdminPostsClient.tsx:8-14`
- Modify: `app/admin/posts/AdminPostsClient.tsx:98-100`

- [ ] **Step 1: Update Post interface to include translations**

```typescript
interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
  translations: { locale: string }[];
}
```

- [ ] **Step 2: Add language badge display**

Add after the title cell (line ~99):

```tsx
{post.translations && post.translations.length > 0 && (
  <div className="flex gap-1 mt-1">
    <span className="text-xs bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 px-1.5 py-0.5 rounded">
      EN
    </span>
    {post.translations.map((t) => (
      <span
        key={t.locale}
        className="text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-1.5 py-0.5 rounded uppercase"
      >
        {t.locale}
      </span>
    ))}
  </div>
)}
```

Also update the table header to add a "Languages" column.

- [ ] **Step 3: Commit**

```bash
git add app/admin/posts/AdminPostsClient.tsx
git commit -m "feat: show language badges on admin post list"
```

---

## Task 7: Translation Editor Component

**Files:**
- Create: `components/TranslationEditor.tsx`

- [ ] **Step 1: Create the TranslationEditor component**

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { RichTextEditorHandle } from '@/components/RichTextEditor';

const RichTextEditor = dynamic(
  () => import('@/components/RichTextEditor').then((m) => m.RichTextEditor),
  { ssr: false }
);

interface Translation {
  locale: string;
  title: string;
  content: string;
  excerpt?: string;
}

interface Post {
  title: string;
  content: string;
  excerpt?: string;
  translations: Translation[];
}

interface TranslationEditorProps {
  post: Post;
  postId: string;
}

const TRANSLATION_LOCALES = [
  { value: 'es', label: 'Spanish (ES)' },
  { value: 'pt', label: 'Portuguese (PT)' },
];

export function TranslationEditor({ post, postId }: TranslationEditorProps) {
  const [selectedLocale, setSelectedLocale] = useState('es');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const editorRef = useRef<RichTextEditorHandle>(null);

  const existingTranslation = post.translations.find((t) => t.locale === selectedLocale);

  useEffect(() => {
    const translation = post.translations.find((t) => t.locale === selectedLocale);
    setTitle(translation?.title || '');
    setExcerpt(translation?.excerpt || '');
    setContent(translation?.content || '');
    // Reset editor after locale change
    setTimeout(() => editorRef.current?.setContent(translation?.content || ''), 0);
  }, [selectedLocale, post.translations]);

  async function handleSave() {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/posts/${postId}/translations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: selectedLocale, title, content, excerpt }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Translation saved!' });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this translation?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}/translations/${selectedLocale}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTitle('');
        setExcerpt('');
        setContent('');
        setMessage({ type: 'success', text: 'Translation deleted' });
        // Trigger refresh via router
        window.location.reload();
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to delete' });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Translations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select
          label="Select Language"
          value={selectedLocale}
          options={TRANSLATION_LOCALES.map((l) => ({
            ...l,
            label: post.translations.some((t) => t.locale === l.value)
              ? `${l.label} (saved)`
              : l.label,
          }))}
          onChange={(e) => setSelectedLocale(e.target.value)}
        />

        <div className="grid grid-cols-2 gap-6">
          {/* English source (read-only) */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
              English Source (read-only)
            </h3>
            <Input label="Title" value={post.title} disabled />
            <Textarea label="Excerpt" value={post.excerpt || ''} disabled rows={2} />
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm max-h-64 overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </div>
          </div>

          {/* Translation fields */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm">
              Translation ({selectedLocale.toUpperCase()})
            </h3>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Translated title"
            />
            <Textarea
              label="Excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Translated excerpt"
              rows={2}
            />
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <RichTextEditor
                ref={editorRef}
                toolbar="post"
                placeholder="Translate content..."
                onUpdate={() => setContent(editorRef.current?.getHTML() || '')}
              />
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-md p-3 text-sm ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={isSaving || !title || !content}>
            {isSaving ? 'Saving...' : 'Save Translation'}
          </Button>
          {existingTranslation && (
            <Button variant="outline" onClick={handleDelete}>
              Delete Translation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/TranslationEditor.tsx
git commit -m "feat: add TranslationEditor component"
```

---

## Task 8: Admin Edit Page — Integrate Translation Panel

**Files:**
- Modify: `app/admin/posts/[id]/edit/page.tsx`

- [ ] **Step 1: Add "Manage Translations" button and integrate editor**

Add state for showing translation panel:

```typescript
const [showTranslations, setShowTranslations] = useState(false);
```

After fetching the post (useEffect around line 64), the post already includes translations from the updated GET /api/posts/[id] endpoint (Task 2). The post data already has `translations` — just pass it to the `TranslationEditor`:

```typescript
const postWithTranslations = post; // already has translations from the updated API
```

Pass `postWithTranslations` to the `TranslationEditor` component.

Add a button after the main form (before the closing div):

```tsx
<Button
  type="button"
  variant="outline"
  onClick={() => setShowTranslations(!showTranslations)}
  className="mt-4"
>
  {showTranslations ? 'Hide' : 'Manage'} Translations
</Button>

{showTranslations && (
  <div className="mt-6">
    <TranslationEditor post={postWithTranslations} postId={postId} />
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add app/admin/posts/\[id\]/edit/page.tsx
git commit -m "feat: integrate translation editor in admin post edit page"
```

---

## Task 9: Verify Everything Works

- [ ] **Step 1: Run typecheck**

Run: `pnpm typecheck`
Expected: No TypeScript errors

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: No lint errors

- [ ] **Step 3: Start dev server and test manually**

Run: `pnpm dev`

Test scenarios:
1. Create a new post in admin (English)
2. Go to edit page, click "Manage Translations"
3. Select Spanish, fill in translated title/content/excerpt, save
4. Visit `/es/blog/[slug]` and verify Spanish content shows
5. Visit `/pt/blog/[slug]` and verify English fallback shows
6. Check post list shows language badges
