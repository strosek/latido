# 0075 — Collapsible completed-tasks section

Status: done

## Goal

Completed tasks currently stay in the main task list, pushed to the bottom by
`sortedTasks` (`views.ts`). For a busy board, rows of finished work take up space and
add noise that a person with a full task list has to scroll past. Move completed tasks
into a dedicated "Completed" section at the very bottom of the board, **folded by
default** so it takes only one compact header row until the user chooses to look.

## Model

- In `renderBoard`, split the main list into open tasks (shown as today) and done tasks:
  - `mainTasks` excludes `done` tasks (stop showing them in the open list).
  - New `doneTasks = state.tasks.filter((t) => t.done && matchesFilters(t) && matchesSearch(t))`,
    sorted by `doneAt` descending (most recently completed first), independent of the
    board sort mode.
- New transient view state `doneSectionOpen: boolean` (default `false` = collapsed),
  kept in `state.ts` like the other view-only state (search/filters/sort) and reset by
  `resetTransientState()` (`actions.ts`).
- New action `toggle-done-section` toggles it and re-renders.
- Render a `done-section` block below the quick section (very bottom of the board):
  - Collapsed → one header row: `Completed (N)` + chevron.
  - Expanded → header row plus a `task-list` of done rows.
- Done rows reuse the existing row markup (`views.ts`), minus open-only affordances:
  no grip, no Move up/down, no Start-session button, no quick toggle (keep the check to
  reopen, and the ⋯ menu with Edit / History / Delete).
- Hide the whole section when `doneTasks.length === 0`.

## Behavior

- Completing a task moves it out of the open list and into the (collapsed) Completed
  section; the count updates. Undoing the completion (existing toast, 0011/0067) returns
  it to the open list.
- The section takes only its header row while collapsed — no empty vertical space.
- Expanding shows the completed rows with the existing muted/done styling.
- Search/filter matches apply to done tasks too, and the filtered-empty message
  (`emptyHtml` in `renderBoard`) must account for them, so it doesn't claim "No tasks
  match" while matching done tasks are hidden in the collapsed section.
- Keyboard navigation (J/K, 0073) naturally covers done rows when the section is
  expanded; collapsed rows are not in the DOM.

## Acceptance criteria

- Done tasks no longer appear in the open list; they live only in the bottom section.
- The section is a single compact header when collapsed and shows all completed tasks
  when expanded.
- Reopening (toggle) a completed task moves it back to the open list.
- The section disappears entirely when there are no completed tasks.
- Search/filter that matches a done task still surfaces it (count reflects it; message
  not misleading).

## Nice to have

- Persist the expanded/collapsed choice in `localStorage` so it survives reloads.
- A count badge and subtle muted styling on the header so the section reads as
  "archive", not another active list.