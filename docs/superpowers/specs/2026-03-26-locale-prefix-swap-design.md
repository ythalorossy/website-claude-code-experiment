# Design: Preserve Page Location on Language Switch

## Summary

Fix the LanguageSelector component to swap only the locale prefix while preserving the rest of the URL path, instead of redirecting to the landing page.

## Problem

Currently, when a user changes language, the `LanguageSelector` component uses:
```js
router.replace(`/${newLocale}`);
```

This drops everything after the locale prefix, redirecting users to the landing page instead of keeping them on their current page.

**Example of the bug:**
- User is on: `/pt/blog/my-post`
- Clicks Spanish flag
- Gets redirected to: `/es` (landing page)
- Expected: `/es/blog/my-post`

## Solution

Modify `components/layout/LanguageSelector.tsx` to:

1. Extract the current locale from the pathname
2. Remove the locale prefix from the pathname to get the path-only portion
3. Construct the new URL by combining the new locale with the preserved path

### Code Change

**Before (line 21-26):**
```js
const handleSelect = (newLocale: string) => {
  setIsOpen(false);
  startTransition(() => {
    router.replace(`/${newLocale}`);
  });
};
```

**After:**
```js
const handleSelect = (newLocale: string) => {
  setIsOpen(false);
  startTransition(() => {
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/';
    router.replace(`/${newLocale}${pathWithoutLocale}`);
  });
};
```

## Behavior Examples

| Current URL | Selected Locale | New URL |
|-------------|-----------------|---------|
| `/pt/blog/my-post` | `es` | `/es/blog/my-post` |
| `/en/projects` | `pt` | `/pt/projects` |
| `/es` | `en` | `/en` |
| `/pt/about` | `pt` | (no change - already on pt) |

## Files to Modify

- `components/layout/LanguageSelector.tsx` - Lines 21-26

## Testing Considerations

- Verify language switch preserves URL path from homepage (e.g., `/en` → `/pt`)
- Verify language switch preserves URL path from blog posts
- Verify language switch preserves URL path from nested routes (e.g., `/en/team/member`)
- Verify language switch on admin routes still works (admin routes don't use locale prefix per `proxy.ts`)
