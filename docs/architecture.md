# Architecture

## The single page

The app is a single Next.js App Router route (`/`). There are no `/focus`, `/history`, or `/settings` routes — History and Settings are dialogs, and the focus session renders inline on `/` while active.

```
src/app/layout.tsx (shell + Providers)
└── src/app/page.tsx
    └── <main class="flex min-h-0 flex-1 flex-col">
        └── <HomeView/>               the whole page
```

`HomeView` (`src/features/home/HomeView.tsx`):

```
hydrated? ── no ──► Skeleton
   │ yes
<MainBackground/>                       fixed room video + scrim + noise
<ZenFade><SiteHeader/></ZenFade>        logo + Zen Mode / History / Settings
session active?
   ├─ yes ──► <FocusTimer onComplete={...}/>   inline timer over the artwork
   ├─ no  ──► <SetupLayer/>                    CTA + setup sheet
completed? ── yes ──► <SessionComplete/> dialog
```

Height chain: `html.h-full` → `body.h-full.flex.flex-col.overflow-hidden` → `page main.flex-1` → `HomeView.relative.flex.min-h-0.flex-1.flex-col.overflow-hidden`. Full-bleed layers (`MainBackground`, the timer content layer) use `absolute inset-0` because `height: 100%` does not resolve against flex-grown heights (see `AGENTS.md`).

## Component tree (focus timer)

```
FocusTimer (fragment; content layer is absolute inset-0 z-10)
├── task name (optional)
├── TimerDisplay                ticking render (useNow/useFocusTimer)
├── Pause/Resume + End Session  (hidden while target_reached)
├── TargetReached dialog        status === target_reached
├── EndConfirmDialog
└── ActiveSessionRestore dialog persisted session not started in this view
```

The idle screen instead renders:

```
SetupLayer
├── ZenFade > FocusCta           bottom-center "Start focus" pill → opens sheet
└── FocusSetupSheet              bottom Sheet (task, mode, duration, start)
```

## Store ownership

| Concern | Store | Persist key |
| --- | --- | --- |
| Active session lifecycle | `useFocusStore` | `focus-active-session` |
| Preferences + ephemeral Zen Mode | `useSettingsStore` | `focus-settings` |
| Appearance presets (style, base, theme, chart) | `useAppearanceStore` | `focus-appearance` |
| Completed sessions | `useHistoryStore` | `focus-history` |

Cross-store: `useFocusStore.complete()` writes into `useHistoryStore`. `useSettingsStore` is read by setup/screen/header/rail via `useSettingsStore((s) => s.settings...)` or `s.zenMode`. Color mode is owned by `next-themes`, composed with `useAppearanceStore` in `AppearanceProvider`.

Audio state is **not** in a store — the module singleton `musicPlayer` exists, but nothing subscribes to it and no component starts playback.

## Data flow

### Start session (`FocusSetupSheet.handleStart`)

```
validate (custom duration 1–600) →
environment = getEnvironment(remembered lastEnvironmentId) ?? ENVIRONMENTS[0] →
startSession({ taskName, mode, targetDuration, completionMessage, musicId, backgroundId })  [focusStore]
save completionMessage (Target only) / lastEnvironmentId [settingsStore]
ensureNotificationPermission() + unlockCompletionSound(first chime)  [both inside the click]
→ focusStore.start turns Zen Mode on
→ HomeView re-renders (session set) → FocusTimer
```

No audio or background swap happens here; the room video is already playing.

### Tick

`useNow(500)` inside `useFocusTimer` → values are derived from the `ActiveSession` timestamps. Consumers are `TimerDisplay`, `FocusTimer` (status + end-confirm elapsed) and `TargetReached` (dialog duration), so that subtree re-renders every tick; the rest of the app does not.

### Target reached

```
getDerivedStatus() flips running → target_reached at zero (derived, not stored)
→ FocusTimer renders TargetReached dialog
→ notifyTargetReached(targetDuration) once per session id
→ Finish Session = complete(); Keep Focusing = enterOvertime()
```

### End session

```
End button → EndConfirmDialog → onEndSession:
  focusStore.complete() → engine.completeSession → historyStore.addSession → clear active
  HomeView shows SessionComplete dialog (duration)
```

### Restore after refresh / close

```
persist rehydrates `session` (startedLocally is not persisted)
→ FocusTimer sees session && !startedLocally → ActiveSessionRestore dialog
→ Resume Session = resume(); End Session = complete()
```

## Directories

```
src/app/            layout, page, providers, globals.css (Tailwind v4 theme)
src/features/
  home/             HomeView (page switch), SetupLayer
  focus/            FocusTimer, FocusSetupSheet, AlertStatus, TargetReached,
                    EndConfirmDialog, SessionComplete, ActiveSessionRestore,
                    TimerDisplay
  pomodoro/         machine, config, types, usePomodoro, store, PomodoroTimer,
                    PomodoroSettings, RoundDots (see docs/specs/pomodoro-cycles.md)
  history/          HistoryDialog, FocusStats, WeekChart, SessionList, SessionItem
  settings/         SettingsDialog, GeneralSettings, SoundSettings, SoundList,
                    AppearanceSettings
src/components/
  ui/               shadcn-style primitives (button, chart, dialog, field, kbd, sheet,
                    toggle-group, toggle, tooltip, …)
  layout/           SiteHeader, ZenFade
  media/            MainBackground
  providers/        AppearanceProvider (preset data attrs + next-themes color mode)
  shared/           DurationField (presets + custom input, used by setup and settings)
src/store/          focusStore, settingsStore, appearanceStore, historyStore, soundStore
src/lib/
  timer/            timer.ts (pure engine), format.ts
  appearance/       presets.ts (ids/labels/defaults), prehydrate.ts (blocking script)
  audio/            musicPlayer.ts (singleton, currently unwired),
                    completionSound.ts (built-in + custom notification sounds)
  storage/          legacy localStorage helpers (DEFAULT_SETTINGS only)
  stats.ts          computeStats, lastNDays
  notifications.ts  Notification helpers
  utils.ts          cn()
src/hooks/          useFocusTimer, useHotkey, useNow, useReferenceNow, usePrefersReducedMotion
src/data/           environments.ts, music.ts, backgrounds.ts, sounds.ts
src/types/          focus.ts (all shared types + constants)
public/
  backgrounds/      270507_small.mp4 (the live artwork)
                    cat-studying.* / capybara-violin.* (data-only, not rendered)
  music/            late-night-study.mp3, violin-velvet-study-room.mp3 (unwired)
  ambient-sounds/   rain / forest / fire / waves / windy (unused)
  sounds/           bell / cow-bell / school-bell / alarm-clock-short /
                    bedside-clock-alarm (notification chimes)
  setup/            main_bg.png (unused)
```

## Theming & motion

- `next-themes` (attribute `class`, `defaultTheme="dark"`, `enableSystem`) + `Providers.tsx`. Color mode is owned by `next-themes` and driven from Settings → Appearance; `AppearanceProvider` also mirrors `style` / `baseColor` / `theme` / `chartColor` onto `<html data-*>` after hydration, while `appearanceScript` applies the persisted values before first paint.
- `motion` (Framer Motion) drives `ZenFade`, respecting `prefers-reduced-motion`.
- CSS variables in `globals.css` define light/dark tokens, palette blocks keyed by `data-*`, plus fixed `--artwork-*` tokens for chrome over the video. Custom utilities: `artwork-surface`, `scrim`, `ember-glow`, `noise`, `font-tabular`.
