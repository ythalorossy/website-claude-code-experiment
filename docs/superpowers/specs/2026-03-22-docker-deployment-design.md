# Docker Deployment — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Containerize the Next.js app for production deployment using Docker with a minimal image size. Database runs externally (PostgreSQL).

---

## Approach

**Single app container** with multi-stage build. PostgreSQL remains external (existing Docker container, managed service, or hosted provider).

Rationale:
- App and database have different lifecycles — keeping them separate improves maintainability
- Smaller, focused image (~150-200MB) rather than bundling database
- Easier to scale, upgrade, and manage independently

---

## Dockerfile

**Stage 1 — Dependencies & Build (`deps` + `builder`):**
```dockerfile
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build
```

**Stage 2 — Runtime (`runner`):**
```dockerfile
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY package.json ./

EXPOSE 3000
CMD ["node", "server.js"]
```

Key decisions:
- `node:22-alpine` (~5MB base) vs Debian-based (~100MB+) — significant size reduction
- `pnpm --frozen-lockfile` — deterministic installs
- Copies only `.next/standalone` output — Next.js runs as standalone Node server
- Only Prisma generated client copied, not full dev dependencies

---

## Docker Compose (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${DATABASE_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      NEXTAUTH_URL: ${NEXTAUTH_URL}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET}
      NEXT_PUBLIC_BASE_URL: ${NEXT_PUBLIC_BASE_URL}
      EMAIL_SERVER_USER: ${EMAIL_SERVER_USER}
      EMAIL_SERVER_PASSWORD: ${EMAIL_SERVER_PASSWORD}
      EMAIL_SERVER_HOST: ${EMAIL_SERVER_HOST}
      EMAIL_SERVER_PORT: ${EMAIL_SERVER_PORT}
      EMAIL_FROM: ${EMAIL_FROM}
      MINIMAX_API_KEY: ${MINIMAX_API_KEY}
    restart: unless-stopped
```

All secrets passed via `-e` / host env vars — not baked into image.

---

## Next.js Config Update

Add `output: 'standalone'` to `next.config.mjs`:
```js
const nextConfig = {
  output: 'standalone',
  images: { remotePatterns: [...] },
  // ... existing headers
};
```

This tells Next.js to output a standalone server in `.next/standalone`.

---

## `.dockerignore`

```
node_modules
.next
.git
.env
.env.*
!.env.example
tests
coverage
*.log
.DS_Store
```

Excludes unnecessary files from build context, keeping image lean.

---

## `.env.example`

Documents required environment variables for deployment:
```
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="<32-char-secret>"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM=""
MINIMAX_API_KEY=""
```

---

## Deployment Workflow

1. Copy `.env.example` to `.env` and fill in values
2. Run `docker compose build`
3. Run `docker compose up -d`
4. App available at `http://localhost:3000`

Database must be running and accessible at `DATABASE_URL` before starting the app.

---

## What We're NOT Building
- No PostgreSQL container (database is external)
- No multi-stage with Turbopack (standard webpack build for compatibility)
- No Kubernetes/Helm charts (plain Docker Compose only)
