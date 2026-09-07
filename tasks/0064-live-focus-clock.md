# 0064 — Live focus clock: progress ring and heartbeat glow

Status: done

## Goal

Make the session clock the emotional centerpiece it should be. Today the clock
(`style.css` `.clock`, `views.ts` `renderSession`) is a flat 6rem set of digits with no
sense of time passing. Give Pomodoro a progress ring that visibly drains as the session
runs down, and give Flowtime a very slow, subtle "heartbeat" glow that mirrors the app's
pulse motif.

## Behavior

- **Pomodoro** — wrap the clock in a circular progress ring (inline SVG). The ring starts
  full and drains to empty as `remainingMs` approaches 0, updating on each repaint tick
  (`repaint.ts` `repaintTick`, currently 250 ms — smooth enough).
- **Flowtime** — the clock gains a soft, slow breathing glow (scale/opacity, ~4 s cycle)
  that grows slightly stronger once past the soft-limit nudge (0054) so the "it's okay
  to stop" state reads at a glance without being alarming.
- **Break / quick-run** screens use the same treatment (countdown ring for break,
  count-up ring or plain glow for quick run).
- All motion respects the existing `prefers-reduced-motion` block (`style.css`).
- Visuals stay calm: low-opacity fills, moss/accent tones, no saturation bursts.

## Acceptance criteria

- During a Pomodoro session the ring drains smoothly in sync with the countdown clock.
- Flowtime shows a subtle breathing glow that never distracts from the digits.
- Reduced-motion users see a static ring and no pulse.
- No per-tick layout churn: the ring updates via `stroke-dashoffset`, not a re-render.

## Notes / trade-offs

- The ring geometry is driven by the same `snapshot()` used for the digits, so drift-free
  behavior is preserved (wall-clock timestamps, not accumulated ticks).