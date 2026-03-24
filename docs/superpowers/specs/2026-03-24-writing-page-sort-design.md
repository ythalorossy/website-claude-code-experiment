# Writing Page Sorting Feature — Design

## Overview
Add a minimal pill/dropdown near the Writing page title that allows sorting articles by username, publish date, positive reactions, or read time. The control should be understated — visible but not prominent.

## UI Behavior

- **Location**: Top-right of the hero section, beside or below the title
- **Appearance**: Small pill-shaped dropdown with current sort label + chevron icon
- **Default**: "Recent" (most recently published)
- **On selection**: Articles re-sort client-side with smooth transition

## Sort Options

| Label | Sort field | Direction |
|-------|------------|-----------|
| Recent | `published_at` | desc |
| Popular | `positive_reactions_count` | desc |
| Author | `username` | asc |
| Quick Read | `reading_time_minutes` | asc |

## Data Source

Dev.to API articles already provide all required fields:
- `username` — author's Dev.to username
- `published_at` — ISO date string
- `positive_reactions_count` — number of positive reactions
- `reading_time_minutes` — estimated read time in minutes

## Technical Approach

### Component Architecture

```
app/[locale]/writing/page.tsx (Server Component)
└── fetches articles via getDevToArticles()
└── passes articles to...

components/devto/WritingClient.tsx (Client Component)
├── manages sort state
├── renders <WritingSortSelect/>
└── renders sorted <DevToArticleCard/> grid
```

### Files to Create/Modify

1. **Create**: `components/devto/WritingSortSelect.tsx`
   - Pill-shaped dropdown component
   - Accepts `value` and `onChange` props
   - Renders sort options with active state highlighted

2. **Create**: `components/devto/WritingClient.tsx`
   - Client component wrapping article grid
   - Accepts `articles` prop from server
   - Manages `sort` state
   - Renders sort dropdown + sorted article grid

3. **Modify**: `app/[locale]/writing/page.tsx`
   - Extract article rendering to `WritingClient`
   - Keep data fetching server-side

4. **Modify**: `lib/devto.ts` (if needed)
   - No changes expected — all fields already available

## Component Details

### WritingSortSelect

```typescript
interface WritingSortSelectProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

type SortOption = 'recent' | 'popular' | 'author' | 'readtime';
```

- Minimal pill/dropdown styling matching site aesthetic
- Icon: chevron-down from lucide-react or inline SVG
- Subtle hover/focus states
- Options list appears below pill on click

### WritingClient

```typescript
interface WritingClientProps {
  articles: DevToArticle[];
}
```

- useState for current sort option (default: 'recent')
- useMemo to sort articles based on selected option
- Passes sorted articles to grid render

## Sort Implementation

```typescript
const sortArticles = (articles: DevToArticle[], sort: SortOption): DevToArticle[] => {
  return [...articles].sort((a, b) => {
    switch (sort) {
      case 'recent':
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      case 'popular':
        return b.positive_reactions_count - a.positive_reactions_count;
      case 'author':
        return a.username.localeCompare(b.username);
      case 'readtime':
        return a.reading_time_minutes - b.reading_time_minutes;
    }
  });
};
```

## Styling

- Use existing Tailwind CSS utilities and brand colors
- Match the understated design language of the writing page
- No new design tokens needed
