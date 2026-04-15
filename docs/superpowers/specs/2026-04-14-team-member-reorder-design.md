# Team Member Reorder Feature

## Overview

Add the ability to reorder team members on the admin Team Members page using up/down buttons. The swap approach exchanges order values between adjacent members.

## Design

### API Endpoint

- **Method**: `POST`
- **Path**: `/api/team/reorder`
- **Auth**: Requires ADMIN session
- **Request Body**:
  ```json
  { "id": "string", "direction": "up" | "down" }
  ```
- **Success Response** (200):
  ```json
  { "member1": TeamMember, "member2": TeamMember }
  ```
- **Error Responses**:
  - 400: Cannot move up (already at top) or move down (already at bottom)
  - 401: Unauthorized
  - 404: Member not found

### Reorder Logic

1. Fetch member by ID
2. Find neighbor:
   - `up` → member with highest order less than current member's order
   - `down` → member with lowest order greater than current member's order
3. Edge cases:
   - First item (lowest order) cannot move up
   - Last item (highest order) cannot move down
4. Swap orders in a Prisma transaction
5. Return both updated members

### Frontend Changes

- Add up (↑) and down (↓) buttons in the "Actions" column, between the Edit and Delete buttons
- Buttons disabled when at top/bottom (no neighbor in that direction)
- On click: call reorder API, update state with returned members
- Show brief loading state during API call
- Optimistic UI not needed — server response is source of truth

### Data Model

- `TeamMember.order` field already exists in schema
- No schema changes needed

## Implementation Checklist

- [ ] Create `POST /api/team/reorder` endpoint with swap logic and transaction
- [ ] Add move up/move down buttons to admin team page
- [ ] Connect buttons to API and update state
- [ ] Disable buttons at boundaries (top/bottom)
- [ ] Test: move up from middle, move down from middle, boundary cases