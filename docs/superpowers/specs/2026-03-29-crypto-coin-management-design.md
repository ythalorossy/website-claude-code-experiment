# Crypto Coin Management — Admin Feature

## Overview

Add a full CRUD admin interface for managing which cryptocurrency coins are supported on the platform. Currently coins are hardcoded in `lib/crypto.ts` and duplicated in `hooks/useCryptoHistory.ts`. This feature moves coin configuration to the database and provides an admin UI to manage them.

## Goals

- Admins can add, edit, remove, and toggle active status for coins from the admin UI
- Coin configuration stored in PostgreSQL via Prisma
- Existing real-time crypto display (public and admin pages) updated to use DB-backed coin config
- Coin data fetched from DB on page load; falls back to hardcoded seed data if DB is unavailable

## Design

### 1. Database Schema

**New Prisma model in `prisma/schema.prisma`:**

```prisma
model Coin {
  id          String   @id @default(cuid())
  symbol      String   // BTC, ETH, SOL, DOGE — unique ticker symbol
  name        String   // Bitcoin, Ethereum, Solana, Dogecoin
  coincapId   String   // "bitcoin", "ethereum", "solana", "dogecoin" — CoinCap asset ID
  color       String   // hex color code for charts and cards, e.g. "#f7931a"
  isActive    Boolean  @default(true)  // whether the coin is displayed on public/admin pages
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([symbol])
  @@unique([coincapId])
  @@index([isActive])
}
```

**Constraints:**
- `symbol` must be unique (case-sensitive, e.g. "BTC" not "btc")
- `coincapId` must be unique — multiple coins cannot share the same CoinCap ID
- `coincapId` is indexed for fast lookups when connecting to CoinCap WebSocket
- `isActive` defaults to `true` so newly added coins are immediately visible

### 2. API Routes

All routes follow the existing pattern used by `app/api/posts/route.ts` — inline auth check using `getServerSession(authOptions)` with role verification. Routes are NOT under an `/api/admin/` prefix.

#### `GET /api/crypto/coins`

Returns all coins (active and inactive) ordered by `symbol`.
No auth required (public data).

**Response `200`:**
```json
{
  "coins": [
    {
      "id": "cuid123",
      "symbol": "BTC",
      "name": "Bitcoin",
      "coincapId": "bitcoin",
      "color": "#f7931a",
      "isActive": true,
      "createdAt": "2026-03-29T00:00:00.000Z",
      "updatedAt": "2026-03-29T00:00:00.000Z"
    }
  ]
}
```

#### `POST /api/crypto/coins`

Create a new coin. **Requires ADMIN role.**

**Auth:** Inline check — `if (!session || session.user.role !== 'ADMIN') return 401`.

**Request body:**
```json
{
  "symbol": "BTC",
  "name": "Bitcoin",
  "coincapId": "bitcoin",
  "color": "#f7931a"
}
```

**Validation:**
- `symbol` — required, 2–10 uppercase letters
- `name` — required, 2–50 characters
- `coincapId` — required, lowercase alphanumeric/dash
- `color` — required, valid hex color (3 or 6 digit, with or without `#`)

**Response `201`:**
```json
{ "coin": { ... } }
```

**Errors:**
- `400` — validation failure with `{ error: "Validation failed", details: [...] }`
- `401` — not authenticated
- `403` — not ADMIN
- `409` — symbol or coincapId already exists

#### `PATCH /api/crypto/coins/[id]`

Update an existing coin. All fields optional. **Requires ADMIN role.**

**Auth:** Inline check — `if (!session || session.user.role !== 'ADMIN') return 401`.

**Request body (all optional):**
```json
{
  "symbol": "ETH",
  "name": "Ethereum",
  "coincapId": "ethereum",
  "color": "#627eea",
  "isActive": false
}
```

**Response `200`:**
```json
{ "coin": { ... } }
```

**Errors:**
- `400` — validation failure
- `401` — not authenticated
- `403` — not ADMIN
- `404` — coin not found
- `409` — symbol or coincapId already exists (if changed to one that conflicts)

#### `DELETE /api/crypto/coins/[id]`

Delete a coin by ID. **Requires ADMIN role.**

**Auth:** Inline check — `if (!session || session.user.role !== 'ADMIN') return 401`.

**Response `200`:**
```json
{ "success": true }
```

**Errors:**
- `401` — not authenticated
- `403` — not ADMIN
- `404` — coin not found

### 3. Admin UI

#### Route: `app/admin/crypto/coins/page.tsx`

Server component that:
1. Checks authentication and ADMIN role (same pattern as other admin pages)
2. Fetches all coins from DB via `getCoins()`
3. Renders `CoinsAdminClient` passing coins as props

#### Component: `CoinsAdminClient.tsx`

`'use client'` component with:

**Layout:**
- Page title: "Manage Coins"
- Breadcrumb or back link to `/admin`
- Link to `/admin/crypto` (the real-time dashboard)

**Table:**
Columns:
| Symbol | Name | CoinCap ID | Color | Active | Actions |

- **Symbol** — text, e.g. "BTC"
- **Name** — text, e.g. "Bitcoin"
- **CoinCap ID** — text, e.g. "bitcoin"
- **Color** — colored square + hex text
- **Active** — toggle switch (PATCHes `isActive` on change)
- **Actions** — "Edit" and "Delete" buttons

**Add Coin Form:**
- Collapsible "Add Coin" section or a "+" button that opens a modal
- Fields: Symbol, Name, CoinCap ID, Color (HTML color picker input)
- Submit button that POSTs to the API
- Cancel button to dismiss

**Edit Coin Modal:**
- Opens when "Edit" is clicked
- Pre-filled form with current values
- Save button PATCHes the API
- Cancel button dismisses

**Delete Confirmation:**
- Modal or inline confirm prompting "Delete {symbol}? This cannot be undone."
- Confirm deletes via DELETE API

**Feedback:**
- Success/error toast notifications after each operation
- Loading states on buttons during API calls

**Behavior:**
- After add/edit/delete, refetch the coin list and update local state
- Changes take effect immediately on the admin crypto dashboard and public crypto page on next page load

### 4. Server-Side Library

#### `lib/crypto.ts`

```typescript
// Seed/fallback data — used if DB is empty or unreachable
export const CRYPTO_COINS_FALLBACK = [
  { symbol: 'BTC', id: 'bitcoin', name: 'Bitcoin', color: '#f7931a' },
  { symbol: 'ETH', id: 'ethereum', name: 'Ethereum', color: '#627eea' },
  { symbol: 'SOL', id: 'solana', name: 'Solana', color: '#14f195' },
  { symbol: 'DOGE', id: 'dogecoin', name: 'Dogecoin', color: '#e84142' },
] as const;

// Types
export type CoinData = {
  symbol: string;
  id: string;        // coincapId
  name: string;
  color: string;
  isActive?: boolean;
};

// Fetch all coins from DB (returns fallback if DB unavailable)
export async function getCoins(): Promise<CoinData[]>

// Fetch only active coins
export async function getActiveCoins(): Promise<CoinData[]>
```

**Implementation notes:**
- `getCoins()` and `getActiveCoins()` are `async` functions that query Prisma
- If Prisma throws (DB down, not connected), catch and return `CRYPTO_COINS_FALLBACK`
- No caching — always fresh on each page request (SSR-friendly)

### 5. Integration with Existing Code

#### `hooks/useCryptoWebSocket.ts` — Refactor to accept dynamic coin IDs

**Current:** `const WS_URL = 'wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana,dogecoin'` — hardcoded.

**Changes:**
- Accept `coinIds: string[]` (array of coincapIds, e.g. `['bitcoin', 'ethereum']`) as a parameter
- Construct the WebSocket URL dynamically: `wss://ws.coincap.io/prices?assets=${coinIds.join(',')}`
- Accept `coins: CoinData[]` as a second parameter to initialize price state and map WebSocket responses
- Change signature: `useCryptoWebSocket(coinIds: string[], coins: CoinData[]): UseCryptoWebSocketReturn`
- Initial state built from the `coins` array instead of `CRYPTO_COINS`
- `onmessage` maps over the passed `coins` array (not a hardcoded list) to find matching `id` (coincapId) → `symbol` mapping

#### `hooks/useCryptoHistory.ts` — Refactor to accept dynamic coin IDs

**Current:** Hardcoded `COIN_IDS` and `COIN_SYMBOLS` arrays.

**Changes:**
- Accept `coins: CoinData[]` as a parameter
- Extract `coinIds` and build the symbol mapping dynamically from the passed `coins` array
- Change signature: `useCryptoHistory(coins: CoinData[]): UseCryptoHistoryReturn`
- Fetch history for each coin's `id` (coincapId) via CoinGecko API
- Map results back to `symbol` using the passed `coins` array

#### `app/admin/crypto/page.tsx` — Server component

- Import `getActiveCoins()` from `lib/crypto.ts`
- `export default async function` — call `const coins = await getActiveCoins()`
- Pass `coins` to `CryptoAdminClient`: `<CryptoAdminClient coins={coins} />`

#### `app/admin/crypto/CryptoAdminClient.tsx` — Refactor to accept coins as prop

**Current:** Imports `CRYPTO_COINS` directly and manages `selectedCoins` locally.

**Changes:**
- Accept `coins: CoinData[]` as a prop
- Remove `import { CRYPTO_COINS }` — no longer used
- Replace all `CRYPTO_COINS` usage with the passed `coins` prop
- `selectedCoins` state initialized from the `coins` prop's active symbols
- Pass `coins.map(c => c.id)` and `coins` to `useCryptoWebSocket(coinIds, coins)`
- Pass `coins` to `useCryptoHistory(coins)`

#### `app/[locale]/crypto/page.tsx` — Server component

- Import `getActiveCoins()` from `lib/crypto.ts`
- `export default async function` — call `const coins = await getActiveCoins()`
- Pass `coins` to `CryptoClient`: `<CryptoClient coins={coins} />`

#### `app/[locale]/crypto/CryptoClient.tsx` — Refactor to accept coins as prop

**Current:** Imports `CRYPTO_COINS` directly.

**Changes:**
- Accept `coins: CoinData[]` as a prop
- Remove `import { CRYPTO_COINS }` — no longer used
- Replace all `CRYPTO_COINS` usage with the passed `coins` prop
- Pass `coins.map(c => c.id)` and `coins` to `useCryptoWebSocket(coinIds, coins)`
- Pass `coins` to `useCryptoHistory(coins)`

#### Sidebar navigation (`app/admin/layout.tsx`)

- Add "Coins" link under Crypto section:
  - `/admin/crypto` → "Dashboard"
  - `/admin/crypto/coins` → "Manage Coins"

### 6. Seeding

**`prisma/seed.ts`:**
- Add `seedCoins()` function
- Runs as part of `prisma/seed.ts` via `pnpm db:seed`
- Upserts (insert or update to existing) 4 default coins:
  - BTC / Bitcoin / bitcoin / #f7931a
  - ETH / Ethereum / ethereum / #627eea
  - SOL / Solana / solana / #14f195
  - DOGE / Dogecoin / dogecoin / #e84142

### 7. Error Handling

| Scenario | Behavior |
|----------|----------|
| DB query fails | Return `CRYPTO_COINS_FALLBACK`, log warning |
| API validation error | Return 400 with error details |
| Coin not found | Return 404 |
| Duplicate symbol | Return 409 |
| WebSocket / API data source error | Handled by existing hooks (connection indicator, reconnect button) |

### 8. File Changes Summary

| File | Action |
|------|--------|
| `prisma/schema.prisma` | Add `Coin` model |
| `prisma/seed.ts` | Add `seedCoins()` |
| `lib/crypto.ts` | Refactor to `getCoins()` / `getActiveCoins()`, keep fallback |
| `app/api/crypto/coins/route.ts` | New — GET (public) and POST (admin) |
| `app/api/crypto/coins/[id]/route.ts` | New — PATCH and DELETE (admin, inline auth) |
| `app/admin/crypto/coins/page.tsx` | New — server component |
| `app/admin/crypto/coins/CoinsAdminClient.tsx` | New — client component |
| `hooks/useCryptoWebSocket.ts` | Refactor to accept `coinIds` and `coins` as params |
| `hooks/useCryptoHistory.ts` | Refactor to accept `coins` as param |
| `app/admin/crypto/page.tsx` | Update to use DB-backed coins |
| `app/admin/crypto/CryptoAdminClient.tsx` | Refactor to accept `coins` as prop |
| `app/[locale]/crypto/page.tsx` | Update to use DB-backed coins |
| `app/[locale]/crypto/CryptoClient.tsx` | Refactor to accept `coins` as prop |
| `app/admin/layout.tsx` | Add Coins nav link | |

### 9. Testing Checklist

**API routes:**
- [ ] GET `/api/crypto/coins` returns all coins (public, no auth)
- [ ] GET `/api/crypto/coins` returns empty array when DB is empty
- [ ] POST creates coin with valid data → 201
- [ ] POST returns 400 for missing/invalid fields
- [ ] POST returns 401 when not authenticated
- [ ] POST returns 403 when not ADMIN
- [ ] POST returns 409 for duplicate symbol
- [ ] POST returns 409 for duplicate coincapId
- [ ] PATCH with valid partial data updates only that field
- [ ] PATCH with `isActive: false` toggles coin off
- [ ] PATCH with `isActive: true` toggles coin on
- [ ] PATCH returns 400 for invalid color format
- [ ] PATCH returns 404 for non-existent ID
- [ ] PATCH returns 409 when changing symbol to an existing one
- [ ] DELETE removes coin → 200
- [ ] DELETE returns 404 for non-existent ID
- [ ] DELETE returns 401 when not authenticated
- [ ] DELETE returns 403 when not ADMIN

**Admin UI:**
- [ ] Coins table renders all DB coins
- [ ] Add coin form creates and shows new coin in table
- [ ] Edit opens modal with pre-filled data
- [ ] Edit saves changes and reflects in table
- [ ] Toggle active updates immediately and reflects on dashboard
- [ ] Delete shows confirmation and removes coin from table
- [ ] Validation errors (empty symbol, invalid color) shown inline
- [ ] Toast notifications appear for success/error
- [ ] Admin sidebar shows both Dashboard and Manage Coins links
- [ ] Back link/navigation between Dashboard and Manage Coins works

**End-to-end (public & admin crypto pages):**
- [ ] Adding a new coin in admin makes it appear on `/admin/crypto` dashboard (after refresh/reconnect)
- [ ] Deactivating a coin removes it from `/[locale]/crypto` public page
- [ ] WebSocket reconnects with new coin list after adding a coin
- [ ] History chart updates for newly added coin on next page load
- [ ] Fallback to hardcoded coins works when DB is unreachable

**Color validation edge cases:**
- [ ] 3-digit hex accepted (`"#fff"`)
- [ ] 6-digit hex accepted (`"#ffffff"`)
- [ ] With `#` prefix accepted (`"#f7931a"`)
- [ ] Without `#` prefix accepted (`"f7931a"`)
- [ ] Invalid format rejected (`"red"`, `"#gggggg"`)
