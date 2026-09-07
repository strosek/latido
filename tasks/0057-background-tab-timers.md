# 0057 — Reliable timers while the tab is hidden

Status: done

## Goal

Make break-end and pomodoro phase transitions trustworthy when the tab is in the background.
Browsers throttle `setInterval` (and `setTimeout`) in hidden tabs, so the repaint loop in
`repaint.ts` stops firing on time — meaning a break never "ends" until the user returns, and phase
cues/notifications fire late or not at all.

## Requirements

- On `visibilitychange` (to visible) and `window` `focus`/`pageshow`, recompute the current timer
  state from wall-clock timestamps (the app is already drift-free, so this is safe):
  - If a break countdown expired while hidden, mark it done and surface the "Break over" state,
    firing the finish cue and notification (mirroring `repaintTick`'s break branch).
  - If a running pomodoro crossed a work/break boundary while hidden, fire the appropriate cue and
    notification exactly once, and ensure the clock shows the correct current phase/remaining.
- Ensure the transition is announced to screen readers via `announce`, as the foreground path
  already does.
- Keep the `setInterval` tick for the visible case unchanged; the hidden case should be driven by
  timestamps, not ticks.

## Acceptance criteria

- Start a break, switch tabs, return after it ends → the app shows "Break over" and the cue has
  fired (even though it ended while hidden).
- Start a pomodoro, hide the tab past a work→break boundary, return → the break cue/notification
  fires once and the clock is correct.
- No duplicate cues fire when returning shortly after a boundary already handled in the foreground.

## Nice to have

- Fire a browser notification at the *exact* moment while hidden using a service worker or Web
  Worker (out of scope for the core fix; needs a scheduled-alarm mechanism that isn't throttled).
