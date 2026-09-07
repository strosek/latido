# 0073 — More keyboard shortcuts and a ? cheat sheet

Status: done

## Goal

The app is shortcut-first (0009: N, /, Space, F, Esc) but stops there. A power user on
this kind of local-first tool will drive it entirely by keyboard. Add navigation
shortcuts and a quick reference so the shortcuts are discoverable instead of hidden in
the About modal (0044).

## Requirements

- New shortcuts:
  - `D` — open Dashboard; `H` — open History (same actions as the header buttons).
  - `?` — toggle a compact shortcut cheat-sheet overlay listing all shortcuts.
  - `J` / `K` — move keyboard focus between task rows on the board (up/down), so a
    keyboard user can reach row actions without Tab-spamming.
- Update the About modal shortcuts list (0044) and the footer hint bar (`views.ts`
  `shortcut-hint`) to mention the new keys.
- Check for conflicts with existing keys (N, /, Space, F, Esc) and typing contexts
  (don't hijack keys while the add-task input, a search box, or a dialog is focused).
  `?` and letters only fire when no input/textarea/select is focused.

## Acceptance criteria

- D/H navigate from the board; the header buttons still work.
- `?` opens and Esc closes the cheat sheet; listing matches the About modal.
- J/K move row focus without breaking checkbox/action activation.
- Shortcuts never fire while typing in an input or editing a note.