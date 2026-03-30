# Codebase Audit Plan

**Date:** 2026-03-30
**Status:** Draft
**Type:** Cleanup & Maintenance

## Overview

This plan addresses findings from a hybrid codebase audit of the `nextjs-marketing-cms` application. The audit identified orphaned code, misnamed modules, a broken lint command, and 43 outdated dependencies.

## Audit Findings Summary

| Category | Issues Found |
|----------|-------------|
| Dead Code | 2 files (useCryptoPrices.ts, SessionChecker.tsx) |
| Misleading Names | 1 file (useCryptoWebSocket.ts - actually polling) |
| Broken Commands | 1 (pnpm lint) |
| Outdated Dependencies | 43 packages |
| TypeScript Errors | 0 |
| Orphan Routes | 0 |

---

## Task Checklist

### Phase 1: Dead Code Removal

- [ ] **1.1** Delete `hooks/useCryptoPrices.ts` (orphaned - CoinGecko API hook replaced by Coinbase polling)
- [ ] **1.2** Delete `components/SessionChecker.tsx` (orphaned - never imported)
- [ ] **1.3** Verify deletions don't break any imports (run `pnpm typecheck`)

### Phase 2: Rename Misleading Module

- [ ] **2.1** Rename `hooks/useCryptoWebSocket.ts` → `hooks/useCryptoPolling.ts`
- [ ] **2.2** Update all imports referencing `useCryptoWebSocket` in:
  - `app/[locale]/crypto/CryptoClient.tsx`
  - `app/admin/crypto/CryptoAdminClient.tsx`
- [ ] **2.3** Update page text in `app/[locale]/crypto/CryptoClient.tsx` - change "powered by WebSocket" to "powered by polling" or "real-time updates"
- [ ] **2.4** Run `pnpm typecheck` to verify rename

### Phase 3: Fix Broken Lint Command

- [ ] **3.1** Investigate `pnpm lint` failure - run `npx next lint` manually to see actual error
- [ ] **3.2** Fix ESLint configuration or package.json lint script
- [ ] **3.3** Verify `pnpm lint` passes with no errors

### Phase 4: Dependency Updates

- [ ] **4.1** Update minor/patch versions (low risk):
  ```bash
  pnpm update --minor
  pnpm update --patch
  ```
- [ ] **4.2** Test after minor updates: `pnpm build && pnpm typecheck && pnpm lint`
- [ ] **4.3** Update major versions one at a time, testing after each:
  - [ ] `pnpm add next@latest react@latest react-dom@latest`
  - [ ] `pnpm add zod@latest`
  - [ ] `pnpm add @hookform/resolvers@latest`
  - [ ] `pnpm add tailwindcss@latest @tailwindcss/forms@latest @tailwindcss/typography@latest` (Tailwind v4)
  - [ ] `pnpm add shiki@latest` (breaking API changes)
  - [ ] `pnpm add @prisma/client@latest prisma@latest` (major version)
  - [ ] Update TypeScript and ESLint packages
- [ ] **4.4** Run full test suite after each major update

### Phase 5: Full App Cycle Test

- [ ] **5.1** Start development server: `pnpm dev`
- [ ] **5.2** Verify all pages load:
  - [ ] Home page (`/`)
  - [ ] Blog (`/blog`)
  - [ ] Crypto prices (`/crypto`)
  - [ ] Admin dashboard (`/admin`)
  - [ ] Contact (`/contact`)
- [ ] **5.3** Test client-side navigation between pages
- [ ] **5.4** Test authentication flow (sign in)
- [ ] **5.5** Test admin features (if authenticated)
- [ ] **5.6** Verify no console errors in browser
- [ ] **5.7** Stop development server

### Phase 6: Run Test Suites

- [ ] **6.1** Run unit tests: `pnpm test`
- [ ] **6.2** Run E2E tests: `pnpm e2e` (if configured)
- [ ] **6.3** Run typecheck: `pnpm typecheck`
- [ ] **6.4** Run lint: `pnpm lint`
- [ ] **6.5** Run build: `pnpm build`

---

## Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint (currently broken)
pnpm typecheck        # Run TypeScript check
pnpm test             # Run unit tests (Vitest)
pnpm e2e              # Run E2E tests (Playwright)

# Dependency Management
pnpm outdated         # Check outdated packages
pnpm update           # Update packages
```

---

## Files to Modify

| File | Action |
|------|--------|
| `hooks/useCryptoPrices.ts` | DELETE |
| `components/SessionChecker.tsx` | DELETE |
| `hooks/useCryptoWebSocket.ts` | RENAME to `useCryptoPolling.ts` |
| `app/[locale]/crypto/CryptoClient.tsx` | UPDATE imports + UI text |
| `app/admin/crypto/CryptoAdminClient.tsx` | UPDATE imports |
| `package.json` | UPDATE dependencies |

---

## Success Criteria

1. All orphan files removed
2. No misleading module names
3. `pnpm lint` passes without errors
4. All 43 outdated packages updated OR documented as intentionally pinned
5. `pnpm dev` starts without errors
6. All navigation links work
7. `pnpm test` passes
8. `pnpm build` succeeds
9. No console errors during app usage

---

## Notes

- **Tailwind v4** is a major rewrite. Consider pinning at v3 unless v4 features are needed.
- **Prisma v7** may require schema changes. Check migration guide before upgrading.
- **React 19** and **Next.js 16** are recent. Ensure all NextAuth.js v4 compatibility.
