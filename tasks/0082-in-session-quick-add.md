# 0082 — Dump tasks mid-session

Status: done

## Goal

The single biggest leak in a focus session is the "oh, I must remember to…" thought.
If the only place to add a task is the board, the user either breaks flow to go add
it, or keeps it in their head and stops being present. Let them **dump a task
without leaving the session**: a quick-add field on the session screen that files the
thought into the board while the clock keeps running.

## Model

- On the session screen (`renderSession` in `views.ts`), add a small, unobtrusive
  "Capture a thought" input (ghost styling, one line). Entering text creates a task
  with the same parsing as the board quick-add (reuse `parseQuickAdd` /
  `addTaskFromInput` path in `actions.ts`), so `#tags`, priorities, and "tomorrow"
  still work.
- The session is untouched: no pause, no reset, no clock change; the repaint tick
  keeps running underneath.
- After saving, show a brief inline confirmation ("Captured — added to your board")
  that fades, and clear the field for the next thought.
- Defaults for the new task: priority P2, quadrant "Not urgent · Important" (the
  same defaults as the board add-task row), so a distracted "buy milk" lands
  sensibly without extra clicks.
- The created task is immediately on the board; when the session ends, it's right
  there ready to be picked up. If the session's task is in the Open list, the new
  task appears next to it.
- Optionally also expose this on the quick-run screen (`renderQuickRun`) and make it
  reachable in focus mode (one keypress away, e.g. `T`).

## Behavior

- Adding a task never interrupts the running session; the clock and any pomodoro
  phase continue normally.
- The same duplicate-task guard (0052) applies: an already-open task with the same
  title prompts "Add anyway?" so the user isn't silently doubled up.
- Parsing feedback (0071 chips) is a nice extra but must stay minimal — the point is
  speed, not the full parser UI.

## Acceptance criteria

- While a session runs, a thought can be turned into a board task in ≤2 keypresses
  without pausing the session.
- The new task respects natural-language input (`#tag`, `!priority`, "tomorrow").
- The session clock/phase is unaffected by creating tasks.
- The task appears on the board after the session ends.

## Nice to have

- A "task created" undo/remove toast so a mis-tap is instantly reversible.
- Persist a lightweight link (session id → created task id) so History can show
  "task added during this session".
- Make the field available during breaks too, so thoughts from the break get parked
  the same way.