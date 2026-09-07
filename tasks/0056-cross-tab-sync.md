# 0056 — Cross-tab synchronization

Status: done

## Goal

Prevent silent data loss when the app is open in more than one browser tab. Today all state lives
in `localStorage` with last-writer-wins semantics and no way for one tab to see another tab's
changes, so two tabs can clobber each other's work without warning.

## Requirements

- Listen for the `storage` event (fires in *other* tabs when a key changes) and, on a change to
  `STATE_KEY`, `SETTINGS_KEY`, or `BACKUP_KEY` (`storage.ts`), reload `state`/`settings` from
  `loadState()`/`loadSettings()` and re-render.
- Recompute the running view after a sync:
  - If the active session, break state, or quick run changed (or the session ended), start/stop the
    repaint loop accordingly (reuse the boot logic in `main.ts`).
  - Apply the synced theme via `applyTheme`.
- Avoid feedback loops: the `storage` event does not fire in the tab that wrote the value, so a
  local `persist()` must not re-trigger itself; guard against re-rendering with stale in-memory
  state.
- On load of external changes, do **not** blindly re-persist the current tab's state, which would
  overwrite the newer data. Only persist as a result of a user action.
- Document the known limitation: simultaneous edits still resolve last-writer-wins (no conflict
  resolution / merge).

## Acceptance criteria

- With two tabs open, adding a task in tab A appears in tab B without a manual reload.
- A settings or theme change in one tab is reflected in the other.
- No infinite render/event loop is triggered by the sync path.

## Nice to have

- A transient "updated from another tab" toast when a sync occurs mid-session, so the change is
  visible rather than silent.
