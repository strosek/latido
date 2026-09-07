# 0055 — Count partial pomodoro focus time

Status: done

## Goal

Stop silently discarding focus time from an unfinished pomodoro block. Today a 25-minute pomodoro
finished at the 20-minute mark records **0m** of focus, which contradicts the app's "honest about
time" promise and under-reports work in history, the dashboard, and exports.

## Problem

`sessionWorkMs` in `stats.ts` computes pomodoro work as
`completedPomodoros * pomodoroWorkMin` only. Because `completedPomodoros` is derived from whole
blocks, any time spent in the final, not-yet-complete focus block is lost. This affects the finish
toast (`actions.ts` → `finishSession`), per-task totals, the dashboard, the summary bar, and the
Markdown export, since they all route through `sessionWorkMs`.

## Requirements

- Extend `sessionWorkMs` so a pomodoro session also counts the elapsed portion of its final focus
  block:
  - Determine the phase at the session's end (`endedAt ?? now`) using the same cycle decomposition
    already in `timer.ts` (`snapshot` / `pomodoroSnapshot`).
  - If the session ended during a **work** phase, add `workMs - remainingMs` to the total.
  - If it ended during a break, add nothing (only completed pomodoros count).
- Keep the flowtime branch unchanged (all active time already counts).
- Reuse the existing segment math rather than reimplementing it, so the two stay in sync if cycle
  configuration changes later.

## Acceptance criteria

- Finishing a 25-min pomodoro after 20 min of focus records ~20m, not 0m.
- Finishing exactly at the end of a block records the full block.
- Finishing during a break records only the completed pomodoros (no partial).
- Flowtime sessions are unaffected.
- Existing `stats.test.ts` cases still pass, plus new cases for the partial-block behavior.

## Nice to have

- A shared helper (e.g. `pomodoroWorkMs(session, config, now)`) so the finish toast and `stats.ts`
  agree exactly on the number shown.
