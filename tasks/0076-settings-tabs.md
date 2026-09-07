# 0076 — Settings dialog tabs (basic / advanced)

Status: done

## Goal

The Settings dialog (`openSettings()` in `actions.ts`) is one long form. Its Data
section uses a non-wrapping flex row (`.data-actions`), so on narrower dialog widths
the Export / Import / Restore / Snapshot / Feedback buttons overflow and the dialog
needs horizontal scrolling. Split Settings into two tabs — **Basic** (shown first: the
focus timers, sound, and notifications) and **Advanced** (the data tools and danger
zone) — and let the data buttons wrap instead of overflowing.

## Model

- Restructure `openSettings()` markup into a tab bar plus two panels, all still inside
  the single `#settings-form` so the existing submit logic is untouched:
  - **Basic** — the current `.settings-grid`: pomodoro focus/short/long/cadence,
    flowtime break %, max flowtime, gentle reminder, sound preset + preview, sound
    cues, auto-start break, task estimates, browser notifications.
  - **Advanced** — the Data section (export, export Markdown, import, import CSV,
    restore backup, restore snapshot, feedback) and the Danger zone (clear data).
- Inactive panels use the `hidden` attribute so the dialog's focus-trapping
  (`focusableIn` in `dialogs.ts`) and Tab order only reach visible controls.
- Implement ARIA tabs: `role="tablist"` / `role="tab"` / `role="tabpanel"` with
  `aria-selected`, `aria-controls`, and `id` links; arrow keys move between tabs and
  Enter/Space activates (native button behavior). The app has an a11y pass (0050), so
  keyboard parity matters.
- Keep the existing Save/Cancel row visible below the panels; Save reads the same field
  ids from whichever tab is shown, so no changes to the save handler or the wiring of
  `exportBtn`, `importBtn`, etc. (listeners are attached once at open, regardless of
  the active tab).
- Change `.data-actions` to `flex-wrap: wrap` so the data buttons flow onto multiple
  lines instead of overflowing (removes the horizontal scroll).

## Behavior

- Opening Settings shows the Basic tab by default; the tab bar indicates the active one.
- Switching tabs only toggles panel visibility — panels are never rebuilt, so typed
  values and toggled checkboxes are preserved when switching back and forth.
- Focus moves to the activated tab on switch; panel controls remain keyboard-reachable.

## Acceptance criteria

- The dialog shows a Basic/Advanced tab bar; Basic is active on open.
- Every settings control is reachable without horizontal scrolling.
- All Data/export/import buttons live on the Advanced tab and wrap onto multiple lines.
- Switching tabs never loses typed or toggled values.
- Saving works from either tab; Cancel still closes; Esc still closes the dialog.
- Arrow keys switch tabs; Tab traps within the dialog and visits visible controls only.

## Nice to have

- Remember the last-active tab in memory (transient) and reset to Basic on each open.
- A small count badge on the Advanced tab (e.g. "Advanced · 7") so the extra tools are
  discoverable before switching.