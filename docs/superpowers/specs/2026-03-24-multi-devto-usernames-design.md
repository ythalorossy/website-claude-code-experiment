# Multi-User Dev.to Writing Page — Design Spec

**Date:** 2026-03-24
**Status:** Approved

---

## Overview

Change the writing page to fetch articles from multiple dev.to usernames via a comma-separated environment variable, combining them into one feed sorted by date.

---

## Changes

### 1. `lib/devto.ts`

- Rename `DEV_TO_USERNAME` → `DEV_TO_USERNAMES` (comma-separated list)
- Parse environment variable by splitting on commas
- Fetch articles per username in parallel via `Promise.all`
- Flatten and sort all articles by `published_at` descending
- Return unified `DevToArticle[]`

**Key logic:**
```typescript
const usernames = process.env.DEV_TO_USERNAMES?.split(',').map(u => u.trim()) || [];
const results = await Promise.all(usernames.map(username => fetchUserArticles(username)));
const allArticles = results.flat();
return allArticles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
```

### 2. `app/[locale]/writing/page.tsx`

- Update error message to reference `DEV_TO_USERNAMES` instead of `DEV_TO_USERNAME`

### 3. `.env.example`

- Replace `DEV_TO_USERNAME=user1` with `DEV_TO_USERNAMES=user1,user2,user3`
- Add comment documenting the format

---

## Data Flow

```
ENV: DEV_TO_USERNAMES="user1,user2,user3"
        ↓
getDevToArticles() fetches all in parallel
        ↓
user1 articles + user2 articles + user3 articles
        ↓
Sort by published_at desc
        ↓
Render unified grid
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Empty `DEV_TO_USERNAMES` | Show empty state |
| One username | Works (backwards compatible) |
| Username with no articles | Returns empty array, skipped in aggregation |
| API error for one user | Continues with others, logs error |
| Whitespace around commas | Trimmed automatically |

---

## Backwards Compatibility

- Old variable `DEV_TO_USERNAME` is no longer used
- If `DEV_TO_USERNAMES` is not set, behaves as empty list (shows empty state with message)
