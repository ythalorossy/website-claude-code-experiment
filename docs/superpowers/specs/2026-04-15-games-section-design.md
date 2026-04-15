# Games Section Design

## Overview

Add a `/games` public page and full admin CMS for game projects. Separate data model from the existing Project model.

## Data Model

**New Prisma model: `Game`**

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | CUID, primary key |
| `title` | `String` | Required |
| `description` | `String` | `@db.Text`, required |
| `image` | `String?` | URL to game screenshot/thumbnail |
| `genre` | `String[]` | `["RPG", "FPS", "Puzzle", "Platformer", "Strategy"]` |
| `platform` | `String[]` | `["PC", "Mobile", "Web", "Console"]` |
| `engine` | `String[]` | `["Unity", "Unreal", "Godot", "Phaser"]` |
| `playUrl` | `String?` | Direct link to play |
| `itchUrl` | `String?` | Itch.io link |
| `status` | `Boolean` | `true` = Active, `false` = Archived |
| `startDate` | `DateTime?` | |
| `endDate` | `DateTime?` | |
| `createdAt` | `DateTime` | Default `now()` |
| `updatedAt` | `DateTime` | Auto-updated |

## Public Page (`/[locale]/games/page.tsx`)

**Hero Section**
- Full-width gradient background (same violet/fuchsia/cyan palette)
- Shows most recently created game (by `createdAt`)
- Displays: large thumbnail/image, title, description (truncated to 2 lines), genre/platform/engine badges, play/itch links as buttons
- If no games exist: shows placeholder hero with "Coming Soon" message

**View Toggle**
- Two buttons: Grid icon / List icon (Lucide `LayoutGrid` / `List`)
- Default: Grid view
- Preference stored in component state only (no persistence)

**Grid View**
- Same Card component as Projects page
- Each card: thumbnail (48px height), title, truncated description (3 lines), genre/platform/engine tags (max 4 shown + "+N more"), status badge, hover overlay with play/itch icon links
- 3-column on desktop, 2 on tablet, 1 on mobile

**List View**
- Compact rows, 1 per game
- Each row: small thumbnail (64x64), title, full description truncated to 1 line, tags inline, status badge, play/itch link icons on the right
- Simple table-like layout, no Card border

**i18n**
- Page metadata translated via `messages/[locale]/common.json` (add `Games: "Games"` and `GamesDescription` keys)

## Admin Page (`/admin/games`)

**Layout**
- Same pattern as `/admin/posts` and `/admin/projects`
- Protected by auth (session + role check)
- Header: "Games" title + "New Game" button (top right)
- Table listing all games with columns: Title, Status, Genres, Platforms, Engines, Created, Actions

**Table Columns**
- Title: text, sortable
- Status: badge (Active/Archived)
- Genres: tag pills (truncated if > 3)
- Platforms: tag pills
- Engines: tag pills
- Created: formatted date
- Actions: Edit (pencil icon), Delete (trash icon)

**Create/Edit Modal or Page**
- Same `Card`-based form pattern as Project admin
- Fields: title (text), description (textarea), image URL (text + preview), genre (multi-select/checkboxes), platform (multi-select), engine (multi-select), playUrl (text), itchUrl (text), status (toggle), startDate (date picker), endDate (date picker)
- Save and Cancel buttons

**Delete**
- Confirmation dialog before deleting

## API Routes

**`GET /api/games`** — List all games, ordered by `createdAt` desc
**`POST /api/games`** — Create game (admin only)
**`GET /api/games/[id]`** — Get single game
**`PATCH /api/games/[id]`** — Update game (admin only)
**`DELETE /api/games/[id]`** — Delete game (admin only)

All admin routes check session role before mutating data.

## Key Components

- `games/page.tsx` — Server component, fetches from DB
- `games/components/GamesHero.tsx` — Featured game hero
- `games/components/GamesGrid.tsx` — Grid view cards
- `games/components/GamesList.tsx` — List view rows
- `games/components/ViewToggle.tsx` — Grid/List toggle
- `admin/games/page.tsx` — Admin game management
- `api/games/route.ts` — GET, POST
- `api/games/[id]/route.ts` — GET, PATCH, DELETE

## Implementation Order

1. Add `Game` model to `prisma/schema.prisma` and migrate
2. Create API routes (`/api/games`, `/api/games/[id]`)
3. Build admin page (`/admin/games`) with table and create/edit/delete
4. Build public page (`/[locale]/games`) with hero, grid, and list views
5. Add i18n strings for page metadata
6. Seed sample game data

## Out of Scope (for this spec)

- Filtering/searching games (future enhancement)
- Game detail page (single game URL) — games link directly to playUrl/itchUrl
- Screenshots gallery per game
- Play count or rating tracking
- Localization of game metadata (genre/platform/engine strings are in English)
