# 0074 — Undo for quick runs and task reorder

Status: done

## Goal

Undo exists for completing, deleting, and rescheduling tasks (0011/0045/0058) but not
for two surprising actions: closing a quick task, and reordering tasks. A mis-tapped
"Close & next" or a fat-finger drag should be one keystroke away from reverting.

## Requirements

- **Quick run**: when a quick task is completed through the quick-run flow, show the
  standard undo toast; undo reopens the quick task exactly as it was.
- **Reorder**: after a manual drag (0060) or Move up/down (0047), show a short undo toast
  that restores the previous ordering (a pre-reorder `order` snapshot). Reuse the toast
  pattern from 0045/0058.
- Keep toasts non-stacking: reuse/queue like the existing undo toasts.
- No toast for purely cosmetic changes.

## Acceptance criteria

- Completing the last quick task in a run shows a toast; undoing restores the task.
- Dragging a task and then undoing restores the exact prior ordering (including manual
  sort state).
- Undoing a move-task up/down returns the row to its original position.