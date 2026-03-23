# Internationalization (i18n) — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Add multi-language support (English, Portuguese, Spanish) with user-selectable language preference via URL-based routing. Uses next-intl library already installed in the project.

---

## Approach

**Subpath routing with locale prefix:**
- URLs: `/en/about`, `/pt/about`, `/es/about`
- Default locale (`en`) redirects root paths to `/en`
- Locale preference is URL-based — shareable, SEO-friendly, no cookie needed
- Language selector updates the URL path when changed

---

## Supported Languages

| Code | Language | Flag |
|------|----------|------|
| `en` | English | 🇺🇸 |
| `pt` | Portuguese | 🇧🇷 |
| `es` | Spanish | 🇪🇸 |

---

## Database Schema

No changes needed — database content (blog posts, team members, projects) is not translated in this phase.

---

## Message Files

**Structure:**
```
messages/
  en.json   (existing — base)
  pt.json   (new — Portuguese)
  es.json   (new — Spanish)
```

**Keys to translate (UI labels + hardcoded page content):**
```json
{
  "Navigation": { "home", "about", "blog", "team", "projects", "contact", "signIn", "signOut", "admin" },
  "Common": { "loading", "error", "save", "cancel", "delete", "edit", "create", "back" },
  "Home": { "title", "subtitle", "readBlog", "learnMore" },
  "About": { "title", "subtitle", "mission", "whatWeDo", "howWeBuild", "values" },
  "Blog": { "title", "subtitle", "noPosts", "readMore" },
  "Contact": { "title", "subtitle", "name", "email", "message", "submit", "success", "error" },
  "Team": { "title", "subtitle", "noMembers" },
  "Projects": { "title", "subtitle", "noProjects", "active", "archived" },
  "Footer": { "rights", "privacy", "terms" },
  "Auth": { "signIn", "signOut", "email", "password" }
}
```

---

## Routing Structure

### Middleware (`middleware.ts`)

Intercepts all requests and:
1. Extracts locale from URL path (`/pt/about`)
2. If no locale prefix, redirects to default locale (`/` → `/en`)
3. Sets `x-locale` header for downstream use
4. Allows access to `/api/*`, `/admin/*`, `/auth/*` without locale prefix

### Page Structure

All public pages move under `/app/[locale]/` segment:

| Old Route | New Route |
|-----------|-----------|
| `/app/page.tsx` | `/app/[locale]/page.tsx` |
| `/app/about/page.tsx` | `/app/[locale]/about/page.tsx` |
| `/app/blog/page.tsx` | `/app/[locale]/blog/page.tsx` |
| `/app/contact/page.tsx` | `/app/[locale]/contact/page.tsx` |
| `/app/team/page.tsx` | `/app/[locale]/team/page.tsx` |
| `/app/projects/page.tsx` | `/app/[locale]/projects/page.tsx` |

**Excluded from locale routing (no translation):**
- `/app/blog/[slug]/page.tsx` — dynamic blog post content
- `/app/admin/*` — admin panel
- `/app/auth/*` — authentication pages
- `/app/api/*` — API routes

### Root Layout Update

Root `app/layout.tsx` is kept as-is (no locale). Locale-specific layout at `app/[locale]/layout.tsx` provides translations context.

---

## Language Selector Component

### Header Selector (Client Component)

- **Trigger:** Globe icon button in header nav (next to ThemeToggle)
- **Dropdown:** Small floating menu showing all 3 languages
- **Each option:** Flag emoji + language name + checkmark if current locale
- **Behavior:** Clicking a language navigates to the same path under the new locale (e.g., `/en/about` → `/pt/about`)
- **Styling:** Matches dark mode, rounded corners, backdrop blur

### Footer Selector

- **Placement:** "Language" section in footer
- **Each option:** Flag icon + full language name as clickable link
- **Current locale:** Bold/highlighted
- **Behavior:** Same navigation as header selector

---

## `next.config.mjs` Update

```js
const nextConfig = {
  output: 'standalone',
  images: { remotePatterns: [...] },
  // ... existing headers
  // next-intl plugin configured via next.config
};
```

Note: next-intl v3 uses a plugin approach via `i18n.ts` routing configuration.

---

## What We're NOT Building

- No database content translation (blog posts, team bios, project descriptions stay in original language)
- No admin UI for managing per-locale content
- No translation API integration (DeepL, Google Translate, etc.)
- No RTL language support
- No locale-specific metadata (SEO) beyond basic `<html lang="...">`
