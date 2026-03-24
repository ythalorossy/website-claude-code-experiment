# Fix Profile Page 404 — Design Spec

## Problem

The profile page at `app/profile/page.tsx` returns a 404 because it exists outside the locale-prefixed routing structure (`app/[locale]/`). All other public pages (about, blog, contact, projects, team) live under `app/[locale]/`, and the `intlMiddleware` routes all paths through locale handling. Without a locale prefix, `/profile` doesn't match any route.

## Solution

Move the profile page into the locale-prefixed structure.

## Changes

| Action | File |
|--------|------|
| Move | `app/profile/page.tsx` → `app/[locale]/profile/page.tsx` |

## URL Impact

| Before | After |
|--------|-------|
| `/profile` | `/en/profile`, `/pt/profile`, `/es/profile` |

## Verification

After the move:
1. Build succeeds (`pnpm build`)
2. Visit `/en/profile` — should show the profile page (redirects to signin if not authenticated)
3. Visit `/pt/profile` — same behavior
4. Visit `/es/profile` — same behavior
