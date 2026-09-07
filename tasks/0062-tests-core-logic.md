# 0062 — Unit tests for quick-add, recurrence, and undo logic

Status: done

## Goal

Cover the highest-risk, currently-untested logic. `dates`, `stats`, `timer`, and `storage` have
test suites, but the natural-language quick-add parser, the CSV importer, and the undo/quick-run
flows in `actions.ts` have none — and they're the most likely to regress.

## Requirements

- Extract or export the small pure functions in `actions.ts` that can be tested in isolation
  (e.g. `parseQuickAdd`, `plannedForFrom`, `parseCsv`, `parseCsvTasks`) so they're importable
  without booting the DOM. Moving them to a small module (or exporting them) is acceptable.
- Add Vitest suites for:
  - `parseQuickAdd`: priority (`!N` / `pN`), date words (`today`/`tomorrow`/weekdays), times
    (`9am`, `18:00`), invalid fragments ignored, and that time is only stripped when a date word is
    present (the "Meet at 12:30" case).
  - `plannedForFrom`: today vs tomorrow vs next weekday, and time-of-day applied.
  - `parseCsv` / `parseCsvTasks`: quoted fields with commas/newlines, escaped quotes, Todoist
    header detection, priority clamping, and skipped empty rows.
  - The partial-pomodoro behavior from 0055 in `sessionWorkMs`.
- Keep tests deterministic and timezone-safe (the existing `dates.test.ts` uses explicit dates and
  `getDay()` rather than assuming local offset — follow that pattern).

## Acceptance criteria

- `npm test` passes with the new suites included.
- The quick-add parser has a test for each documented syntax rule from 0046.
- The CSV parser has a test for a quoted cell containing a comma and a newline.
- No behavioral change to production code beyond the minimum needed to make functions testable.

## Nice to have

- A couple of `happy-dom` tests covering the undo toast restore path (0045) and the quick-run
  advance/finish flow (0018), exercising them through the DOM like `app.smoke.test.ts`.
