# 0058 — Undo for session and note deletion

Status: done

## Goal

Extend the existing undo pattern (0045, 0011) to the two destructive actions that currently lack
it: deleting a session and deleting a note. The session delete dialog even warns "This cannot be
undone", which is needlessly harsh for an accidental click.

## Requirements

- Deleting a session (`confirmDeleteSession` in `actions.ts`) shows an undo toast that restores:
  - the removed `Session`, and
  - any notes that were attached to it (the delete currently also strips
    `state.notes` entries with a matching `sessionId`).
  Capture both before removal so the undo can reinsert them.
- Deleting a note (`deleteNote`) shows an undo toast that restores the note.
- Reuse the existing `showUndoToast` mechanism (auto-dismiss after a few seconds, single active
  toast).
- Remove the "cannot be undone" wording from the session delete confirmation once undo exists.

## Acceptance criteria

- Deleting a session shows an undo toast; pressing Undo restores the session *and* its notes in
  history.
- Deleting a note shows an undo toast; pressing Undo restores the note.
- Undo toasts auto-dismiss and do not interfere with the task-level undo toasts.

## Nice to have

- Include the deleted session's task title in the undo toast text, matching the finish toast style.
