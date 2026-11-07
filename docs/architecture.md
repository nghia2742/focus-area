# Architecture

## The single page

The app is a single Next.js App Router route (`/`). There are no `/focus`, `/history`, or `/settings` routes — History and Settings are dialogs, and the focus session renders on `/` while active.

```
src/app/layout.tsx (shell + Providers)
└── src/app/page.tsx
    └── <SiteHeader/>                 sticky glass header: logo + History / Settings buttons → dialogs
    └── <main class="flex flex-1 flex-col">
        └── <HomeView/>               the whole page
```

`HomeView` (`src/components/home/HomeView.tsx`):

```
hydrated? ── no ──► Skeleton list
   │ yes
session active?
   ├─ yes ──► <FocusScreen onComplete={...}/>     (immersive timer)
   ├─ no  ──► <FocusSetup/>                        (setup form)
completed? ── yes ──► <SessionComplete/> overlay   (absolute inset-0 z-20)
```

Height chain: `html.h-full` → `body.min-h-full.flex.flex-col` → page root `flex-1` → `main.flex-1` → `HomeView.relative.flex-1` → `FocusScreen.relative.flex-1`. Full-bleed layers (`BackgroundRenderer`, the focus content layer) use `absolute inset-0` because `height: 100%` does not resolve against flex-grown heights (see `AGENTS.md`).

## Component tree (focus screen)

```
FocusScreen (relative flex-1 overflow-hidden)
├── BackgroundRenderer              absolute inset-0: video/image + dark gradient overlay
├── content layer                   absolute inset-0 z-10, centered column
│   ├── task name (optional)
│   ├── TimerDisplay                the ONLY component using useNow/useFocusTimer
│   ├── MusicPlayer                 play/pause · volume · "Change environment" → EnvironmentSelector dialog
│   └── Pause/Resume + End buttons
├── TargetReached overlay           when status === target_reached
├── EndConfirmDialog
├── ActiveSessionRestore dialog     for persisted sessions not started in this view
└── Environment selector dialog     list of environments, live-swap pair
```

## Store ownership

| Concern | Store | Persist key |
| --- | --- | --- |
| Active session lifecycle | `useFocusStore` | `focus-active-session` |
| Preferences | `useSettingsStore` | `focus-settings` |
| Completed sessions | `useHistoryStore` | `focus-history` |

Cross-store: `useFocusStore.complete()` writes into `useHistoryStore`. `useSettingsStore` is read by setup/screen/header via `useSettingsStore((s) => s.settings...)`.

Audio state is **not** in a store — the module singleton `musicPlayer` + `useMusicPlayer` subscription.

## Data flow

### Start session (`FocusSetup.handleStart`)

```
validate (custom duration 1–600) →
environment = getEnvironment(environmentId) →
startSession({ taskName, mode, targetDuration, musicId, backgroundId })     [focusStore]
remember lastEnvironmentId if enabled                                       [settingsStore]
musicPlayer.setVolume(...); musicPlayer.setTrack(musicId) | stop()          [audio, in gesture]
requestNotificationPermission()
→ HomeView re-renders (session set) → FocusScreen
```

### Tick

`useNow(500)` in `TimerDisplay` → `useFocusTimer` derives values from the `ActiveSession` timestamps → re-renders only the timer subtree.

### Change environment mid-session (`FocusScreen.handleEnvironmentChange`)

```
musicPlayer.setTrack(env.musicId) + play | stop()   [audio]
focusStore.setEnvironment({ musicId, backgroundId }) [session record]
settingsStore.update({ lastEnvironmentId: id })      if rememberLastEnvironment
```

### End session

```
End button → EndConfirmDialog → onEndSession:
  focusStore.complete() → engine.completeSession → historyStore.addSession → clear active
  musicPlayer.stop()
  HomeView shows SessionComplete overlay (duration)
```

## Directories

```
src/app/            layout, page, providers, globals.css (Tailwind v4 theme)
src/components/
  home/             HomeView (page-level switch)
  focus/            FocusScreen, FocusSetup, TargetReached, EndConfirmDialog,
                    SessionComplete, ActiveSessionRestore
  history/          HistoryDialog, FocusStats, WeekChart, SessionList, SessionItem
  settings/         SettingsDialog
  media/            BackgroundRenderer, MusicPlayer, EnvironmentSelector
  layout/           SiteHeader
  timer/            TimerDisplay
  ui/               shadcn-style primitives (button, chart, dialog, field, toggle-group, …)
src/store/          focusStore, settingsStore, historyStore
src/lib/
  timer/            timer.ts (pure engine), format.ts
  audio/            musicPlayer.ts (singleton)
  storage/          legacy localStorage helpers (DEFAULT_SETTINGS only)
  stats.ts          computeStats, lastNDays
  notifications.ts  Notification helpers
src/hooks/          useFocusTimer, useNow, useReferenceNow, useMusicPlayer,
                    usePrefersReducedMotion
src/data/           environments.ts, music.ts, backgrounds.ts
src/types/          focus.ts (all shared types + constants)
public/
  backgrounds/      cat-studying.mp4
  music/            late-night-study.mp3
```

## Theming

`next-themes` (attribute `class`) + `Providers.tsx`. `ThemeSync` mirrors `settings.theme` into `next-themes` via an effect (only after hydration). CSS variables in `globals.css` define `light`/`dark` tokens; custom utilities `glass`, `text-glow`, `font-tabular` live alongside.
