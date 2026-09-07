# 0069 — Friendly empty states with a path forward

Status: done

## Goal

Empty states are currently one-line strings (`views.ts` `emptyMsg`; dashboard cards use
"No finished sessions yet." etc.). For a first-time or overwhelmed user, a plain line of
grey text gives no way forward. Replace them with a short, friendly block: an icon, one
line of warm copy, and a concrete next action.

## Requirements

- Board with no tasks: icon + "Plan your first task" copy + a call-to-action that focuses
  the add-task input (and, if no data exists, a **Load example data** button).
- Board empty because of filters/search: keep the existing message, add a "Clear filters"
  button.
- Dashboard/History empties: keep the current copy but give it the same visual treatment
  (icon + centered block) so the app never looks "broken" when there is nothing to show.
- **Load example data**: fetch a bundled example export (copy `examples/*.json` into
  `public/`) and run it through the existing import path (`parseImport` + `confirmImport`,
  `actions.ts`), confirming it will replace current data like any import.

## Acceptance criteria

- New users are offered example data or a guided first input, not a blank void.
- Filtered-empty and truly-empty states are visually distinct.
- Loading example data flows through the standard import confirmation and works offline
  (examples bundled in the PWA).