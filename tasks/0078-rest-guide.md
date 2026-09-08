# 0078 — Rest-session education guide

Status: done

## Goal

A break only recharges you if you actually rest. Most people spend breaks scrolling a
phone, which keeps the brain active and defeats the recovery that makes the next focus
wave possible. Add a **Learn** button to the rest/break session screen
(`renderBreak` in `views.ts`) that opens a short, practical guide to effective ways to
restore the brain and body during a break.

## Model

- Add a "Learn" control to the break session screen (a ghost button or icon, e.g.
  `data-action="rest-guide"`), placed near the existing Start now / Skip controls. The
  countdown keeps running underneath (the modal overlays it; the repaint tick updates
  `.clock` as usual).
- New helper `openRestGuide()` (reuse `openDialog`, `dialogs.ts`) showing a calm,
  skimmable guide:
  - Short intro: why breaks matter — the ultradian rest that lets the next ~90-minute
    focus wave be sharp again; a break that engages the brain is not a break.
  - Concrete, categorized options (bulleted, 1 line each):
    - **Move** — walk, stretch, step outside; shake off seated tension.
    - **Eyes** — look at something 20+ feet away for 20 seconds; reduce screen time.
    - **Breathe** — a few slow, deep breaths (e.g. 4-7-8) to shift into rest mode.
    - **Fuel** — water and a light snack; skip the sugar spike.
    - **Unplug** — no screens: daydream, listen to music, chat, or do a tiny nap.
    - **Nature** — a plant or window view lowers stress markers quickly.
  - A "Got it" button that closes the guide and returns to the running break.
- Optionally show the same Learn control on the "Break over" state so the guidance is
  available after the break too.

## Behavior

- Opening the guide never resets or skips the break countdown; closing returns to it.
- The guide is keyboard accessible: Esc closes, focus moves in and back (existing
  `openDialog` focus handling).

## Acceptance criteria

- A "Learn" button is visible on the rest/break session screen.
- Opening it shows the rest guide; closing returns to the break with the countdown
  intact and still counting.
- The content is genuinely useful and skimmable (short intro + categorized bullets).

## Nice to have

- A Learn link on the "Break over" state as well.
- A fresh random tip each time the guide is opened, so returning readers still learn.