# Dev.to Username Display on Writing Page Card

## Context
When multiple Dev.to usernames are configured via `DEV_TO_USERNAMES`, articles from all users are merged and sorted by date. However, the username attribution is lost in the current implementation since the Dev.to API response doesn't include the username per article when fetching by username.

## Goal
Display the Dev.to username on each article card in a subtle, non attention-grabbing way on the writing page.

## Design

### Data Model Change
Add `username` field to `DevToArticle` interface in `lib/devto.ts`.

### Implementation

1. **`lib/devto.ts`** — Modify `fetchUserArticles` to attach the `username` to each article object before returning.

2. **`components/devto/DevToArticleCard.tsx`** — Add username display in the card footer:
   - Small, muted text (text-xs, text-gray-400/500)
   - Positioned alongside or replacing the "Read →" link
   - Format: `@username` or just `username`
   - Should not compete with reactions count for attention

### Styling
- Font size: `text-xs` (12px)
- Color: `text-gray-400` (light) / `text-gray-500` (dark)
- Optional: prefix with `@` symbol
- Position: right side of footer, after reading time, before "Read" arrow

## Files to Modify
- `lib/devto.ts`
- `components/devto/DevToArticleCard.tsx`
