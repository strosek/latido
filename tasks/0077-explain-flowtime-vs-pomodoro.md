# 0077 — Explain Flowtime vs Pomodoro when choosing a session

Status: pending

## Goal

Most people don't know what an *ultradian rhythm* is or what the *Flowtime* technique
means, so when they hit the start button they default to Pomodoro — the only option they
recognize. Give the session-type chooser (`promptStartSession` in `actions.ts`) a small
**"What's the difference?"** affordance that explains both techniques in plain language,
so users choose with understanding instead of familiarity.

## Model

- In `promptStartSession`, add a tertiary control below the two technique buttons (e.g. a
  ghost button `data-tech="learn"`: "What's the difference?"). It must not start a
  session or close the chooser.
- New helper `openFlowtimeExplain()` (reuse `openDialog`, `dialogs.ts`) that opens an
  explainer modal on top of the chooser; closing it returns to the chooser with the
  chosen task intact.
- Content (short and calm, per INTENT.md — skimmable for an ADHD user):
  - **Your natural rhythm** — the ~90-minute ultradian wave: you're genuinely sharp in
    waves, then your energy dips and you need rest. Latido works *with* this.
  - **Flowtime** — a count-up session: start when you're ready, keep going while you're
    in flow, and finish when your energy dips. No interrupting bell.
  - **Pomodoro** — fixed work/break blocks (e.g. 25 + 5): a forcing function that's great
    when you're procrastinating and need external structure.
  - A short recommendation line: *"Not sure? Start with Flowtime — you can switch to
    Pomodoro any time."*
  - A "Got it" button that closes the explainer and returns to the chooser.
- Optionally enrich the two chooser buttons with a one-line hint each (e.g.
  "Flowtime · open — work until your energy dips" / "Pomodoro · 25 min — fixed blocks")
  so the difference is visible even before opening the explainer.

## Behavior

- Opening the explainer never dismisses the chooser or loses the task.
- The explainer is keyboard accessible: Esc closes, focus moves into it and back
  (existing `openDialog` focus handling).

## Acceptance criteria

- The chooser shows a visible "What's the difference?" control.
- The explainer covers ultradian rhythm, Flowtime, Pomodoro, and when to use each, in
  plain language.
- Closing the explainer returns to the same task's chooser, ready to pick a technique.
- No session starts or state changes while reading the explainer.

## Nice to have

- A "Which one should I pick?" one-liner recommendation.
- Reuse/trim the About-modal (0044) story text so copy stays consistent.