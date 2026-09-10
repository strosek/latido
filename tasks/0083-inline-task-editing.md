# 0083 — Edit priority & quadrant inline from the task list

Status: done

## Goal

Priority and quadrant are the two most frequently-tweaked properties of a task, but
changing them today requires the Edit dialog (`openEditTask`). The quadrant pill and
the priority pill (`quadrantPriorityHtml` in `views.ts`) are already displayed on every
row — make them directly interactive so a tap changes the value right in the list,
without the extra steps of opening and closing a dialog.

## Model

- Turn the two read-only pills into buttons that carry `data-id` plus the current
  value, so a single click can update the task.
  - **Quadrant pill** (`<span class="quadrant q*">`): clicking cycles
    q1 → q2 → q3 → q4 → q1 (wrap-around) — or opens a tiny inline picker with the four
    options (see Behavior). Label and accent color update from the existing
    `QUADRANT_LABEL` / `.quadrant.q*` styles.
  - **Priority pill** (`<span class="priority-pill" style="color:…">P*</span>`):
    clicking cycles 1 → 2 → 3 → 4 → 5 → 1, using the existing `PRIORITY_COLORS`.
- Add `data-action="cycle-quadrant"` / `data-action="cycle-priority"` with `data-id` so
  the existing delegated click handler in `events.ts` → `handleAction` in `actions.ts`
  can persist the change (a small `setQuadrant(id, q)` / `setPriority(id, p)` helper,
  reusing `taskById`, `persist()`, `render()`).
- Keep the row menu / Edit dialog untouched — inline editing is an alternative, not a
  replacement.
- The same pills also appear in compact rows (Today/Later/Quick lists and the
  Dashboard "Today" card); they should behave identically there.

## Behavior

- Single click changes the value immediately, persists it, and re-renders in place.
- **Cycle direction**: going up (q1→q2→…, P1→P2→…) matches the natural "increase"
  direction; the 5th priority wraps to 1. To avoid overshooting, the picker variant is
  preferred for quadrant on touch: tap opens the four options; tap again closes.
- Keyboard accessible: the pill buttons are focusable; Enter/Space activates them, and
  Esc closes any open picker.
- No session/quick-run disruption: this is board-only interaction and must not touch
  an active session.

## Acceptance criteria

- Clicking the quadrant pill changes the task's quadrant and updates the pill label +
  color in place; clicking the priority pill changes priority 1–5 and wraps correctly.
- The change is persisted (survives reload) and reflected in the row menu and Edit
  dialog the next time they open.
- Works on main rows and compact rows (Today/Later/Quick, Dashboard).
- Accessible: keyboard operable, sensible `aria-label`, focus returns to the pill.

## Nice to have

- A tiny "cycle" affordance: e.g. a caret or tooltip on hover explaining the tap.
- Multi-tap undo: a brief toast letting the user step back one change.
- Consistency with `toggleTask`'s completion animation (0067) — a subtle chip "pop"
  on change so the update is noticeable.