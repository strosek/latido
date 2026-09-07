# 0071 — Live quick-add parsing feedback

Status: done

## Goal

The natural-language quick-add (`src/parse.ts`) is powerful but invisible: users type
"submit report #work !1 tomorrow 9am" and only learn what was parsed after the task is
created. Show parsed attributes as chips under the input while typing, so the syntax is
self-discovering and mistakes are caught before creating a task.

## Requirements

- Debounce parsing (e.g. ~150 ms) as the user types in `#task-title` on the board; feed
  the raw text through the same parse used by add-task (`actions.ts`).
- Render a small row of chips under the input for whatever is parsed: tags (`#work`),
  priority (`P1`), due date/time ("tomorrow 9am"), quick flag, etc. Unparsed trailing
  text is the title.
- Clear the chips when the input is cleared or the task is added.
- No focus loss while typing (chips render below the input; use `aria-live="polite"` or a
  labelled container so screen readers announce the result).
- Keep the existing "Add task" defaults (P2, Q2) visible so users understand which
  defaults they are overriding.

## Acceptance criteria

- Typing "report #work !1 tomorrow" shows chips `#work`, `P1`, and a "tomorrow" date chip
  before any task exists.
- The created task matches the chips exactly.
- Clearing the input clears the chips; no stale state.