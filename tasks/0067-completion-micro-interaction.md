# 0067 — Satisfying task-completion feedback

Status: done

## Goal

The done-toggle currently flips instantly (`.check` in `views.ts`, `toggleTask` in
`actions.ts`). A brief, calm animation when a task is completed — an animated checkmark
draw, then the row relaxing into "done" — makes the core loop of the app feel rewarding
without being loud.

## Behavior

- On toggle-to-done: animate the checkmark (stroke draw) on the row's `.check` button,
  then commit the state change and re-render. Because `render()` rebuilds the whole
  board, apply the animation *before* the re-render (a transient "pending" class on the
  button for ~150 ms) or defer the re-render by the animation length.
- Completed rows keep their existing muted strikethrough style (`style.css` `.task.done`),
  possibly with a gentle fade of the row into the done state.
- Toggle-to-open stays instant (returning a task should feel immediate).
- Respect `prefers-reduced-motion`.
- Keyboard and touch behavior unchanged.

## Acceptance criteria

- Completing a task shows an animated checkmark draw, then the done style.
- The board is still correct after the animation (row marked done, counts updated).
- No extra latency on the common path beyond ~150 ms.
- Reduced-motion users get the plain, instant toggle.

## Notes / trade-offs

- This is an animation-vs-re-render coordination problem: keep the animation on the
  button element and re-render the list, not the other way around.