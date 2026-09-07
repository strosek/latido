# 0072 — Session-end summary toast

Status: done

## Goal

Finishing a session drops the user straight back to the static board. A brief summary at
that moment — how long they focused and what is *next* — closes the loop and reduces the
"what now?" decision that drains people after deep work.

## Behavior

- On finishing a session (Finish button, quick-run close, auto-finish paths), show the
  existing toast pattern (0045/0058) for ~3 s: e.g. "2h 05m · Finished <task>".
  - If there is another open task planned for today, add "Next: <title>".
  - If nothing is next, keep just the summary (never invent a next task).
- The toast reuses the existing finish-undo affordance (0011) — finishing is already
  undoable, so the summary should sit on the same toast rather than a second one.
- Clicking "Next: <title>" starts a session for that task.

## Acceptance criteria

- Finishing any session shows one toast combining duration + (optional) next task.
- The existing finish-undo still works from the same toast.
- No toast on pause/resume or focus-mode toggles.

## Notes / trade-offs

- "Next" is best-effort: first open task planned for today, falling back to the highest
  priority open task, else none. Never fabricate a next task.