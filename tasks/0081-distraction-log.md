# 0081 — Distraction log (opt-in)

Status: done

## Goal

When focus breaks, it's usually because a stray thought grabs you ("I should email
Laura", "check the parcel code"). Fighting that thought out of your head is what
drains focus; parking it somewhere is what works. Add an **opt-in distraction log**
that lets a user capture those interruptions in one tap during a session, so the
thought is safely parked and they can return to the work without losing it.

The feature is off by default: ADHD users can get overwhelmed by extra chrome, so
it must be *activated* in Settings before anything new appears.

## Model

- New boolean setting `distractionLogEnabled` (default `false`) in the settings
  model (0001), toggled from a Settings tab (Basic or a new Focus panel).
- While a session (flowtime, pomodoro, or quick run) is running and the setting is
  on, show a subtle "Log a distraction" affordance on the session screen
  (`renderSession` / `renderQuickRun` in `views.ts`). It must not pause or disturb
  the clock.
- Tapping it opens a small modal (reuse `openDialog`, `dialogs.ts`) with a single
  textarea and "Save" / "Cancel". Pre-fill with the current timestamp. Saving
  appends an entry to `state.distractions` (new model array).
- Entries are visible in the History view (a "Distractions" section, newest first)
  and in the Dashboard as a simple count or list, so patterns become visible.
- Include a one-line "how it helps" hint in Settings next to the toggle, and
  consider a gentle reminder the first time the setting is enabled.

## Behavior

- Logging a distraction never touches the running session: no pause, no reset, no
  clock change; the repaint tick keeps running underneath.
- The log is available in every session mode when enabled (flowtime, pomodoro,
  quick run). During focus mode it should be equally reachable (e.g. a small
  unobtrusive control) or, at minimum, one keypress away.
- The distraction list survives reloads (persisted with state) and can be cleared
  from the History view.
- Entry shape is minimal and forward-compatible: timestamp, text, and the taskId of
  the session it happened in (so it can be grouped later).

## Acceptance criteria

- With the setting off, nothing new appears anywhere.
- With it on, a distraction can be captured in ≤2 clicks/keystrokes during a
  session and shows up in History afterwards.
- Capturing a distraction does not pause, finish, or otherwise change the session.
- The data persists across reloads and the list can be cleared.

## Nice to have

- Keyboard shortcut (e.g. `G`) to open the log during a session.
- Quick checkbox "make this a task" so a distraction can be promoted straight into
  the task board (complements 0082).
- Group distractions by task in the History view.