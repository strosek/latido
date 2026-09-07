# 0068 — Chart polish: gradients and today highlight

Status: done

## Goal

Dashboard charts (`style.css` `.chart-bar`, `.bar-fill`) are flat moss rectangles.
Small, calm refinements — a subtle vertical gradient and a soft glow on "today" — make
the dashboard feel more crafted without adding noise.

## Requirements

- `.chart-bar`: subtle vertical gradient of the moss/accent tones; today's column keeps
  its accent color and gains a faint glow (drop-shadow) so the present reads at a glance.
- `.bar-fill` (horizontal proportion bars): soft gradient, same idea.
- Zero-value bars stay visibly muted (`.chart-col.zero`).
- All static — no animation, so the existing `prefers-reduced-motion` block needs no
  change.
- No changes to the data or markup contract in `views.ts` (`chartColumns`, `barRows`).

## Acceptance criteria

- Bars show a gentle gradient; today's focus column stands out softly.
- Zero/hover behavior is unchanged.
- Day theme (`data-theme="day"`) variants look correct too.