# 0070 — First-run onboarding

Status: done

## Goal

The hardest moment for a new user is a completely empty board. Offer a short,
dismissible welcome that teaches the three core loops of Latido (add a task → start
focus → see your rhythm) and offers to load example data. This is intentionally small —
no multi-step wizard, just one calm screen.

## Behavior

- Show the welcome when the user has no tasks, no finished sessions, and has not
  dismissed it before (a flag persisted in settings/localStorage).
- Content: the app's one-sentence promise, three short steps (each with an icon), and
  two buttons: **Load example data** (reuses the import path, 0069) and **Start now**
  (dismisses and focuses the add-task input).
- A "×"/dismiss control in the corner; dismissing persists the flag.
- Keep it skimmable for an ADHD user: ≤ 5 short lines of copy, big buttons, one action
  at a time (INTENT.md).

## Acceptance criteria

- First-ever load shows the welcome; a returning user with data or a dismissed flag does
  not see it again.
- "Start now" closes the welcome and places focus in the add-task input.
- "Load example data" opens the standard import confirmation.
- Reduced-motion friendly; keyboard accessible (Esc closes, focus moves into the card).