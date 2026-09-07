# 0066 — Smooth view transitions

Status: done

## Goal

Views currently swap instantly because every `render()` call replaces `app.innerHTML`
(`views.ts`). A short, gentle fade/slide on mount makes navigation between board,
dashboard, history, and session feel considered rather than abrupt.

## Requirements

- Add a ~150 ms fade + 8px rise entrance to the top-level content of each rendered view
  (CSS `@starting-style` or a one-shot `.view-enter` animation applied to the freshly
  rendered container).
- Apply consistently to: board, dashboard, history, session, break, and quick-run views.
- No-op under `prefers-reduced-motion` (existing block at `style.css`).
- Keep it subtle and short — this app's calm identity (INTENT.md) means no bouncy
  transitions.

## Acceptance criteria

- Switching between any two views produces a gentle fade, not a hard cut.
- Reduced-motion users see no animation.
- Typing into the add-task input or notes is unaffected (the animation is on view mount
  only, not on the 250 ms repaint tick).

## Notes / trade-offs

- The repaint tick (`repaint.ts`) only mutates `.clock` text and phase labels, so it must
  not replay the entrance animation every second — apply the entrance class in `render()`,
  not in the tick.