# 0063 — Preserve completion history for recurring tasks

Status: done

## Goal

Keep a record of *each* completed occurrence of a recurring task. Today completing a recurring task
mutates the same task in place and bumps `plannedFor` (`actions.ts` → `toggleTask`), so past
occurrences leave no trace: the task's "done" state is ephemeral, and there is no way to see what
was completed and when.

## Model

- Add a lightweight, append-only completion log to `Task` (e.g. `completedAt: number[]` or an
  occurrence list `{ completedAt, plannedFor }`), sanitized like the rest of the task in
  `storage.ts` (unknown/absent → empty; capped length to avoid unbounded growth).
- Completing a recurring task:
  - pushes the current occurrence (timestamp + due date) onto the log, then
  - reopens and reschedules the task for its next occurrence exactly as today.
- Display the log in task history (0002) so each past occurrence is visible alongside its session.
- Session history is unchanged: every completed instance already records its own finished session
  (per 0043).

## Behavior

- Marking a daily task done three days in a row yields three logged completions, all visible in the
  task's history.
- One-off tasks are unaffected (no log needed).
- The log survives export/import and is bounded (e.g. keep the most recent N entries) so it can't
  grow without limit.

## Acceptance criteria

- After completing a recurring task, its history shows each past completion date/time.
- Existing data (tasks without a log) sanitizes to an empty log and works unchanged.
- The log is included in JSON export/import round-trips.

## Notes / trade-offs

- This is a data-model change and needs a migration path for existing exported files. The sanitizer
  already defaults missing fields, so old exports load cleanly; the only cost is a new optional
  field and its display.
- If per-occurrence *task* editing (rather than just history) is desired later, a full
  instance-based model would be needed — out of scope here.
