# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`nextjs-marketing-cms` is a full-stack Next.js 16 (React 19) application - a software engineering blog with an admin CMS. Uses PostgreSQL with Prisma ORM, NextAuth.js v4 for authentication, and Tailwind CSS for styling.

## Git Workflow

- Do NOT commit or push changes unless explicitly asked to do so
- Do NOT push to remote branches without confirming the user has a remote set up
- Never commit .claude/ folder or files containing secrets
- Use `/commit` skill for all commits — it enforces these rules and generates conventional commit messages

## Commands

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm typecheck   # Run TypeScript check

# Testing
pnpm test         # Run unit tests (Vitest)
pnpm test:watch   # Watch mode for unit tests
pnpm e2e          # Run e2e tests (Playwright)
pnpm e2e:ui       # Run e2e tests with UI

**Setup issue:** If tests fail with "Failed to resolve import @testing-library/jest-dom", run `pnpm add -D @testing-library/jest-dom`

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run Prisma migrations
pnpm db:seed      # Seed database with sample data
pnpm db:studio    # Open Prisma Studio
```

## Framework Knowledge

- This project uses Next.js 16 which uses proxy.ts instead of middleware.ts (middleware.ts is deprecated)
- After any Prisma schema changes, always run `npx prisma generate` before testing
- Always regenerate Prisma client after schema modifications

## Approach Guidelines

- When user corrects your approach, fully abandon the previous approach rather than trying to patch it
- Ask which page/component the user means before implementing UI features
- Do not modify solution files (*.sln) or add packages unless explicitly requested

## Common Mistakes to Avoid

- Do NOT rename proxy.ts to middleware.ts (middleware.ts is deprecated in Next.js 16)
- Do NOT forget to run `npx prisma generate` after schema changes — test failures will result
- Do NOT implement features for the wrong page without asking for clarification first
- Do NOT commit or push changes without explicit permission

## Architecture

### App Router Structure
- `app/` - Next.js 16 App Router with file-based routing
- `app/[locale]/` - Locale-prefixed public pages (about, blog, contact, projects, team)
- `app/api/` - RESTful API routes (posts, team, comments, claps, contact, chat)
- `app/admin/` - Protected admin CMS pages (require ADMIN role)
- `app/blog/[slug]/` - Blog post detail pages (note: blog routes use `[locale]` prefix)

### Authentication (Two-Layer Protection)
- NextAuth.js v4 with JWT strategy
- **Layer 1**: `proxy.ts` middleware uses `withAuth` to intercept `/admin` routes before they reach pages
- **Layer 2**: `app/admin/layout.tsx` uses `getServerSession()` as a runtime check
- Two providers: Google OAuth + Credentials (email/password)
- Role-based access: `USER` and `ADMIN` roles stored in database, fetched on each JWT/session update
- Credentials provider accepts any email in the database (no password needed for admin seed account)

### Internationalization
- Uses `next-intl` for i18n support
- Routing configured in `i18n/routing.ts`, request config in `i18n/request.ts`
- Messages stored in `messages/` directory (JSON files per locale)
- Supported locales: `en`, `pt`, `es`

### Language Switching (LanguageSelector)
- `components/layout/LanguageSelector.tsx` uses `router.replace(\`/${newLocale}\`)` which drops the path
- To preserve path: `pathname.replace(\`/${locale}\`, '') || '/'` then `router.replace(\`/${newLocale}${pathWithoutLocale}\`)`

### Database Pattern
- Prisma singleton imported from `@/lib/db` to prevent multiple instances
- PostgreSQL via Docker (postgres:16)
- Connection: `postgresql://postgres:postgres@localhost:5432/marketing_cms`

### Styling
- Tailwind CSS with custom brand colors (violet/fuchsia/cyan palette)
- Dark mode via `class` strategy (default: dark)
- Path alias `@/*` maps to project root
- Uses `@tailwindcss/typography` for prose styling and `@tailwindcss/forms` for form elements

### Rich Text Editing
- TipTap editor (`@tiptap/react`) used for post content and comments
- Content stored as HTML in the database
- Code syntax highlighting via Shiki (`rehype-pretty-code`)

### API Routes
- `app/api/posts/` - Post CRUD (GET list, POST create)
- `app/api/posts/[id]/` - Single post operations (GET, PATCH, DELETE)
- `app/api/team/` and `app/api/team/[id]/` - Team member CRUD
- `app/api/comments/` - Comment operations
- `app/api/claps/` - Clap/like functionality
- `app/api/contact/` - Contact form submission (with rate limiting)
- `app/api/chat/` - AI chat integration (Minimax)

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models (User, Post, Comment, Clap, TeamMember, plus NextAuth Account/Session/VerificationToken) |
| `lib/auth.ts` | NextAuth configuration with Google OAuth and Credentials providers |
| `lib/db.ts` | Prisma singleton |
| `lib/utils.ts` | Utilities: `cn()`, `slugify()`, `formatDate()`, `truncate()` (Note: `new Date('YYYY-MM-DD')` parses as UTC midnight - append `'T00:00:00'` for local timezone) |
| `lib/rate-limit.ts` | Rate limiting via `rate-limiter-flexible` (100 req/min general, 5 req/min for contact) |
| `i18n/routing.ts` | next-intl routing configuration (locales, defaultLocale) |
| `i18n/request.ts` | next-intl request config (locale detection, message loading) |
| `components/ui/` | Reusable UI components (Card, Button, Input, etc.) |
| `app/admin/layout.tsx` | Admin layout with role-based access control |
| `proxy.ts` | Middleware: protects `/admin` routes via JWT role check, then passes to next-intl |

## Testing & Verification

- When asked to review changes, focus on current unstaged changes (git diff) not commit history unless specified
- After completing a task that involved starting a dev server, always stop/kill the server process
- When writing tests, double-check expected values and avoid duplicate dictionary keys before running

## Database Setup

```bash
# Start PostgreSQL container
docker run -d --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=marketing_cms \
  -p 5432:5432 \
  postgres:16

# Then run
pnpm db:generate && pnpm db:push && pnpm db:seed
```

## Admin Access

After seeding: `admin@example.com` (password in `prisma/seed.ts`)

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketing_cms"
NEXTAUTH_SECRET="<32-char-secret>"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
# Email (SMTP for contact form)
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@example.com"
# AI Chat (Minimax)
MINIMAX_API_KEY=""
```

## Maintaining CLAUDE.md

When you learn something new about this project, add it to CLAUDE.md using:
- **During a session:** Press `#` to have Claude auto-incorporate learnings
- **After a session:** Use `/claude-md-improver` skill to audit and improve
- **Local personalization:** Create `.claude.local.md` for personal preferences (add to .gitignore)
