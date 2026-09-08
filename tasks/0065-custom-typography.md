# 0065 — Custom typography (self-hosted, offline-safe)

Status: done

## Goal

Give UltradianDrift a distinct, calm identity. Today everything renders in system-ui
(`style.css` `:root` font-family), which is safe but characterless. Introduce a
self-hosted variable font so the PWA keeps working fully offline.

## Requirements

- Self-host one variable font (WOFF2, subset for latin), added to `public/` so the
  service worker (`public/sw.js`) caches it and the app works offline.
- A warm humanist sans for UI/body copy, with a serif accent used sparingly for the
  wordmark (`h1`) and page/section headings — reinforces the "biophilic, calm" intent
  (INTENT.md).
- Keep a robust system fallback stack; if the font fails to load, the app looks
  unchanged.
- Mind file size (variable fonts can be large): subset aggressively, prefer a single
  weight axis. The page-weight budget stays reasonable for a local-first app.
- Avoid layout shift / flash issues (e.g. `font-display: swap` with metric overrides).

## Acceptance criteria

- The new type renders on the board, dashboard, session, and dialogs.
- Works offline after first load (font is in the service-worker cache).
- Text is readable from first paint — no jarring FOIT/FOUT.
- The wordmark reads as "UltradianDrift" with a warmer, more distinctive voice than system-ui.

## Nice to have

- A small set of display weights tuned for the big session clock.