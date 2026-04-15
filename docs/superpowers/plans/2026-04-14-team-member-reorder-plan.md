# Team Member Reorder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add up/down reorder buttons to admin team page that swap adjacent members' order values via a new API endpoint.

**Architecture:** A new `POST /api/team/reorder` endpoint handles swap logic in a Prisma transaction. Frontend adds two buttons per row that call this endpoint and update local state with returned values.

**Tech Stack:** Next.js App Router, Prisma ORM, TypeScript

---

## File Map

- **Create**: `app/api/team/reorder/route.ts` — reorder API endpoint
- **Modify**: `app/admin/team/page.tsx` — add move up/down buttons and handler

---

## Tasks

### Task 1: Create Reorder API Endpoint

**Files:**
- Create: `app/api/team/reorder/route.ts`

- [ ] **Step 1: Create the reorder route file**

```typescript
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, direction } = body as { id: string; direction: 'up' | 'down' };

    if (!id || !direction || !['up', 'down'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const member = await prisma.teamMember.findUnique({ where: { id } });
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Find neighbor
    const neighbor = direction === 'up'
      ? await prisma.teamMember.findFirst({
          where: { order: { lt: member.order }, isActive: true },
          orderBy: { order: 'desc' },
        })
      : await prisma.teamMember.findFirst({
          where: { order: { gt: member.order }, isActive: true },
          orderBy: { order: 'asc' },
        });

    if (!neighbor) {
      return NextResponse.json(
        { error: direction === 'up' ? 'Already at top' : 'Already at bottom' },
        { status: 400 }
      );
    }

    // Swap orders in transaction
    const [updatedMember1, updatedMember2] = await prisma.$transaction([
      prisma.teamMember.update({ where: { id: member.id }, data: { order: neighbor.order } }),
      prisma.teamMember.update({ where: { id: neighbor.id }, data: { order: member.order } }),
    ]);

    return NextResponse.json({ member1: updatedMember1, member2: updatedMember2 });
  } catch (error) {
    console.error('Error reordering team member:', error);
    return NextResponse.json({ error: 'Failed to reorder' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Test the endpoint exists**

Run: `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/team/reorder`
Expected: 401 (no auth) or proper error response

- [ ] **Step 3: Commit**

```bash
git add app/api/team/reorder/route.ts
git commit -m "feat: add POST /api/team/reorder endpoint for swapping member orders"
```

---

### Task 2: Add Move Buttons to Admin Team Page

**Files:**
- Modify: `app/admin/team/page.tsx` (add reorder handler and buttons)

- [ ] **Step 1: Add the reorder function and state to AdminTeamPage**

Find this section in `app/admin/team/page.tsx`:
```typescript
const deleteMember = async (id: string) => {
```

Add this before `deleteMember`:

```typescript
const moveMember = async (id: string, direction: 'up' | 'down') => {
  try {
    const res = await fetch('/api/team/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, direction }),
    });

    if (res.ok) {
      const { member1, member2 } = await res.json();
      startTransition(() => {
        setTeamMembers((prev) =>
          prev.map((m) =>
            m.id === member1.id ? member1 : m.id === member2.id ? member2 : m
          )
        );
      });
    }
  } catch (error) {
    console.error('Failed to reorder member:', error);
  }
};
```

- [ ] **Step 2: Add move up/move down buttons in Actions column**

Find the Actions `<td>` that contains Edit and Delete buttons (around line 149). Replace the `<div className="flex items-center justify-end gap-1">` content with:

```tsx
<div className="flex items-center justify-end gap-1">
  <button
    onClick={() => moveMember(member.id, 'up')}
    disabled={member.order === 1}
    className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    title="Move Up"
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  </button>
  <button
    onClick={() => moveMember(member.id, 'down')}
    disabled={member.order === teamMembers.length}
    className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    title="Move Down"
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
  <Link
    href={`/admin/team/${member.id}/edit`}
    className="rounded-lg p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20 dark:hover:text-brand-400 transition-colors"
    title="Edit"
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  </Link>
  <button
    onClick={() => deleteMember(member.id)}
    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
    title="Delete"
  >
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  </button>
</div>
```

- [ ] **Step 3: Verify page compiles without errors**

Run: `pnpm typecheck` (or let dev server hot reload catch errors)
Expected: No TypeScript errors

- [ ] **Step 4: Test in browser**

1. Navigate to `/admin/team`
2. Click up/down arrows and verify order changes
3. Verify buttons disable at boundaries

- [ ] **Step 5: Commit**

```bash
git add app/admin/team/page.tsx
git commit -m "feat: add move up/down buttons to admin team page"
```

---

## Verification Checklist

After all tasks:
- [ ] `POST /api/team/reorder` with auth returns swapped members
- [ ] First member's "up" button is disabled
- [ ] Last member's "down" button is disabled
- [ ] Clicking reorder updates the order column values correctly
- [ ] No TypeScript errors
- [ ] No console errors
