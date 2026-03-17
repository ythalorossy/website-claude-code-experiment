# Marketing Website with Admin CMS

A modern, production-ready marketing website built with Next.js 14, featuring a blog with MDX support and a full admin CMS.

## Features

- **Next.js 14** with App Router and React Server Components
- **PostgreSQL** with Prisma ORM
- **NextAuth.js** with Google OAuth and Email authentication
- **MDX Blog** with syntax highlighting (Shiki)
- **Admin CMS** with full CRUD operations and optimistic UI
- **TypeScript** for type safety
- **Tailwind CSS** with dark mode support
- **Accessibility** - keyboard navigation, skip links, semantic HTML
- **SEO** - Metadata, sitemap, robots.txt, OpenGraph

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- PostgreSQL + Prisma
- NextAuth.js
- Tailwind CSS
- MDX + Shiki
- Vitest + Playwright

## Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (for PostgreSQL)

## Local Setup

### 1. Start PostgreSQL Container

```bash
# Start PostgreSQL container


# Verify it's running
docker run -d \
  --name postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=marketing_cms \
  -p 5432:5432 \
  postgres:16
docker ps
```

**Useful Docker commands:**
- Start: `docker start postgres`
- Stop: `docker stop postgres`
- Logs: `docker logs -f postgres`

### 2. Environment Variables

```bash
# Copy example env file
cp .env.example .env.local
```

The `.env.local` should already have the correct Docker connection string:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketing_cms"
```

Generate a secret if needed:
```bash
openssl rand -base64 32
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Setup Database

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed
```

### 6. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript check |
| `pnpm test` | Run unit tests |
| `pnpm e2e` | Run e2e tests |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Prisma Studio |

## Project Structure

```
app/
├── api/               # API routes
│   ├── auth/         # NextAuth endpoints
│   ├── posts/        # Posts API
│   └── contact/      # Contact form API
├── admin/            # Admin pages
│   └── posts/        # Post management
├── blog/             # Blog pages
├── about/            # About page
├── contact/          # Contact page
├── privacy/          # Privacy policy
├── terms/            # Terms of service
├── layout.tsx        # Root layout
├── page.tsx          # Home page
├── sitemap.ts       # Sitemap
└── robots.ts        # Robots.txt

components/
├── ui/              # Reusable UI components
└── layout/          # Layout components (Header, Footer)

lib/
├── db.ts            # Prisma client
├── auth.ts          # NextAuth config
├── utils.ts         # Utility functions
└── rate-limit.ts    # Rate limiting

prisma/
├── schema.prisma    # Database schema
└── seed.ts          # Seed script

tests/
├── unit/            # Unit tests
└── e2e/             # E2E tests
```

## Admin Access

After seeding, you can sign in with:
- Email: `admin@example.com`
- (Password configured in seed - check `prisma/seed.ts`)

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Environment Variables for Production

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://your-domain.com
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Troubleshooting

### "Cannot connect to database"

- Check Docker container is running: `docker ps`
- Check container logs: `docker logs postgres`
- Verify DATABASE_URL in .env.local
- Restart container: `docker restart postgres`

### "Prisma client not generated"

```bash
pnpm db:generate
```

### "NextAuth callback error"

- Ensure NEXTAUTH_URL matches your deployment URL
- Check NEXTAUTH_SECRET is set

## License

MIT