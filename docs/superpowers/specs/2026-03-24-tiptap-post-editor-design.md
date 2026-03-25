# Spec: TipTap Editor for Admin Post Authoring

## Overview

Replace the plain `Textarea` used for post content editing in the admin area with the same TipTap rich-text editor used for comments. Content will be stored as HTML, matching the comment pattern.

## Goals

- Replace raw text post editing with rich-text TipTap editor
- Share a single `RichTextEditor` component between comments and posts
- Store post content as HTML (same as comments)
- Rename database field from `contentMDX` to `content`
- Simplify the blog post renderer to use `dangerouslySetInnerHTML`

## Architecture

### Shared `RichTextEditor` Component

**File:** `components/RichTextEditor.tsx` (new)

A configurable TipTap wrapper accepting a `toolbar` prop:

```typescript
type ToolbarConfig = 'comment' | 'post';

interface RichTextEditorProps {
  editor: ReturnType<typeof useEditor>;
  toolbar: ToolbarConfig;
  placeholder?: string;
  content?: string;
}
```

**Extensions by toolbar type:**

| Extension | comment | post |
|-----------|---------|------|
| StarterKit (bold, italic, strike) | ✓ | ✓ |
| BulletList + OrderedList | ✓ | ✓ |
| Link | ✓ | ✓ |
| Placeholder | ✓ | ✓ |
| Heading (H1, H2) | — | ✓ |
| CodeBlock | — | ✓ |
| Blockquote | — | ✓ |

**Toolbar UI by variant:**

- `comment`: Bold, Italic, Bullet List, Ordered List, Link
- `post`: Bold, Italic, H1, H2, Bullet List, Ordered List, Code Block, Blockquote, Link

Both variants use the same `Placeholder.configure()` with variant-specific placeholder text.

### Updated `CommentEditor.tsx`

Refactor to use `RichTextEditor` internally with `toolbar="comment"`. No visible UI changes.

### New Post Editor

**Files:** `app/admin/posts/new/page.tsx` and `app/admin/posts/[id]/edit/page.tsx`

- Replace `Textarea` with `RichTextEditor` (dynamic import, no SSR)
- Use `editor.getHTML()` on form submission
- Form field: `content` (renamed from `contentMDX`)
- Zod schema: `content: z.string().min(1)`
- Edit page pre-populates editor with existing `post.content` HTML

### Simplified Blog Renderer

**File:** `app/[locale]/blog/[slug]/page.tsx`

Remove manual line-by-line MDX parsing. Replace with:

```tsx
<div dangerouslySetInnerHTML={{ __html: post.content }} />
```

### Database Changes

**File:** `prisma/schema.prisma`

Rename `contentMDX` field to `content` on the `Post` model:

```prisma
content String @db.Text  // was: contentMDX String @db.Text
```

### API Changes

**Files:** `app/api/posts/route.ts`, `app/api/posts/[id]/route.ts`

- Rename `contentMDX` to `content` in request/response JSON shapes

## Files to Change

| File | Change |
|------|--------|
| `components/RichTextEditor.tsx` | **New** — shared TipTap editor |
| `components/CommentEditor.tsx` | Use `RichTextEditor` internally |
| `app/admin/posts/new/page.tsx` | TipTap editor, field rename |
| `app/admin/posts/[id]/edit/page.tsx` | TipTap editor, field rename |
| `app/[locale]/blog/[slug]/page.tsx` | `dangerouslySetInnerHTML` renderer |
| `prisma/schema.prisma` | Rename `contentMDX` → `content` |
| `app/api/posts/route.ts` | Field rename |
| `app/api/posts/[id]/route.ts` | Field rename |

## Files Not Changed

- `lib/utils.ts`, `lib/auth.ts`, `lib/rate-limit.ts` — untouched
- `prisma/seed.ts` — no existing posts to migrate
- Internationalization, authentication, rate limiting — unaffected

## Implementation Order

1. Add `RichTextEditor` component
2. Update `CommentEditor` to use it
3. Rename `contentMDX` → `content` in Prisma schema + migrate
4. Update API routes for field rename
5. Update post create/edit pages with TipTap
6. Simplify blog post renderer
7. Seed fresh data, test full flow
