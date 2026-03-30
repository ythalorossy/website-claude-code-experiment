# Codebase Audit Plan

**Date:** 2026-03-30
**Status:** Completed (Phases 1-4)
**Type:** Cleanup & Maintenance

## Overview

This plan addresses findings from a hybrid codebase audit of the `nextjs-marketing-cms` application. The audit identified orphaned code, misnamed modules, a broken lint command, and 43 outdated dependencies.

## Audit Findings Summary

| Category | Issues Found |
|----------|-------------|
| Dead Code | 2 files (useCryptoPrices.ts, SessionChecker.tsx) - FIXED |
| Misleading Names | 1 file (useCryptoWebSocket.ts - actually polling) - FIXED |
| Broken Commands | 1 (pnpm lint) - ESLint 9 migration needed |
| Outdated Dependencies | 43 packages - PARTIALLY UPDATED |
| TypeScript Errors | 0 |
| Orphan Routes | 0 |

---

## Task Checklist

### Phase 1: Dead Code Removal ✅

- [x] **1.1** Delete `hooks/useCryptoPrices.ts` (orphaned - CoinGecko API hook replaced by Coinbase polling)
- [x] **1.2** Delete `components/SessionChecker.tsx` (orphaned - never imported)
- [x] **1.3** Verify deletions don't break any imports (run `pnpm typecheck`)

### Phase 2: Rename Misleading Module ✅

- [x] **2.1** Rename `hooks/useCryptoWebSocket.ts` → `hooks/useCryptoPolling.ts`
- [x] **2.2** Update all imports referencing `useCryptoWebSocket` in:
  - `app/[locale]/crypto/CryptoClient.tsx`
  - `app/admin/crypto/CryptoAdminClient.tsx`
- [x] **2.3** Update page text in `app/[locale]/crypto/CryptoClient.tsx` - change "powered by WebSocket" to "powered by polling"
- [x] **2.4** Run `pnpm typecheck` to verify rename

### Phase 3: Fix Broken Lint Command ⚠️ PARTIALLY DONE

- [x] **3.1** Investigate `pnpm lint` failure - ESLint 9 circular reference error discovered
- [ ] **3.2** ESLint 9 flat config migration needed (complex - requires rewriting .eslintrc.cjs to eslint.config.js format)
- [ ] **3.3** Verify `pnpm lint` passes with no errors

### Phase 4: Dependency Updates ✅ COMPLETED

**Updated successfully:**
- next@16.2.1, react@19.2.4, react-dom@19.2.4
- next-auth@4.24.13
- zod@4.3.6
- shiki@4.0.2
- rate-limiter-flexible@10.0.1
- @hookform/resolvers@5.2.2
- eslint@9.39.4, eslint-config-next@16.2.1
- typescript@5.9.3
- Multiple dev dependencies to latest

**Kept at stable versions (major jumps caused breaking changes):**
- [x] tailwindcss@3.4.1 (v4 requires full config rewrite)
- [x] vite@5.4.21 (v6 incompatible with vitest 1.x)
- [x] @vitejs/plugin-react@4.2.1 (v6 requires vite 8.x)
- [x] vitest@1.3.0 (v4.x requires vite 6+)
- [x] lucide-react@0.469.0 (v1.x removed icons)
- [x] prisma@5.22.0 (v7 has breaking schema changes)

---

## Verification Results

| Command | Status |
|---------|--------|
| `pnpm typecheck` | ✅ Pass |
| `pnpm test` | ✅ Pass (14 tests) |
| `pnpm build` | ✅ Pass |
| `pnpm lint` | ❌ ESLint 9 migration needed |

---

## Commits

- `d6b6af5` - chore: audit cleanup - remove dead code, rename misleading module
- `41bad9d` - chore: update dependencies to latest compatible versions

---

## Remaining Issues

1. **ESLint linting broken** - ESLint 9 has circular reference errors with Next.js plugins. Needs flat config migration.

## Files Modified

| File | Action |
|------|--------|
| `hooks/useCryptoPrices.ts` | DELETED |
| `components/SessionChecker.tsx` | DELETED |
| `hooks/useCryptoWebSocket.ts` | RENAMED to `useCryptoPolling.ts` |
| `app/[locale]/crypto/CryptoClient.tsx` | UPDATED imports + UI text |
| `app/admin/crypto/CryptoAdminClient.tsx` | UPDATED imports |
| `package.json` | UPDATED dependencies |
| `pnpm-lock.yaml` | UPDATED |

---

## Success Criteria

- [x] 1. All orphan files removed
- [x] 2. No misleading module names
- [ ] 3. `pnpm lint` passes without errors (BLOCKED: ESLint 9 migration needed)
- [x] 4. Most dependencies updated (major breaking changes kept stable)
- [x] 5. `pnpm build` succeeds
- [x] 6. `pnpm test` passes
- [x] 7. `pnpm typecheck` passes
