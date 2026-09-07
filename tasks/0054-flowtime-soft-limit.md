# 0054 — Flowtime gentle stop reminder

Status: done

## Goal

Give Flowtime a configurable *soft* limit: when a session runs past a chosen duration, the app
gently reminds you that it's okay to stop — for people who get obsessed with "one more minute"
or are afraid to stop. Unlike the hard cap (0021), it never forces the session to end.

## Model

- New settings field `flowtimeNudgeMin: number` (0 = off). Default `90`, matching the length of a
  natural ultradian focus wave.
- Independent of `maxFlowtimeMin` (0021, the hard cap). If both are set, the soft nudge fires
  first (soft < hard); the hard cap still auto-finishes past its own limit.
- Sanitized like other settings (clamped 0..1440, non-numbers fall back to default).

## Behavior

- During a **Flowtime** session, when active elapsed time first reaches `flowtimeNudgeMin`:
  - Show a gentle, non-blocking notice on the session screen (reuse the toast pattern, 0045):
    "You've been at this for 90 minutes — it's okay to stop." with two actions:
    - **Finish** — ends the session (same path as the Finish button).
    - **Keep going** — dismisses the notice and lets the timer continue.
  - Play a soft sound cue (reuse `playCue` with the current preset) and, if enabled, a browser
    notification (0020).
  - Announce the reminder via the aria-live region (`announce`), so it's screen-reader friendly.
- The session **keeps running** — this is a reminder, not a cap. The clock continues to count up.
- If the user keeps going, re-nudge every 30 minutes after the limit so the reminder stays gentle
  but persistent (fixed cadence, not separately configurable).
- The `elapsed` readout may take on a slightly emphasized style past the limit so the state is
  visible at a glance without being alarming.
- Nudge is a flowtime-only concept; pomodoro is unaffected.

## Acceptance criteria

- With `flowtimeNudgeMin = 90`, a flowtime session reaching 90 minutes shows the reminder while
  the timer keeps running.
- "Finish" in the reminder ends the session; "Keep going" dismisses it until the next cadence.
- Setting `flowtimeNudgeMin = 0` disables the reminder entirely.
- No session is ever auto-finished by the soft limit (only the hard cap 0021 does that).

## Nice to have

- A one-line hint in Settings next to the field: "Gently remind you to stop after N minutes."
- Mention the default 90-minute ultradian wave in the About modal (0044) copy.