# Multilingual Blog Translations — Design Spec

**Date:** 2026-03-25
**Status:** Approved

## Overview

Allow admins to translate blog posts into all supported languages (en, pt, es). When a user visits the blog, they see content in their selected locale. If no translation exists, fall back to English.

---

## 1. Data Model

### 1.1 New Table: `PostTranslation`

```prisma
model PostTranslation {
  id        String  @id @default(cuid())
  postId    String
  locale    String  // 'pt' or 'es' only (not 'en')
  title     String
  content   String  @db.Text // HTML from TipTap
  excerpt   String? @db.Text

  post      Post    @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, locale])
  @@index([postId])
}
```

### 1.2 Updated: `Post` model

No changes to the existing `Post` model. English is always the canonical source.

- `slug` remains unique (English is the source of truth)
- `title`, `content`, `excerpt` remain in English

---

## 2. API Changes

### 2.1 `GET /api/posts/[id]`

Response shape adds `translations`:

```json
{
  "id": "...",
  "title": "English Title",
  "slug": "my-post",
  "content": "<p>English content</p>",
  "excerpt": "English excerpt",
  "status": "PUBLISHED",
  "translations": [
    { "locale": "es", "title": "Título en español", "content": "<p>Contenido español</p>", "excerpt": "Extracto español" },
    { "locale": "pt", "title": "Título em português", "content": "<p>Conteúdo português</p>", "excerpt": "Excerto português" }
  ]
}
```

### 2.2 `PATCH /api/posts/[id]`

Updates English content only. Existing behavior unchanged.

### 2.3 New: Translation CRUD

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts/[id]/translations` | List all translations for a post |
| POST | `/api/posts/[id]/translations` | Create or update a translation |
| DELETE | `/api/posts/[id]/translations/[locale]` | Delete a translation |

**POST body:**
```json
{ "locale": "es", "title": "...", "content": "...", "excerpt": "..." }
```

Uses upsert: if translation for locale exists, update it; otherwise create.

---

## 3. Blog Display Logic

### 3.1 Blog Listing Page (`/[locale]/blog`)

Fetch: All published posts with their translations.

Display per post:
- If `translations[locale]` exists → use translated `title`, `excerpt`
- Else → use English `title`, `excerpt` from `Post`

Tags, author, date are shared (not translated).

### 3.2 Blog Post Page (`/[locale]/blog/[slug]`)

Fetch: Single post by `slug` with translations.

Display:
- If `translations[locale]` exists → use translated `title`, `content`, `excerpt`
- Else → use English content

Metadata (author, date, tags) are shared.

---

## 4. Admin UI

### 4.1 Post List Page

- Show a language indicator on each post row: badges like "EN" or "EN + 2 translations"
- Existing post list unchanged

### 4.2 Main Edit Page (`/admin/posts/[id]/edit`)

- Edit English content exactly as today
- No changes to existing form

### 4.3 Translation Panel

- Accessible via button on the main edit page: "Manage Translations"
- Opens a modal or side panel with:
  - **Language selector**: Dropdown to switch between 'pt' and 'es'
  - **Side-by-side layout**:
    - Left: English source (read-only) — title, excerpt, content preview
    - Right: Translation fields — title, excerpt, content (TipTap editor)
  - **Save button**: Saves the translation for the selected locale
- Uses upsert: creating a translation for a locale that exists updates it instead of failing

---

## 5. Routing & Slug

- Slug is shared across locales
- Routes: `/en/blog/my-post`, `/es/blog/my-post`, `/pt/blog/my-post`
- Same slug → different content based on locale
- 404 if no post exists for that slug (regardless of locale)

---

## 6. Fallback Behavior

| Scenario | Behavior |
|----------|----------|
| Translation missing for `locale` | Use English content |
| Post exists only in English | All locales show English |
| Translation exists but title is empty | Use English title |

---

## 7. Database Migration

1. Create `PostTranslation` table
2. No data migration needed (translations are created after posts exist)

---

## 8. Summary of Changes

| Area | Changes |
|------|---------|
| `prisma/schema.prisma` | Add `PostTranslation` model |
| `app/api/posts/[id]/route.ts` | Include translations in GET response |
| `app/api/posts/[id]/translations/` | New CRUD endpoints |
| `app/[locale]/blog/page.tsx` | Use locale-aware content with fallback |
| `app/[locale]/blog/[slug]/page.tsx` | Use locale-aware content with fallback |
| `app/admin/posts/[id]/edit/page.tsx` | Add "Manage Translations" button |
| Translation UI component | New side-by-side translation editor |
| `pnpm db:generate` | Generate Prisma client after schema change |
