# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`nextjs-marketing-cms` is a full-stack Next.js 16 application - a software engineering blog with an admin CMS. Uses PostgreSQL with Prisma ORM, NextAuth.js for authentication, and Tailwind CSS for styling.

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
pnpm e2e          # Run e2e tests (Playwright)

# Database
pnpm db:generate  # Generate Prisma client
pnpm db:push      # Push schema to database
pnpm db:migrate   # Run Prisma migrations
pnpm db:seed      # Seed database with sample data
pnpm db:studio    # Open Prisma Studio
```

## Architecture

### App Router Structure
- `app/` - Next.js 16 App Router with file-based routing
- `app/api/` - RESTful API routes (posts, team, comments, claps, contact)
- `app/admin/` - Protected admin CMS pages (require ADMIN role)
- `app/blog/[slug]/` - Blog post detail pages

### Authentication
- NextAuth.js v4 with JWT strategy
- Two providers: Google OAuth + Credentials (email/password)
- Role-based access: `USER` and `ADMIN` roles in database
- Admin routes protected in `app/admin/layout.tsx` via `getServerSession()` check
- API routes protected by checking `session.user.role === 'ADMIN'`

### Database Pattern
- Prisma singleton imported from `@/lib/db` to prevent multiple instances
- PostgreSQL via Docker (postgres:16)
- Connection: `postgresql://postgres:postgres@localhost:5432/marketing_cms`

### Styling
- Tailwind CSS with custom brand colors (violet/fuchsia/cyan palette)
- Dark mode via `class` strategy (default: dark)
- Path alias `@/*` maps to project root

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database models (User, Post, Comment, Clap, TeamMember) |
| `lib/auth.ts` | NextAuth configuration |
| `lib/db.ts` | Prisma singleton |
| `lib/utils.ts` | Utilities: `cn()`, `slugify()`, `formatDate()`, `truncate()` |
| `app/admin/layout.tsx` | Admin layout with role-based access control |
| `proxy.ts` | Route protection for `/admin` paths |

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
```
