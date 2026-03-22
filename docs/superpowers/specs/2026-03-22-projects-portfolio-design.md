# Projects Portfolio — Design Spec

**Date:** 2026-03-22
**Status:** Approved

---

## Overview

Add a public-facing projects portfolio page that showcases software/technical projects with thumbnails, tech stack, team members with roles, and links to GitHub/demo. Includes admin CRUD for managing projects.

---

## Database Schema

### New Models

```prisma
model Project {
  id          String    @id @default(cuid())
  title       String
  description String    @db.Text
  image       String?   // thumbnail URL
  githubUrl   String?
  demoUrl     String?
  status      Boolean   @default(true)  // true=active, false=archived
  startDate   DateTime?
  endDate     DateTime?
  technologies String[] @default([])   // tag array, e.g. ["Next.js", "PostgreSQL"]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  members ProjectMember[]
}

model ProjectMember {
  id        String @id @default(cuid())
  projectId String
  memberId  String
  role      String // e.g. "Lead Developer", "Contributor"

  project Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  member  TeamMember @relation(fields: [memberId], references: [id], onDelete: Cascade)

  @@unique([projectId, memberId])
}
```

### Relationships
- `Project` 1:N `ProjectMember` (one project has many members)
- `TeamMember` 1:N `ProjectMember` (one team member can be on many projects)
- `ProjectMember` is the junction table with explicit `role` field

---

## Public Portfolio Page (`/projects`)

### Layout
- Hero section: gradient banner + "Our Projects" title (matches About/Blog style)
- Responsive 3-column grid → 2 columns tablet → 1 column mobile

### Project Card Contents
- **Thumbnail image** (or gradient placeholder if none set)
- **Title**
- **Tech stack tags** (first 3-4 shown, "+N more" overflow indicator)
- **Team member avatars** (stacked circles, max 3 shown + overflow count badge)
- **Status badge** ("Active" green / "Archived" gray)
- **Date range** (e.g., "Jan 2024 – Present")

### Card Hover State
- Subtle scale + shadow lift
- GitHub icon link (top-right corner)
- Demo icon link (next to GitHub)
- Clicking anywhere navigates to `/projects` (no detail page per design decision)

### Empty State
- Centered message: "No projects yet."

### Data Fetching
Server component fetches all projects with members (member name, image) and technologies ordered by `createdAt desc`.

---

## Admin CRUD

### Listing Page (`/admin/projects`)
- Header: "Projects" title + "New Project" button
- Table columns: Image thumbnail, Title, Status, Tech count, Member count, Actions
- Actions per row: Edit (link), Delete (button with confirmation)
- Empty state message

### Create/Edit Form (`/admin/projects/new`, `/admin/projects/[id]/edit`)
Shared form component with fields:

| Field | Type | Notes |
|-------|------|-------|
| Title | text | required |
| Description | textarea | required |
| Image URL | text | optional |
| GitHub URL | text | optional, validated as URL |
| Demo URL | text | optional, validated as URL |
| Status | toggle | active/archived |
| Start Date | date | optional |
| End Date | date | optional |
| Technologies | tag input | comma-separated, stored as `String[]` |
| Team Members | multi-select + role | select existing TeamMember, enter role per selection |

### Behavior
- Create: `POST /api/projects`
- Update: `PATCH /api/projects/[id]`
- Delete: `DELETE /api/projects/[id]` with confirmation dialog
- Validation errors shown inline
- Success redirects to listing page

---

## API Routes

### `GET /api/projects`
Returns all projects with members and technologies.
```json
{
  "projects": [
    {
      "id": "...",
      "title": "...",
      "description": "...",
      "image": "...",
      "githubUrl": "...",
      "demoUrl": "...",
      "status": true,
      "startDate": "...",
      "endDate": "...",
      "technologies": ["Next.js", "PostgreSQL"],
      "members": [
        { "memberId": "...", "name": "...", "image": "...", "role": "Lead Developer" }
      ]
    }
  ]
}
```

### `POST /api/projects`
Body: project fields + `members` array `[{ memberId, role }]`
Returns created project with 201 status.

### `GET /api/projects/[id]`
Returns single project or 404.

### `PATCH /api/projects/[id]`
Partial update, including optional `members` array to replace existing.

### `DELETE /api/projects/[id]`
Deletes project (cascade deletes ProjectMember entries). Returns 204.

---

## Navigation Update

Add "Projects" link to header nav between Blog and About (or after Team), following existing nav pattern with hover states.

---

## Design Consistency
- **Hero sections**: Gradient backgrounds (violet/fuchsia) matching About page
- **Card hover**: Scale + shadow animation matching Blog page
- **Avatar stacks**: Stacked circles matching Team page
- **Typography**: Same heading/body styles, brand gradient text
- **Dark mode**: Full support via Tailwind `dark:` classes

---

## What We're NOT Building (per design decisions)
- No project detail page (card view only)
- No filtering/sorting on public page
- No public create/edit (admin only)
- No project-tag relationship table (technologies stored as tag array)
