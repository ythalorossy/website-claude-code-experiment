# Crypto Coin Management — Admin Feature

## Overview

Add a full CRUD admin interface for managing which cryptocurrency coins are supported on the platform. Currently coins are hardcoded in `lib/crypto.ts`. This feature moves coin configuration to the database and provides an admin UI to manage them.

## Goals

- Admins can add, edit, remove, and toggle active status for coins from the admin UI
- Coin configuration stored in PostgreSQL via Prisma
- Existing real-time crypto display (public and admin pages) continues to work unchanged
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
  @@index([coincapId])
}
```

**Constraints:**
- `symbol` must be unique (case-sensitive, e.g. "BTC" not "btc")
- `coincapId` is indexed for fast lookups when connecting to CoinCap WebSocket
- `isActive` defaults to `true` so newly added coins are immediately visible

### 2. API Routes

All routes live under `app/api/admin/crypto/coins/` and require authentication and ADMIN role (via existing `withAuth` middleware pattern used by other admin APIs).

#### `GET /api/admin/crypto/coins`

Returns all coins (active and inactive) ordered by `symbol`.

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

#### `POST /api/admin/crypto/coins`

Create a new coin.

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
- `409` — symbol already exists

#### `PATCH /api/admin/crypto/coins/[id]`

Update an existing coin. All fields optional.

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
- `404` — coin not found

#### `DELETE /api/admin/crypto/coins/[id]`

Delete a coin by ID.

**Response `200`:**
```json
{ "success": true }
```

**Errors:**
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

**`hooks/useCryptoWebSocket.ts`:**
- No changes — receives coin config as prop from parent
- Parent (page component) passes coins from `getActiveCoins()`

**`hooks/useCryptoHistory.ts`:**
- No changes — receives coin `id` values as prop

**`app/admin/crypto/page.tsx`:**
- Update to call `getActiveCoins()` instead of importing `CRYPTO_COINS`
- Pass fetched coins to `CryptoAdminClient`

**`app/[locale]/crypto/page.tsx`:**
- Same change — call `getActiveCoins()` and pass to `CryptoClient`

**Sidebar navigation (`app/admin/layout.tsx`):**
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
| `app/api/admin/crypto/coins/route.ts` | New — GET and POST |
| `app/api/admin/crypto/coins/[id]/route.ts` | New — PATCH and DELETE |
| `app/admin/crypto/coins/page.tsx` | New — server component |
| `app/admin/crypto/coins/CoinsAdminClient.tsx` | New — client component |
| `app/admin/crypto/page.tsx` | Update to use DB-backed coins |
| `app/[locale]/crypto/page.tsx` | Update to use DB-backed coins |
| `app/admin/layout.tsx` | Add Coins nav link |

### 9. Testing Checklist

**API routes:**
- [ ] GET returns all coins
- [ ] POST creates coin with valid data
- [ ] POST returns 400 for missing/invalid fields
- [ ] POST returns 409 for duplicate symbol
- [ ] PATCH updates single field
- [ ] PATCH updates all fields
- [ ] PATCH returns 404 for non-existent ID
- [ ] DELETE removes coin
- [ ] DELETE returns 404 for non-existent ID

**Admin UI:**
- [ ] Coins table renders all DB coins
- [ ] Add coin form creates and shows new coin
- [ ] Edit updates the coin
- [ ] Toggle active shows/hides on dashboard
- [ ] Delete removes and updates list
- [ ] Validation errors shown in UI
- [ ] Admin sidebar shows Coins link
