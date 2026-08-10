<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Focus — Agent Guide

A single-page focus timer web app: choose a task + atmosphere, start a session, disappear into an immersive timer screen, then come back and review your focus history. **One thing. Right now.**

The original product spec lives in `focus-web-app-mvp-spec.md`. Detailed docs on what is currently implemented live in `docs/` (start with `docs/README.md`).

## Commands

```bash
npm run dev      # dev server (Turbopack), http://localhost:3000
npm run lint     # eslint (config via eslint-config-next)
npm run build    # production build (also regenerates .next/types)
npm run start    # serve the production build
npx tsc --noEmit # typecheck (needs .next/types to exist — run dev/build once first)
```

## Stack

- Next.js 16.3.0 (App Router), React 19, TypeScript 5, Tailwind CSS v4 (`@import "tailwindcss"` + `@theme` in `src/app/globals.css`).
- State: zustand 5 with `persist` (localStorage) — one store per domain.
- Styling: shadcn-style primitives in `src/components/ui/` (built on `radix-ui`), `lucide-react` icons, `sonner` toasts, `next-themes` for theming.
- UI framework conventions may differ from older shadcn — read `src/components/ui/*` before assuming component APIs (e.g. `Field`, `FieldLabel`, `ToggleGroup`, `Badge`).

## Architecture in one screen

```
src/app/layout.tsx        html/body shell + Providers (next-themes, ThemeSync, Toaster)
src/app/page.tsx          the ONLY route: SiteHeader + HomeView  (no /focus /history /settings routes)
src/components/home/HomeView.tsx   session active ? <FocusScreen/> : <FocusSetup/> + SessionComplete overlay
src/components/focus/FocusScreen.tsx   immersive timer screen (background, timer, controls, dialogs)
src/components/focus/FocusSetup.tsx    the setup form (task, mode, duration, environment)
src/components/layout/SiteHeader.tsx   header w/ History & Settings buttons → dialogs
src/components/history/*   HistoryDialog: FocusStats, WeekChart, SessionList
src/components/settings/SettingsDialog.tsx
src/components/media/*     BackgroundRenderer, MusicPlayer, EnvironmentSelector
src/store/                 focusStore (active session), settingsStore, historyStore
src/lib/timer/timer.ts     pure timestamp-based timer engine (no React/DOM)
src/lib/audio/musicPlayer.ts   module-singleton audio controller
src/data/environments.ts   environment pairs (music + background always travel together)
```

History and Settings are **dialogs**, not routes. The focus session renders on `/` when active; `FocusSetup` is shown otherwise.

## Conventions & rules

- **Timer is timestamp-derived, never a counter.** All elapsed values come from `ActiveSession` timestamps (`startedAt`, `pausedAt`, `totalPausedDuration`, `overtimeSince`) computed by the pure engine in `src/lib/timer/timer.ts`. Never introduce `setInterval(() => seconds++, 1000)`.
- **Keep the ticking render isolated.** `useNow(500)` + `useFocusTimer` are consumed only by `TimerDisplay` so the rest of the app never re-renders every tick.
- **Gate on hydration.** Every zustand store exposes a `hydrated` flag set in `onRehydrateStorage`. Components that render persisted state must gate on it (show `Skeleton`) to avoid SSR/client mismatches. Do not "fix" this with effect-sync — use lazy initial state from the store after the hydration gate.
- **Music must start inside the Start Focus click gesture** (browser autoplay rules). `musicPlayer` is a module-level singleton (outside React) so playback survives navigation and can be driven from the gesture.
- **Environments are pairs.** Music and background are coupled via `src/data/environments.ts`; picking an environment sets both `musicId` and `backgroundId`. Do not reintroduce separate music/background pickers.
- **Full-bleed layout gotcha.** `height: 100%` does NOT resolve against a parent whose height comes from `flex-grow` (it falls back to auto — this caused a real "video only fills part of the screen" bug). Use `flex-1` on the flex item and `absolute inset-0` for full-bleed layers (`BackgroundRenderer` and the focus content layer both use `absolute inset-0`).
- **Persistence.** zustand persist keys: `focus-active-session`, `focus-settings`, `focus-history`. The legacy `src/lib/storage/localStorage.ts` helpers (`getSettings`/`saveSessions`/etc.) are mostly unused — only `DEFAULT_SETTINGS` is imported from it. Do not dual-write.
- **Settings migration.** `lastMusicId`/`lastBackgroundId`/`rememberLastMusic`/`rememberLastBackground` were replaced by `rememberLastEnvironment` + `lastEnvironmentId`. Old persisted values are ignored automatically — do not add back the old keys.
- **Don't kill the Playwright MCP node processes** (they back the `playwright_browser_*` tools). For one-off browser verification use `playwright-core` installed with `--no-save`, then remove it.

## Verification workflow

1. `npm run lint` and `npx tsc --noEmit` after any change (typecheck requires `.next/types`; run `npm run build` or `npm run dev` once first).
2. `npm run build` to confirm the single-route app compiles (`/` + `/_not-found`).
3. Browser smoke test via Playwright: setup → start → timer ticks → pause/resume → end → session shows in History; check the video background fills the full content area and the console is free of errors.

## Known environment quirks

- Dev-console "hydration mismatch" diffs are caused by the Grammarly browser extension adding body attributes — not an app bug.
- Deleting `.next` removes Next-generated global types (e.g. `LayoutProps`); they regenerate on the next `next build`/`next dev`. Until then `npx tsc --noEmit` fails with false errors.
