# 0061 — Storage quota safety

Status: done

## Goal

Stop failing silently when the browser's `localStorage` quota is exhausted. The app is designed to
hold data "forever", but `saveState`/`saveSettings`/`saveBackup`/`saveDailySnapshot` all swallow
write errors, so a full quota means data stops saving with no warning.

## Requirements

- Detect write failures (notably `QuotaExceededError`) in the storage layer and surface a clear,
  calm message prompting the user to export their data — matching the app's tone, not an error page.
- Make `saveDailySnapshot` degrade gracefully: if writing a snapshot fails, drop the oldest
  snapshot and retry before giving up, so the daily backup feature doesn't silently stop.
- Ensure a failed *state* save never corrupts existing data (the current pattern writes the whole
  blob in one `setItem`, which is atomic; keep it that way and just report the failure).
- Do not add cloud sync or tracking — a local-only warning is the intended scope.

## Acceptance criteria

- When the quota is exceeded, the user sees a message (not a silent no-op) offering to export.
- Daily snapshots prune the oldest entry and retry before failing.
- No data is lost or corrupted as a result of a failed save.

## Nice to have

- On load, report approximate storage usage and warn when it's near the limit.
- A "compact history" action that archives/prunes very old finished sessions to reclaim space
  (larger change; consider a follow-up task).
