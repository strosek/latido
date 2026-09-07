# 0060 — Keyboard & touch-friendly task reordering

Status: done

## Goal

Make manual ordering (0047) usable beyond desktop. The current reordering relies on native HTML5
drag-and-drop (`events.ts` `dragstart`/`dragover`/`drop`), which does not work on touch screens and
offers no keyboard alternative — a real gap for a mobile, ADHD-focused app.

## Requirements

- Add "Move up" / "Move down" actions to the task row menu (0037) that are only shown when the
  sort mode is `manual` and the task is open.
- Each action swaps the task with its neighbor in the currently displayed manual order (the same
  ordering used by `sortedTasks` with `sortBy === "manual"`), then persists and re-renders.
- Keep the existing desktop drag-and-drop behavior intact; the buttons are an additional,
  keyboard/touch-accessible path.
- Buttons should be disabled (or omitted) at the top/bottom edges where there is no neighbor.

## Acceptance criteria

- On a touch device (or via keyboard), a task can be reordered using the menu's Move up/down
  buttons.
- The ordering survives a refresh and matches drag-and-drop semantics.
- The buttons only appear in manual sort mode and respect the top/bottom bounds.

## Nice to have

- A pointer-based drag implementation (pointer events) that works on touch, as an alternative to the
  buttons for the "grip" handle.
