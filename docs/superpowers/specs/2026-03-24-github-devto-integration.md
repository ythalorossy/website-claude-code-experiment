# GitHub & Dev.to API Integration — Design Spec

## Overview

Add GitHub and Dev.to API integrations to the portfolio website, displaying GitHub repos and Dev.to articles alongside existing self-hosted blog content.

## Architecture

**GitHub Integration:**
- Env var: `GITHUB_USERNAME` (your GitHub handle, e.g., `octocat`)
- Optional: `GITHUB_TOKEN` for higher rate limits (5000/hr vs 60/hr)
- Public GitHub REST API: `GET https://api.github.com/users/{username}/repos?sort=stars&per_page=6`
- ISR revalidation: `revalidate = 3600` (1 hour)
- No auth needed for public repos

**Dev.to Integration:**
- Env var: `DEV_TO_USERNAME` (your Dev.to username)
- Public Dev.to API: `GET https://dev.to/api/articles?username={username}`
- ISR revalidation: `revalidate = 3600` (1 hour)
- No auth needed

**Both use Server Components** — no client-side fetching, no exposed API keys.

**Error handling:**
- If GitHub API fails: show "Projects unavailable" placeholder
- If Dev.to API fails: show "Articles unavailable" placeholder
- If env var not set: section doesn't render

## Pages & Components

### Home Page
- **Featured Projects section** — top 3 GitHub repos by stars
  - Cards with: repo name, description, language badge, star count, fork count
  - Links to GitHub repo
- **Latest Writing section** — top 3 Dev.to articles
  - Cards with: title, description, reaction count, reading time, date
  - Links to full article on Dev.to
- Both sections only render if respective env var is configured

### New `/projects` Page (under `[locale]`)
- Grid of all public GitHub repos as cards
- Each card: name, description, language, stars, forks, link to GitHub
- Sort by: stars (default), recently updated, name

### New `/writing` Page (under `[locale]`)
- Grid of Dev.to articles as cards
- Each card: title, description excerpt, reaction count, reading time, date, link to full article
- Sorted by popularity (default Dev.to ordering)

### New Components
- `GitHubRepoCard` — displays a single repo (used on home + projects page)
- `DevToArticleCard` — displays a single article (used on home + writing page)

## API Response Shapes

### GitHub Repo Fields Used
```ts
{
  name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  updated_at: string
}
```

### Dev.to Article Fields Used
```ts
{
  title: string
  description: string
  url: string
  positive_reactions_count: number
  reading_time_minutes: number
  published_at: string
  tag_list: string[]
}
```

## Environment Variables

```bash
GITHUB_USERNAME=your_github_handle
DEV_TO_USERNAME=your_devto_handle
# Optional: GITHUB_TOKEN=ghp_... (for higher rate limits)
```

## Files to Create/Modify

| Action | File |
|--------|------|
| Create | `components/github/GitHubRepoCard.tsx` |
| Create | `components/github/GitHubProjectsClient.tsx` |
| Create | `components/devto/DevToArticleCard.tsx` |
| Create | `components/devto/DevToArticlesClient.tsx` |
| Create | `lib/github.ts` |
| Create | `lib/devto.ts` |
| Modify | `app/[locale]/page.tsx` — add Featured Projects + Latest Writing sections |
| Create | `app/[locale]/projects/page.tsx` |
| Create | `app/[locale]/writing/page.tsx` |
| Modify | `messages/en.json`, `pt.json`, `es.json` — add nav + section keys |
| Modify | `navigation.tsx` or header — add Projects + Writing links |

## Testing

- Unit tests for fetcher functions with mocked fetch responses
- Verify correct field extraction from API responses
- Verify graceful handling of missing/null fields
- Verify revalidation is set correctly
- Verify sections don't render when env vars are absent
